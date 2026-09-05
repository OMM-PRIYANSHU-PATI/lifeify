/**
 * Advanced Deterministic Tri-Factor Health Matrix Predictor Engine
 *
 * Infers Sleep Duration, Sleep Quality, Deep/REM Restorative Balance,
 * Mood Score, Stress Index, and Autonomic Recovery Readiness
 * through multi-question topic rounds without asking direct hours.
 */

export type BedtimeWindow = "pre_1030" | "around_11" | "midnight" | "late_night" | "wee_hours";
export type DriftOffSpeed = "instant" | "peaceful" | "racing_mind" | "insomnia_toss";
export type NightWakeups = "none" | "one_brief" | "tossed_2_3" | "wide_awake_gap" | "restless_storm";

export type WakeupTrigger = "before_alarm" | "gentle_alarm" | "snooze_war" | "jolted_abrupt";
export type BodyMobility = "limber_spring" | "steady_normal" | "heavy_achy" | "deep_exhaustion";
export type AutonomicBreath = "deep_calm" | "steady_even" | "fluttery_tight";

export type BootupMindset = "excited_ready" | "calm_grounded" | "overwhelmed_todos" | "stormy_drained";
export type CognitiveClarity = "laser_4k" | "steady_coffee" | "foggy_scattered" | "spaced_out";
export type SocialBattery = "full_friendly" | "selective_peace" | "headphones_on" | "irritable_short";

export interface MultiQuestionQuizAnswers {
  // Round 1: Night Passage
  bedtimeWindow: BedtimeWindow;
  driftOffSpeed: DriftOffSpeed;
  nightWakeups: NightWakeups;
  // Round 2: Morning Boot
  wakeupTrigger: WakeupTrigger;
  bodyMobility: BodyMobility;
  autonomicBreath: AutonomicBreath;
  // Round 3: Mind Radar
  bootupMindset: BootupMindset;
  cognitiveClarity: CognitiveClarity;
  socialBattery: SocialBattery;
}

export type RecoveryStatus = "PEAK_READINESS" | "OPTIMAL" | "MODERATE" | "REST_PRIORITY";

export interface FullHealthMatrixPrediction {
  // 1. Sleep Matrix
  sleepHours: number; // e.g. 7.6 hrs
  sleepQuality: number; // 0–100%
  sleepEfficiency: number; // 0–100%
  deepSleepScore: number; // 0–100%
  sleepStageLabel: string;
  sleepDebtStatus: string;

  // 2. Mood Matrix
  moodScore: number; // 1–5
  moodValence: string;
  moodAura: string;
  stressIndex: number; // 0–100%
  socialBandwidth: string;
  cognitiveClarityLabel: string;

