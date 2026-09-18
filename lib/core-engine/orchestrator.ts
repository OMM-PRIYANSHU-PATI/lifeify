/**
 * LIFIFY Core Health Intelligence Engine — Central Orchestrator
 *
 * Fulfills Section 1 & Section 2:
 * Central unified health intelligence layer coordinating Fitness, Nutrition,
 * Sleep, Medication, Symptoms, Vitals, Longitudinal Baselines, Risk Intelligence,
 * and AI Personalization.
 */

import {
  HealthDataPoint,
  WorkoutRecord,
  SleepSessionRecord,
  MedicationDoseLog,
  SymptomLogRecord,
  HealthContext,
  PersonalizedDailyHealthPlan,
  RiskSignal,
  PersonalBaselineProfile
} from "./types";

import { ingestionEngine } from "./ingestion/ingestion-engine";
import { domainEventBus } from "./events/event-bus";
import { baselineEngine } from "./baseline/baseline-engine";
import { fitnessEngine } from "./fitness/fitness-engine";
import { nutritionEngine } from "./nutrition/nutrition-engine";
import { sleepEngine } from "./sleep/sleep-engine";
import { medicationEngine } from "./medication/medication-engine";
import { contextEngine } from "./context/context-engine";
import { riskSignalEngine } from "./predictive/risk-signal-engine";
import { personalizationEngine } from "./personalization/personalization-engine";
import { doctorPreferenceEngine } from "./doctor/doctor-preference-engine";
import { safetyEngine } from "./safety/safety-engine";
import { productionGeminiProvider } from "./providers/gemini-provider";
import { demoGenerator } from "./demo/demo-generator";

export interface OrchestratedOverviewResult {
  context: HealthContext;
  plan: PersonalizedDailyHealthPlan;
  baselineProfile: PersonalBaselineProfile;
  aiExecutiveSummary: string;
  crossDomainPatterns: string[];
}

const globalHealthStores = globalThis as unknown as {
  __lififyHealthStores?: {
    workoutsStore: Map<string, WorkoutRecord[]>;
    sleepStore: Map<string, SleepSessionRecord[]>;
    medicationStore: Map<string, MedicationDoseLog[]>;
    symptomStore: Map<string, SymptomLogRecord[]>;
  };
};

if (!globalHealthStores.__lififyHealthStores) {
  globalHealthStores.__lififyHealthStores = {
    workoutsStore: new Map(),
    sleepStore: new Map(),
    medicationStore: new Map(),
    symptomStore: new Map(),
  };
}

export class AIHealthIntelligenceEngine {
  private workoutsStore = globalHealthStores.__lififyHealthStores.workoutsStore;
  private sleepStore = globalHealthStores.__lififyHealthStores.sleepStore;
  private medicationStore = globalHealthStores.__lififyHealthStores.medicationStore;
  private symptomStore = globalHealthStores.__lififyHealthStores.symptomStore;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    domainEventBus.subscribe("WorkoutCompleted", (event) => {
      const workout = event.payload as WorkoutRecord;
      const userList = this.workoutsStore.get(workout.userId) || [];
      userList.push(workout);
      this.workoutsStore.set(workout.userId, userList);
    });

    domainEventBus.subscribe("SleepRecorded", (event) => {
      const sleep = event.payload as SleepSessionRecord;
      const userList = this.sleepStore.get(sleep.userId) || [];
      userList.push(sleep);
      this.sleepStore.set(sleep.userId, userList);
    });

    domainEventBus.subscribe("MedicationTaken", (event) => {
      const dose = event.payload as MedicationDoseLog;
      const userList = this.medicationStore.get(dose.userId) || [];
      userList.push(dose);
      this.medicationStore.set(dose.userId, userList);
    });

