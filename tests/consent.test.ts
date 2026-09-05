import { describe, it, expect } from "vitest";
import { CONSENT_TYPES, CONSENT_METADATA } from "@/lib/consent";

describe("Consent Management", () => {
  it("defines all four required consent types for Slice 1", () => {
    expect(CONSENT_TYPES).toContain("data_processing");
    expect(CONSENT_TYPES).toContain("medical_storage");
    expect(CONSENT_TYPES).toContain("emergency_card");
    expect(CONSENT_TYPES).toContain("analytics");
    expect(CONSENT_TYPES).toHaveLength(4);
  });

  it("provides user-facing labels and descriptions for each consent", () => {
    for (const type of CONSENT_TYPES) {
      const meta = CONSENT_METADATA[type];
      expect(meta.label).toBeDefined();
      expect(meta.description).toBeDefined();
      expect(meta.description.length).toBeGreaterThan(10);
    }
  });
});
