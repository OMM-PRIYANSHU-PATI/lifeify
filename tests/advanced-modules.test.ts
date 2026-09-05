import { describe, it, expect } from "vitest";
import {
  checkDrugInteractions,
  normalizeDrugName,
} from "../lib/rules/ddi-matrix";
import {
  calculateMedicationEffectiveness,
} from "../lib/rules/pharmacokinetics";
import { calculateIDRS } from "../lib/rules/risk-scores/idrs";
import { calculateFraminghamCvdRisk } from "../lib/rules/risk-scores/framingham";
import { evaluateVitalEmergency } from "../lib/rules/emergency-triage";
import { evaluateSymptomTriage } from "../lib/rules/symptom-triage";

describe("Module 1: Advanced Drug-Drug and Food Interactions", () => {
  it("normalizes brand aliases to canonical generic names", () => {
    expect(normalizeDrugName("Glycomet 500mg")).toBe("metformin");
    expect(normalizeDrugName("Lipitor 20mg")).toBe("atorvastatin");
    expect(normalizeDrugName("Combiflam")).toBe("ibuprofen");
    expect(normalizeDrugName("Manforce 50")).toBe("sildenafil");
    expect(normalizeDrugName("Plavix 75mg")).toBe("clopidogrel");
  });

  it("detects strictly CONTRAINDICATED combinations (Sildenafil + Nitroglycerin)", () => {
    const report = checkDrugInteractions(["Manforce", "Nitroglycerin"]);
    expect(report.riskLevel).toBe("CRITICAL");
    expect(report.requiresImmediateAction).toBe(true);
    expect(report.drugDrugInteractions.length).toBeGreaterThanOrEqual(1);
    expect(report.drugDrugInteractions[0].severity).toBe("CONTRAINDICATED");
  });

  it("detects MAJOR interactions (Warfarin + Aspirin / Ibuprofen)", () => {
    const report = checkDrugInteractions(["Warfarin", "Combiflam"]);
    expect(report.riskLevel).toBe("HIGH");
    expect(report.drugDrugInteractions.some((d) => d.severity === "MAJOR")).toBe(true);
  });

  it("identifies clinically relevant food and substance interactions", () => {
    const report = checkDrugInteractions(["Atorvastatin", "Metformin"]);
    expect(report.foodInteractions.length).toBeGreaterThan(0);
    const grapefruit = report.foodInteractions.find((f) => f.foodOrSubstance.includes("Grapefruit"));
    expect(grapefruit).toBeDefined();
    expect(grapefruit?.severity).toBe("MAJOR");

    const alcohol = report.foodInteractions.find((f) => f.foodOrSubstance.includes("Alcohol"));
    expect(alcohol).toBeDefined();
  });
});

describe("Module 2: Pharmacokinetics & Predictive Effectiveness", () => {
  it("calculates steady-state progression and hours to steady state", () => {
    const projection = calculateMedicationEffectiveness({
      drugName: "metformin",
      daysSinceStarted: 14,
      adherenceRate: 100,
    });

    expect(projection.halfLifeHours).toBe(6.2);
    expect(projection.percentSteadyStateAchieved).toBeGreaterThanOrEqual(95);
    expect(projection.therapeuticStatus).toBe("OPTIMAL_THERAPEUTIC");
    expect(projection.simulationCurve.length).toBe(13); // 0 to 24 by step 2
  });

  it("penalizes therapeutic concentrations when adherence is poor", () => {
    const projection = calculateMedicationEffectiveness({
      drugName: "amlodipine",
      daysSinceStarted: 30,
      adherenceRate: 20, // severe non-adherence
    });

    expect(projection.therapeuticStatus).toBe("SUB_THERAPEUTIC");
    expect(projection.clinicalInsights.some((s) => s.includes("sub-therapeutic"))).toBe(true);
  });
});

describe("Module 3: Validated Disease-Risk Intelligence (IDRS & Framingham)", () => {
  it("correctly scores high risk on Indian Diabetes Risk Score (IDRS)", () => {
    const result = calculateIDRS({
      age: 52, // 30 pts
      gender: "MALE",
      waistCircumferenceCm: 95, // 20 pts
      physicalActivity: "NO_EXERCISE", // 30 pts
      familyHistory: "BOTH_PARENTS", // 20 pts
    });

    expect(result.score).toBe(100);
    expect(result.riskCategory).toBe("HIGH");
    expect(result.estimatedPrevalenceRiskPercent).toContain("> 60%");
  });

  it("correctly scores low risk on IDRS for young active individual", () => {
    const result = calculateIDRS({
      age: 26, // 0 pts
      gender: "FEMALE",
      waistCircumferenceCm: 74, // 0 pts
      physicalActivity: "VIGOROUS", // 0 pts
      familyHistory: "NONE", // 0 pts
    });

    expect(result.score).toBe(0);
    expect(result.riskCategory).toBe("LOW");
  });

  it("calculates Framingham 10-year CVD risk with modifiable factors", () => {
    const result = calculateFraminghamCvdRisk({
      age: 62,
      gender: "MALE",
      totalCholesterolMgDl: 285,
      hdlCholesterolMgDl: 34,
      systolicBp: 165,
      isBpTreated: true,
      isSmoker: true,
      hasDiabetes: true,
    });

    expect(result.riskCategory).toBe("HIGH");
    expect(result.tenYearRiskPercent).toBeGreaterThanOrEqual(20);
    expect(result.modifiableRiskFactors.length).toBeGreaterThanOrEqual(4);
  });
});

