/**
 * LIFIFY Core Health Intelligence Engine — Medication Intelligence Engine
 *
 * Implements:
 * - Dose logging & adherence rate calculation
 * - Temporal medication <-> symptom association detector
 * - Strict non-causal observational language generation
 * - Clinically conservative flagging for doctor/pharmacist review
 */

import {
  MedicationDoseLog,
  SymptomLogRecord,
  TemporalMedicationSymptomAssociation,
  MedicationEventType,
  HealthSourceType
} from "../types";

export interface AdherenceMetrics {
  totalScheduled: number;
  takenOnTime: number;
  missed: number;
  skipped: number;
  adherencePercentage: number; // 0 to 100
  streakDays: number;
}

export class MedicationIntelligenceEngine {
  /**
   * Calculates adherence percentage and status for a series of dose logs
   */
  calculateAdherence(logs: MedicationDoseLog[], windowDays: number = 7): AdherenceMetrics {
    const now = new Date().getTime();
    const windowMs = windowDays * 24 * 60 * 60 * 1000;
    const windowStart = now - windowMs;

    const relevantLogs = logs.filter(
      (log) => new Date(log.scheduledTime).getTime() >= windowStart
    );

    if (relevantLogs.length === 0) {
      return {
        totalScheduled: 0,
        takenOnTime: 0,
        missed: 0,
        skipped: 0,
        adherencePercentage: 100, // Default baseline if no schedule
        streakDays: 0
      };
    }

    let takenCount = 0;
    let missedCount = 0;
    let skippedCount = 0;

    relevantLogs.forEach((log) => {
      if (log.eventType === "TAKEN") {
        takenCount++;
      } else if (log.eventType === "MISSED") {
        missedCount++;
      } else if (log.eventType === "SKIPPED") {
        skippedCount++;
      }
    });

    const totalScheduled = relevantLogs.length;
    const adherencePercentage =
      totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 100;

    // Calculate approximate streak
    let streakDays = 0;
    // Simple chronological streak check
    const sorted = [...relevantLogs].sort(
      (a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
    );
    for (const log of sorted) {
      if (log.eventType === "TAKEN") {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      totalScheduled,
      takenOnTime: takenCount,
      missed: missedCount,
      skipped: skippedCount,
      adherencePercentage,
      streakDays
    };
  }

  /**
   * Identifies temporal associations between medication dose times and symptom onsets.
   *
   * CLINICAL SAFETY NOTE:
   * This detector reports OBSERVATIONAL TEMPORAL PROXIMITY only.
   * It never claims causal etiology ("drug caused symptom").
   * Time window default: 30 minutes to 360 minutes (6 hours) after intake.
   */
  detectTemporalAssociations(
    doses: MedicationDoseLog[],
    symptoms: SymptomLogRecord[],
    maxProximityMinutes: number = 360 // 6 hours
  ): TemporalMedicationSymptomAssociation[] {
    const associations: TemporalMedicationSymptomAssociation[] = [];

    // Filter to taken doses with valid actual or scheduled time
    const takenDoses = doses.filter((d) => d.eventType === "TAKEN");

    // Track repetitions by medication + symptom pair
    const pairCounter = new Map<string, number>();

    takenDoses.forEach((dose) => {
      const doseTime = new Date(dose.actualTime || dose.scheduledTime).getTime();

      symptoms.forEach((symptom) => {
        const symptomOnset = new Date(symptom.onsetAt).getTime();
        const diffMinutes = Math.round((symptomOnset - doseTime) / (1000 * 60));

        // Dose occurred within (0, maxProximityMinutes] before symptom onset
        if (diffMinutes >= 15 && diffMinutes <= maxProximityMinutes) {
          const pairKey = `${dose.medicationName}__${symptom.symptomName}`;
          const currentCount = (pairCounter.get(pairKey) || 0) + 1;
          pairCounter.set(pairKey, currentCount);

          const hours = (diffMinutes / 60).toFixed(1);
          const associationType =
            currentCount >= 2
              ? "Repeated Temporal Association"
              : "Observed Temporal Proximity";

          const observationalStatement =
            currentCount >= 2
              ? `${symptom.symptomName} was recorded approx. ${hours}h following ${dose.medicationName} administration across ${currentCount} separate instances. This represents an observational timing pattern, not confirmed causality.`
              : `${symptom.symptomName} was logged approx. ${hours}h after ${dose.medicationName}. Observational correlation noted for clinical review.`;

          associations.push({
            medicationName: dose.medicationName,
            doseTime: new Date(doseTime),
            symptomName: symptom.symptomName,
            symptomOnset: new Date(symptomOnset),
            proximityMinutes: diffMinutes,
            associationType,
            occurrenceCount: currentCount,
            observationalStatement,
            requiresProfessionalReview: currentCount >= 2 || symptom.severity >= 6
          });
        }
      });
    });

    return associations;
  }

  /**
   * Formats a clinical summary note for doctor visits
   */
  generatePhysicianReviewNote(associations: TemporalMedicationSymptomAssociation[]): string {
    if (associations.length === 0) {
      return "No close temporal associations observed between logged doses and symptoms.";
    }

    const lines = associations.map(
      (a) =>
        `- ${a.medicationName} -> ${a.symptomName} (Onset: +${a.proximityMinutes}m, Instances: ${a.occurrenceCount}) [${a.associationType}]`
    );

    return [
      "LIFIFY Observational Medication-Symptom Temporal Review:",
      ...lines,
      "Note: Non-causal observational record. Discuss potential drug adverse effects or interactions with attending physician or clinical pharmacist."
    ].join("\n");
  }
}

export const medicationEngine = new MedicationIntelligenceEngine();
