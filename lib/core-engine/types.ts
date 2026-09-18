/**
 * LIFIFY Core Health Intelligence Engine — Canonical Type Definitions
 *
 * Implements strict provenance, multi-domain health modeling, longitudinal baselines,
 * recovery-adjusted fitness strain, sleep architecture, closed-loop medication associations,
 * and explainable risk signals.
 */

export type HealthSourceType =
  | "APPLE_HEALTH"
  | "HEALTH_CONNECT"
  | "WEARABLE"
  | "PHONE_SENSOR"
  | "MANUAL"
  | "DOCUMENT"
  | "OCR"
  | "VOICE"
  | "DOCTOR"
  | "SYSTEM";

export type DataQualityState =
  | "VERIFIED"
  | "USER_REPORTED"
  | "ESTIMATED"
  | "PARTIAL"
  | "MISSING"
  | "STALE"
  | "CONFLICTING"
  | "UNVERIFIED";

export interface HealthDataPoint {
  id: string;
  userId: string;
  sourceType: HealthSourceType;
  sourceId?: string;
  metricType: string;
  value: number | string;
  unit?: string;
  capturedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  confidence?: number;
  qualityState: DataQualityState;
  isUserConfirmed: boolean;
  isVerified: boolean;
  isEstimated: boolean;
  metadata?: Record<string, any>;
}

// =========================================================================
// 1. FITNESS & RECOVERY-ADJUSTED STRAIN
// =========================================================================
export interface WorkoutRecord {
  id: string;
  userId: string;
  workoutType: string;
  durationMinutes: number;
  intensity: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
  averageHeartRate?: number;
  maxHeartRate?: number;
  hrZones?: {
    zone1RecoveryMinutes?: number;
    zone2AerobicMinutes?: number;
    zone3TempoMinutes?: number;
    zone4ThresholdMinutes?: number;
    zone5AnaerobicMinutes?: number;
  };
  steps?: number;
  distanceMeters?: number;
  caloriesBurned?: number;
  capturedAt: Date;
  sourceType: HealthSourceType;
}

export interface FitnessStrainResult {
  baseStrain: number; // 0 to 100
  recoveryModifier: number; // e.g. 0.85 (good recovery) to 1.25 (poor recovery)
  adjustedStrain: number; // Base Strain * Recovery Modifier
  trainingLoadLabel: "Low" | "Moderate" | "High" | "Very High";
  explanation: string;
  contributingFactors: {
    durationLoad: number;
    intensityMultiplier: number;
    cardiacStrain: number;
    volumeBonus: number;
  };
}

export interface AdaptiveTrainingRecommendation {
  recommendedIntensity: "rest" | "active_recovery" | "low" | "moderate" | "high";
  suggestedDurationMinutes: number;
  recoveryFocus: boolean;
  reason: string;
  confidence: "low" | "moderate" | "high";
  suggestedActivities: string[];
}

// =========================================================================
// 2. NUTRITION & INDIAN FOOD INTELLIGENCE
// =========================================================================
export interface MacroTargets {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  waterMl: number;
}

export interface NutritionIntakeSummary {
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  consumedFiber: number;
  consumedWaterMl: number;
  mealCount: number;
  loggedFoods: Array<{
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isIndianItem?: boolean;
  }>;
}

export interface NutritionVarianceResult {
  calorieVariance: number; // Actual - Target
  proteinVariance: number;
  carbVariance: number;
  fatVariance: number;
  hydrationVariance: number;
  calorieVariancePct: number;
  proteinVariancePct: number;
  hydrationVariancePct: number;
  status: "ON_TRACK" | "DEFICIT" | "SURPLUS";
  practicalAdjustments: string[];
}

// =========================================================================
// 3. SLEEP ARCHITECTURE & READINESS INDEX
// =========================================================================
export type SleepStageType = "AWAKE" | "LIGHT" | "DEEP" | "REM" | "UNKNOWN";

