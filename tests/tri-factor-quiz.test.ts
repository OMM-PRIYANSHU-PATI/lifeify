import { describe, it, expect } from "vitest";
import {
  predictTriFactor,
  TriFactorQuizAnswers,
} from "@/lib/rules/tri-factor-quiz";

describe("Gamified Tri-Factor Quiz & Predictor Engine", () => {
  it("predicts peak recovery, optimal sleep, and joyful mood for high-vitality inputs", () => {
    const answers: TriFactorQuizAnswers = {
      wakeupVibe: "rocket",
      sleepArch: "hyperspace",
      moodWeather: "radiant",
      physicalBattery: "battery_100",
    };

    const result = predictTriFactor(answers);

    expect(result.sleepHours).toBeGreaterThanOrEqual(8.0);
    expect(result.sleepQuality).toBeGreaterThanOrEqual(90);
    expect(result.moodScore).toBe(5);
    expect(result.moodValence).toBe("Radiant & Optimistic");
    expect(result.recoveryScore).toBeGreaterThanOrEqual(85);
    expect(result.recoveryStatus).toBe("PEAK_READINESS");
    expect(result.actionableAdvice).toContain("primed");
  });

  it("predicts rest priority, low mood, and short sleep for depleted inputs", () => {
    const answers: TriFactorQuizAnswers = {
      wakeupVibe: "zombie",
      sleepArch: "insomnia",
      moodWeather: "storm",
      physicalBattery: "battery_15",
    };

    const result = predictTriFactor(answers);

    expect(result.sleepHours).toBeLessThanOrEqual(4.5);
    expect(result.sleepQuality).toBeLessThanOrEqual(40);
    expect(result.moodScore).toBe(1);
    expect(result.moodValence).toBe("Exhausted & Stormy");
    expect(result.recoveryScore).toBeLessThanOrEqual(40);
    expect(result.recoveryStatus).toBe("REST_PRIORITY");
    expect(result.actionableAdvice).toContain("reserves are low");
  });

  it("predicts balanced steady metrics for standard day inputs", () => {
    const answers: TriFactorQuizAnswers = {
      wakeupVibe: "coffee",
      sleepArch: "solid",
      moodWeather: "breeze",
      physicalBattery: "battery_80",
    };

    const result = predictTriFactor(answers);

    expect(result.sleepHours).toBeCloseTo(7.5, 1);
    expect(result.sleepQuality).toBeGreaterThanOrEqual(80);
    expect(result.moodScore).toBe(4);
    expect(result.moodValence).toBe("Calm & Centered");
    expect(result.recoveryScore).toBe(84);
    expect(result.recoveryStatus).toBe("OPTIMAL");
  });

  it("predicts moderate recovery for screen time and slight fatigue", () => {
    const answers: TriFactorQuizAnswers = {
      wakeupVibe: "coffee",
      sleepArch: "screen_toss",
      moodWeather: "clouds",
      physicalBattery: "battery_55",
    };

    const result = predictTriFactor(answers);

    expect(result.sleepHours).toBeCloseTo(6.2, 1);
    expect(result.moodScore).toBe(3);
    expect(result.recoveryScore).toBeGreaterThanOrEqual(50);
    expect(result.recoveryScore).toBeLessThan(70);
    expect(result.recoveryStatus).toBe("MODERATE");
  });

  it("strictly enforces biological bounds across all ranges", () => {
    const extremeLow: TriFactorQuizAnswers = {
      wakeupVibe: "zombie",
      sleepArch: "insomnia",
      moodWeather: "storm",
      physicalBattery: "battery_15",
    };
    const resLow = predictTriFactor(extremeLow);
    expect(resLow.sleepHours).toBeGreaterThanOrEqual(3.0);
    expect(resLow.recoveryScore).toBeGreaterThanOrEqual(10);
    expect(resLow.moodScore).toBeGreaterThanOrEqual(1);

    const extremeHigh: TriFactorQuizAnswers = {
      wakeupVibe: "rocket",
      sleepArch: "hyperspace",
      moodWeather: "radiant",
      physicalBattery: "battery_100",
    };
    const resHigh = predictTriFactor(extremeHigh);
    expect(resHigh.sleepHours).toBeLessThanOrEqual(12.0);
    expect(resHigh.recoveryScore).toBeLessThanOrEqual(99);
    expect(resHigh.moodScore).toBeLessThanOrEqual(5);
  });
});
