import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession, isAdminIdentifier } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = String(body.phone ?? "").trim();
    const code = String(body.code ?? "").trim();

    if (!rawPhone || !code) {
      return NextResponse.json(
        { ok: false, message: "Phone number and 6-digit code are required." },
        { status: 400 }
      );
    }

    const verification = await verifyOtp(rawPhone, code);
    if (!verification.verified) {
      return NextResponse.json(
        { ok: false, message: verification.error ?? "Invalid or expired code." },
        { status: 400 }
      );
    }

    const phone = verification.phone;

    // Find or provision user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    const isNew = !user;
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: isAdminIdentifier(phone) ? "ADMIN" : "USER",
          onboardingComplete: false,
        },
      });

      await audit({
        userId: user.id,
        action: "ACCOUNT_CREATED",
        entity: "User",
        entityId: user.id,
        ip: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { ok: false, message: "This account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Role synchronization for admin identifier list
    if (isAdminIdentifier(phone) && user.role !== "ADMIN") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
    }

    // Issue JWT session and set HTTP-only cookie
    await createSession(user.id, user.role, user.phone ?? undefined);

    await audit({
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    logger.info(`User ${user.id} authenticated via OTP`);

    return NextResponse.json({
      ok: true,
      isNew,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        onboardingComplete: user.onboardingComplete,
      },
      redirectTo: user.onboardingComplete ? "/app/dashboard" : "/onboarding",
    });
  } catch (err) {
    logger.error("Error in OTP verification route", err);
    return NextResponse.json(
      { ok: false, message: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
