import { SleepSessionRecord, ReadinessIndexResult } from "../types";

export class SleepEngine {
  /**
   * Evaluates sleep architecture and returns quality score (0 to 100)
   */
  static evaluateSleepSession(session: SleepSessionRecord, targetHours = 8.0): {
    sleepScore: number;
    durationHours: number;
    debtHours: number;
    deepSleepPct: number;
    remSleepPct: number;
    efficiencyPct: number;
    observations: string[];
  } {
    const durationHours = Number((session.totalDurationMinutes / 60).toFixed(1));
    const debtHours = Number(Math.max(0, targetHours - durationHours).toFixed(1));

    const totalMinutes = session.totalDurationMinutes || 1;
    const deepSleepPct = Math.round((session.deepSleepMinutes / totalMinutes) * 100);
    const remSleepPct = Math.round((session.remSleepMinutes / totalMinutes) * 100);
    const efficiencyPct = session.efficiencyPercent || 85;

    // Sleep score calculation (0 to 100)
    let score = 0;
    // 1. Duration (up to 50 points)
    score += Math.min(50, (durationHours / targetHours) * 50);

    // 2. Deep & REM architecture (up to 30 points)
    if (deepSleepPct >= 18) score += 15;
    else score += (deepSleepPct / 18) * 15;

    if (remSleepPct >= 20) score += 15;
    else score += (remSleepPct / 20) * 15;

    // 3. Efficiency (up to 20 points)
    if (efficiencyPct >= 85) score += 20;
    else score += (efficiencyPct / 85) * 20;

    const sleepScore = Math.min(100, Math.max(20, Math.round(score)));

    const observations: string[] = [];
    if (durationHours < targetHours - 1.5) {
      observations.push(`Sleep duration (${durationHours}h) was notably below your target (${targetHours}h).`);
    }
    if (deepSleepPct < 12) {
      observations.push("Deep sleep percentage was lower than typical restorative thresholds (15–25%).");
    }
    if (efficiencyPct < 80) {
      observations.push("Higher nighttime restlessness or awakenings observed.");
    }

    return {
      sleepScore,
      durationHours,
      debtHours,
      deepSleepPct,
      remSleepPct,
      efficiencyPct,
      observations,
    };
  }