    domainEventBus.subscribe("SymptomRecorded", (event) => {
      const sym = event.payload as SymptomLogRecord;
      const userList = this.symptomStore.get(sym.userId) || [];
      userList.push(sym);
      this.symptomStore.set(sym.userId, userList);
    });
  }

  /**
   * Ingests any normalized health data point with idempotency and domain routing
   */
  ingestDataPoint(point: HealthDataPoint) {
    return ingestionEngine.ingestPoint(point);
  }

  /**
   * Records a workout session and publishes domain event
   */
  recordWorkout(workout: WorkoutRecord) {
    const userList = this.workoutsStore.get(workout.userId) || [];
    userList.push(workout);
    this.workoutsStore.set(workout.userId, userList);

    domainEventBus.publish({
      id: `evt_wo_${Date.now()}`,
      eventType: "WorkoutCompleted",
      userId: workout.userId,
      timestamp: new Date(),
      payload: workout,
      sourceType: workout.sourceType
    });
  }

  /**
   * Records a sleep session and publishes domain event
   */
  recordSleep(session: SleepSessionRecord) {
    const userList = this.sleepStore.get(session.userId) || [];
    userList.push(session);
    this.sleepStore.set(session.userId, userList);

    domainEventBus.publish({
      id: `evt_sl_${Date.now()}`,
      eventType: "SleepRecorded",
      userId: session.userId,
      timestamp: new Date(),
      payload: session,
      sourceType: session.sourceType
    });
  }

  /**
   * Records medication dose log
   */
  recordMedication(dose: MedicationDoseLog) {
    const userList = this.medicationStore.get(dose.userId) || [];
    userList.push(dose);
    this.medicationStore.set(dose.userId, userList);

    domainEventBus.publish({
      id: `evt_med_${Date.now()}`,
      eventType: "MedicationTaken",
      userId: dose.userId,
      timestamp: new Date(),
      payload: dose,
      sourceType: dose.sourceType
    });
  }

  /**
   * Records symptom log
   */
  recordSymptom(symptom: SymptomLogRecord) {
    const userList = this.symptomStore.get(symptom.userId) || [];
    userList.push(symptom);
    this.symptomStore.set(symptom.userId, userList);

    domainEventBus.publish({
      id: `evt_sym_${Date.now()}`,
      eventType: "SymptomRecorded",
      userId: symptom.userId,
      timestamp: new Date(),
      payload: symptom,
      sourceType: symptom.sourceType
    });
  }

  /**
   * Loads the built-in 90-day longitudinal demo scenario
   */
  load90DayDemoScenario(userId: string = "demo_patient_001"): OrchestratedOverviewResult {
    const scenario = demoGenerator.generate90DayScenario(userId);

    // Populate data store
    this.workoutsStore.set(userId, scenario.workouts);
    this.sleepStore.set(userId, scenario.sleepSessions);
    this.medicationStore.set(userId, scenario.medicationLogs);
    this.symptomStore.set(userId, scenario.symptomLogs);

    // Ingest all data points
    scenario.dataPoints.forEach((dp) => ingestionEngine.ingestPoint(dp));

    return this.generateOverviewSync(userId);
  }

  /**
   * Synchronous overview generator using computed health context
   */
  generateOverviewSync(userId: string): OrchestratedOverviewResult {
    const userSleep = this.sleepStore.get(userId) || [];
    const latestSleep = userSleep[userSleep.length - 1];

    const userWorkouts = this.workoutsStore.get(userId) || [];
    const latestWorkout = userWorkouts[userWorkouts.length - 1];

    const userMeds = this.medicationStore.get(userId) || [];
    const userSymptoms = this.symptomStore.get(userId) || [];

    // Calculate Sleep & Readiness
    const readiness = sleepEngine.calculateReadinessIndex({
      latestSleep,
      recentSleepSessions: userSleep.slice(-7),
      recentWorkoutLoad: latestWorkout ? latestWorkout.durationMinutes * 1.5 : 20
    });

    // Calculate Recovery-Adjusted Fitness Strain
    const strain = latestWorkout
      ? fitnessEngine.calculateRecoveryAdjustedStrain(latestWorkout, readiness.score)
      : {
          baseStrain: 25,
          recoveryModifier: 1.0,
          adjustedStrain: 25,
          trainingLoadLabel: "Low" as const,
          explanation: "Baseline daily activity.",
          contributingFactors: {
            durationLoad: 15,
            intensityMultiplier: 1.0,
            cardiacStrain: 5,
            volumeBonus: 5
          }
        };

    const adaptation = fitnessEngine.generateAdaptiveRecommendation(
      readiness.score,
      strain.adjustedStrain
    );

    // Calculate Nutrition Variance
    const nutritionTarget = {
      dailyCalories: 2200,
      proteinGrams: 110,
      carbsGrams: 250,
      fatGrams: 65,
      waterMl: 2500
    };
    const nutritionIntake = {
      consumedCalories: 2050,
      consumedProtein: 95,
      consumedCarbs: 230,
      consumedFat: 60,
      consumedFiber: 24,
      consumedWaterMl: 1700,
      mealCount: 3,
      loggedFoods: [
        { name: "2 Roti + Moong Dal", quantity: 1, unit: "serving", calories: 380, proteinG: 14, carbsG: 62, fatG: 6, isIndianItem: true },
        { name: "Paneer Tikka + Salad", quantity: 150, unit: "g", calories: 320, proteinG: 22, carbsG: 8, fatG: 20, isIndianItem: true }
      ]
    };
    const nutritionVariance = nutritionEngine.calculateVariance(nutritionIntake, nutritionTarget);

    // Calculate Longitudinal Baselines & Z-Scores
    const rhrPoints = ingestionEngine.getPointsByMetric(userId, "resting_heart_rate");
    const baselineProfile = baselineEngine.generateBaselineProfile(userId, {
      resting_heart_rate: rhrPoints
    });

    // Detect Medication <-> Symptom Associations
    const medAssociations = medicationEngine.detectTemporalAssociations(
      userMeds,
      userSymptoms
    );

    // Medication Adherence
    const adherence = medicationEngine.calculateAdherence(userMeds, 7);

    // Build Unified HealthContext
    const context = contextEngine.buildContext({
      userId,
      fitness: {
        stepsToday: 9200,
        workoutsThisWeek: userWorkouts.slice(-7).length,
        currentStrain: strain,
        adaptation
      },
      nutrition: {
        todayVariance: nutritionVariance,
        calorieIntake: nutritionIntake.consumedCalories,
        proteinIntake: nutritionIntake.consumedProtein
      },
      sleep: {
        lastNightHours: latestSleep ? +(latestSleep.totalDurationMinutes / 60).toFixed(1) : 7.0,
        sleepDebtHours: +(sleepEngine.calculateSleepDebt(userSleep.slice(-7))).toFixed(1),
        efficiency: latestSleep ? latestSleep.efficiencyPercent : 88,
        readiness
      },
      medications: {
        scheduledTodayCount: 1,
        adherencePercentLast7Days: adherence.adherencePercentage,
        recentAssociations: medAssociations
      },
      symptoms: {
        recentSymptoms: userSymptoms.slice(-5)
      },
      vitals: {
        latestSystolicBp: 128,
        latestDiastolicBp: 82,
        latestRestingHr: latestSleep?.restingHeartRate || 74,
        latestSpO2: 98,
        latestWeightKg: 72.5
      },
      baselineDeviations: baselineProfile.significantDeviations
    });

    // Generate Risk Signals
    const riskSignals = riskSignalEngine.evaluateSignals(context);
    context.riskSignals = riskSignals;

    // Cross-Domain Pattern Detection
    const crossDomainPatterns = contextEngine.detectCrossDomainPatterns(context);

    // Generate Personalized Daily Health Plan
    const plan = personalizationEngine.generateDailyPlan(context);

    // Fallback AI Summary
    const aiExecutiveSummary = safetyEngine.appendStandardDisclaimer(
      `Systemic recovery stands at ${readiness.score}/100 (${readiness.label}). ` +
      `Training load estimate is ${strain.adjustedStrain.toFixed(0)} (${strain.trainingLoadLabel}). ` +
      (riskSignals.length > 0
        ? `Notice: ${riskSignals[0].title} observed relative to longitudinal baselines.`
        : "All longitudinal baseline metrics remain within steady bounds.")
    );

    return {
      context,
      plan,
      baselineProfile,
      aiExecutiveSummary,
      crossDomainPatterns
    };
  }

  /**
   * Async overview with Gemini AI synthesis if configured
   */
  async generateOverviewAsync(userId: string): Promise<OrchestratedOverviewResult> {
    const result = this.generateOverviewSync(userId);

    try {
      if (await productionGeminiProvider.isAvailable()) {
        const geminiSummary = await productionGeminiProvider.generateHealthSummary(result.context);
        if (geminiSummary) {
          result.aiExecutiveSummary = geminiSummary;
        }
      }
    } catch {
      // Fallback already set in generateOverviewSync
    }

    return result;
  }
}

export const healthIntelligenceEngine = new AIHealthIntelligenceEngine();