  // 3. Recovery Matrix
  recoveryScore: number; // 0–100%
  recoveryStatus: RecoveryStatus;
  recoveryStatusLabel: string;
  muscularTone: string;
  autonomicTone: string;
  recommendedStrain: string;
  actionableAdvice: string;
  suggestedFocus: string;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

const BEDTIME_CONFIG: Record<BedtimeWindow, { baseInBed: number; desc: string }> = {
  pre_1030: { baseInBed: 8.8, desc: "Early Sleep Sanctuary" },
  around_11: { baseInBed: 8.0, desc: "Standard Circadian Rhythm" },
  midnight: { baseInBed: 7.2, desc: "Midnight Drift" },
  late_night: { baseInBed: 5.8, desc: "Late Night Compression" },
  wee_hours: { baseInBed: 4.4, desc: "Wee Hours Shift" },
};

const DRIFT_CONFIG: Record<DriftOffSpeed, { latencyHours: number; effBonus: number }> = {
  instant: { latencyHours: 0.15, effBonus: 5 },
  peaceful: { latencyHours: 0.35, effBonus: 3 },
  racing_mind: { latencyHours: 0.75, effBonus: -6 },
  insomnia_toss: { latencyHours: 1.35, effBonus: -15 },
};

const WAKEUP_LOSS_CONFIG: Record<NightWakeups, { lostHours: number; effBonus: number; deepScore: number }> = {
  none: { lostHours: 0.0, effBonus: 6, deepScore: 94 },
  one_brief: { lostHours: 0.2, effBonus: 1, deepScore: 84 },
  tossed_2_3: { lostHours: 0.6, effBonus: -8, deepScore: 64 },
  wide_awake_gap: { lostHours: 1.0, effBonus: -16, deepScore: 46 },
  restless_storm: { lostHours: 1.4, effBonus: -24, deepScore: 28 },
};

const WAKEUP_TRIGGER_CONFIG: Record<WakeupTrigger, { inertiaHours: number; recovDelta: number; moodDelta: number }> = {
  before_alarm: { inertiaHours: 0.2, recovDelta: 8, moodDelta: 4 },
  gentle_alarm: { inertiaHours: 0.0, recovDelta: 4, moodDelta: 2 },
  snooze_war: { inertiaHours: -0.3, recovDelta: -6, moodDelta: -4 },
  jolted_abrupt: { inertiaHours: -0.4, recovDelta: -10, moodDelta: -8 },
};

const MOBILITY_CONFIG: Record<BodyMobility, { baseRecovery: number; muscleTone: string }> = {
  limber_spring: { baseRecovery: 90, muscleTone: "Supple & Primed" },
  steady_normal: { baseRecovery: 78, muscleTone: "Normal Healthy Baseline" },
  heavy_achy: { baseRecovery: 56, muscleTone: "Achy / Micro-Strain" },
  deep_exhaustion: { baseRecovery: 30, muscleTone: "High Fatigue & Tightness" },
};

const BREATH_CONFIG: Record<AutonomicBreath, { recovDelta: number; stressBase: number; tone: string }> = {
  deep_calm: { recovDelta: 8, stressBase: 18, tone: "High Parasympathetic Tone (Rest & Digest)" },
  steady_even: { recovDelta: 2, stressBase: 38, tone: "Balanced Autonomic Equilibrium" },
  fluttery_tight: { recovDelta: -10, stressBase: 72, tone: "Elevated Sympathetic Tone (Fight or Flight)" },
};

const MINDSET_CONFIG: Record<BootupMindset, { moodBase: number; valence: string; aura: string; recovDelta: number; stressDelta: number }> = {
  excited_ready: { moodBase: 5, valence: "Radiant & Driven", aura: "☀️ Sunny Gold", recovDelta: 6, stressDelta: -10 },
  calm_grounded: { moodBase: 4, valence: "Calm & Centered", aura: "🌤️ Emerald Calm", recovDelta: 3, stressDelta: -6 },
  overwhelmed_todos: { moodBase: 2, valence: "Tense & Overloaded", aura: "🌧️ Steel Blue", recovDelta: -6, stressDelta: 16 },
  stormy_drained: { moodBase: 1, valence: "Emotionally Drained", aura: "⛈️ Charcoal Storm", recovDelta: -12, stressDelta: 24 },
};

const CLARITY_CONFIG: Record<CognitiveClarity, { clarityScore: number; label: string; recovDelta: number }> = {
  laser_4k: { clarityScore: 95, label: "4K Laser Focus", recovDelta: 4 },
  steady_coffee: { clarityScore: 80, label: "Steady Baseline", recovDelta: 0 },
  foggy_scattered: { clarityScore: 48, label: "Hazy Brain Fog", recovDelta: -5 },
  spaced_out: { clarityScore: 24, label: "Cognitive Disconnect", recovDelta: -8 },
};

const SOCIAL_CONFIG: Record<SocialBattery, { bandwidth: string; moodDelta: number }> = {
  full_friendly: { bandwidth: "High Social Capacity (Extroverted)", moodDelta: 0.3 },
  selective_peace: { bandwidth: "Balanced & Polite (Selective)", moodDelta: 0.0 },
  headphones_on: { bandwidth: "Low Social Buffer (Do Not Disturb)", moodDelta: -0.3 },
  irritable_short: { bandwidth: "Critical Short Fuse (Tense)", moodDelta: -0.6 },
};

/**
 * Multi-Question Matrix Prediction Algorithm
 */
export function predictFullHealthMatrix(answers: MultiQuestionQuizAnswers): FullHealthMatrixPrediction {
  const bed = BEDTIME_CONFIG[answers.bedtimeWindow] ?? BEDTIME_CONFIG.around_11;
  const drift = DRIFT_CONFIG[answers.driftOffSpeed] ?? DRIFT_CONFIG.peaceful;
  const wakeLoss = WAKEUP_LOSS_CONFIG[answers.nightWakeups] ?? WAKEUP_LOSS_CONFIG.one_brief;
  const wakeTrig = WAKEUP_TRIGGER_CONFIG[answers.wakeupTrigger] ?? WAKEUP_TRIGGER_CONFIG.gentle_alarm;
  const mobility = MOBILITY_CONFIG[answers.bodyMobility] ?? MOBILITY_CONFIG.steady_normal;
  const breath = BREATH_CONFIG[answers.autonomicBreath] ?? BREATH_CONFIG.steady_even;
  const mindset = MINDSET_CONFIG[answers.bootupMindset] ?? MINDSET_CONFIG.calm_grounded;
  const clarity = CLARITY_CONFIG[answers.cognitiveClarity] ?? CLARITY_CONFIG.steady_coffee;
  const social = SOCIAL_CONFIG[answers.socialBattery] ?? SOCIAL_CONFIG.selective_peace;

  // 1. SLEEP MATRIX CALCULATIONS
  // Net actual sleep = Total in bed - drift off latency - wake up loss + wake quality buffer
  const rawSleep = bed.baseInBed - drift.latencyHours - wakeLoss.lostHours + wakeTrig.inertiaHours;
  const sleepHours = clamp(Math.round(rawSleep * 10) / 10, 3.0, 11.0);

  // Sleep Efficiency %
  const baseEff = 86 + drift.effBonus + wakeLoss.effBonus;
  const sleepEfficiency = clamp(Math.round(baseEff), 40, 98);

  // Deep Sleep Restorative Index
  const deepSleepScore = clamp(Math.round(wakeLoss.deepScore + (mobility.baseRecovery > 70 ? 4 : -6)), 20, 98);

  // Overall Sleep Quality Score
  const sleepQuality = clamp(Math.round((sleepEfficiency * 0.5) + (deepSleepScore * 0.5)), 20, 98);

  // Sleep debt label
  const sleepDebtStatus =
    sleepHours >= 7.5 ? "Surplus / Fully Recharged" : sleepHours >= 6.5 ? "Balanced" : "Accumulated Sleep Debt (-1.5h+)";

  // 2. MOOD MATRIX CALCULATIONS
  const rawMood = mindset.moodBase + social.moodDelta + (sleepHours >= 7.0 ? 0.2 : -0.4);
  const moodScore = clamp(Math.round(rawMood), 1, 5);
  const stressIndex = clamp(Math.round(breath.stressBase + mindset.stressDelta), 10, 95);

  // 3. RECOVERY MATRIX CALCULATIONS
  const rawRecovery =
    mobility.baseRecovery +
    breath.recovDelta +
    mindset.recovDelta +
    wakeTrig.recovDelta +
    clarity.recovDelta +
    (sleepHours >= 7.5 ? 4 : sleepHours < 6.0 ? -8 : 0);

  const recoveryScore = clamp(Math.round(rawRecovery), 10, 98);

  let recoveryStatus: RecoveryStatus = "OPTIMAL";
  let recoveryStatusLabel = "Optimal Capacity";
  let recommendedStrain = "Moderate Strength & Aerobic Conditioning";
  let actionableAdvice = "Nervous and muscular systems are well balanced. Ready for a standard day of productive work and progressive training.";
  let suggestedFocus = "Maintain steady hydration (2.5L) and complete planned workouts without over-reaching.";

  if (recoveryScore >= 85) {
    recoveryStatus = "PEAK_READINESS";
    recoveryStatusLabel = "Peak Readiness";
    recommendedStrain = "High Intensity, Heavy Resistance or Personal Records";
    actionableAdvice = "Your autonomic nervous system and muscular tone are fully restored. Ideal day for maximum strain or challenging physical/mental feats.";
    suggestedFocus = "Seize your high-energy window: tackle your toughest cognitive tasks and peak workout volume.";
  } else if (recoveryScore >= 70) {
    recoveryStatus = "OPTIMAL";
    recoveryStatusLabel = "Optimal Capacity";
    recommendedStrain = "Moderate to High Volume Training";
    actionableAdvice = "Strong physiological stability with clear mental focus. You can safely absorb standard to heavy training volume.";
    suggestedFocus = "Steady pacing: 2.5L water, balanced nutrition, consistent work blocks.";
  } else if (recoveryScore >= 50) {
    recoveryStatus = "MODERATE";
    recoveryStatusLabel = "Moderate Recovery";
    recommendedStrain = "Zone 2 Cardio, Mobility & Light Volume";
    actionableAdvice = "Mild systemic fatigue detected. Your body can handle moderate daily output, but avoid maximal strain.";
    suggestedFocus = "Active recovery: 30-min brisk walk, mobility drills, and aim for bed 30 mins earlier.";
  } else {
    recoveryStatus = "REST_PRIORITY";
    recoveryStatusLabel = "Rest & Recharge Priority";
    recommendedStrain = "Active Rest, Light Walk or Total Rest Day";
    actionableAdvice = "Elevated biological stress and accumulated fatigue. Strenuous exertion today will increase injury risk and delay adaptation.";
    suggestedFocus = "Nourishing warm meals, extra hydration, gentle stretching, and an early sleep wind-down.";
  }

  return {
    sleepHours,
    sleepQuality,
    sleepEfficiency,
    deepSleepScore,
    sleepStageLabel: bed.desc,
    sleepDebtStatus,
    moodScore,
    moodValence: mindset.valence,
    moodAura: mindset.aura,
    stressIndex,
    socialBandwidth: social.bandwidth,
    cognitiveClarityLabel: clarity.label,
    recoveryScore,
    recoveryStatus,
    recoveryStatusLabel,
    muscularTone: mobility.muscleTone,
    autonomicTone: breath.tone,
    recommendedStrain,
    actionableAdvice,
    suggestedFocus,
  };
}

// Backward compatibility alias for legacy simple signature
export function predictTriFactor(answers: {
  wakeupVibe?: string;
  sleepArch?: string;
  moodWeather?: string;
  physicalBattery?: string;
}): {
  sleepHours: number;
  sleepQuality: number;
  moodScore: number;
  moodValence: string;
  recoveryScore: number;
  recoveryStatus: RecoveryStatus;
  recoveryStatusLabel: string;
  actionableAdvice: string;
  suggestedFocus: string;
} {
  // Convert simple inputs to multi-question mapping
  const mapped: MultiQuestionQuizAnswers = {
    bedtimeWindow: answers.sleepArch === "hyperspace" ? "pre_1030" : answers.sleepArch === "insomnia" ? "wee_hours" : "around_11",
    driftOffSpeed: answers.wakeupVibe === "zombie" ? "insomnia_toss" : answers.wakeupVibe === "rocket" ? "instant" : "peaceful",
    nightWakeups: answers.sleepArch === "hyperspace" ? "none" : answers.sleepArch === "insomnia" ? "restless_storm" : "one_brief",
    wakeupTrigger: answers.wakeupVibe === "rocket" ? "before_alarm" : answers.wakeupVibe === "zombie" ? "snooze_war" : "gentle_alarm",
    bodyMobility: answers.physicalBattery === "battery_100" ? "limber_spring" : answers.physicalBattery === "battery_15" ? "deep_exhaustion" : "steady_normal",
    autonomicBreath: answers.moodWeather === "radiant" ? "deep_calm" : answers.moodWeather === "storm" ? "fluttery_tight" : "steady_even",
    bootupMindset: answers.moodWeather === "radiant" ? "excited_ready" : answers.moodWeather === "storm" ? "stormy_drained" : "calm_grounded",
    cognitiveClarity: answers.wakeupVibe === "rocket" ? "laser_4k" : answers.wakeupVibe === "zombie" ? "spaced_out" : "steady_coffee",
    socialBattery: answers.moodWeather === "radiant" ? "full_friendly" : answers.moodWeather === "storm" ? "irritable_short" : "selective_peace",
  };

  const full = predictFullHealthMatrix(mapped);
  return {
    sleepHours: full.sleepHours,
    sleepQuality: full.sleepQuality,
    moodScore: full.moodScore,
    moodValence: full.moodValence,
    recoveryScore: full.recoveryScore,
    recoveryStatus: full.recoveryStatus,
    recoveryStatusLabel: full.recoveryStatusLabel,
    actionableAdvice: full.actionableAdvice,
    suggestedFocus: full.suggestedFocus,
  };
}
