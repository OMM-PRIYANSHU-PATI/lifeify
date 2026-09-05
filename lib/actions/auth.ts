"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, sendOtp, verifyOtp, isAdminIdentifier } from "@/lib/auth";
import { audit } from "@/lib/audit";

const identifierSchema = z
  .string()
  .trim()
  .min(5, "Enter a valid phone number or email")
  .max(120);

const otpSchema = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code");

export type AuthState = { error?: string; devCode?: string; stage: "identifier" | "otp"; identifier?: string };

export async function requestOtpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = identifierSchema.safeParse(formData.get("identifier"));
  if (!parsed.success) return { stage: "identifier", error: parsed.error.issues[0]?.message };

  const identifier = parsed.data;
  const normalized = identifier.includes("@") ? identifier.toLowerCase() : identifier.replace(/\D/g, "").slice(-10);
  if (!identifier.includes("@") && normalized.length !== 10) {
    return { stage: "identifier", error: "Enter a valid 10-digit phone number" };
  }

  try {
    const { devCode } = await sendOtp(normalized);
    return { stage: "otp", identifier: normalized, devCode };
  } catch (err) {
    if (err instanceof Error && err.message === "TOO_MANY_OTP_REQUESTS") {
      return { stage: "identifier", error: "Too many code requests. Please wait a few minutes." };
    }
    return { stage: "identifier", error: "Could not send the code. Please try again." };
  }
}

export async function verifyOtpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const identifier = String(formData.get("identifier") ?? "");
  const parsedCode = otpSchema.safeParse(formData.get("code"));
  const mode = String(formData.get("mode") ?? "login");

  if (!identifier) return { stage: "identifier", error: "Session expired — start again." };
  if (!parsedCode.success) return { stage: "otp", identifier, error: parsedCode.error.issues[0]?.message };

  if (!verifyOtp(identifier, parsedCode.data)) {
    return { stage: "otp", identifier, error: "Incorrect or expired code. Request a new one." };
  }

  const isEmail = identifier.includes("@");
  let user = isEmail
    ? await prisma.user.findFirst({ where: { email: identifier } })
    : await prisma.user.findUnique({ where: { phone: identifier } });

  if (mode === "signup" && user) {
    return { stage: "otp", identifier, error: "An account already exists — use Log in instead." };
  }
  if (mode === "login" && !user) {
    return { stage: "otp", identifier, error: "No account found for this identifier — use Sign up." };
  }
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: isEmail ? `email:${identifier}` : identifier,
        email: isEmail ? identifier : null,
        role: isAdminIdentifier(identifier) ? "ADMIN" : "USER",
      },
    });
    await audit({ userId: user.id, action: "ACCOUNT_CREATED", entity: "User", entityId: user.id });
  }
  if (user.status !== "ACTIVE") {
    return { stage: "otp", identifier, error: "This account is suspended. Contact support." };
  }

  // Keep admin role in sync for allow-listed identifiers
  if (isAdminIdentifier(identifier) && user.role !== "ADMIN") {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  }

  await createSession(user.id, user.role);
  await audit({ userId: user.id, action: "LOGIN", entity: "User", entityId: user.id });

  redirect(user.onboardingComplete ? "/app/dashboard" : "/onboarding");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
