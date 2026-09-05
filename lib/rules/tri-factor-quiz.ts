/**
 * Advanced Deterministic Tri-Factor Health Matrix Predictor Engine
 *
 * Supports:
 * 1. ⚡ Lightning Mode (Short 60-Sec 3-Tap Check)
 * 2. 🌙 Deep Sleep Chrono-Quest (8-Question Comprehensive Sleep Deep-Dive)
 * 3. 🙂 Deep Mood & Mindset Radar (8-Question Cognitive & Stress Deep-Dive)
 * 4. 💚 Deep Autonomic Recovery Quest (8-Question Muscular & Physiological Deep-Dive)
 * 5. 🌌 Full 3-Domain Odyssey (All 3 in sequence)
 */

export type BedtimeWindow = "pre_1030" | "around_11" | "midnight" | "late_night" | "wee_hours";
export type DriftOffSpeed = "instant" | "peaceful" | "racing_mind" | "insomnia_toss";
export type NightWakeups = "none" | "one_brief" | "tossed_2_3" | "wide_awake_gap" | "restless_storm";
export type CaffeineCutoff = "before_2pm" | "late_afternoon" | "with_dinner" | "late_night";
export type ScreenWindDown = "dim_book_60m" | "short_check_15m" | "scrolled_in_bed" | "tv_sleep_timer";
export type BedroomClimate = "cool_pitch_dark" | "normal" | "warm_stuffy" | "noisy_street";
export type DreamRecall = "vivid_calm" | "faint_pleasant" | "stress_nightmares" | "blank_blackout";

export type WakeupTrigger = "before_alarm" | "gentle_alarm" | "snooze_war" | "jolted_abrupt";
export type BodyMobility = "limber_spring" | "steady_normal" | "heavy_achy" | "deep_exhaustion";
export type AutonomicBreath = "deep_calm" | "steady_even" | "fluttery_tight";
export type SorenessZone = "none" | "neck_shoulders" | "lower_back" | "legs_glutes" | "full_body_tender";
export type HydrationAwakening = "quenched_fresh" | "mildly_dry" | "parched_sticky";
export type PreviousDayStrain = "rest_day" | "moderate_active" | "brutal_intense" | "poor_recovery_cycle";

export type BootupMindset = "excited_ready" | "calm_grounded" | "overwhelmed_todos" | "stormy_drained";
export type CognitiveClarity = "laser_4k" | "steady_coffee" | "foggy_scattered" | "spaced_out";
export type SocialBattery = "full_friendly" | "selective_peace" | "headphones_on" | "irritable_short";
export type StressTriggers = "minimal_smooth" | "deadline_pressure" | "interpersonal_friction" | "health_body_anxiety" | "chronic_burnout";
export type InnerSelfTalk = "empowering_kind" | "neutral_pragmatic" | "harsh_critical" | "anxious_catastrophic";
export type EnergyStability = "steady_flowing" | "moderate_rollercoaster" | "crash_and_burn";

export type RecoveryStatus = "PEAK_READINESS" | "OPTIMAL" | "MODERATE" | "REST_PRIORITY";

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

// ==========================================
// 1. LIGHTNING MODE (3-Question Fast Track)
// ==========================================
export interface LightningQuizAnswers {
  nightFeeling: "slept_like_rock" | "normal_rest" | "tossed_turned" | "barely_slept";
  morningEnergy: "rocket_ready" | "steady_baseline" | "sluggish_coffee" | "exhausted_zombie";
  mindsetAura: "sunny_optimistic" | "calm_grounded" | "anxious_stressed" | "heavy_overwhelmed";
}

