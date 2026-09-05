// Shared string-union "enums" (Prisma enums are unsupported on SQLite)
// and domain constants used across the rule engine and UI.

export const LOG_TYPES = ["STEPS", "WALK", "RUN", "WATER", "SLEEP", "MOOD", "WEIGHT", "FOOD"] as const;
export type LogType = (typeof LOG_TYPES)[number];

export const VITAL_TYPES = ["BP", "GLUCOSE", "WEIGHT", "HEART_RATE", "SPO2"] as const;
export type VitalType = (typeof VITAL_TYPES)[number];

export const RECORD_TYPES = [
  "BLOOD_REPORT",
  "PRESCRIPTION",
  "ECG",
  "SCAN",
  "DISCHARGE_SUMMARY",
  "DOCTOR_SUMMARY",
  "OTHER",
] as const;
export type RecordType = (typeof RECORD_TYPES)[number];

export const FREQUENCIES = ["OD", "BD", "TDS", "QID", "HS", "PRN", "CUSTOM"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const SLOTS = ["MORNING", "AFTERNOON", "EVENING", "NIGHT", "CUSTOM"] as const;
export type Slot = (typeof SLOTS)[number];

export const DOSE_STATUSES = ["PENDING", "TAKEN", "SKIPPED", "MISSED", "SNOOZED"] as const;
export type DoseStatus = (typeof DOSE_STATUSES)[number];

export const SEVERITIES = ["MILD", "MODERATE", "SEVERE"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const CONDITIONS = [
  "diabetes",
  "hypertension",
  "cardiovascular",
  "kidney",
  "respiratory",
  "thyroid",
  "other",
] as const;
export type Condition = (typeof CONDITIONS)[number];

export const FAMILY_RELATIONS = ["father", "mother", "grandparent", "sibling", "other"] as const;

export const FAMILY_CONDITIONS = [
  "diabetes",
  "heart_disease",
  "hypertension",
  "stroke",
  "kidney_disease",
  "cancer",
  "other",
] as const;

export const ACTIVITY_LEVELS = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "ATHLETE"] as const;
export const DIET_TYPES = ["VEG", "NON_VEG", "EGGETARIAN", "VEGAN"] as const;

export const MOOD_EMOJIS = [
  { score: 5, emoji: "😄", label: "Great" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 2, emoji: "😔", label: "Low" },
  { score: 1, emoji: "😞", label: "Very low" },
] as const;

export const NOTIFICATION_TYPES = [
  "MED_REMINDER",
  "MED_MISSED",
  "STOCK_LOW",
  "REFILL",
  "CHECK_IN",
  "FOLLOW_UP",
  "HEALTH_LOG",
  "WEEKLY_SUMMARY",
  "SYSTEM",
] as const;

// Symptoms that always route the user to seek medical care. The app never
// diagnoses — it only instructs the user to contact a professional.
export const RED_FLAG_SYMPTOMS = [
  "chest pain",
  "difficulty breathing",
  "shortness of breath",
  "severe bleeding",
  "fainting",
  "unconscious",
  "seizure",
  "stroke",
  "slurred speech",
  "face drooping",
  "severe allergic reaction",
  "swelling of face",
  "swelling of throat",
  "anaphylaxis",
  "suicidal",
  "self harm",
  "severe abdominal pain",
  "high fever with rash",
  "confusion",
  "blurred vision",
];

export function frequencyToTimes(frequency: string, customTimes: string[] = []): string[] {
  switch (frequency) {
    case "OD":
      return ["09:00"];
    case "BD":
      return ["09:00", "21:00"];
    case "TDS":
      return ["08:00", "14:00", "20:00"];
    case "QID":
      return ["06:00", "12:00", "18:00", "22:00"];
    case "HS":
      return ["22:00"];
    case "CUSTOM":
      return customTimes.length > 0 ? customTimes : ["09:00"];
    default:
      return []; // PRN — taken as needed, no fixed schedule
  }
}

export function slotForTime(time: string): Slot {
  const h = parseInt(time.split(":")[0] ?? "0", 10);
  if (h < 12) return "MORNING";
  if (h < 16) return "AFTERNOON";
  if (h < 20) return "EVENING";
  return "NIGHT";
}
