import "server-only";
import { createHmac, randomInt } from "node:crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/config";
import { logger } from "@/lib/logger";
import { RateLimitError, ValidationError } from "@/lib/errors";

const COOLDOWN_SECONDS = 60;
const MAX_PER_HOUR = 5;
const MAX_ATTEMPTS = 3;

/**
 * Hash a phone number deterministically for lookup and rate limiting.
 */
export function hashPhone(phone: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(phone.trim()).digest("hex");
}

/**
 * Hash an OTP code for safe database storage.
 */
export function hashCode(phone: string, code: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(`${phone.trim()}:${code.trim()}`).digest("hex");
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Standardize on 10 digits for Indian numbers, or full international if provided
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length > 6) return digits;
  throw new ValidationError("Please enter a valid phone number (at least 10 digits).");
}

export interface RequestOtpResult {
  success: true;
  cooldownSeconds: number;
  devCode?: string;
}

/**
 * Request an OTP for a phone number.
 * Implements 60s cooldown and max 5 requests per hour.
 * Always resolves without leaking whether the user already exists (anti-enumeration).
 */
export async function requestOtp(rawPhone: string): Promise<RequestOtpResult> {
  const phone = normalizePhone(rawPhone);
  const phoneHash = hashPhone(phone);
  const now = new Date();

  // 1. Check rate limits
  const oneMinuteAgo = new Date(now.getTime() - COOLDOWN_SECONDS * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [recentOtp, hourCount] = await Promise.all([
    prisma.otpCode.findFirst({
      where: {
        phoneHash,
        createdAt: { gte: oneMinuteAgo },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.otpCode.count({
      where: {
        phoneHash,
        createdAt: { gte: oneHourAgo },
      },
    }),
  ]);

  if (recentOtp) {
    const elapsed = Math.floor((now.getTime() - recentOtp.createdAt.getTime()) / 1000);
    const retryAfter = Math.max(1, COOLDOWN_SECONDS - elapsed);
    throw new RateLimitError(`Please wait ${retryAfter} seconds before requesting a new code.`, retryAfter);
  }

  if (hourCount >= MAX_PER_HOUR) {
    throw new RateLimitError("Too many OTP requests. Please try again in an hour.", 3600);
  }

  // 2. Generate a secure 6-digit OTP
  const code = String(randomInt(100000, 999999));
  const codeHash = hashCode(phone, code);
  const expiresAt = new Date(now.getTime() + env.OTP_TTL_MINUTES * 60 * 1000);

  // Invalidate any existing unused OTPs for this phone
  await prisma.otpCode.deleteMany({
    where: {
      phoneHash,
      expiresAt: { lte: now },
    },
  });

  // Store new OTP in database
  await prisma.otpCode.create({
    data: {
      phone,
      phoneHash,
      codeHash,
      attempts: 0,
      expiresAt,
    },
  });

  logger.info(`Generated OTP for ${phone.slice(0, 3)}***${phone.slice(-2)} (valid ${env.OTP_TTL_MINUTES}m)`);

  const isDev = env.NODE_ENV !== "production";
  if (isDev) {
    console.log(`\x1b[36m[LIFEIFY][DEV-AUTH] OTP for ${phone}: ${code}\x1b[0m`);
  }

  return {
    success: true,
    cooldownSeconds: COOLDOWN_SECONDS,
    devCode: isDev ? code : undefined,
  };
}

export interface VerifyOtpResult {
  verified: boolean;
  phone: string;
  error?: string;
}

/**
 * Verify a received OTP. Enforces max 3 attempts and expiration.
 */
export async function verifyOtp(rawPhone: string, rawCode: string): Promise<VerifyOtpResult> {
  const phone = normalizePhone(rawPhone);
  const phoneHash = hashPhone(phone);
  const code = rawCode.trim();
  const now = new Date();

  if (!/^\d{6}$/.test(code)) {
    return { verified: false, phone, error: "OTP must be a 6-digit number." };
  }

  // Find the active OTP for this phone
  const record = await prisma.otpCode.findFirst({
    where: {
      phoneHash,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { verified: false, phone, error: "Invalid or expired code. Please request a new one." };
  }

  // Check attempt limit
  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.otpCode.delete({ where: { id: record.id } });
    return { verified: false, phone, error: "Too many failed attempts. Please request a new code." };
  }

  const expectedHash = hashCode(phone, code);
  if (record.codeHash !== expectedHash) {
    // Increment attempts
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 },
    });
    const remaining = MAX_ATTEMPTS - (record.attempts + 1);
    return {
      verified: false,
      phone,
      error: remaining > 0 ? `Incorrect code. ${remaining} attempt(s) remaining.` : "Incorrect code. Please request a new one.",
    };
  }

  // OTP is correct -> delete so it cannot be replayed
  await prisma.otpCode.delete({ where: { id: record.id } });

  return { verified: true, phone };
}