export interface SleepStageInterval {
  stage: SleepStageType;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

export interface SleepSessionRecord {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  totalDurationMinutes: number;
  efficiencyPercent: number; // e.g. 88%
  awakeningsCount: number;
  deepSleepMinutes: number;
  lightSleepMinutes: number;
  remSleepMinutes: number;
  awakeMinutes: number;
  stages?: SleepStageInterval[];
  restingHeartRate?: number;
  hrvRmssd?: number;
  sourceType: HealthSourceType;
}

export interface ReadinessIndexResult {
  score: number; // 0 to 100 normalized
  label: "Optimal Readiness" | "Adequate Readiness" | "Moderate Fatigue" | "High Strain / Rest Needed";
  sleepComponent: number; // 0 to 35
  recoveryComponent: number; // 0 to 30
  activityLoadComponent: number; // 0 to 20
  subjectiveComponent: number; // 0 to 15
  headline: string;
  observations: string[];
  recommendations: string[];
}

// =========================================================================
// 4. PERSONAL BASELINE ENGINE (Rolling Windows & Z-Scores)
// =========================================================================
export type BaselineWindowDays = 7 | 14 | 30 | 60 | 90;

export interface MetricBaselineSummary {
  metric: string;
  windowDays: BaselineWindowDays;
  mean: number;
  stdDev: number;
  currentValue: number;
  absoluteDelta: number;
  percentageDelta: number;
  zScore: number;
  trend: "INCREASING" | "DECREASING" | "STABLE";
  isSignificantDeviation: boolean; // |z| >= 1.75
  dataQuality: DataQualityState;
  sampleCount: number;
}

export interface PersonalBaselineProfile {
  userId: string;
  calculatedAt: Date;
  windows: {
    sevenDay: Record<string, MetricBaselineSummary>;
    thirtyDay: Record<string, MetricBaselineSummary>;
    ninetyDay: Record<string, MetricBaselineSummary>;
  };
  significantDeviations: MetricBaselineSummary[];
}

// =========================================================================
// 5. MEDICATION INTELLIGENCE & SYMPTOM TEMPORAL ASSOCIATION
// =========================================================================
export type MedicationEventType =
  | "SCHEDULED"
  | "TAKEN"
  | "MISSED"
  | "SKIPPED"
  | "SNOOZED"
  | "REFUSED"
  | "UNKNOWN";

export interface MedicationDoseLog {
  id: string;
  userId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: Date;
  actualTime?: Date;
  eventType: MedicationEventType;
  sourceType: HealthSourceType;
  isUserConfirmed: boolean;
  notes?: string;
}

export interface SymptomLogRecord {
  id: string;
  userId: string;
  symptomName: string;
  severity: number; // 1 to 10
  onsetAt: Date;
  durationHours?: number;
  notes?: string;
  sourceType: HealthSourceType;
}

export interface TemporalMedicationSymptomAssociation {
  medicationName: string;
  doseTime: Date;
  symptomName: string;
  symptomOnset: Date;
  proximityMinutes: number; // Time elapsed between dose and symptom
  associationType: "Observed Temporal Proximity" | "Repeated Temporal Association" | "Insufficient Data";
  occurrenceCount: number;
  observationalStatement: string; // "Headache recorded approx. 3 hours after medication event."
  requiresProfessionalReview: boolean;
}

// =========================================================================
// 6. PREDICTIVE RISK SIGNALS & EXPLAINABILITY
// =========================================================================
export interface RiskSignal {
  id: string;
  userId: string;
  type: string;
  severity: "INFO" | "LOW" | "MODERATE" | "HIGH";
  title: string;
  summary: string;
  observedMetrics: string[];
  baselineComparison?: {
    current: number;
    baseline: number;
    unit: string;
    percentageDelta: number;
  };
  confidence: number; // 0.0 to 1.0
  evidence: string[]; // Explicit explainability bullets
  recommendedAction?: string;
  requiresProfessionalReview: boolean;
  generatedAt: Date;
  modelVersion?: string;
}

// =========================================================================
// 7. CROSS-DOMAIN HEALTH CONTEXT & CENTRAL ORCHESTRATION
// =========================================================================
export interface HealthContext {
  userId: string;
  generatedAt: Date;
  profile: {
    age?: number;
    gender?: string;
    goal?: string;
    conditions?: string[];
  };
  fitness: {
    stepsToday: number;
    workoutsThisWeek: number;
    currentStrain: FitnessStrainResult;
    adaptation: AdaptiveTrainingRecommendation;
  };
  nutrition: {
    todayVariance: NutritionVarianceResult;
    calorieIntake: number;
    proteinIntake: number;
  };
  sleep: {
    lastNightHours: number;
    sleepDebtHours: number;
    efficiency: number;
    readiness: ReadinessIndexResult;
  };
  medications: {
    scheduledTodayCount: number;
    adherencePercentLast7Days: number;
    recentAssociations: TemporalMedicationSymptomAssociation[];
  };
  symptoms: {
    recentSymptoms: SymptomLogRecord[];
  };
  vitals: {
    latestSystolicBp?: number;
    latestDiastolicBp?: number;
    latestRestingHr?: number;
    latestSpO2?: number;
    latestWeightKg?: number;
  };
  baselineDeviations: MetricBaselineSummary[];
  riskSignals: RiskSignal[];
  dataQuality: {
    overallState: DataQualityState;
    missingDomains: string[];
  };
}

export interface PersonalizedDailyHealthPlan {
  headline: string;
  readinessIndex: number;
  topWhatMattersToday: string[];
  whatChangedRelativeToBaseline: string[];
  possiblePatterns: string[];
  riskSignals: RiskSignal[];
  personalizedActions: Array<{
    domain: "FITNESS" | "NUTRITION" | "SLEEP" | "MEDICATION" | "RECOVERY";
    title: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "ROUTINE";
  }>;
  doctorDiscussionPrompts: string[];
}

// =========================================================================
// 8. DOCTOR PREFERENCES
// =========================================================================
export interface DoctorPreference {
  doctorId: string;
  patientId: string;
  preferredMetrics: string[];
  monitoredSymptoms: string[];
  monitoredMedications: string[];
  reportingFrequency?: "DAILY" | "WEEKLY" | "MONTHLY" | "ON_ANOMALY";
  alertPreferences?: {
    notifyOnHighBp?: boolean;
    notifyOnMissedDosesConsecutive?: number;
    notifyOnSevereSymptom?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