export function evaluateLightningQuiz(answers: LightningQuizAnswers) {
  const sleepMap = {
    slept_like_rock: { hours: 8.2, quality: 92, eff: 94 },
    normal_rest: { hours: 7.4, quality: 80, eff: 86 },
    tossed_turned: { hours: 5.8, quality: 58, eff: 68 },
    barely_slept: { hours: 4.0, quality: 32, eff: 48 },
  };

  const energyMap = {
    rocket_ready: { recovBase: 90, recovStatus: "PEAK_READINESS" as RecoveryStatus },
    steady_baseline: { recovBase: 78, recovStatus: "OPTIMAL" as RecoveryStatus },
    sluggish_coffee: { recovBase: 58, recovStatus: "MODERATE" as RecoveryStatus },
    exhausted_zombie: { recovBase: 34, recovStatus: "REST_PRIORITY" as RecoveryStatus },
  };

  const moodMap = {
    sunny_optimistic: { score: 5, valence: "Radiant & Optimistic", aura: "☀️ Sunny Gold", delta: 4 },
    calm_grounded: { score: 4, valence: "Calm & Centered", aura: "🌤️ Emerald Calm", delta: 2 },
    anxious_stressed: { score: 2, valence: "Tense & Anxious", aura: "🌧️ Steel Blue", delta: -6 },
    heavy_overwhelmed: { score: 1, valence: "Exhausted & Heavy", aura: "⛈️ Charcoal Storm", delta: -12 },
  };

  const s = sleepMap[answers.nightFeeling] ?? sleepMap.normal_rest;
  const e = energyMap[answers.morningEnergy] ?? energyMap.steady_baseline;
  const m = moodMap[answers.mindsetAura] ?? moodMap.calm_grounded;

  const recoveryScore = clamp(e.recovBase + m.delta, 15, 96);
  const recoveryStatus: RecoveryStatus =
    recoveryScore >= 85 ? "PEAK_READINESS" : recoveryScore >= 70 ? "OPTIMAL" : recoveryScore >= 50 ? "MODERATE" : "REST_PRIORITY";

  return {
    sleepHours: s.hours,
    sleepQuality: s.quality,
    sleepEfficiency: s.eff,
    moodScore: m.score,
    moodValence: m.valence,
    moodAura: m.aura,
    recoveryScore,
    recoveryStatus,
    recoveryStatusLabel:
      recoveryStatus === "PEAK_READINESS"
        ? "Peak Readiness"
        : recoveryStatus === "OPTIMAL"
        ? "Optimal Capacity"
        : recoveryStatus === "MODERATE"
        ? "Moderate Recovery"
        : "Rest Priority",
    actionableAdvice:
      recoveryStatus === "PEAK_READINESS"
        ? "High nervous system resilience. Green light for tough challenges and peak workouts."
        : recoveryStatus === "OPTIMAL"
        ? "Steady baseline stamina. Great for standard workouts and productive workday pacing."
        : recoveryStatus === "MODERATE"
        ? "Moderate fatigue. Prefer Zone 2 cardio, mobility work, and early sleep."
        : "High biological fatigue. Take an active rest day and hydrate well.",
  };
}

// ==========================================
// 2. DEEP SLEEP CHRONO-QUEST (Detailed)
// ==========================================
export interface DeepSleepQuestAnswers {
  bedtimeWindow: BedtimeWindow;
  driftOffSpeed: DriftOffSpeed;
  nightWakeups: NightWakeups;
  caffeineCutoff: CaffeineCutoff;
  screenWindDown: ScreenWindDown;
  bedroomClimate: BedroomClimate;
  dreamRecall: DreamRecall;
}

