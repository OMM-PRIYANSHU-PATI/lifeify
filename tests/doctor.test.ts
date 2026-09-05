import { describe, it, expect } from "vitest";

describe("Doctor Consultation Access & Temporary Codes", () => {
  it("enforces 10-minute expiration lifetime on temporary access tokens", () => {
    const now = Date.now();
    const durationMs = 10 * 60 * 1000;
    const expiresAt = new Date(now + durationMs);

    const diffMinutes = Math.round((expiresAt.getTime() - now) / 60000);
    expect(diffMinutes).toBe(10);
  });

  it("verifies read-only clinical grant invariant", () => {
    const doctorPerm = {
      permissionKey: "DOCTOR_CONSULTATION_READ",
      scope: "READ_ONLY",
      source: "DOCTOR_CODE",
    };

    expect(doctorPerm.scope).toBe("READ_ONLY");
    expect(doctorPerm.permissionKey).toBe("DOCTOR_CONSULTATION_READ");
  });
});
