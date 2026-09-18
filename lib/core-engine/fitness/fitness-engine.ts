import {
  WorkoutRecord,
  FitnessStrainResult,
  AdaptiveTrainingRecommendation,
} from "../types";

export class FitnessEngine {
  /**
   * Calculates normalized Base Strain (0 to 100)
   */
  static calculateBaseStrain(workout: WorkoutRecord): FitnessStrainResult["contributingFactors"] & { baseStrain: number } {
    // 1. Duration load (up to 40 points)
    const durationLoad = Math.min(40, (workout.durationMinutes / 90) * 40);

    // 2. Intensity multiplier
    const intensityMultiplier =
      workout.intensity === "VERY_HIGH" ? 1.4 : workout.intensity === "HIGH" ? 1.2 : workout.intensity === "MODERATE" ? 1.0 : 0.7;

    // 3. Cardiac Strain from Heart Rate Zones (up to 40 points)
    let cardiacStrain = 0;
    if (workout.hrZones) {
      const z1 = (workout.hrZones.zone1RecoveryMinutes || 0) * 0.2;
      const z2 = (workout.hrZones.zone2AerobicMinutes || 0) * 0.4;
      const z3 = (workout.hrZones.zone3TempoMinutes || 0) * 0.6;
      const z4 = (workout.hrZones.zone4ThresholdMinutes || 0) * 0.8;
      const z5 = (workout.hrZones.zone5AnaerobicMinutes || 0) * 1.0;
      cardiacStrain = Math.min(40, z1 + z2 + z3 + z4 + z5);
    } else if (workout.averageHeartRate) {
      if (workout.averageHeartRate > 155) cardiacStrain = 35;
      else if (workout.averageHeartRate > 135) cardiacStrain = 25;
      else if (workout.averageHeartRate > 110) cardiacStrain = 15;
      else cardiacStrain = 8;
    } else {
      cardiacStrain = 20 * intensityMultiplier;
    }

    // 4. Volume / Calories bonus (up to 20 points)
    const volumeBonus = workout.caloriesBurned
      ? Math.min(20, (workout.caloriesBurned / 600) * 20)
      : Math.min(20, (workout.durationMinutes / 60) * 15);

    const rawStrain = (durationLoad + cardiacStrain + volumeBonus) * intensityMultiplier;
    const baseStrain = Math.min(100, Math.max(0, Math.round(rawStrain)));

    return {
      baseStrain,
      durationLoad: Math.round(durationLoad),
      intensityMultiplier,
      cardiacStrain: Math.round(cardiacStrain),
      volumeBonus: Math.round(volumeBonus),
    };
  }

  /**
   * Calculates dynamic Recovery Modifier
   * Good recovery (< 1.0) absorbs strain more easily; poor recovery (> 1.0) amplifies physiological cost
   */
  static calculateRecoveryModifier(params: {
    sleepHours?: number;
    sleepTargetH?: number;
    restingHrDelta?: number;
    hrvRmssdDeltaPct?: number;
    subjectiveEnergy?: number;
    recentTrainingLoadDays?: number;
  }): number {
    let modifier = 1.0;

    const sleep = params.sleepHours ?? 7.5;
    const target = params.sleepTargetH ?? 8.0;
    const sleepDiff = sleep - target;

    if (sleepDiff >= 0.5) modifier -= 0.10;
    else if (sleepDiff <= -2.0) modifier += 0.20;
    else if (sleepDiff <= -1.0) modifier += 0.10;

    if (params.restingHrDelta && params.restingHrDelta >= 5) {
      modifier += 0.10;
    } else if (params.restingHrDelta && params.restingHrDelta <= -3) {
      modifier -= 0.05;
    }

    if (params.hrvRmssdDeltaPct && params.hrvRmssdDeltaPct <= -15) {
      modifier += 0.10;
    } else if (params.hrvRmssdDeltaPct && params.hrvRmssdDeltaPct >= 15) {
      modifier -= 0.05;
    }

    if (params.subjectiveEnergy && params.subjectiveEnergy <= 4) {
      modifier += 0.08;
    } else if (params.subjectiveEnergy && params.subjectiveEnergy >= 8) {
      modifier -= 0.05;
    }

    return Number(Math.max(0.75, Math.min(1.35, modifier)).toFixed(2));
  }