export function evaluateDeepSleepQuest(answers: DeepSleepQuestAnswers) {
  const bedTimes = { pre_1030: 8.8, around_11: 8.0, midnight: 7.2, late_night: 5.8, wee_hours: 4.4 };
  const driftLatency = { instant: 0.15, peaceful: 0.35, racing_mind: 0.75, insomnia_toss: 1.35 };
  const wakeLoss = { none: 0.0, one_brief: 0.2, tossed_2_3: 0.6, wide_awake_gap: 1.0, restless_storm: 1.4 };

  // Hygiene modifiers
  const caffeineBonus = { before_2pm: 4, late_afternoon: 0, with_dinner: -6, late_night: -12 };
  const screenBonus = { dim_book_60m: 6, short_check_15m: 2, scrolled_in_bed: -8, tv_sleep_timer: -4 };
  const climateBonus = { cool_pitch_dark: 5, normal: 0, warm_stuffy: -6, noisy_street: -10 };

  const rawInBed = bedTimes[answers.bedtimeWindow] ?? 8.0;
  const rawLatency = driftLatency[answers.driftOffSpeed] ?? 0.35;
  const rawLost = wakeLoss[answers.nightWakeups] ?? 0.2;

  const sleepHours = clamp(Math.round((rawInBed - rawLatency - rawLost) * 10) / 10, 3.0, 11.0);

  const hygieneScore = clamp(
    70 +
      (caffeineBonus[answers.caffeineCutoff] ?? 0) +
      (screenBonus[answers.screenWindDown] ?? 0) +
      (climateBonus[answers.bedroomClimate] ?? 0),
    20,
    98
  );

  const effBonus = (answers.nightWakeups === "none" ? 8 : answers.nightWakeups === "one_brief" ? 2 : -10);
  const sleepEfficiency = clamp(Math.round(84 + effBonus + (answers.driftOffSpeed === "instant" ? 4 : -6)), 40, 98);

  const deepSleepScore = clamp(Math.round(hygieneScore * 0.4 + sleepEfficiency * 0.6), 25, 96);
  const remSleepScore = clamp(
    Math.round(
      sleepHours >= 7.5
        ? 88
        : sleepHours >= 6.5
        ? 74
        : 50 + (answers.dreamRecall === "vivid_calm" ? 10 : 0)
    ),
    25,
    95
  );

  const sleepQuality = clamp(Math.round((sleepEfficiency * 0.4) + (deepSleepScore * 0.35) + (remSleepScore * 0.25)), 25, 98);

  const sleepDebtStatus =
    sleepHours >= 7.8
      ? "Surplus (Fully Restored)"
      : sleepHours >= 6.8
      ? "Balanced (Optimal Maintenance)"
      : "Accumulated Sleep Debt (-1.5h to -3.0h)";

  let personalizedSleepTips = "Maintain consistent bedtime and keep bedroom cool for continuous deep sleep.";
  if (answers.screenWindDown === "scrolled_in_bed") {
    personalizedSleepTips = "Blue light before bed delays melatonin onset. Try 15 minutes of dim-light audio or reading tonight.";
  } else if (answers.caffeineCutoff === "with_dinner" || answers.caffeineCutoff === "late_night") {
    personalizedSleepTips = "Evening caffeine has a 6-hour half-life that fragments deep slow-wave sleep. Cut off caffeine by 2 PM.";
  } else if (answers.nightWakeups === "restless_storm" || answers.nightWakeups === "wide_awake_gap") {
    personalizedSleepTips = "Middle-of-night awakenings correlate with room temperature or late heavy meals. Try a lighter dinner and cooler room.";
  }

  return {
    sleepHours,
    sleepQuality,
    sleepEfficiency,
    deepSleepScore,
    remSleepScore,
    sleepHygieneScore: hygieneScore,
    sleepDebtStatus,
    personalizedSleepTips,
  };
}

// ==========================================
// 3. DEEP MOOD & MINDSET RADAR
// ==========================================
export interface DeepMoodQuestAnswers {
  bootupMindset: BootupMindset;
  cognitiveClarity: CognitiveClarity;
  socialBattery: SocialBattery;
  stressTriggers: StressTriggers;
  innerSelfTalk: InnerSelfTalk;
  energyStability: EnergyStability;
}

