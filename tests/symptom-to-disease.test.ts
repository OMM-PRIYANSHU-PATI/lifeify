import { describe, it, expect } from "vitest";
import {
  analyzeSymptomsWithGemini,
  SymptomToDiseaseAnalysisInput,
} from "@/lib/medical/gemini-symptom-analyzer";
import { resolveQuerySymptoms } from "@/lib/medical/inference-engine";

describe("Symptom to Disease Analyzer with Gemini AI Integration", () => {
  it("resolves raw user queries into structured symptom records", () => {
    const resolved = resolveQuerySymptoms(["Fever", "Cough", "Sharp Chest Pain", "Headache"]);
    expect(resolved.length).toBe(4);

    const chestPain = resolved.find((s) => s.id === "sharp_chest_pain");
    expect(chestPain).toBeDefined();
    expect(chestPain!.isRedFlag).toBe(true);

    const fever = resolved.find((s) => s.name.toLowerCase().includes("fever"));
    expect(fever).toBeDefined();
    expect(fever!.organSystem).toContain("Constitutional");
  });

  it("computes ranked differential diagnoses for respiratory symptoms", async () => {
    const input: SymptomToDiseaseAnalysisInput = {
      symptoms: ["Fever", "Cough", "Fatigue"],
      severity: 6,
      durationDays: 3,
      age: 32,
    };

    const result = await analyzeSymptomsWithGemini(input);

    expect(result.symptomsAnalyzed.length).toBe(3);
    expect(result.differentialDiagnosis.length).toBeGreaterThanOrEqual(1);
    expect(result.differentialDiagnosis[0].diseaseName).toBeTruthy();
    expect(result.differentialDiagnosis[0].probabilityPercent).toBeGreaterThan(0);
    expect(result.differentialDiagnosis[0].clinicalRationale).toBeTruthy();
    expect(result.targetedQuestions.length).toBeGreaterThan(0);
    expect(result.recommendedDiagnostics.length).toBeGreaterThan(0);
    expect(result.evidenceBasedRelief.length).toBeGreaterThan(0);
  });

  it("escalates triage urgency to EMERGENCY when red flag symptoms are present", async () => {
    const input: SymptomToDiseaseAnalysisInput = {
      symptoms: ["Chest Pain", "Shortness of Breath", "Sweating"],
      severity: 9,
      durationDays: 1,
      age: 58,
      vitals: {
        heartRate: 110,
        systolicBp: 165,
        spO2: 91,
      },
    };

    const result = await analyzeSymptomsWithGemini(input);

    expect(result.overallTriageUrgency).toBe("EMERGENCY");
    expect(result.triageHeadline.toLowerCase()).toContain("emergency");
    expect(result.ruleOutConditions).toContain("Acute Coronary Syndrome (ACS)");
    expect(result.redFlagWarnings.length).toBeGreaterThan(0);
  });

  it("adapts clinical questions and recommendations based on answered follow-up inputs", async () => {
    const input: SymptomToDiseaseAnalysisInput = {
      symptoms: ["Headache", "Fever"],
      severity: 7,
      durationDays: 2,
      answeredQuestions: {
        q_fever_neck: true, // indicates neck stiffness
      },
    };

    const result = await analyzeSymptomsWithGemini(input);

    expect(result.differentialDiagnosis.length).toBeGreaterThan(0);
    expect(result.doctorDiscussionSummary.length).toBeGreaterThan(0);
  });
});
