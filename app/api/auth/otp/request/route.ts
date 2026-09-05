import { NextRequest, NextResponse } from "next/server";
import { requestOtp } from "@/lib/auth/otp";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = String(body.phone ?? "").trim();

    if (!phone) {
      return NextResponse.json(
        { ok: false, message: "Phone number is required." },
        { status: 400 }
      );
    }

    const result = await requestOtp(phone);

    // Anti-enumeration: returns success true consistently
    return NextResponse.json({
      ok: true,
      message: "If this phone number is valid, a verification code has been sent.",
      cooldownSeconds: result.cooldownSeconds,
      devCode: result.devCode, // populated only in non-production
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { ok: false, message: err.message, details: err.details },
        { status: err.statusCode }
      );
    }
    logger.error("Failed to process OTP request", err);
    return NextResponse.json(
      { ok: false, message: "Could not send verification code. Please try again." },
      { status: 500 }
    );
  }
}
