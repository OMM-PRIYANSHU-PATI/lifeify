/**
 * LIFIFY Core Health Intelligence Engine — Cross-Domain Context Engine
 *
 * Fulfills Section 2 Product Objective:
 * Unifies Fitness, Nutrition, Sleep, Medications, Symptoms, Vitals, and Baselines
 * into a single unified health data context.
 *
 * Implements cross-domain pattern correlation:
 * - Simultaneous sleep deficit + high physical strain
 * - Hydration deficit + workout volume
 * - Medication omission + recurring symptom latency
 */

import {
  HealthContext,
  FitnessStrainResult,
  AdaptiveTrainingRecommendation,
  NutritionVarianceResult,
  ReadinessIndexResult,
  MetricBaselineSummary,
  TemporalMedicationSymptomAssociation,
  SymptomLogRecord,
  RiskSignal,
  DataQualityState
} from "../types";

export interface ContextBuildInput {
  userId: string;
  profile?: {
    age?: number;
    gender?: string;
    goal?: string;
    conditions?: string[];
  };
  fitness?: {
    stepsToday: number;
    workoutsThisWeek: number;
    currentStrain: FitnessStrainResult;
    adaptation: AdaptiveTrainingRecommendation;
  };
  nutrition?: {
    todayVariance: NutritionVarianceResult;
    calorieIntake: number;
    proteinIntake: number;
  };
  sleep?: {
    lastNightHours: number;
    sleepDebtHours: number;
    efficiency: number;
    readiness: ReadinessIndexResult;
  };
  medications?: {
    scheduledTodayCount: number;
    adherencePercentLast7Days: number;
    recentAssociations: TemporalMedicationSymptomAssociation[];
  };
  symptoms?: {
    recentSymptoms: SymptomLogRecord[];
  };
  vitals?: {
    latestSystolicBp?: number;
    latestDiastolicBp?: number;
    latestRestingHr?: number;
    latestSpO2?: number;
    latestWeightKg?: number;
  };
  baselineDeviations?: MetricBaselineSummary[];
  riskSignals?: RiskSignal[];
}

export class HealthContextEngine {
  /**
   * Constructs the unified HealthContext across all 6 core domains.
   */
  buildContext(input: ContextBuildInput): HealthContext {
    const missingDomains: string[] = [];

    if (!input.fitness) missingDomains.push("fitness");
    if (!input.nutrition) missingDomains.push("nutrition");
    if (!input.sleep) missingDomains.push("sleep");
    if (!input.medications) missingDomains.push("medications");
    if (!input.vitals) missingDomains.push("vitals");

    // Determine overall data quality state
    let overallState: DataQualityState = "VERIFIED";
    if (missingDomains.length >= 3) {
      overallState = "PARTIAL";
    } else if (missingDomains.length > 0) {
      overallState = "USER_REPORTED";
    }

    // Default fallbacks to guarantee robust context object
    const defaultStrain: FitnessStrainResult = {
      baseStrain: 30,
      recoveryModifier: 1.0,
      adjustedStrain: 30,
      trainingLoadLabel: "Moderate",
      explanation: "Moderate baseline baseline activity estimate.",
      contributingFactors: {
        durationLoad: 15,
        intensityMultiplier: 1.0,
        cardiacStrain: 10,
        volumeBonus: 5
      }
    };

    const defaultAdaptation: AdaptiveTrainingRecommendation = {
      recommendedIntensity: "moderate",
      suggestedDurationMinutes: 30,
      recoveryFocus: false,
      reason: "Balanced baseline parameters maintain consistent fitness progression.",
      confidence: "moderate",
      suggestedActivities: ["Brisk Walking", "Light Jogging", "Mobility Drills"]
    };

    const defaultNutritionVariance: NutritionVarianceResult = {
      calorieVariance: 0,
      proteinVariance: 0,
      carbVariance: 0,
      fatVariance: 0,
      hydrationVariance: 0,
      calorieVariancePct: 0,
      proteinVariancePct: 0,
      hydrationVariancePct: 0,
      status: "ON_TRACK",
      practicalAdjustments: ["Maintain balanced whole foods with adequate hydration."]
    };

    const defaultReadiness: ReadinessIndexResult = {
      score: 75,
      label: "Adequate Readiness",
      sleepComponent: 25,
      recoveryComponent: 22,
      activityLoadComponent: 15,
      subjectiveComponent: 13,
      headline: "Balanced recovery indicates capacity for typical daily workloads.",
      observations: ["Sleep and recovery metrics remain within steady bounds."],
      recommendations: ["Maintain regular bedtime schedule and hydration."]
    };

    return {
      userId: input.userId,
      generatedAt: new Date(),
      profile: input.profile || {
        goal: "Longevity & Metabolic Health",
        conditions: []
      },
      fitness: input.fitness || {
        stepsToday: 6500,
        workoutsThisWeek: 3,
        currentStrain: defaultStrain,
        adaptation: defaultAdaptation
      },
      nutrition: input.nutrition || {
        todayVariance: defaultNutritionVariance,
        calorieIntake: 2000,
        proteinIntake: 75
      },
      sleep: input.sleep || {
        lastNightHours: 7.2,
        sleepDebtHours: 0.5,
        efficiency: 88,
        readiness: defaultReadiness
      },
      medications: input.medications || {
        scheduledTodayCount: 0,
        adherencePercentLast7Days: 100,
        recentAssociations: []
      },
      symptoms: input.symptoms || {
        recentSymptoms: []
      },
      vitals: input.vitals || {},
      baselineDeviations: input.baselineDeviations || [],
      riskSignals: input.riskSignals || [],
      dataQuality: {
        overallState,
        missingDomains
      }
    };
  }

  /**
   * Detects multi-domain patterns and potential cross-system strain
   */
  detectCrossDomainPatterns(context: HealthContext): string[] {
    const patterns: string[] = [];

    // Pattern 1: High Physical Strain combined with Sleep Deprivation
    if (
      context.sleep.lastNightHours < 6.0 &&
      context.fitness.currentStrain.adjustedStrain >= 60
    ) {
      patterns.push(
        "High Training Strain coupled with Low Sleep: Recent workout strain exceeds 60 while sleep fell below 6h. Autonomic recovery may be compromised."
      );
    }

    // Pattern 2: Hydration Deficit combined with Elevated Resting HR
    const hydrationDeficit = context.nutrition.todayVariance.hydrationVariance < -500;
    const elevatedRhr =
      context.vitals.latestRestingHr && context.vitals.latestRestingHr > 75;
    if (hydrationDeficit && elevatedRhr) {
      patterns.push(
        "Elevated Resting HR alongside Hydration Deficit: Resting heart rate is above typical baseline while fluid intake is deficient by >500ml."
      );
    }

    // Pattern 3: Recent Symptom following Medication Timing
    if (context.medications.recentAssociations.length > 0) {
      const topAssoc = context.medications.recentAssociations[0];
      patterns.push(
        `Temporal Alignment: ${topAssoc.symptomName} noted within ${Math.round(topAssoc.proximityMinutes / 60)}h of ${topAssoc.medicationName} intake.`
      );
    }

    // Pattern 4: Blood Pressure elevation + Sleep debt
    if (
      context.vitals.latestSystolicBp &&
      context.vitals.latestSystolicBp >= 135 &&
      context.sleep.sleepDebtHours >= 2.0
    ) {
      patterns.push(
        "Cardiovascular / Sleep Interaction: Systolic blood pressure elevation coincides with an accumulated sleep debt of >= 2 hours."
      );
    }

    return patterns;
  }
}

export const contextEngine = new HealthContextEngine();
