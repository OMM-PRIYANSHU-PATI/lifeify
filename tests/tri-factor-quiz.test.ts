import { describe, it, expect, vi } from "vitest";
import {
  evaluateLightningQuiz,
  evaluateDeepSleepQuest,
  evaluateDeepMoodQuest,
  evaluateDeepRecoveryQuest,
  evaluateMorningSimulation,
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

  // 5. GUIDED MORNING SIMULATION (Sleep -> Mood -> Recovery)
  it("evaluates Guided Morning Simulation seamlessly across all 3 acts", () => {
    const res = evaluateMorningSimulation({
      // Act 1: Sleep
      bedtimeWindow: "around_11",
      driftOffSpeed: "peaceful",
      nightWakeups: "none",
      screenWindDown: "dim_book_60m",
      // Act 2: Mood
      bootupMindset: "excited_ready",
      cognitiveClarity: "laser_4k",
      socialBattery: "full_friendly",
      stressTriggers: "minimal_smooth",
      // Act 3: Recovery
      bodyMobility: "limber_spring",
      sorenessZone: "none",
      autonomicBreath: "deep_calm",
      previousDayStrain: "rest_day",
    });

    // Verify Sleep Act output
    expect(res.sleepHours).toBeGreaterThanOrEqual(7.5);
    expect(res.sleepEfficiency).toBeGreaterThanOrEqual(85);
    // Verify Mood Act output
    expect(res.moodScore).toBe(5);
    expect(res.stressIndex).toBeLessThanOrEqual(25);
    // Verify Recovery Act output
    expect(res.recoveryScore).toBeGreaterThanOrEqual(80);
    expect(res.recoveryStatus).toBe("PEAK_READINESS");
  });

  // 6. BACKWARD COMPATIBILITY
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

  // 7. FAILSAFE QUIZ SUBMISSION (Server Action Desync Resiliency)
  it("falls back to REST API gracefully when a server action rejects or desyncs", async () => {
    const { submitQuizSafely } = await import("@/components/health/quizzes/save-quiz-helper");
    
    // Mock fetch for REST API fallback
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, message: "Logged successfully via REST fallback" }),
    });
    global.fetch = mockFetch as any;

    // Simulate Server Action throwing 'UnrecognizedActionError'
    const failingServerAction = vi.fn().mockRejectedValue(
      new Error('Server Action "4008f08829fd30ebb4d16735a812863bfa626bd374" was not found on the server.')
    );

    const result = await submitQuizSafely(
      "simulation",
      { sleepHours: 8, moodScore: 5, recoveryScore: 90 },
      failingServerAction
    );

    expect(failingServerAction).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    expect(result.message).toBe("Logged successfully via REST fallback");
  });
});

