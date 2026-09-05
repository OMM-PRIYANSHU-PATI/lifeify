import { describe, it, expect } from "vitest";
import {
  predictFullHealthMatrix,
  predictTriFactor,
  MultiQuestionQuizAnswers,
} from "@/lib/rules/tri-factor-quiz";

describe("Advanced Multi-Question Health Matrix Predictor", () => {
  it("infers peak sleep duration, high efficiency, and peak recovery without asking direct hours", () => {
    const answers: MultiQuestionQuizAnswers = {
      bedtimeWindow: "pre_1030", // ~8.8h in bed
      driftOffSpeed: "instant", // -0.15h latency, +5% eff
      nightWakeups: "none", // 0.0h lost, +6% eff
      wakeupTrigger: "before_alarm", // +0.2h inertia buffer
      bodyMobility: "limber_spring", // 90 base recovery
      autonomicBreath: "deep_calm", // +8 recov
      bootupMindset: "excited_ready", // +6 recov, mood 5
      cognitiveClarity: "laser_4k", // +4 recov
      socialBattery: "full_friendly",
    };

    const matrix = predictFullHealthMatrix(answers);

    // Sleep inferences
    expect(matrix.sleepHours).toBeGreaterThanOrEqual(8.2);
    expect(matrix.sleepEfficiency).toBeGreaterThanOrEqual(92);
    expect(matrix.deepSleepScore).toBeGreaterThanOrEqual(90);
    expect(matrix.sleepDebtStatus).toContain("Surplus");

    // Mood inferences
    expect(matrix.moodScore).toBe(5);
    expect(matrix.stressIndex).toBeLessThanOrEqual(25);
    expect(matrix.moodValence).toBe("Radiant & Driven");

    // Recovery inferences
    expect(matrix.recoveryScore).toBeGreaterThanOrEqual(85);
    expect(matrix.recoveryStatus).toBe("PEAK_READINESS");
    expect(matrix.recommendedStrain).toContain("High Intensity");
  });

  it("infers short sleep, high fragmentation, and rest priority for late, restless night", () => {
    const answers: MultiQuestionQuizAnswers = {
      bedtimeWindow: "wee_hours", // ~4.4h in bed
      driftOffSpeed: "insomnia_toss", // -1.35h latency, -15% eff
      nightWakeups: "restless_storm", // -1.4h lost, -24% eff
      wakeupTrigger: "snooze_war",
      bodyMobility: "deep_exhaustion", // 30 base recovery
      autonomicBreath: "fluttery_tight",
      bootupMindset: "stormy_drained",
      cognitiveClarity: "spaced_out",
      socialBattery: "irritable_short",
    };

    const matrix = predictFullHealthMatrix(answers);

    // Sleep inferences
    expect(matrix.sleepHours).toBeLessThanOrEqual(4.5);
    expect(matrix.sleepEfficiency).toBeLessThanOrEqual(60);
    expect(matrix.sleepDebtStatus).toContain("Accumulated Sleep Debt");

    // Mood inferences
    expect(matrix.moodScore).toBe(1);
    expect(matrix.stressIndex).toBeGreaterThanOrEqual(70);

    // Recovery inferences
    expect(matrix.recoveryScore).toBeLessThanOrEqual(35);
    expect(matrix.recoveryStatus).toBe("REST_PRIORITY");
    expect(matrix.recommendedStrain).toContain("Active Rest");
  });

  it("infers steady baseline metrics for standard modern working adult", () => {
    const answers: MultiQuestionQuizAnswers = {
      bedtimeWindow: "around_11", // ~8.0h in bed
      driftOffSpeed: "peaceful", // -0.35h latency
      nightWakeups: "one_brief", // -0.2h lost
      wakeupTrigger: "gentle_alarm",
      bodyMobility: "steady_normal", // 78 base recovery
      autonomicBreath: "steady_even",
      bootupMindset: "calm_grounded", // mood 4
      cognitiveClarity: "steady_coffee",
      socialBattery: "selective_peace",
    };

    const matrix = predictFullHealthMatrix(answers);

    expect(matrix.sleepHours).toBeCloseTo(7.5, 1);
    expect(matrix.sleepEfficiency).toBeGreaterThanOrEqual(85);
    expect(matrix.moodScore).toBe(4);
    expect(matrix.recoveryScore).toBeGreaterThanOrEqual(75);
    expect(["OPTIMAL", "PEAK_READINESS"]).toContain(matrix.recoveryStatus);
  });

  it("maintains backward compatibility with simple 4-question format", () => {
    const legacy = predictTriFactor({
      wakeupVibe: "rocket",
      sleepArch: "hyperspace",
      moodWeather: "radiant",
      physicalBattery: "battery_100",
    });

    expect(legacy.sleepHours).toBeGreaterThanOrEqual(8.0);
    expect(legacy.moodScore).toBe(5);
    expect(legacy.recoveryScore).toBeGreaterThanOrEqual(85);
    expect(legacy.recoveryStatus).toBe("PEAK_READINESS");
  });

  it("strictly enforces physiological bounds across all matrix outputs", () => {
    const extremeAnswers: MultiQuestionQuizAnswers = {
      bedtimeWindow: "wee_hours",
      driftOffSpeed: "insomnia_toss",
      nightWakeups: "restless_storm",
      wakeupTrigger: "jolted_abrupt",
      bodyMobility: "deep_exhaustion",
      autonomicBreath: "fluttery_tight",
      bootupMindset: "stormy_drained",
      cognitiveClarity: "spaced_out",
      socialBattery: "irritable_short",
    };

    const res = predictFullHealthMatrix(extremeAnswers);
    expect(res.sleepHours).toBeGreaterThanOrEqual(3.0);
    expect(res.sleepEfficiency).toBeGreaterThanOrEqual(40);
    expect(res.deepSleepScore).toBeGreaterThanOrEqual(20);
    expect(res.moodScore).toBeGreaterThanOrEqual(1);
    expect(res.recoveryScore).toBeGreaterThanOrEqual(10);
    expect(res.stressIndex).toBeLessThanOrEqual(95);
  });
});