export function evaluateDeepMoodQuest(answers: DeepMoodQuestAnswers) {
  const mindsetScores = { excited_ready: 5, calm_grounded: 4, overwhelmed_todos: 2, stormy_drained: 1 };
  const clarityScores = { laser_4k: 95, steady_coffee: 80, foggy_scattered: 45, spaced_out: 25 };
  const socialScores = {
    full_friendly: "High Extroverted Capacity",
    selective_peace: "Balanced & Polite (Selective)",
    headphones_on: "Solo Buffer (Do Not Disturb)",
    irritable_short: "Tension Alert (Short Fuse)",
  };

  const stressBase = {
    minimal_smooth: 15,
    deadline_pressure: 45,
    interpersonal_friction: 60,
    health_body_anxiety: 72,
    chronic_burnout: 88,
  };

  const selfTalkDelta = {
    empowering_kind: -10,
    neutral_pragmatic: 0,
    harsh_critical: 12,
    anxious_catastrophic: 20,
  };

  const baseMood = mindsetScores[answers.bootupMindset] ?? 4;
  const stressIndex = clamp((stressBase[answers.stressTriggers] ?? 40) + (selfTalkDelta[answers.innerSelfTalk] ?? 0), 10, 95);

  let burnoutRisk = "Low / Resilient";
  if (stressIndex >= 75 || answers.energyStability === "crash_and_burn") {
    burnoutRisk = "High / Overextended — Guard mental boundaries";
  } else if (stressIndex >= 50 || answers.energyStability === "moderate_rollercoaster") {
    burnoutRisk = "Moderate — Schedule strategic rest pauses";
  }

  const moodValence =
    baseMood === 5
      ? "Radiant & Driven"
      : baseMood === 4
      ? "Calm & Centered"
      : baseMood === 2
      ? "Tense & Overloaded"
      : "Emotionally Drained";

  const moodAura =
    baseMood === 5
      ? "☀️ Sunny Gold"
      : baseMood === 4
      ? "🌤️ Emerald Calm"
      : baseMood === 2
      ? "🌧️ Steel Blue"
      : "⛈️ Charcoal Storm";

  let mindsetNudge = "Maintain your calm flow. Protect your mental bandwidth and focus on single-task execution.";
  if (answers.stressTriggers === "chronic_burnout" || baseMood === 1) {
    mindsetNudge = "Your nervous system is emotionally overloaded. Cancel non-critical demands, go for a quiet walk, and prioritize self-compassion.";
  } else if (answers.innerSelfTalk === "harsh_critical" || answers.innerSelfTalk === "anxious_catastrophic") {
    mindsetNudge = "Notice unhelpful inner dialogue. Reframe catastrophic thoughts with calm, evidence-based self-talk.";
  }

  return {
    moodScore: baseMood,
    moodValence,
    moodAura,
    stressIndex,
    burnoutRisk,
    socialBandwidth: socialScores[answers.socialBattery] ?? "Balanced",
    cognitiveClarityScore: clarityScores[answers.cognitiveClarity] ?? 80,
    mindsetNudge,
  };
}

// ==========================================
// 4. DEEP AUTONOMIC RECOVERY QUEST
// ==========================================
export interface DeepRecoveryQuestAnswers {
  wakeupTrigger: WakeupTrigger;
  bodyMobility: BodyMobility;
  autonomicBreath: AutonomicBreath;
  sorenessZone: SorenessZone;
  hydrationAwakening: HydrationAwakening;
  previousDayStrain: PreviousDayStrain;
}