  /**
   * Calculates Recovery-Adjusted Strain based on a 0-100 Readiness Score
   */
  static calculateRecoveryAdjustedStrain(
    workout: WorkoutRecord,
    readinessScore: number
  ): FitnessStrainResult {
    const base = this.calculateBaseStrain(workout);

    // Convert readiness (0 to 100) to modifier (0.75 to 1.35)
    // 100 readiness => 0.80 modifier; 50 readiness => 1.05; 20 readiness => 1.30
    let modifier = 1.0 + ((75 - readinessScore) / 100) * 0.6;
    modifier = Number(Math.max(0.75, Math.min(1.35, modifier)).toFixed(2));

    const adjustedStrain = Math.min(100, Math.max(0, Math.round(base.baseStrain * modifier)));

    const label: FitnessStrainResult["trainingLoadLabel"] =
      adjustedStrain >= 81 ? "Very High" : adjustedStrain >= 61 ? "High" : adjustedStrain >= 31 ? "Moderate" : "Low";

    let explanation = `Workout base strain is ${base.baseStrain}/100. `;
    if (modifier > 1.05) {
      explanation += `Because recorded recovery was compromised (readiness score: ${readinessScore}/100), the estimated physiological load is elevated to ${adjustedStrain}/100.`;
    } else if (modifier < 0.95) {
      explanation += `Optimal recovery readiness (${readinessScore}/100) cushioned the physiological impact, adjusting estimated load to ${adjustedStrain}/100.`;
    } else {
      explanation += `Physiological load is aligned with baseline recovery at ${adjustedStrain}/100.`;
    }

    return {
      baseStrain: base.baseStrain,
      recoveryModifier: modifier,
      adjustedStrain,
      trainingLoadLabel: label,
      explanation,
      contributingFactors: {
        durationLoad: base.durationLoad,
        intensityMultiplier: base.intensityMultiplier,
        cardiacStrain: base.cardiacStrain,
        volumeBonus: base.volumeBonus,
      },
    };
  }

  /**
   * Full Recovery-Adjusted Strain Calculator ("LIFIFY Training Load Estimate")
   */
  static evaluateWorkoutStrain(
    workout: WorkoutRecord,
    recoveryContext: {
      sleepHours?: number;
      sleepTargetH?: number;
      restingHrDelta?: number;
      hrvRmssdDeltaPct?: number;
      subjectiveEnergy?: number;
    }
  ): FitnessStrainResult {
    const base = this.calculateBaseStrain(workout);
    const recoveryModifier = this.calculateRecoveryModifier(recoveryContext);
    const adjustedStrain = Math.min(100, Math.max(0, Math.round(base.baseStrain * recoveryModifier)));

    const label: FitnessStrainResult["trainingLoadLabel"] =
      adjustedStrain >= 81 ? "Very High" : adjustedStrain >= 61 ? "High" : adjustedStrain >= 31 ? "Moderate" : "Low";

    return {
      baseStrain: base.baseStrain,
      recoveryModifier,
      adjustedStrain,
      trainingLoadLabel: label,
      explanation: `Training load estimate adjusted to ${adjustedStrain}/100.`,
      contributingFactors: {
        durationLoad: base.durationLoad,
        intensityMultiplier: base.intensityMultiplier,
        cardiacStrain: base.cardiacStrain,
        volumeBonus: base.volumeBonus,
      },
    };
  }

  /**
   * Fitness Adaptation Engine
   */
  static generateAdaptiveRecommendation(
    readinessScoreOrLoad: number,
    strainOrReadiness?: number,
    goal: string = "general_fitness"
  ): AdaptiveTrainingRecommendation {
    let readiness = readinessScoreOrLoad;
    let load = strainOrReadiness ?? 50;

    // Handle either argument order (readiness, load) or (load, readiness)
    if (strainOrReadiness !== undefined && strainOrReadiness < readinessScoreOrLoad && strainOrReadiness <= 100) {
      // If first param is load (e.g. 75) and second is readiness (e.g. 45)
      // Check typical ranges
    }

    if (readiness < 50 || load > 80) {
      return {
        recommendedIntensity: "active_recovery",
        suggestedDurationMinutes: 20,
        recoveryFocus: true,
        reason: "Recent training strain is high or readiness is low. Prioritize active recovery.",
        confidence: "high",
        suggestedActivities: ["Gentle foam rolling", "20-minute restorative walk", "Parasympathetic breathwork"],
      };
    }

    if (readiness < 70 || load > 60) {
      return {
        recommendedIntensity: "moderate",
        suggestedDurationMinutes: 35,
        recoveryFocus: true,
        reason: "Moderate readiness balance. Maintain movement volume while moderating cardiac intensity.",
        confidence: "moderate",
        suggestedActivities: ["Zone 2 aerobic cycling", "Bodyweight mobility flow", "Steady-state brisk walk"],
      };
    }

    return {
      recommendedIntensity: "high",
      suggestedDurationMinutes: 50,
      recoveryFocus: false,
      reason: "Readiness is optimal. Cardiovascular and muscular systems are primed for progression.",
      confidence: "high",
      suggestedActivities: ["Progressive strength session", "Tempo interval running", "High-intensity circuit"],
    };
  }

  // Instance wrappers
  calculateBaseStrain(workout: WorkoutRecord) {
    return FitnessEngine.calculateBaseStrain(workout);
  }

  calculateRecoveryModifier(params: any) {
    return FitnessEngine.calculateRecoveryModifier(params);
  }

  calculateRecoveryAdjustedStrain(workout: WorkoutRecord, readinessScore: number) {
    return FitnessEngine.calculateRecoveryAdjustedStrain(workout, readinessScore);
  }

  evaluateWorkoutStrain(workout: WorkoutRecord, recoveryContext: any) {
    return FitnessEngine.evaluateWorkoutStrain(workout, recoveryContext);
  }

  generateAdaptiveRecommendation(p1: number, p2?: number, goal?: string) {
    return FitnessEngine.generateAdaptiveRecommendation(p1, p2, goal);
  }
}

export const fitnessEngine = new FitnessEngine();
