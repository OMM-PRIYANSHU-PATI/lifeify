import { describe, it, expect } from "vitest";
import { calculateNewLevel, BADGE_DEFINITIONS, POINT_VALUES } from "../lib/rules/domains/gamification";

describe("Medication Expansion, Symptoms & Gamification", () => {
  it("calculates gamification levels deterministically based on thresholds", () => {
    expect(calculateNewLevel(0)).toBe(1);
    expect(calculateNewLevel(99)).toBe(1);
    expect(calculateNewLevel(100)).toBe(2);
    expect(calculateNewLevel(249)).toBe(2);
    expect(calculateNewLevel(250)).toBe(3);
    expect(calculateNewLevel(500)).toBe(4);
    expect(calculateNewLevel(1200)).toBe(5);
  });

  it("verifies badge definitions adhere to tier hierarchy", () => {
    expect(BADGE_DEFINITIONS.length).toBeGreaterThanOrEqual(6);
    const tiers = BADGE_DEFINITIONS.map((b) => b.tier);
    expect(tiers).toContain("bronze");
    expect(tiers).toContain("silver");
    expect(tiers).toContain("gold");
    expect(tiers).toContain("diamond");

    const medBronze = BADGE_DEFINITIONS.find((b) => b.code === "MED_BRONZE");
    expect(medBronze?.tier).toBe("bronze");
  });

  it("assigns point values according to positive behavioral outcomes", () => {
    expect(POINT_VALUES.DOSE_TAKEN).toBe(10);
    expect(POINT_VALUES.WORKOUT_COMPLETED).toBe(20);
    expect(POINT_VALUES.CHECKIN_COMPLETED).toBe(15);
  });
});
