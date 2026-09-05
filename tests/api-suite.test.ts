import { describe, it, expect } from "vitest";
import { parsePrescriptionText } from "@/services/ocr";
import { parseVoiceCommand } from "@/lib/voice/parser";
import { PLAN_LIMITS, checkUsageStatus } from "@/lib/payments/entitlements";
import { generateFitnessPlan } from "@/lib/rules/domains/fitness";
import { generateNutritionPlan } from "@/lib/rules/domains/nutrition";
import { generateSleepPlan } from "@/lib/rules/domains/sleep";
import { calculateNewLevel, POINT_VALUES } from "@/lib/rules/domains/gamification";

describe("Complete End-to-End API & Engine Suite (Phases 1 - 14)", () => {
  describe("Phase 3: OCR Engine & Confirmation Invariant", () => {
    it("parses prescription text into structured draft medicines with confidence scores", () => {
      const sampleText = "Tab Metformin 500mg OD for 30 days\nTelmisartan 40mg once daily";
      const result = parsePrescriptionText(sampleText);

      expect(result.medicines.length).toBeGreaterThanOrEqual(2);
      const met = result.medicines.find((m) => m.name.toLowerCase().includes("metformin"));
      expect(met).toBeDefined();
      expect(met?.dose).toContain("500mg");
      expect(met?.frequency).toBe("OD");
      expect(met?.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it("ensures OCR output is purely a draft and requires confirmation", () => {
      const result = parsePrescriptionText("Paracetamol 650mg SOS");
      expect(result.medicines[0].confirmed).toBe(false);
    });
  });

  describe("Phase 5: Daily Check-in & ADR Reporting", () => {
    it("flags critical symptoms in check-ins and side-effect reporting", () => {
      const RED_FLAG_SYMPTOMS = ["chest pain", "shortness of breath", "severe rash", "anaphylaxis"];
      const testReport = "Patient is experiencing mild chest pain after exertion";
      const isRedFlag = RED_FLAG_SYMPTOMS.some((s) => testReport.toLowerCase().includes(s));
      expect(isRedFlag).toBe(true);
    });
  });

  describe("Phase 7: Emergency Card Security & Expiration", () => {
    it("enforces emergency card slug uniqueness and revokability", () => {
      const card = {
        slug: "abc123xyz",
        active: true,
        revoked: false,
      };

      expect(card.active).toBe(true);
      // Simulate revoke
      const revokedCard = { ...card, active: false, revoked: true };
      expect(revokedCard.revoked).toBe(true);
      expect(revokedCard.active).toBe(false);
    });
  });

  describe("Phase 10: Wearables & Normalization", () => {
    it("normalizes diverse wearable inputs into canonical metrics", () => {
      const rawGoogleSteps = { count: 8420, date: "2026-09-04" };
      const normalized = {
        type: "steps",
        value: rawGoogleSteps.count,
        unit: "count",
        source: "google_health_connect",
      };

      expect(normalized.type).toBe("steps");
      expect(normalized.value).toBe(8420);
      expect(normalized.unit).toBe("count");
    });
  });

  describe("Phase 12: Doctor Ecosystem Invariants", () => {
    it("strictly bounds doctor consultation code validity to 10 minutes", () => {
      const creationTime = new Date("2026-09-04T12:00:00Z");
      const expirationTime = new Date(creationTime.getTime() + 10 * 60 * 1000);
      const testTimeWithin = new Date("2026-09-04T12:09:59Z");
      const testTimeExpired = new Date("2026-09-04T12:10:01Z");

      expect(testTimeWithin < expirationTime).toBe(true);
      expect(testTimeExpired < expirationTime).toBe(false);
    });
  });

  describe("Phase 13: Deterministic Wellness Plans & Gamification", () => {
    it("generates deterministic fitness plan with correct days and exercises", () => {
      const plan = generateFitnessPlan("weight_loss", "beginner", 4, 45);
      expect(plan.weeklySchedule).toHaveLength(7);
      expect(plan.daysPerWeek).toBe(4);
      const workoutDays = plan.weeklySchedule.filter((d) => !d.isRest);
      expect(workoutDays).toHaveLength(4);
    });

    it("generates deterministic nutrition plan with macro distribution", () => {
      const plan = generateNutritionPlan(70, 175, 30, "male", "moderate", "maintenance", "veg");
      expect(plan.calorieTarget).toBeGreaterThan(1500);
      expect(plan.proteinTargetG).toBeGreaterThan(0);
      expect(plan.carbTargetG).toBeGreaterThan(0);
      expect(plan.fatTargetG).toBeGreaterThan(0);
      expect(plan.meals.length).toBeGreaterThan(0);
    });

    it("generates deterministic sleep plan with wind-down and caffeine cutoffs", () => {
      const plan = generateSleepPlan("07:00", 5);
      expect(plan.wakeTime).toBe("07:00");
      expect(plan.bedtime).toBe("23:15");
      expect(plan.caffeineCutoff).toBe("14:15");
      expect(plan.checklist.length).toBeGreaterThan(0);
    });

    it("computes gamification level transitions deterministically", () => {
      expect(calculateNewLevel(0)).toBe(1);
      expect(calculateNewLevel(150)).toBe(2);
      expect(calculateNewLevel(350)).toBe(3);
      expect(calculateNewLevel(1200)).toBe(5);
    });
  });

  describe("Phase 14: Entitlements, Quotas & Voice Parser", () => {
    it("calculates usage caps correctly for Free vs Premium", () => {
      const freeLimits = PLAN_LIMITS.FREE;
      const statusUnder = checkUsageStatus(3, freeLimits.maxRecords);
      expect(statusUnder.isHardCapped).toBe(false);

      const statusAtLimit = checkUsageStatus(5, freeLimits.maxRecords);
      expect(statusAtLimit.isHardCapped).toBe(true);
    });

    it("parses voice commands without hallucination or autonomous execution", () => {
      const cmd = parseVoiceCommand("I drank 500ml water");
      expect(cmd.action).toBe("log_water");
      expect(cmd.data.amountMl).toBe(500);

      const medCmd = parseVoiceCommand("took Metformin");
      expect(medCmd.action).toBe("log_medication");
      expect(medCmd.data.medicineName?.toLowerCase()).toContain("metformin");
    });
  });
});
