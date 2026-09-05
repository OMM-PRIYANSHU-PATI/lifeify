import "server-only";
import { requestOtp as requestOtpCore, verifyOtp as verifyOtpCore } from "./auth/otp";

export * from "./auth/session";
export * from "./auth/otp";

/**
 * Backward compatibility wrapper for existing actions calling sendOtp(identifier).
 */
export async function sendOtp(identifier: string): Promise<{ devCode?: string }> {
  const result = await requestOtpCore(identifier);
  return { devCode: result.devCode };
}

/**
 * Backward compatibility wrapper for existing actions calling verifyOtp(identifier, code).
 */
export async function verifyOtp(identifier: string, code: string): Promise<boolean> {
  const result = await verifyOtpCore(identifier, code);
  return result.verified;
}
