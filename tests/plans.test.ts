import { describe, it, expect } from "vitest";
import { generateFitnessPlan, evaluatePlanAdaptation } from "../lib/rules/domains/fitness";
import { calculateTDEE, generateNutritionPlan } from "../lib/rules/domains/nutrition";
import { INDIAN_FOOD_DATABASE } from "../lib/rules/indian-foods";
import { generateSleepPlan, calculateSleepConsistency } from "../lib/rules/domains/sleep";

describe("Wellness & Plans Rule Engines", () => {
  describe("Fitness Engine", () => {
    it("generates correct schedule with 4 active days and 3 rest days", () => {
      const plan = generateFitnessPlan("weight_loss", "intermediate", 4, 45);
      expect(plan.weeklySchedule).toHaveLength(7);

      const activeDays = plan.weeklySchedule.filter((d) => !d.isRest);
      const restDays = plan.weeklySchedule.filter((d) => d.isRest);

      expect(activeDays).toHaveLength(4);
      expect(restDays).toHaveLength(3);
      expect(activeDays[0].exercises.length).toBeGreaterThan(0);
    });

    it("evaluates plan adaptation correctly based on completion threshold", () => {
      expect(evaluatePlanAdaptation(0.4).recommendation).toBe("deload");
      expect(evaluatePlanAdaptation(0.95).recommendation).toBe("increase_volume");
      expect(evaluatePlanAdaptation(0.75).recommendation).toBe("maintain");
    });
  });

  describe("Nutrition & Indian Food Engine", () => {
    it("calculates Mifflin-St Jeor TDEE with precision", () => {
      // 70kg, 175cm, 30yo, male, moderate activity (1.55)
      // BMR = 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
      // TDEE = 1648.75 * 1.55 = 2555.56 => 2556
      const tdee = calculateTDEE(70, 175, 30, "male", "moderate");
      expect(tdee).toBe(2556);
    });

    it("generates caloric deficit for weight loss and allocates authentic Indian foods", () => {
      const plan = generateNutritionPlan(70, 175, 30, "male", "moderate", "weight_loss", "veg");
      expect(plan.calorieTarget).toBe(2156); // 2556 - 400
      expect(plan.meals).toHaveLength(4);
      expect(INDIAN_FOOD_DATABASE.length).toBeGreaterThanOrEqual(10);

      // Check Indian Food integrity
      const roti = INDIAN_FOOD_DATABASE.find((f) => f.name.includes("Roti"));
      expect(roti).toBeDefined();
      expect(roti?.calories).toBe(85);
      expect(roti?.substitutionAlternative).toBeDefined();
    });
  });

  describe("Sleep Engine", () => {
    it("computes 90-minute sleep cycles, bedtime, caffeine cutoff, and wind-down time", () => {
      // Wake at 06:30, 5 cycles = 7.5 hrs sleep + 15m latency = 7h 45m before 06:30 = 22:45
      const plan = generateSleepPlan("06:30", 5);
      expect(plan.wakeTime).toBe("06:30");
      expect(plan.targetDurationH).toBe(7.5);
      expect(plan.bedtime).toBe("22:45");
      // Caffeine cutoff = 22:45 - 9 hrs = 13:45
      expect(plan.caffeineCutoff).toBe("13:45");
      // Wind-down start = 22:45 - 45 mins = 22:00
      expect(plan.windDownStart).toBe("22:00");
      expect(plan.checklist.length).toBe(6);
    });

    it("evaluates sleep consistency correctly", () => {
      const logs = [
        { bedtime: "22:40", wakeTime: "06:35" }, // Within 30 mins
        { bedtime: "22:50", wakeTime: "06:25" }, // Within 30 mins
        { bedtime: "01:00", wakeTime: "09:00" }, // Way off
      ];
      const consistency = calculateSleepConsistency(logs, "22:45", "06:30");
      expect(consistency).toBe(67); // 2 out of 3 = 67%
    });
  });
});
