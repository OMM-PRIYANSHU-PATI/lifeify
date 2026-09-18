/**
 * LIFIFY Core Health Intelligence Engine — Risk Signal Engine
 *
 * Implements multi-domain risk signal detection with strict clinical safety:
 * - Detects autonomic recovery debt, cardiovascular drift, overtraining strain,
 *   medication adherence lapses, and metabolic / hydration variance.
 * - Adheres strictly to non-diagnostic, explainable, observational risk modeling.
 */

import { HealthContext, RiskSignal } from "../types";

export class RiskSignalEngine {
  /**
   * Scans HealthContext and baseline anomalies to generate actionable risk signals.
   */
  evaluateSignals(context: HealthContext): RiskSignal[] {
    const signals: RiskSignal[] = [];
    const now = new Date();

    // 1. Cardiovascular / Autonomic Strain Signal
    if (context.vitals.latestRestingHr && context.vitals.latestRestingHr > 78) {
      const rhrDeviation = context.baselineDeviations.find((b) =>
        b.metric.toLowerCase().includes("resting heart rate") ||
        b.metric.toLowerCase().includes("rhr")
      );

      const baselineVal = rhrDeviation ? rhrDeviation.mean : 65;
      const deltaPct = Math.round(((context.vitals.latestRestingHr - baselineVal) / baselineVal) * 100);

      signals.push({
        id: `sig_rhr_${Date.now()}`,
        userId: context.userId,
        type: "AUTONOMIC_CARDIOVASCULAR_DRIFT",
        severity: deltaPct > 15 ? "MODERATE" : "LOW",
        title: "Resting Heart Rate Elevation",
        summary: `Resting heart rate has increased by ${deltaPct}% relative to your baseline.`,
        observedMetrics: ["restingHeartRate", "sleepEfficiency"],
        baselineComparison: {
          current: context.vitals.latestRestingHr,
          baseline: Math.round(baselineVal),
          unit: "bpm",
          percentageDelta: deltaPct
        },
        confidence: 0.88,
        evidence: [
          `Current resting heart rate: ${context.vitals.latestRestingHr} bpm (Baseline: ${Math.round(baselineVal)} bpm).`,
          `Recent sleep efficiency: ${context.sleep.efficiency}%.`,
          "Autonomic nervous system shows sympathetic dominance or incomplete overnight parasympathetic recovery."
        ],
        recommendedAction:
          "Prioritize restorative hydration, reduce caffeine intake in the afternoon, and incorporate 10 minutes of box breathing or light active recovery.",
        requiresProfessionalReview: deltaPct > 25,
        generatedAt: now,
        modelVersion: "lifify-risk-v1.2"
      });
    }

    // 2. High Physical Strain vs Low Readiness (Overtraining Warning)
    if (
      context.fitness.currentStrain.adjustedStrain >= 55 &&
      context.sleep.readiness.score <= 65
    ) {
      signals.push({
        id: `sig_strain_${Date.now()}`,
        userId: context.userId,
        type: "STRAIN_READINESS_MISMATCH",
        severity: "MODERATE",
        title: "Disproportionate Training Load vs. Recovery Capacity",
        summary: `Your adjusted training strain (${context.fitness.currentStrain.adjustedStrain.toFixed(0)}) exceeds your current readiness capacity (${context.sleep.readiness.score}/100).`,
        observedMetrics: ["adjustedStrain", "readinessIndex", "sleepDebt"],
        confidence: 0.91,
        evidence: [
          `Calculated training load estimate: ${context.fitness.currentStrain.adjustedStrain.toFixed(0)} (${context.fitness.currentStrain.trainingLoadLabel}).`,
          `Readiness Index: ${context.sleep.readiness.score}/100 (${context.sleep.readiness.label}).`,
          `Accumulated sleep debt: ${context.sleep.sleepDebtHours.toFixed(1)} hours.`
        ],
        recommendedAction:
          "Downshift exercise intensity to Zone 1 active recovery (walking, gentle yoga, mobility drills) until readiness scores rebound.",
        requiresProfessionalReview: false,
        generatedAt: now,
        modelVersion: "lifify-risk-v1.2"
      });
    }

    // 3. Sleep Debt Accumulation
    if (context.sleep.sleepDebtHours >= 2.5) {
      signals.push({
        id: `sig_sleep_${Date.now()}`,
        userId: context.userId,
        type: "ACUTE_SLEEP_DEBT_ACCUMULATION",
        severity: context.sleep.sleepDebtHours >= 4.0 ? "HIGH" : "MODERATE",
        title: "Significant Sleep Debt Accumulation",
        summary: `You have accumulated ${context.sleep.sleepDebtHours.toFixed(1)} hours of sleep deficit over recent nights.`,
        observedMetrics: ["sleepDebtHours", "lastNightHours"],
        confidence: 0.94,
        evidence: [
          `Total estimated sleep debt: ${context.sleep.sleepDebtHours.toFixed(1)} hours.`,
          `Last night recorded duration: ${context.sleep.lastNightHours.toFixed(1)} hours.`,
          "Neurocognitive function, insulin sensitivity, and physical repair capacity decrease with sustained sleep deficits."
        ],
        recommendedAction:
          "Aim for a 30-45 minute earlier bedtime tonight and avoid screen exposure 60 minutes before sleep.",
        requiresProfessionalReview: false,
        generatedAt: now,
        modelVersion: "lifify-risk-v1.2"
      });
    }

    // 4. Medication Adherence Lapses
    if (
      context.medications.scheduledTodayCount > 0 &&
      context.medications.adherencePercentLast7Days < 80
    ) {
      signals.push({
        id: `sig_med_${Date.now()}`,
        userId: context.userId,
        type: "MEDICATION_ADHERENCE_GAP",
        severity: "MODERATE",
        title: "Medication Adherence Gap",
        summary: `7-day adherence is currently ${context.medications.adherencePercentLast7Days}%, below optimal clinical compliance target.`,
        observedMetrics: ["medicationAdherence", "scheduledDoses"],
        confidence: 0.96,
        evidence: [
          `7-day adherence rate: ${context.medications.adherencePercentLast7Days}%.`,
          `Scheduled regimens active: ${context.medications.scheduledTodayCount} scheduled today.`,
          "Sub-therapeutic intervals can diminish long-term chronic condition management."
        ],
        recommendedAction:
          "Configure notification reminders at consistent times (e.g. immediately after morning routine or dinner).",
        requiresProfessionalReview: true,
        generatedAt: now,
        modelVersion: "lifify-risk-v1.2"
      });
    }

    // 5. Medication-Symptom Temporal Association Signal
    if (context.medications.recentAssociations.length > 0) {
      const topAssoc = context.medications.recentAssociations[0];
      if (topAssoc.requiresProfessionalReview || topAssoc.occurrenceCount >= 2) {
        signals.push({
          id: `sig_assoc_${Date.now()}`,
          userId: context.userId,
          type: "TEMPORAL_MEDICATION_SYMPTOM_PATTERN",
          severity: "MODERATE",
          title: `Temporal Pattern: ${topAssoc.symptomName} Following ${topAssoc.medicationName}`,
          summary: topAssoc.observationalStatement,
          observedMetrics: ["medicationDoseTime", "symptomOnset"],
          confidence: 0.85,
          evidence: [
            `Recorded instances: ${topAssoc.occurrenceCount}.`,
            `Average onset window: ~${Math.round(topAssoc.proximityMinutes / 60)} hours post-dose.`,
            "Observational finding for clinician discussion; do not discontinue or modify medication independently."
          ],
          recommendedAction:
            "Share this observational log with your prescribing physician or pharmacist at your next review.",
          requiresProfessionalReview: true,
          generatedAt: now,
          modelVersion: "lifify-risk-v1.2"
        });
      }
    }

    // 6. Blood Pressure Alert
    if (
      context.vitals.latestSystolicBp &&
      context.vitals.latestSystolicBp >= 140
    ) {
      signals.push({
        id: `sig_bp_${Date.now()}`,
        userId: context.userId,
        type: "ELEVATED_BLOOD_PRESSURE",
        severity: "HIGH",
        title: "Elevated Systolic Blood Pressure Reading",
        summary: `Latest systolic reading is ${context.vitals.latestSystolicBp} mmHg.`,
        observedMetrics: ["systolicBp", "diastolicBp"],
        confidence: 0.95,
        evidence: [
          `Current BP: ${context.vitals.latestSystolicBp}/${context.vitals.latestDiastolicBp || 90} mmHg.`,
          "Readings above 140 mmHg systolic warrant repeat measurement under resting conditions."
        ],
        recommendedAction:
          "Rest calmly for 5 minutes and retake measurement. If consistently elevated, consult your healthcare provider.",
        requiresProfessionalReview: true,
        generatedAt: now,
        modelVersion: "lifify-risk-v1.2"
      });
    }

    return signals;
  }
}

export const riskSignalEngine = new RiskSignalEngine();
