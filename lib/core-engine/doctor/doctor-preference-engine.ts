/**
 * LIFIFY Core Health Intelligence Engine — Doctor Preference Engine
 *
 * Implements Section 8 & Clinical Review:
 * - Patient-specific doctor preferences (preferred metrics, monitored symptoms, threshold alerts)
 * - Structured clinical review summary matching clinician time constraints
 */

import { DoctorPreference, HealthContext } from "../types";

export class DoctorPreferenceEngine {
  private preferences: Map<string, DoctorPreference> = new Map();

  /**
   * Saves or updates a doctor's preference configuration for a patient
   */
  setPreference(preference: DoctorPreference): void {
    const key = `${preference.doctorId}_${preference.patientId}`;
    this.preferences.set(key, preference);
  }

  /**
   * Retrieves preferences for a doctor and patient
   */
  getPreference(doctorId: string, patientId: string): DoctorPreference | null {
    const key = `${doctorId}_${patientId}`;
    return this.preferences.get(key) || null;
  }

  /**
   * Formats a clinical consultation report tailored to the doctor's configured focus areas
   */
  generateClinicalConsultReport(
    context: HealthContext,
    preference?: DoctorPreference
  ): {
    header: string;
    keyObservations: string[];
    medicationAndSymptomCorrelations: string[];
    monitoredVitals: Record<string, any>;
    flaggedAnomalies: string[];
    recommendationsForReview: string[];
  } {
    const metricsToInclude = preference?.preferredMetrics || [
      "bloodPressure",
      "restingHeartRate",
      "sleepDuration",
      "medicationAdherence"
    ];

    const monitoredVitals: Record<string, any> = {};
    if (metricsToInclude.includes("bloodPressure") && context.vitals.latestSystolicBp) {
      monitoredVitals.bloodPressure = `${context.vitals.latestSystolicBp}/${context.vitals.latestDiastolicBp || 80} mmHg`;
    }
    if (metricsToInclude.includes("restingHeartRate") && context.vitals.latestRestingHr) {
      monitoredVitals.restingHeartRate = `${context.vitals.latestRestingHr} bpm`;
    }
    if (metricsToInclude.includes("sleepDuration")) {
      monitoredVitals.averageSleep = `${context.sleep.lastNightHours}h (Debt: ${context.sleep.sleepDebtHours.toFixed(1)}h)`;
    }
    if (metricsToInclude.includes("medicationAdherence")) {
      monitoredVitals.medicationAdherence7d = `${context.medications.adherencePercentLast7Days}%`;
    }

    const medicationCorrelations = context.medications.recentAssociations.map(
      (assoc) => assoc.observationalStatement
    );

    const flaggedAnomalies = context.baselineDeviations.map(
      (dev) => `${dev.metric}: ${dev.percentageDelta > 0 ? "+" : ""}${dev.percentageDelta}% vs ${dev.windowDays}d baseline (z=${dev.zScore.toFixed(2)})`
    );

    const recommendationsForReview = [
      "Confirm current medication tolerability given temporal symptom logs.",
      "Review home blood pressure log consistency.",
      "Evaluate autonomic recovery and sleep debt amortization."
    ];

    return {
      header: `LIFIFY Clinical Summary Dossier — Patient: ${context.userId}`,
      keyObservations: [
        `Overall Data Quality: ${context.dataQuality.overallState}`,
        `Current Readiness Index: ${context.sleep.readiness.score}/100`,
        `Recent Training Load Estimate: ${context.fitness.currentStrain.adjustedStrain.toFixed(0)}`
      ],
      medicationAndSymptomCorrelations: medicationCorrelations,
      monitoredVitals,
      flaggedAnomalies,
      recommendationsForReview
    };
  }
}

export const doctorPreferenceEngine = new DoctorPreferenceEngine();