  /**
   * Calculates the personalized LIFIFY Readiness Index (0 to 100)
   */
  static calculateReadinessIndex(params: {
    sleepSession?: SleepSessionRecord;
    baselineSleepHours?: number;
    restingHeartRate?: number;
    baselineRestingHr?: number;
    hrvRmssd?: number;
    baselineHrvRmssd?: number;
    recentTrainingStrain?: number; // 0 to 100
    subjectiveEnergy?: number; // 1 to 10
    mood?: number; // 1 to 5
  }): ReadinessIndexResult {
    const sleepTarget = params.baselineSleepHours || 7.5;
    const sleepEval = params.sleepSession
      ? this.evaluateSleepSession(params.sleepSession, sleepTarget)
      : { sleepScore: 70, durationHours: 7.0, debtHours: 0.5, observations: [] };

    // 1. Sleep Component (0 to 35 points)
    const sleepComponent = Math.round((sleepEval.sleepScore / 100) * 35);

    // 2. Recovery & Autonomic Vitals Component (0 to 30 points)
    let recoveryScore = 24; // baseline assumption
    if (params.restingHeartRate && params.baselineRestingHr) {
      const hrDelta = params.restingHeartRate - params.baselineRestingHr;
      if (hrDelta <= -2) recoveryScore += 4; // Lower RHR = better recovery
      else if (hrDelta >= 4) recoveryScore -= 6; // Elevated RHR = fatigue/strain
    }
    if (params.hrvRmssd && params.baselineHrvRmssd) {
      const hrvDeltaPct = ((params.hrvRmssd - params.baselineHrvRmssd) / params.baselineHrvRmssd) * 100;
      if (hrvDeltaPct >= 10) recoveryScore += 4;
      else if (hrvDeltaPct <= -15) recoveryScore -= 6;
    }
    const recoveryComponent = Math.min(30, Math.max(5, recoveryScore));

    // 3. Activity & Strain Inverse Load Component (0 to 20 points)
    const strain = params.recentTrainingStrain || 45;
    let activityLoadComponent = 16;
    if (strain > 75) activityLoadComponent = 6;
    else if (strain > 55) activityLoadComponent = 12;
    else activityLoadComponent = 19;

    // 4. Subjective Energy & Mood Component (0 to 15 points)
    const energy = params.subjectiveEnergy || 6;
    const subjectiveComponent = Math.min(15, Math.max(2, Math.round((energy / 10) * 15)));

    const rawTotal = sleepComponent + recoveryComponent + activityLoadComponent + subjectiveComponent;
    const score = Math.min(100, Math.max(10, Math.round(rawTotal)));

    const label: ReadinessIndexResult["label"] =
      score >= 82
        ? "Optimal Readiness"
        : score >= 65
        ? "Adequate Readiness"
        : score >= 45
        ? "Moderate Fatigue"
        : "High Strain / Rest Needed";

    const headline =
      score >= 80
        ? "Your body is in prime physiological recovery. Ready for peak activity."
        : score >= 65
        ? "Readiness is stable. Balanced capacity for moderate-to-vigorous training."
        : "Recovery indicators suggest fatigue. A lower-intensity or restorative focus is recommended.";

    const observations: string[] = [...sleepEval.observations];
    if (params.restingHeartRate && params.baselineRestingHr && params.restingHeartRate > params.baselineRestingHr + 3) {
      observations.push(`Resting heart rate (${params.restingHeartRate} bpm) is elevated above baseline (${params.baselineRestingHr} bpm).`);
    }
    if (strain > 70) {
      observations.push(`Cumulative training strain (${strain}/100) is pulling on recovery reserves.`);
    }

    const recommendations: string[] = [];
    if (score < 60) {
      recommendations.push("Prioritize 30 minutes earlier bedtime tonight to clear sleep debt.");
      recommendations.push("Consider swapping intense cardiovascular intervals for mobility or zone 2 walking.");
    } else {
      recommendations.push("Maintain current sleep cadence and hydration to preserve readiness.");
    }

    return {
      score,
      label,
      sleepComponent,
      recoveryComponent,
      activityLoadComponent,
      subjectiveComponent,
      headline,
      observations,
      recommendations,
    };
  }

  static calculateSleepDebt(sessions: SleepSessionRecord[], targetHoursPerNight = 8.0): number {
    if (sessions.length === 0) return 0;
    let totalDebt = 0;
    sessions.forEach((s) => {
      const durH = s.totalDurationMinutes / 60;
      if (durH < targetHoursPerNight) {
        totalDebt += (targetHoursPerNight - durH);
      }
    });
    return Number(totalDebt.toFixed(1));
  }

  // Instance wrappers
  evaluateSleepSession(session: SleepSessionRecord, targetHours = 8.0) {
    return SleepEngine.evaluateSleepSession(session, targetHours);
  }

  calculateReadinessIndex(params: {
    latestSleep?: SleepSessionRecord;
    lastNightSession?: SleepSessionRecord;
    recentSleepSessions?: SleepSessionRecord[];
    recentWorkoutLoad?: number;
    recentTrainingStrain?: number;
    baselineHrv?: number;
    baselineRestingHr?: number;
    subjectiveEnergy?: number;
  }) {
    const session = params.latestSleep || params.lastNightSession;
    if (!session) {
      return {
        score: 75,
        label: "Adequate Readiness" as const,
        sleepComponent: 25,
        recoveryComponent: 22,
        activityLoadComponent: 15,
        subjectiveComponent: 13,
        headline: "Balanced recovery indicates capacity for typical daily workloads.",
        observations: ["No recorded sleep disruptions."],
        recommendations: ["Maintain regular bedtime schedule and hydration."]
      };
    }

    return SleepEngine.calculateReadinessIndex({
      sleepSession: session,
      recentTrainingStrain: params.recentWorkoutLoad || params.recentTrainingStrain,
      baselineHrv: params.baselineHrv,
      baselineRestingHr: params.baselineRestingHr,
      subjectiveEnergy: params.subjectiveEnergy
    });
  }

  calculateSleepDebt(sessions: SleepSessionRecord[], targetHours = 8.0) {
    return SleepEngine.calculateSleepDebt(sessions, targetHours);
  }
}

export const sleepEngine = new SleepEngine();
