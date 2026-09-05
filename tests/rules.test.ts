import { describe, it, expect } from "vitest";
import { evaluateRule } from "@/lib/rules/engine";
import { healthScoreRule } from "@/lib/rules/domains/health-score";
import { adherenceRule } from "@/lib/rules/domains/adherence";
import { stockRule } from "@/lib/rules/domains/stock";
import { vitalAlertRule } from "@/lib/rules/domains/alerts";
import { checkinSelectionRule } from "@/lib/rules/domains/checkin-selection";

describe("Rule Engine Foundation", () => {
  describe("Health Score Rule", () => {
    it("computes 100/100 score for perfect day targets", () => {
      const result = evaluateRule(healthScoreRule, {
        adherencePct: 100,
        sleepHours: 8,
        sleepTargetH: 8,
        steps: 6000,
        stepTarget: 6000,
        waterMl: 2000,
        waterTargetMl: 2000,
        mood: 5,
        vitalsInRangeRatio: 1,
        checkInCompleted: true,
      });

      expect(result.output.score).toBe(100);
      expect(result.output.components).toEqual({
        adherence: 30,
        sleep: 20,
        activity: 20,
        hydration: 10,
        mood: 5,
        vitals: 10,
        checkIn: 5,
      });
      expect(result.explanation).toContain("Health score of 100/100");
    });

    it("handles zero values and missing optional metrics safely", () => {
      const result = evaluateRule(healthScoreRule, {
        adherencePct: 0,
        sleepHours: null,
        sleepTargetH: 8,
        steps: 0,
        stepTarget: 6000,
        waterMl: 0,
        waterTargetMl: 2000,
        mood: null,
        vitalsInRangeRatio: null, // neutral 5 points
        checkInCompleted: false,
      });

      expect(result.output.score).toBe(5);
      expect(result.output.components.vitals).toBe(5);
      expect(result.output.components.adherence).toBe(0);
      expect(result.output.components.sleep).toBe(0);
    });
  });

  describe("Adherence Rule", () => {
    it("returns 100% when no doses are scheduled", () => {
      const result = evaluateRule(adherenceRule, {
        scheduledDoses: 0,
        takenDoses: 0,
      });
      expect(result.output.percentage).toBe(100);
      expect(result.output.status).toBe("EXCELLENT");
    });

    it("calculates accurate percentage and status for partial adherence", () => {
      const result = evaluateRule(adherenceRule, {
        scheduledDoses: 10,
        takenDoses: 7,
        windowDays: 7,
      });
      expect(result.output.percentage).toBe(70);
      expect(result.output.status).toBe("ATTENTION_NEEDED");
      expect(result.explanation).toContain("70% adherence over the last 7 days");
    });
  });

  describe("Stock & Refill Rule", () => {
    it("identifies adequate stock", () => {
      const result = evaluateRule(stockRule, {
        medicineName: "Metformin",
        currentQuantity: 30,
        dosesPerDay: 2,
        refillThresholdDays: 5,
      });
      expect(result.output.daysRemaining).toBe(15);
      expect(result.output.isLowStock).toBe(false);
      expect(result.output.refillRecommended).toBe(false);
    });

    it("triggers low stock and refill recommended when below threshold", () => {
      const result = evaluateRule(stockRule, {
        medicineName: "Metformin",
        currentQuantity: 8,
        dosesPerDay: 2,
        refillThresholdDays: 5,
      });
      expect(result.output.daysRemaining).toBe(4);
      expect(result.output.isLowStock).toBe(true);
      expect(result.output.refillRecommended).toBe(true);
      expect(result.explanation).toContain("below your 5-day refill threshold");
    });

    it("flags critical zero stock", () => {
      const result = evaluateRule(stockRule, {
        medicineName: "Telma 40",
        currentQuantity: 0,
        dosesPerDay: 1,
      });
      expect(result.output.daysRemaining).toBe(0);
      expect(result.output.isLowStock).toBe(true);
      expect(result.explanation).toContain("CRITICAL: Telma 40 is completely out of stock");
    });
  });

  describe("Range-Aware Vital Alert Rule", () => {
    it("generates purely informational alert and never diagnoses", () => {
      const result = evaluateRule(vitalAlertRule, {
        samples: [
          { type: "BP", systolic: 145, diastolic: 92, takenAt: new Date() },
          { type: "BP", systolic: 140, diastolic: 90, takenAt: new Date() },
          { type: "BP", systolic: 120, diastolic: 80, takenAt: new Date() },
        ],
        thresholdOutOfRangeCount: 2,
      });

      expect(result.output.shouldAlert).toBe(true);
      expect(result.output.outOfRangeCount).toBe(2);
      expect(result.output.informationalMessage).toContain("outside your configured target range 2 time(s)");
      expect(result.output.informationalMessage).not.toMatch(/hypertension|disease|diagnosis/i);
    });
  });

  describe("Check-in Question Selection Rule", () => {
    it("includes base wellness plus condition-specific questions", () => {
      const result = evaluateRule(checkinSelectionRule, {
        conditions: ["diabetes", "hypertension"],
        activeMedications: ["Metformin 500mg"],
        yesterdaySymptoms: ["nausea"],
      });

      const codes = result.output.questions.map((q) => q.code);
      expect(codes).toContain("daily_mood");
      expect(codes).toContain("daily_energy");
      expect(codes).toContain("daily_sleep");
      expect(codes).toContain("diabetes_symptoms");
      expect(codes).toContain("cvd_symptoms");
      expect(codes).toContain("med_side_effect_metformin_500mg");
      expect(codes).toContain("symptom_followup_nausea");
    });
  });
});
