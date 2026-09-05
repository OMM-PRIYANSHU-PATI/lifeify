import { Rule } from "../engine";

export interface CheckinSelectionInput {
  conditions: string[];          // e.g. ["diabetes", "hypertension"]
  activeMedications: string[];   // e.g. ["Metformin 500mg", "Telma 40"]
  yesterdaySymptoms?: string[];  // e.g. ["nausea", "headache"]
}

export interface SelectedQuestion {
  code: string;
  question: string;
  type: "MOOD" | "SCALE" | "YES_NO" | "TEXT" | "CHOICE";
  options?: string[];
  reason: string;
}

export interface CheckinSelectionOutput {
  questions: SelectedQuestion[];
  totalQuestions: number;
}

export const checkinSelectionRule: Rule<CheckinSelectionInput, CheckinSelectionOutput> = {
  id: "rule_checkin_selection_v1",
  name: "Daily Check-in Question Selector",
  domain: "checkin_selection",
  evaluate(input: CheckinSelectionInput) {
    const questions: SelectedQuestion[] = [];

    // 1. Base routine questions
    questions.push({
      code: "daily_mood",
      question: "How are you feeling overall today?",
      type: "MOOD",
      options: ["1", "2", "3", "4", "5"],
      reason: "Daily baseline wellbeing check",
    });

    questions.push({
      code: "daily_energy",
      question: "How would you rate your physical energy levels?",
      type: "SCALE",
      options: ["Low", "Normal", "High"],
      reason: "Daily energy baseline",
    });

    questions.push({
      code: "daily_sleep",
      question: "Did you wake up feeling rested?",
      type: "YES_NO",
      options: ["Yes", "No"],
      reason: "Rest quality tracking",
    });

    // 2. Condition-specific deterministic modules
    const conditionSet = new Set(input.conditions.map((c) => c.toLowerCase()));

    if (conditionSet.has("diabetes")) {
      questions.push({
        code: "diabetes_symptoms",
        question: "Have you experienced any dizziness, unusual sweating, or shakiness today?",
        type: "YES_NO",
        options: ["No", "Yes"],
        reason: "Hypoglycemia awareness for logged diabetes profile",
      });
    }

    if (conditionSet.has("hypertension") || conditionSet.has("heart_disease")) {
      questions.push({
        code: "cvd_symptoms",
        question: "Have you felt any shortness of breath or unusual palpitations today?",
        type: "YES_NO",
        options: ["No", "Yes"],
        reason: "Cardiovascular symptom screening",
      });
    }

    // 3. Medication-specific check
    if (input.activeMedications.length > 0) {
      const sampleMed = input.activeMedications[0];
      questions.push({
        code: `med_side_effect_${sampleMed.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        question: `Have you noticed any side effects or discomfort from ${sampleMed}?`,
        type: "YES_NO",
        options: ["No", "Yes"],
        reason: `Active prescription monitoring for ${sampleMed}`,
      });
    }

    // 4. Follow-up to previous symptoms
    if (input.yesterdaySymptoms && input.yesterdaySymptoms.length > 0) {
      const sym = input.yesterdaySymptoms[0];
      questions.push({
        code: `symptom_followup_${sym}`,
        question: `Regarding the ${sym} you reported yesterday: is it better, unchanged, or worse?`,
        type: "CHOICE",
        options: ["Better", "Unchanged", "Worse"],
        reason: `Follow-up to symptom reported yesterday (${sym})`,
      });
    }

    const explanation = `Selected ${questions.length} questions: 3 baseline wellness, ${questions.length - 3} dynamic follow-ups based on active conditions and prescriptions.`;

    return {
      output: {
        questions,
        totalQuestions: questions.length,
      },
      explanation,
      details: { count: questions.length, codes: questions.map((q) => q.code) },
    };
  },
};
