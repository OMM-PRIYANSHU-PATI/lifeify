import { describe, it, expect } from "vitest";
import {
  normalizer,
  ingestionEngine,
  createProvenancePoint,
  domainEventBus,
  baselineEngine,
  fitnessEngine,
  nutritionEngine,
  sleepEngine,
  medicationEngine,
  safetyEngine,
  demoGenerator,
  healthIntelligenceEngine
} from "../lib/core-engine";

describe("LIFIFY Core Health Intelligence Engine", () => {
  describe("1. Data Ingestion, Normalization & Provenance", () => {
    it("normalizes weight from pounds to kilograms", () => {
      const res = normalizer.normalize("weight", 154, "lbs");
      expect(res.unit).toBe("kg");
      expect(res.value).toBeCloseTo(69.85, 1);
    });

    it("normalizes blood glucose from mmol/L to mg/dL", () => {
      const res = normalizer.normalize("glucose", 5.5, "mmol/L");
      expect(res.unit).toBe("mg/dL");
      expect(res.value).toBe(99);
    });

    it("creates health data points with verified provenance", () => {
      const point = createProvenancePoint({
        userId: "user_test",
        sourceType: "APPLE_HEALTH",
        metricType: "resting_heart_rate",
        value: 64,
        unit: "bpm"
      });

      expect(point.sourceType).toBe("APPLE_HEALTH");
      expect(point.qualityState).toBe("VERIFIED");
      expect(point.isVerified).toBe(true);

      const ingestRes = ingestionEngine.ingestPoint(point);
      expect(ingestRes.accepted).toBe(true);
      expect(ingestRes.isDuplicate).toBe(false);

      // Re-ingest with same idempotency key -> duplicate detected
      const duplicateRes = ingestionEngine.ingestPoint(point);
      expect(duplicateRes.accepted).toBe(false);
      expect(duplicateRes.isDuplicate).toBe(true);
    });
  });

  describe("2. Domain Event Bus", () => {
    it("publishes and consumes cross-domain events", async () => {
      let received = false;
      const unsubscribe = domainEventBus.subscribe("WorkoutCompleted", (evt) => {
        if (evt.userId === "bus_user_1") {
          received = true;
        }
      });

      await domainEventBus.publish({
        id: "evt_1",
        eventType: "WorkoutCompleted",
        userId: "bus_user_1",
        timestamp: new Date(),
        payload: { durationMinutes: 45 },
        sourceType: "WEARABLE"
      });

      expect(received).toBe(true);
      unsubscribe();
    });
  });

  describe("3. Personal Baseline Engine & Z-Scores", () => {
    it("calculates rolling window stats, deltas, and z-score anomalies", () => {
      const now = new Date();
      const points = [];
      // Generate 30 days of baseline RHR at 65 bpm with variance +/- 2
      for (let i = 30; i >= 1; i--) {
        points.push(
          createProvenancePoint({
            userId: "base_user",
            sourceType: "APPLE_HEALTH",
            metricType: "resting_heart_rate",
            value: 65 + (i % 3) - 1, // 64, 65, 66
            unit: "bpm",
            capturedAt: new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          })
        );
      }

      // Add a modern spike: 82 bpm
      points.push(
        createProvenancePoint({
          userId: "base_user",
          sourceType: "APPLE_HEALTH",
          metricType: "resting_heart_rate",
          value: 82,
          unit: "bpm",
          capturedAt: now
        })
      );

      const summary = baselineEngine.calculateBaseline(points, 30);
      expect(summary).not.toBeNull();
      if (summary) {
        expect(summary.mean).toBeCloseTo(65, 0);
        expect(summary.currentValue).toBe(82);
        // 82 vs 65 with low std dev produces z-score >= 1.75
        expect(summary.zScore).toBeGreaterThanOrEqual(1.75);
        expect(summary.isSignificantDeviation).toBe(true);
        expect(summary.trend).toBe("INCREASING");
      }
    });
  });

  describe("4. Fitness Strain & Recovery Adjustment", () => {
    it("computes base strain and recovery modifier accurately", () => {
      const workout = {
        id: "wo_1",
        userId: "fit_user",
        workoutType: "Interval Running",
        durationMinutes: 45,
        intensity: "HIGH" as const,
        averageHeartRate: 155,
        maxHeartRate: 175,
        capturedAt: new Date(),
        sourceType: "WEARABLE" as const
      };

      // When readiness is low (40/100), recovery modifier increases strain
      const lowRecoveryStrain = fitnessEngine.calculateRecoveryAdjustedStrain(workout, 40);
      expect(lowRecoveryStrain.recoveryModifier).toBeGreaterThan(1.0);
      expect(lowRecoveryStrain.adjustedStrain).toBeGreaterThan(lowRecoveryStrain.baseStrain);

      // When readiness is high (95/100), recovery modifier decreases strain
      const highRecoveryStrain = fitnessEngine.calculateRecoveryAdjustedStrain(workout, 95);
      expect(highRecoveryStrain.recoveryModifier).toBeLessThan(1.0);
      expect(highRecoveryStrain.adjustedStrain).toBeLessThan(highRecoveryStrain.baseStrain);

      // Label check
      expect(["Low", "Moderate", "High", "Very High"]).toContain(lowRecoveryStrain.trainingLoadLabel);
    });

    it("generates adaptive training recommendations", () => {
      const recLow = fitnessEngine.generateAdaptiveRecommendation(45, 75);
      expect(recLow.recommendedIntensity).toBe("active_recovery");
      expect(recLow.recoveryFocus).toBe(true);

      const recHigh = fitnessEngine.generateAdaptiveRecommendation(90, 20);
      expect(recHigh.recommendedIntensity).toBe("high");
      expect(recHigh.recoveryFocus).toBe(false);
    });
  });

  describe("5. Nutrition & Indian Food Engine", () => {
    it("calculates macro variances and parses Indian foods", () => {
      const target = {
        dailyCalories: 2000,
        proteinGrams: 100,
        carbsGrams: 220,
        fatGrams: 60,
        waterMl: 2500
      };

      const intake = {
        consumedCalories: 1800,
        consumedProtein: 90,
        consumedCarbs: 210,
        consumedFat: 55,
        consumedFiber: 25,
        consumedWaterMl: 2600,
        mealCount: 3,
        loggedFoods: []
      };

      const variance = nutritionEngine.calculateVariance(intake, target);
      expect(variance.calorieVariance).toBe(-200);
      expect(variance.hydrationVariance).toBe(100);

      // Indian food parser
      const parsedRoti = nutritionEngine.parseFoodString("2 roti with dal");
      expect(parsedRoti.length).toBeGreaterThanOrEqual(1);
      expect(parsedRoti[0].isIndianItem).toBe(true);
    });
  });

  describe("6. Sleep Architecture & Readiness Index", () => {
    it("calculates composite readiness index from 0 to 100", () => {
      const sleep = {
        id: "sl_1",
        userId: "sleep_user",
        startTime: new Date(Date.now() - 8 * 3600 * 1000),
        endTime: new Date(),
        totalDurationMinutes: 480, // 8 hours
        efficiencyPercent: 92,
        awakeningsCount: 1,
        deepSleepMinutes: 95,
        lightSleepMinutes: 260,
        remSleepMinutes: 110,
        awakeMinutes: 15,
        restingHeartRate: 62,
        sourceType: "APPLE_HEALTH" as const
      };

      const readiness = sleepEngine.calculateReadinessIndex({
        latestSleep: sleep,
        recentWorkoutLoad: 25
      });

      expect(readiness.score).toBeGreaterThanOrEqual(75);
      expect(readiness.score).toBeLessThanOrEqual(100);
      expect(readiness.sleepComponent).toBeGreaterThan(25);
    });
  });

  describe("7. Medication Adherence & Temporal Symptom Tracking", () => {
    it("calculates adherence and detects temporal associations with non-causal language", () => {
      const now = new Date();
      const doseTime = new Date(now.getTime() - 3 * 3600 * 1000); // 3h ago
      const symptomTime = new Date(now.getTime() - 1 * 3600 * 1000); // 1h ago (2h after dose)

      const doseLogs = [
        {
          id: "d1",
          userId: "med_user",
          medicationId: "m1",
          medicationName: "Lisinopril",
          dosage: "10mg",
          scheduledTime: doseTime,
          actualTime: doseTime,
          eventType: "TAKEN" as const,
          sourceType: "MANUAL" as const,
          isUserConfirmed: true
        }
      ];

      const symptomLogs = [
        {
          id: "s1",
          userId: "med_user",
          symptomName: "Dizziness",
          severity: 5,
          onsetAt: symptomTime,
          sourceType: "MANUAL" as const
        }
      ];

      const adherence = medicationEngine.calculateAdherence(doseLogs, 7);
      expect(adherence.adherencePercentage).toBe(100);

      const associations = medicationEngine.detectTemporalAssociations(doseLogs, symptomLogs);
      expect(associations.length).toBe(1);
      expect(associations[0].medicationName).toBe("Lisinopril");
      expect(associations[0].symptomName).toBe("Dizziness");
      expect(associations[0].proximityMinutes).toBe(120); // 2 hours
      // Strictly non-causal observational language
      expect(associations[0].observationalStatement).toContain("logged approx.");
      expect(associations[0].observationalStatement).not.toContain("caused");
    });
  });

  describe("8. Clinical AI Safety Engine", () => {
    it("blocks unauthorized medication alteration advice", () => {
      const unsafeText = "You should stop taking your Lisinopril immediately.";
      const check = safetyEngine.validateAndSanitize(unsafeText);
      expect(check.sanitizedText).toContain("Consult your prescribing physician");
      expect(check.sanitizedText).not.toContain("stop taking your Lisinopril");
    });

    it("sanitizes autonomous disease diagnoses into conservative discussion language", () => {
      const diagnosticClaim = "You definitely have type 2 diabetes based on this.";
      const check = safetyEngine.validateAndSanitize(diagnosticClaim);
      expect(check.sanitizedText).toContain("patterns frequently discussed");
      expect(check.sanitizedText).not.toContain("You definitely have");
    });

    it("detects emergency red flags", () => {
      const emergencyText = "I have sudden crushing chest pain and shortness of breath.";
      const check = safetyEngine.validateAndSanitize(emergencyText);
      expect(check.triggeredEmergencyEscalation).toBe(true);
      expect(check.sanitizedText).toContain("seek emergency medical care immediately");
    });
  });

  describe("9. 90-Day Synthetic Longitudinal Scenario & Central Orchestration", () => {
    it("generates and orchestrates the full 90-day test scenario", () => {
      const scenario = demoGenerator.generate90DayScenario("longitudinal_test_user");
      expect(scenario.dataPoints.length).toBeGreaterThan(100);
      expect(scenario.sleepSessions.length).toBe(90);
      expect(scenario.medicationLogs.length).toBe(90);

      // Run through Central Health Intelligence Engine
      const overview = healthIntelligenceEngine.load90DayDemoScenario("longitudinal_test_user");
      expect(overview.context).toBeDefined();
      expect(overview.plan).toBeDefined();
      expect(overview.plan.readinessIndex).toBeGreaterThan(0);
      expect(overview.plan.topWhatMattersToday.length).toBeGreaterThanOrEqual(1);
      expect(overview.plan.personalizedActions.length).toBeGreaterThanOrEqual(1);
      expect(overview.context.riskSignals.length).toBeGreaterThanOrEqual(1);
    });
  });
});
