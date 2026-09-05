// Pure, dependency-free rule functions — the deterministic core of V1.
// Kept free of "server-only" and Prisma imports so unit tests can cover them.

export type ScoreInput = {
  steps: number;
  waterMl: number;
  sleepHours: number | null;
  mood: number | null; // 1..5
  adherencePct: number; // 0..100
  vitalsInRangeRatio: number | null; // 0..1, null = no vitals recorded
};

export type ScoreTargets = { stepTarget: number; waterTargetMl: number; sleepTargetH: number };

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// Rule-based Health Score (0–100): activity 20, hydration 15, sleep 20,
// mood 15, medication 20, vitals 10.
export function computeHealthScore(input: ScoreInput, targets: ScoreTargets): number {
  const activity = clamp(Math.round((input.steps / Math.max(1, targets.stepTarget)) * 20), 0, 20);
  const hydration = clamp(Math.round((input.waterMl / Math.max(1, targets.waterTargetMl)) * 15), 0, 15);

  let sleep = 0;
  if (input.sleepHours != null) {
    const ratio = input.sleepHours / targets.sleepTargetH;
    sleep = ratio >= 0.85 && ratio <= 1.25 ? 20 : ratio >= 0.7 ? 14 : ratio >= 0.5 ? 8 : 3;
  }

  let mood = 0;
  if (input.mood != null) mood = Math.round(((input.mood - 1) / 4) * 15);

  const medication = Math.round((clamp(input.adherencePct, 0, 100) / 100) * 20);
  const vitals = input.vitalsInRangeRatio == null ? 5 : Math.round(input.vitalsInRangeRatio * 10);

  return clamp(activity + hydration + sleep + mood + medication + vitals, 0, 100);
}

// Informational range checks only — the app never diagnoses.
export function isVitalInRange(type: string, systolic: number | null, diastolic: number | null, value: number | null): boolean {
  switch (type) {
    case "BP":
      if (systolic == null || diastolic == null) return true;
      return systolic < 130 && diastolic < 85;
    case "GLUCOSE":
      if (value == null) return true;
      return value >= 70 && value <= 140;
    case "HEART_RATE":
      if (value == null) return true;
      return value >= 60 && value <= 100;
    case "SPO2":
      if (value == null) return true;
      return value >= 95;
    default:
      return true;
  }
}

export function stockDaysRemaining(remainingQty: number, dailyRequired: number): number {
  if (dailyRequired <= 0) return Number.POSITIVE_INFINITY;
  return remainingQty / dailyRequired;
}

export function adherencePct(taken: number, scheduled: number): number {
  if (scheduled <= 0) return 100;
  return Math.round((taken / scheduled) * 100);
}

// Check-in answer classification: certain answers always route to seek care.
export function classifyAnswer(questionCode: string, answer: string): "NORMAL" | "WARNING" | "RED_FLAG" {
  const RED_FLAGS: Record<string, string[]> = {
    new_symptoms: ["chest pain", "difficulty breathing", "severe bleeding", "fainting", "slurred speech", "face drooping", "seizure", "unconscious"],
    worsening_symptoms: ["chest pain", "difficulty breathing", "fainting"],
    side_effect_present: ["anaphylaxis", "swelling of face", "swelling of throat", "severe rash"],
  };
  const WARNING_CODES = new Set(["worsening_symptoms", "side_effect_present", "missed_doses", "glucose_concern", "bp_concern"]);

  const a = answer.toLowerCase().trim();
  for (const phrase of RED_FLAGS[questionCode] ?? []) {
    if (a.includes(phrase)) return "RED_FLAG";
  }
  if (WARNING_CODES.has(questionCode) && a && a !== "no" && a !== "none") return "WARNING";
  return "NORMAL";
}

export const RED_FLAG_MESSAGE =
  "Your response includes a symptom that may need urgent attention. Please contact your doctor or local emergency services right away. LIFEIFY does not diagnose — when in doubt, seek professional care immediately.";

// Allergy match: candidate medicine name/ingredient vs allergy substances.
export function matchAllergies(allergySubstances: string[], name: string, activeIngredient?: string | null): string[] {
  const candidates = [name, activeIngredient ?? ""].map((s) => s.toLowerCase().trim()).filter(Boolean);
  return allergySubstances.filter((substance) => {
    const s = substance.toLowerCase().trim();
    if (!s) return false;
    return candidates.some((c) => c.includes(s) || s.includes(c));
  });
}

export type MedRef = { id: string; name: string; activeIngredient: string | null };
export type DrugRef = { brandName: string; activeIngredient: string };

// Duplicate detection: same resolved active ingredient across two active meds.
export function matchDuplicateIngredient(activeMeds: MedRef[], candidate: MedRef, drugRefs: DrugRef[]): MedRef[] {
  const normalized = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const resolve = (med: MedRef): string | null => {
    if (med.activeIngredient) return med.activeIngredient.toLowerCase().trim();
    const ref = drugRefs.find((r) => normalized(r.brandName) === normalized(med.name));
    return ref ? ref.activeIngredient.toLowerCase().trim() : null;
  };
  const candidateIngredient = resolve(candidate);
  if (!candidateIngredient) return [];
  return activeMeds.filter((med) => resolve(med) === candidateIngredient);
}

// Red-flag side effects always routed to seek-care messaging (never a diagnosis).
export const RED_FLAG_SIDE_EFFECTS = [
  "anaphylaxis", "swelling of face", "swelling of throat", "difficulty breathing", "chest pain",
  "severe rash", "yellowing of skin", "yellowing of eyes", "blood in stool", "blood in urine",
  "fainting", "severe dizziness", "irregular heartbeat",
];

export function isRedFlagSideEffect(name: string, severity: string): boolean {
  return RED_FLAG_SIDE_EFFECTS.some((f) => name.toLowerCase().includes(f)) || severity === "SEVERE";
}