export function evaluateDeepRecoveryQuest(answers: DeepRecoveryQuestAnswers) {
  const mobilityBase = { limber_spring: 90, steady_normal: 78, heavy_achy: 56, deep_exhaustion: 32 };
  const breathDelta = { deep_calm: 8, steady_even: 2, fluttery_tight: -10 };
  const wakeDelta = { before_alarm: 6, gentle_alarm: 2, snooze_war: -6, jolted_abrupt: -12 };
  const sorenessPenalty = { none: 0, neck_shoulders: -4, lower_back: -6, legs_glutes: -6, full_body_tender: -14 };
  const hydrationDelta = { quenched_fresh: 4, mildly_dry: 0, parched_sticky: -8 };
  const strainHistory = { rest_day: 6, moderate_active: 2, brutal_intense: -8, poor_recovery_cycle: -14 };

  const rawRecovery =
    (mobilityBase[answers.bodyMobility] ?? 78) +
    (breathDelta[answers.autonomicBreath] ?? 0) +
    (wakeDelta[answers.wakeupTrigger] ?? 0) +
    (sorenessPenalty[answers.sorenessZone] ?? 0) +
    (hydrationDelta[answers.hydrationAwakening] ?? 0) +
    (strainHistory[answers.previousDayStrain] ?? 0);

  const recoveryScore = clamp(Math.round(rawRecovery), 12, 98);

  let recoveryStatus: RecoveryStatus = "OPTIMAL";
  let recoveryStatusLabel = "Optimal Capacity";
  let recommendedStrain = "Moderate to High Volume Workouts";
  let actionableAdvice = "Muscular recovery and nervous balance are in strong equilibrium. Full capacity for progressive workouts.";

  if (recoveryScore >= 85) {
    recoveryStatus = "PEAK_READINESS";
    recoveryStatusLabel = "Peak Readiness";
    recommendedStrain = "Maximal Effort / Heavy Resistance / Sprint Intervals";
    actionableAdvice = "Your body is in prime condition. Low inflammation, high autonomic resilience. Great day to push personal records.";
  } else if (recoveryScore >= 70) {
    recoveryStatus = "OPTIMAL";
    recoveryStatusLabel = "Optimal Capacity";
    recommendedStrain = "Solid Baseline Volume & Progressive Sets";
    actionableAdvice = "Steady stamina and clear recovery reserves. Safe to execute full daily workout plan.";
  } else if (recoveryScore >= 50) {
    recoveryStatus = "MODERATE";
    recoveryStatusLabel = "Moderate Recovery";
    recommendedStrain = "Zone 2 Low Intensity, Mobility & Technique";
    actionableAdvice = "Muscular or autonomic fatigue detected. Avoid maximum lift attempts or all-out HIIT today. Prioritize active recovery.";
  } else {
    recoveryStatus = "REST_PRIORITY";
    recoveryStatusLabel = "Rest & Recharge Priority";
    recommendedStrain = "Gentle Strolling, Stretching or Total Rest";
    actionableAdvice = "Systemic biological strain is elevated. Further intense breakdown today will impair muscle repair and immune function.";
  }

  const sorenessMap = {
    none: "Zero Muscle Soreness (Fresh)",
    neck_shoulders: "Tension in Neck / Traps (Postural Strain)",
    lower_back: "Lumbar Stiffness (Core / Posterior Chain Fatigue)",
    legs_glutes: "Lower Body DOMS (Quads / Hamstrings)",
    full_body_tender: "Systemic Muscular Tenderness / Inflammation",
  };

  const autonomicMap = {
    deep_calm: "High Parasympathetic Tone (Rest & Digest Dominant)",
    steady_even: "Balanced Autonomic Equilibrium",
    fluttery_tight: "Elevated Sympathetic Tone (Fight-or-Flight Bias)",
  };

  return {
    recoveryScore,
    recoveryStatus,
    recoveryStatusLabel,
    muscularTone: sorenessMap[answers.sorenessZone] ?? "Normal Baseline",
    autonomicTone: autonomicMap[answers.autonomicBreath] ?? "Balanced Equilibrium",
    recommendedStrain,
    actionableAdvice,
  };
}