describe("Module 4: Emergency Dangerous-Reading Triage", () => {
  it("triggers CRITICAL_EMERGENCY and SOS modal for Hypertensive Crisis", () => {
    const result = evaluateVitalEmergency({
      systolicBp: 195,
      diastolicBp: 125,
    });

    expect(result.hasEmergency).toBe(true);
    expect(result.overallSeverity).toBe("CRITICAL_EMERGENCY");
    expect(result.requiresSosModal).toBe(true);
    expect(result.playAlarmAudio).toBe(true);
    expect(result.emergencyNumbers.some((n) => n.number === "112")).toBe(true);
  });

  it("triggers CRITICAL_EMERGENCY for severe neuroglycopenia / hypoglycemia (< 54 mg/dL)", () => {
    const result = evaluateVitalEmergency({
      glucoseMgDl: 46,
    });

    expect(result.hasEmergency).toBe(true);
    expect(result.alerts[0].vitalType).toBe("GLUCOSE");
    expect(result.alerts[0].immediateAction).toContain("15");
  });

  it("evaluates normal vitals as non-emergency", () => {
    const result = evaluateVitalEmergency({
      systolicBp: 118,
      diastolicBp: 78,
      glucoseMgDl: 92,
      spo2Percent: 99,
      heartRateBpm: 68,
    });

    expect(result.hasEmergency).toBe(false);
    expect(result.hasUrgentWarning).toBe(false);
    expect(result.overallSeverity).toBe("NORMAL");
  });
});

describe("Module 10: Algorithmic Symptom Triage Decision Trees", () => {
  it("short-circuits to EMERGENCY when FAST stroke signs or cardiac radiation present", () => {
    const result = evaluateSymptomTriage({
      primaryComplaint: "CHEST_PAIN",
      durationHours: 1,
      severityScale: 9,
      hasChestPressureRadiating: true,
      hasShortnessOfBreathAtRest: true,
      hasSuddenNeurologicalDeficit: false,
      hasConfusionOrDrowsiness: false,
      hasStiffNeckWithFever: false,
      hasSevereAbdominalRigidity: false,
      hasBloodyVomitOrStool: false,
      hasHighFeverUnresponsive: false,
      hasPersistentVomitingDehydration: false,
      age: 55,
      hasKnownCardiacHistory: true,
      hasDiabetes: true,
      hasImmunocompromise: false,
    });

    expect(result.urgency).toBe("EMERGENCY");
    expect(result.immediateInstructions.some((ins) => ins.includes("112"))).toBe(true);
  });

  it("triages unresponsive high fever as URGENT_CARE", () => {
    const result = evaluateSymptomTriage({
      primaryComplaint: "FEVER",
      durationHours: 12,
      severityScale: 6,
      hasChestPressureRadiating: false,
      hasShortnessOfBreathAtRest: false,
      hasSuddenNeurologicalDeficit: false,
      hasConfusionOrDrowsiness: false,
      hasStiffNeckWithFever: false,
      hasSevereAbdominalRigidity: false,
      hasBloodyVomitOrStool: false,
      hasHighFeverUnresponsive: true,
      hasPersistentVomitingDehydration: false,
      age: 28,
      hasKnownCardiacHistory: false,
      hasDiabetes: false,
      hasImmunocompromise: false,
    });

    expect(result.urgency).toBe("URGENT_CARE");
    expect(result.recommendedActionTimeframe).toContain("6 to 12 hours");
  });

  it("triages mild transient symptoms as SELF_CARE with red flag watch guidelines", () => {
    const result = evaluateSymptomTriage({
      primaryComplaint: "HEADACHE",
      durationHours: 4,
      severityScale: 3,
      hasChestPressureRadiating: false,
      hasShortnessOfBreathAtRest: false,
      hasSuddenNeurologicalDeficit: false,
      hasConfusionOrDrowsiness: false,
      hasStiffNeckWithFever: false,
      hasSevereAbdominalRigidity: false,
      hasBloodyVomitOrStool: false,
      hasHighFeverUnresponsive: false,
      hasPersistentVomitingDehydration: false,
      age: 24,
      hasKnownCardiacHistory: false,
      hasDiabetes: false,
      hasImmunocompromise: false,
    });

    expect(result.urgency).toBe("SELF_CARE");
    expect(result.homeCareAdvice.length).toBeGreaterThan(0);
    expect(result.warningSignsToReassess.length).toBeGreaterThan(0);
  });
});
