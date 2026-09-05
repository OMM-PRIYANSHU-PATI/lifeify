/**
 * Deterministic Tri-Factor Health Predictor Engine
 *
 * Predicts Sleep Duration, Sleep Quality, Mood Score, and Recovery Readiness
 * using a gamified 4-question daily check-in.
 */

export type WakeupVibe = "rocket" | "fresh" | "coffee" | "snooze" | "zombie";
export type SleepArchitecture = "hyperspace" | "solid" | "screen_toss" | "night_owl" | "insomnia";
export type MoodWeather = "radiant" | "breeze" | "clouds" | "rain" | "storm";
export type PhysicalBattery = "battery_100" | "battery_80" | "battery_55" | "battery_35" | "battery_15";

export interface TriFactorQuizAnswers {
  wakeupVibe: WakeupVibe;
  sleepArch: SleepArchitecture;
  moodWeather: MoodWeather;
  physicalBattery: PhysicalBattery;
}

export type RecoveryStatus = "PEAK_READINESS" | "OPTIMAL" | "MODERATE" | "REST_PRIORITY";

export interface TriFactorPrediction {
  sleepHours: number;
  sleepQuality: number; // 0–100%
  sleepQualityRating: number; // 1–5
  sleepStageLabel: string;
  moodScore: number; // 1–5
  moodValence: string;
  moodAura: string;
  recoveryScore: number; // 0–100%
  recoveryStatus: RecoveryStatus;
  recoveryStatusLabel: string;
  actionableAdvice: string;
  suggestedFocus: string;
}

const SLEEP_ARCH_CONFIG: Record<SleepArchitecture, { baseHours: number; baseQuality: number; label: string }> = {
  hyperspace: { baseHours: 8.5, baseQuality: 94, label: "Deep Restorative Slumber" },
  solid: { baseHours: 7.5, baseQuality: 82, label: "Solid Steady Sleep" },
  screen_toss: { baseHours: 6.2, baseQuality: 62, label: "Restless / Light Sleep" },
  night_owl: { baseHours: 5.2, baseQuality: 48, label: "Short / Interrupted Sleep" },
  insomnia: { baseHours: 4.0, baseQuality: 28, label: "Fragmented / Insufficient Rest" },
};

const WAKEUP_VIBE_CONFIG: Record<WakeupVibe, { hourDelta: number; qualityDelta: number; recoveryDelta: number }> = {
  rocket: { hourDelta: 0.3, qualityDelta: 6, recoveryDelta: 12 },
  fresh: { hourDelta: 0.1, qualityDelta: 3, recoveryDelta: 8 },
  coffee: { hourDelta: 0.0, qualityDelta: 0, recoveryDelta: 0 },
  snooze: { hourDelta: -0.2, qualityDelta: -4, recoveryDelta: -8 },
  zombie: { hourDelta: -0.4, qualityDelta: -8, recoveryDelta: -16 },
};

const MOOD_WEATHER_CONFIG: Record<MoodWeather, { score: number; valence: string; aura: string; recoveryDelta: number }> = {
  radiant: { score: 5, valence: "Radiant & Optimistic", aura: "☀️ Sunny Gold", recoveryDelta: 8 },
  breeze: { score: 4, valence: "Calm & Centered", aura: "🌤️ Emerald Calm", recoveryDelta: 4 },
  clouds: { score: 3, valence: "Slightly Overwhelmed", aura: "⛅ Silver Mist", recoveryDelta: 0 },
  rain: { score: 2, valence: "Anxious & Tense", aura: "🌧️ Steel Blue", recoveryDelta: -8 },
  storm: { score: 1, valence: "Exhausted & Stormy", aura: "⛈️ Charcoal Storm", recoveryDelta: -14 },
};

const BATTERY_CONFIG: Record<PhysicalBattery, { baseRecovery: number; label: string }> = {
  battery_100: { baseRecovery: 92, label: "Prime Vitality" },
  battery_80: { baseRecovery: 80, label: "High Capacity" },
  battery_55: { baseRecovery: 60, label: "Moderate Fatigue" },
  battery_35: { baseRecovery: 42, label: "Sore & Weary" },
  battery_15: { baseRecovery: 24, label: "Deep Depletion" },
};

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Predicts Recovery, Mood, and Sleep metrics based on gamified quiz responses.
 */
