import { describe, it, expect } from "vitest";
import {
  evaluateLightningQuiz,
  evaluateDeepSleepQuest,
  evaluateDeepMoodQuest,
  evaluateDeepRecoveryQuest,
  predictTriFactor,
  predictFullHealthMatrix,
} from "@/lib/rules/tri-factor-quiz";

describe("Dual-Mode Health Matrix & Deep Game-Field Quests", () => {
  // 1. LIGHTNING MODE (SHORT 60-SEC)
  it("evaluates Lightning Pulse quickly and accurately", () => {
    const res = evaluateLightningQuiz({
      nightFeeling: "slept_like_rock",
      morningEnergy: "rocket_ready",
      mindsetAura: "sunny_optimistic",
    });

    expect(res.sleepHours).toBeGreaterThanOrEqual(8.0);
    expect(res.sleepQuality).toBeGreaterThanOrEqual(90);
    expect(res.moodScore).toBe(5);
    expect(res.recoveryScore).toBeGreaterThanOrEqual(85);
    expect(res.recoveryStatus).toBe("PEAK_READINESS");
  });

  // 2. DEEP SLEEP CHRONO-QUEST (10-MIN IN-DEPTH)
  it("evaluates Deep Sleep Quest with environmental hygiene & sleep debt", () => {
    const res = evaluateDeepSleepQuest({
      bedtimeWindow: "pre_1030",
      driftOffSpeed: "instant",
      nightWakeups: "none",
      caffeineCutoff: "before_2pm",
      screenWindDown: "dim_book_60m",
      bedroomClimate: "cool_pitch_dark",
      dreamRecall: "vivid_calm",
    });

    expect(res.sleepHours).toBeGreaterThanOrEqual(8.0);
    expect(res.sleepEfficiency).toBeGreaterThanOrEqual(90);
    expect(res.sleepHygieneScore).toBeGreaterThanOrEqual(85);
    expect(res.deepSleepScore).toBeGreaterThanOrEqual(85);
    expect(res.remSleepScore).toBeGreaterThanOrEqual(80);
    expect(res.sleepDebtStatus).toContain("Surplus");
  });

  // 3. DEEP MOOD & MINDSET QUEST
  it("evaluates Deep Mood Quest with burnout risk & stress index", () => {
    const res = evaluateDeepMoodQuest({
      bootupMindset: "calm_grounded",
      cognitiveClarity: "laser_4k",
      socialBattery: "full_friendly",
      stressTriggers: "minimal_smooth",
      innerSelfTalk: "empowering_kind",
      energyStability: "steady_flowing",
    });

    expect(res.moodScore).toBe(4);
    expect(res.moodValence).toBe("Calm & Centered");
    expect(res.stressIndex).toBeLessThanOrEqual(20);
    expect(res.burnoutRisk).toContain("Low");
    expect(res.cognitiveClarityScore).toBe(95);
  });

  // 4. DEEP AUTONOMIC RECOVERY QUEST
  it("evaluates Deep Recovery Quest with muscle soreness zones & autonomic tone", () => {
    const res = evaluateDeepRecoveryQuest({
      wakeupTrigger: "before_alarm",
      bodyMobility: "limber_spring",
      autonomicBreath: "deep_calm",
      sorenessZone: "none",
      hydrationAwakening: "quenched_fresh",
      previousDayStrain: "moderate_active",
    });

    expect(res.recoveryScore).toBeGreaterThanOrEqual(85);
    expect(res.recoveryStatus).toBe("PEAK_READINESS");
    expect(res.autonomicTone).toContain("Parasympathetic");
    expect(res.muscularTone).toContain("Zero Muscle Soreness");
    expect(res.recommendedStrain).toContain("Maximal");
  });

  // 5. BACKWARD COMPATIBILITY
  it("maintains backward compatibility with legacy 4-parameter calls", () => {
    const res = predictTriFactor({
      wakeupVibe: "rocket",
      sleepArch: "hyperspace",
      moodWeather: "radiant",
      physicalBattery: "battery_100",
    });

    expect(res.sleepHours).toBeGreaterThanOrEqual(8.0);
    expect(res.moodScore).toBe(5);
    expect(res.recoveryScore).toBeGreaterThanOrEqual(85);
  });
});
