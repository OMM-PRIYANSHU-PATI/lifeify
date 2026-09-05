import { describe, it, expect } from "vitest";
import { PLAN_LIMITS, checkUsageStatus } from "../lib/payments/entitlements";

describe("Subscription & Entitlements", () => {
  it("verifies plan limits for Free and Premium tiers", () => {
    expect(PLAN_LIMITS.FREE.maxRecords).toBe(5);
    expect(PLAN_LIMITS.FREE.maxFamilyMembers).toBe(1);
    expect(PLAN_LIMITS.FREE.hasWearableSync).toBe(false);

    expect(PLAN_LIMITS.PREMIUM.maxRecords).toBeGreaterThan(1000);
    expect(PLAN_LIMITS.PREMIUM.maxFamilyMembers).toBe(6);
    expect(PLAN_LIMITS.PREMIUM.hasWearableSync).toBe(true);
    expect(PLAN_LIMITS.PREMIUM.hasAdvancedAnalytics).toBe(true);
  });

  it("calculates soft cap warning at 80% and hard cap at 100%", () => {
    // 3 of 5 records = 60% => no cap
    const status60 = checkUsageStatus(3, 5);
    expect(status60.isSoftCapped).toBe(false);
    expect(status60.isHardCapped).toBe(false);
    expect(status60.percentage).toBe(60);

    // 4 of 5 records = 80% => soft cap
    const status80 = checkUsageStatus(4, 5);
    expect(status80.isSoftCapped).toBe(true);
    expect(status80.isHardCapped).toBe(false);
    expect(status80.percentage).toBe(80);

    // 5 of 5 records = 100% => hard cap
    const status100 = checkUsageStatus(5, 5);
    expect(status100.isHardCapped).toBe(true);
    expect(status100.percentage).toBe(100);
  });
});