export function predictTriFactor(answers: TriFactorQuizAnswers): TriFactorPrediction {
  const arch = SLEEP_ARCH_CONFIG[answers.sleepArch] ?? SLEEP_ARCH_CONFIG.solid;
  const wake = WAKEUP_VIBE_CONFIG[answers.wakeupVibe] ?? WAKEUP_VIBE_CONFIG.coffee;
  const mood = MOOD_WEATHER_CONFIG[answers.moodWeather] ?? MOOD_WEATHER_CONFIG.breeze;
  const batt = BATTERY_CONFIG[answers.physicalBattery] ?? BATTERY_CONFIG.battery_80;

  // 1. Calculate Sleep Duration & Quality
  const rawHours = arch.baseHours + wake.hourDelta;
  const sleepHours = clamp(Math.round(rawHours * 10) / 10, 3.0, 11.5);

  const rawQuality = arch.baseQuality + wake.qualityDelta;
  const sleepQuality = clamp(Math.round(rawQuality), 15, 98);
  const sleepQualityRating = clamp(Math.round((sleepQuality / 100) * 4) + 1, 1, 5);

  // 2. Calculate Mood
  const moodScore = mood.score;
  const moodValence = mood.valence;
  const moodAura = mood.aura;

  // 3. Calculate Recovery Score (0–100%)
  const rawRecovery = batt.baseRecovery + wake.recoveryDelta + mood.recoveryDelta;
  const recoveryScore = clamp(Math.round(rawRecovery), 12, 98);

  // 4. Status and Actionable Clinical Advice
  let recoveryStatus: RecoveryStatus = "OPTIMAL";
  let recoveryStatusLabel = "Optimal Capacity";
  let actionableAdvice = "Solid baseline stamina. Safe for regular workout routines and full workday productivity.";
  let suggestedFocus = "Maintain steady hydration (2.0L+) and balanced protein pacing.";

  if (recoveryScore >= 85) {
    recoveryStatus = "PEAK_READINESS";
    recoveryStatusLabel = "Peak Readiness";
    actionableAdvice = "Your nervous system and musculature are primed! Excellent day for progressive resistance, cardio intervals, or demanding cognitive focus.";
    suggestedFocus = "High-energy window: tackle your most demanding physical or creative tasks.";
  } else if (recoveryScore >= 70) {
    recoveryStatus = "OPTIMAL";
    recoveryStatusLabel = "Optimal Capacity";
    actionableAdvice = "Great recharge. Your body is well balanced to handle moderate-to-high strain without excessive fatigue accumulation.";
    suggestedFocus = "Steady pacing: standard workout, 2.5L hydration, consistent nutrition.";
  } else if (recoveryScore >= 50) {
    recoveryStatus = "MODERATE";
    recoveryStatusLabel = "Moderate Recovery";
    actionableAdvice = "Mild systemic fatigue detected. Prioritize active recovery, light mobility, and avoid excessive late caffeine.";
    suggestedFocus = "Zone 2 walks, stretching, and wind down 30 mins earlier tonight.";
  } else {
    recoveryStatus = "REST_PRIORITY";
    recoveryStatusLabel = "Rest & Recharge Priority";
    actionableAdvice = "Your biological reserves are low. High intensity today may delay full adaptation. Take a gentle walk, nap if possible, and aim for 8+ hours sleep.";
    suggestedFocus = "Rest day: prioritize warm fluids, magnesium-rich foods, and minimal screen time.";
  }

  return {
    sleepHours,
    sleepQuality,
    sleepQualityRating,
    sleepStageLabel: arch.label,
    moodScore,
    moodValence,
    moodAura,
    recoveryScore,
    recoveryStatus,
    recoveryStatusLabel,
    actionableAdvice,
    suggestedFocus,
  };
}