// Legacy multi-question matrix evaluator (Full Odyssey)
export function predictFullHealthMatrix(answers: {
  bedtimeWindow: BedtimeWindow;
  driftOffSpeed: DriftOffSpeed;
  nightWakeups: NightWakeups;
  wakeupTrigger: WakeupTrigger;
  bodyMobility: BodyMobility;
  autonomicBreath: AutonomicBreath;
  bootupMindset: BootupMindset;
  cognitiveClarity: CognitiveClarity;
  socialBattery: SocialBattery;
}) {
  const sleepRes = evaluateDeepSleepQuest({
    bedtimeWindow: answers.bedtimeWindow,
    driftOffSpeed: answers.driftOffSpeed,
    nightWakeups: answers.nightWakeups,
    caffeineCutoff: "before_2pm",
    screenWindDown: "dim_book_60m",
    bedroomClimate: "cool_pitch_dark",
    dreamRecall: "vivid_calm",
  });

  const moodRes = evaluateDeepMoodQuest({
    bootupMindset: answers.bootupMindset,
    cognitiveClarity: answers.cognitiveClarity,
    socialBattery: answers.socialBattery,
    stressTriggers: "minimal_smooth",
    innerSelfTalk: "neutral_pragmatic",
    energyStability: "steady_flowing",
  });

  const recovRes = evaluateDeepRecoveryQuest({
    wakeupTrigger: answers.wakeupTrigger,
    bodyMobility: answers.bodyMobility,
    autonomicBreath: answers.autonomicBreath,
    sorenessZone: "none",
    hydrationAwakening: "quenched_fresh",
    previousDayStrain: "moderate_active",
  });

  return {
    sleepHours: sleepRes.sleepHours,
    sleepQuality: sleepRes.sleepQuality,
    sleepEfficiency: sleepRes.sleepEfficiency,
    deepSleepScore: sleepRes.deepSleepScore,
    sleepStageLabel: "Synthesized Circadian Architecture",
    sleepDebtStatus: sleepRes.sleepDebtStatus,
    moodScore: moodRes.moodScore,
    moodValence: moodRes.moodValence,
    moodAura: moodRes.moodAura,
    stressIndex: moodRes.stressIndex,
    socialBandwidth: moodRes.socialBandwidth,
    cognitiveClarityLabel: moodRes.cognitiveClarityScore >= 80 ? "Sharp Focus" : "Mild Brain Fog",
    recoveryScore: recovRes.recoveryScore,
    recoveryStatus: recovRes.recoveryStatus,
    recoveryStatusLabel: recovRes.recoveryStatusLabel,
    muscularTone: recovRes.muscularTone,
    autonomicTone: recovRes.autonomicTone,
    recommendedStrain: recovRes.recommendedStrain,
    actionableAdvice: recovRes.actionableAdvice,
    suggestedFocus: sleepRes.personalizedSleepTips,
  };
}

// Backward compatibility alias for legacy simple signature
export function predictTriFactor(answers: {
  wakeupVibe?: string;
  sleepArch?: string;
  moodWeather?: string;
  physicalBattery?: string;
}) {
  const lightningRes = evaluateLightningQuiz({
    nightFeeling: answers.sleepArch === "hyperspace" ? "slept_like_rock" : answers.sleepArch === "insomnia" ? "barely_slept" : "normal_rest",
    morningEnergy: answers.wakeupVibe === "rocket" ? "rocket_ready" : answers.wakeupVibe === "zombie" ? "exhausted_zombie" : "steady_baseline",
    mindsetAura: answers.moodWeather === "radiant" ? "sunny_optimistic" : answers.moodWeather === "storm" ? "heavy_overwhelmed" : "calm_grounded",
  });

  return {
    sleepHours: lightningRes.sleepHours,
    sleepQuality: lightningRes.sleepQuality,
    moodScore: lightningRes.moodScore,
    moodValence: lightningRes.moodValence,
    recoveryScore: lightningRes.recoveryScore,
    recoveryStatus: lightningRes.recoveryStatus,
    recoveryStatusLabel: lightningRes.recoveryStatusLabel,
    actionableAdvice: lightningRes.actionableAdvice,
    suggestedFocus: "Prioritize consistent hydration and recovery pacing.",
  };
}
