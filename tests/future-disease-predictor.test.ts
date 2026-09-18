import { describe, it, expect } from "vitest";
import {
  predictFutureDiseases,
  FutureDiseasePredictorInputs,
} from "@/lib/rules/risk-scores/future-disease-predictor";

describe("Future Disease Predictor Engine", () => {
  it("computes low future risk for an optimal young active profile", () => {
    const inputs: FutureDiseasePredictorInputs = {
      age: 24,
      gender: "FEMALE",
      heightCm: 165,
      weightKg: 55,
      waistCircumferenceCm: 70,
      systolicBp: 110,
      diastolicBp: 70,
      restingHeartRate: 62,
      fastingGlucoseMgDl: 85,
      hba1cPercent: 5.0,
      totalCholesterolMgDl: 160,
      hdlCholesterolMgDl: 60,
      triglyceridesMgDl: 90,
      familyDiabetes: "NONE",
      familyPrematureCad: false,
      familyHypertension: false,
      familyStroke: false,
      familyCkd: false,
      dailySteps: 11000,
      sleepHours: 8,
      smokingStatus: "NEVER",
      alcoholFrequency: "NONE",
      dietType: "WHOLE_FOODS",
      stressLevel: 3,
    };

    const report = predictFutureDiseases(inputs);

    expect(report.patientAge).toBe(24);
    expect(report.bmi).toBeLessThan(21);
    expect(report.overallFutureRiskIndex).toBeLessThan(15);
    expect(["OPTIMAL", "LOW"]).toContain(report.overallRiskTier);
    expect(report.allPredictedConditions.length).toBeGreaterThanOrEqual(6);

    // Each condition must have protocol and diagnostics
    report.allPredictedConditions.forEach((cond) => {
      expect(cond.preventionProtocol.length).toBeGreaterThan(0);
      expect(cond.recommendedDiagnostics.length).toBeGreaterThan(0);
      expect(cond.fiveYearRiskPercent).toBeLessThanOrEqual(cond.tenYearRiskPercent);
    });
  });

  it("identifies elevated multi-domain disease risks for sedentary high-risk profile", () => {
    const inputs: FutureDiseasePredictorInputs = {
      age: 54,
      gender: "MALE",
      heightCm: 170,
      weightKg: 95,
      waistCircumferenceCm: 104,
      systolicBp: 148,
      diastolicBp: 94,
      fastingGlucoseMgDl: 122,
      hba1cPercent: 6.4,
      totalCholesterolMgDl: 240,
      hdlCholesterolMgDl: 36,
      triglyceridesMgDl: 240,
      familyDiabetes: "BOTH_PARENTS",
      familyPrematureCad: true,
      familyHypertension: true,
      familyStroke: true,
      familyCkd: false,
      dailySteps: 2200,
      sleepHours: 5.5,
      smokingStatus: "CURRENT",
      alcoholFrequency: "MODERATE",
      dietType: "PROCESSED_FAST_FOOD",
      stressLevel: 8,
      symptoms: {
        frequentThirstOrUrination: true,
        morningHeadaches: true,
        postMealBrainFog: true,
      },
    };

    const report = predictFutureDiseases(inputs);

    expect(["ELEVATED", "HIGH"]).toContain(report.overallRiskTier);
    expect(report.overallFutureRiskIndex).toBeGreaterThanOrEqual(30);

    const t2d = report.allPredictedConditions.find((c) => c.id === "type_2_diabetes");
    expect(t2d).toBeDefined();
    expect(t2d!.tenYearRiskPercent).toBeGreaterThanOrEqual(35);
    expect(t2d!.rootCauses.length).toBeGreaterThan(0);

    const ascvd = report.allPredictedConditions.find((c) => c.id === "cardiovascular_disease");
    expect(ascvd).toBeDefined();
    expect(ascvd!.tenYearRiskPercent).toBeGreaterThanOrEqual(20);
  });

  it("accurately simulates risk reversibility with What-If overrides", () => {
    const baselineInputs: FutureDiseasePredictorInputs = {
      age: 48,
      gender: "MALE",
      heightCm: 172,
      weightKg: 88,
      waistCircumferenceCm: 98,
      systolicBp: 142,
      diastolicBp: 88,
      fastingGlucoseMgDl: 112,
      familyDiabetes: "ONE_PARENT",
      familyPrematureCad: true,
      familyHypertension: true,
      familyStroke: false,
      familyCkd: false,
      dailySteps: 3500,
      sleepHours: 6,
      smokingStatus: "CURRENT",
      alcoholFrequency: "OCCASIONAL",
      dietType: "HIGH_CARB_SUGAR",
      stressLevel: 7,
    };

    const baselineReport = predictFutureDiseases(baselineInputs);

    // Apply simulation: lose 7kg, +4000 steps, -14 mmHg BP, quit smoking, optimize diet
    const simulatedReport = predictFutureDiseases({
      ...baselineInputs,
      simulationOverrides: {
        weightReductionKg: 7,
        stepIncrease: 4000,
        bpReductionMmHg: 14,
        quitSmoking: true,
        optimizedDiet: true,
      },
    });

    expect(simulatedReport.bmi).toBeLessThan(baselineReport.bmi);
    expect(simulatedReport.overallFutureRiskIndex).toBeLessThan(baselineReport.overallFutureRiskIndex);
    expect(simulatedReport.simulationInsights.potentialRiskPointsReversible).toBeGreaterThan(0);
    expect(simulatedReport.simulationInsights.maxReversiblePercentage).toBeGreaterThan(15);

    // Verify condition-level 10-year risk reductions
    baselineReport.allPredictedConditions.forEach((baseCond) => {
      const simCond = simulatedReport.allPredictedConditions.find((c) => c.id === baseCond.id);
      expect(simCond).toBeDefined();
      expect(simCond!.simulatedTenYearRiskPercent).toBeLessThanOrEqual(baseCond.tenYearRiskPercent);
    });
  });

  it("safely handles omitted optional lab biomarkers with robust clinical fallbacks", () => {
    const minimalInputs: FutureDiseasePredictorInputs = {
      age: 36,
      gender: "FEMALE",
      heightCm: 160,
      weightKg: 68,
      waistCircumferenceCm: 82,
      systolicBp: 122,
      diastolicBp: 78,
      familyDiabetes: "NONE",
      familyPrematureCad: false,
      familyHypertension: false,
      familyStroke: false,
      familyCkd: false,
      dailySteps: 6000,
      sleepHours: 7,
      smokingStatus: "NEVER",
      alcoholFrequency: "NONE",
      dietType: "BALANCED",
      stressLevel: 5,
    };

    const report = predictFutureDiseases(minimalInputs);
    expect(report.overallFutureRiskIndex).toBeGreaterThan(0);
    expect(report.topFutureThreats.length).toBe(3);
    expect(report.allPredictedConditions.length).toBe(6);
  });
});
