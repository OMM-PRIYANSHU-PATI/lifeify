import { describe, it, expect } from "vitest";
import { normalizePhone, hashPhone, hashCode } from "@/lib/auth/otp";
import { SignJWT, jwtVerify } from "jose";

describe("Auth Core & Security", () => {
  describe("Phone Normalization", () => {
    it("normalizes 10-digit Indian numbers", () => {
      expect(normalizePhone("9876543210")).toBe("9876543210");
      expect(normalizePhone("+91 98765 43210")).toBe("9876543210");
      expect(normalizePhone("919876543210")).toBe("9876543210");
      expect(normalizePhone(" 9876-543-210 ")).toBe("9876543210");
    });

    it("rejects invalid phone numbers with too few digits", () => {
      expect(() => normalizePhone("1234")).toThrow();
    });
  });

  describe("Cryptographic Hashing", () => {
    it("produces deterministic phone hashes", () => {
      const hash1 = hashPhone("9876543210");
      const hash2 = hashPhone("9876543210");
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex
    });

    it("produces different hashes for different phones and codes", () => {
      const hashA = hashCode("9876543210", "123456");
      const hashB = hashCode("9876543210", "654321");
      const hashC = hashCode("9123456780", "123456");
      expect(hashA).not.toBe(hashB);
      expect(hashA).not.toBe(hashC);
    });
  });

  describe("JWT Session Token Verification", () => {
    it("signs and verifies session tokens properly", async () => {
      const secret = new TextEncoder().encode("lifeify-dev-secret-change-in-production-0123456789abcdef");
      const token = await new SignJWT({ sub: "user-123", role: "USER", phone: "9876543210" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(secret);

      const { payload } = await jwtVerify(token, secret);
      expect(payload.sub).toBe("user-123");
      expect(payload.role).toBe("USER");
      expect(payload.phone).toBe("9876543210");
    });
  });
});
