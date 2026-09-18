/**
 * LIFIFY Core Health Intelligence Engine — 90-Day Synthetic Longitudinal Generator
 *
 * Implements Sections 52–54 test scenario:
 * - Days 1–45: Stable baseline (Sleep 7.5-8.2h, RHR 62-66 bpm, Steps 7.5k-9k, normal recovery)
 * - Days 46–60: Sleep disruption phase (Sleep drops to ~5.5h, sleep debt builds)
 * - Days 61–75: Activity rise (Workouts increase, strain vs readiness mismatch)
 * - Days 76–90: Accumulated fatigue & hydration deficit (RHR drifts to 78+ bpm, z >= 1.75)
 * - Days 85 & 87: Medication A taken -> Headache logged ~2.5h later (Temporal association pattern)
 */

import {
  HealthDataPoint,
  WorkoutRecord,
  SleepSessionRecord,
  MedicationDoseLog,
  SymptomLogRecord
} from "../types";

export interface LongitudinalScenarioResult {
  userId: string;
  startDate: Date;
  endDate: Date;
  dataPoints: HealthDataPoint[];
  workouts: WorkoutRecord[];
  sleepSessions: SleepSessionRecord[];
  medicationLogs: MedicationDoseLog[];
  symptomLogs: SymptomLogRecord[];
}

export class LongitudinalDemoGenerator {
  generate90DayScenario(userId: string = "demo_patient_001"): LongitudinalScenarioResult {
    const dataPoints: HealthDataPoint[] = [];
    const workouts: WorkoutRecord[] = [];
    const sleepSessions: SleepSessionRecord[] = [];
    const medicationLogs: MedicationDoseLog[] = [];
    const symptomLogs: SymptomLogRecord[] = [];

    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;

    for (let day = 90; day >= 1; day--) {
      const dayDate = new Date(now.getTime() - day * msPerDay);
      const dayNumber = 91 - day; // 1 to 90

      // 1. Phase-based parameter determination
      let sleepHours: number;
      let rhr: number;
      let steps: number;
      let hydrationMl: number;
      let workoutIntensity: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" = "MODERATE";
      let workoutDuration = 35;
      let hasWorkout = dayNumber % 2 === 0;

      if (dayNumber <= 45) {
        // Phase 1: Stable Baseline (Days 1-45)
        sleepHours = 7.6 + (Math.sin(dayNumber) * 0.4);
        rhr = 64 + Math.round(Math.cos(dayNumber) * 2);
        steps = 8200 + Math.round(Math.sin(dayNumber) * 800);
        hydrationMl = 2400 + Math.round(Math.cos(dayNumber) * 200);
        workoutIntensity = "MODERATE";
        workoutDuration = 35;
      } else if (dayNumber <= 60) {
        // Phase 2: Sleep Disruption (Days 46-60)
        sleepHours = 5.4 + (Math.sin(dayNumber) * 0.3);
        rhr = 68 + Math.round(Math.sin(dayNumber) * 2);
        steps = 7500 + Math.round(Math.cos(dayNumber) * 500);
        hydrationMl = 2200;
        workoutIntensity = "MODERATE";
        workoutDuration = 30;
      } else if (dayNumber <= 75) {
        // Phase 3: Activity Rise / Strain Mismatch (Days 61-75)
        sleepHours = 5.5 + (Math.cos(dayNumber) * 0.3);
        rhr = 72 + Math.round(Math.sin(dayNumber) * 2);
        steps = 11500 + Math.round(Math.sin(dayNumber) * 1000);
        hydrationMl = 2100;
        hasWorkout = true; // Daily workouts despite low sleep
        workoutIntensity = "HIGH";
        workoutDuration = 55;
      } else {
        // Phase 4: Autonomic Strain & Hydration Drop (Days 76-90)
        sleepHours = 5.2 + (Math.sin(dayNumber) * 0.4);
        rhr = 78 + Math.round(Math.sin(dayNumber) * 3); // z-score anomaly
        steps = 9000;
        hydrationMl = 1600; // Deficit
        workoutIntensity = "HIGH";
        workoutDuration = 45;
      }

      // 2. Sleep Session Record
      const sleepStart = new Date(dayDate.getTime() - 8 * 60 * 60 * 1000);
      const sleepDurationMinutes = Math.round(sleepHours * 60);
      const deepRatio = dayNumber > 60 ? 0.12 : 0.20;
      const remRatio = dayNumber > 60 ? 0.18 : 0.24;

      sleepSessions.push({
        id: `sleep_d${dayNumber}`,
        userId,
        startTime: sleepStart,
        endTime: dayDate,
        totalDurationMinutes: sleepDurationMinutes,
        efficiencyPercent: dayNumber > 60 ? 82 : 91,
        awakeningsCount: dayNumber > 60 ? 4 : 1,
        deepSleepMinutes: Math.round(sleepDurationMinutes * deepRatio),
        lightSleepMinutes: Math.round(sleepDurationMinutes * 0.55),
        remSleepMinutes: Math.round(sleepDurationMinutes * remRatio),
        awakeMinutes: Math.round(sleepDurationMinutes * 0.08),
        restingHeartRate: rhr,
        hrvRmssd: dayNumber > 60 ? 32 : 55,
        sourceType: "APPLE_HEALTH"
      });

      // 3. Resting Heart Rate HealthDataPoint
      dataPoints.push({
        id: `dp_rhr_${dayNumber}`,
        userId,
        sourceType: "APPLE_HEALTH",
        metricType: "resting_heart_rate",
        value: rhr,
        unit: "bpm",
        capturedAt: dayDate,
        createdAt: dayDate,
        updatedAt: dayDate,
        qualityState: "VERIFIED",
        isUserConfirmed: true,
        isVerified: true,
        isEstimated: false
      });

      // 4. Daily Steps HealthDataPoint
      dataPoints.push({
        id: `dp_steps_${dayNumber}`,
        userId,
        sourceType: "APPLE_HEALTH",
        metricType: "steps",
        value: steps,
        unit: "count",
        capturedAt: dayDate,
        createdAt: dayDate,
        updatedAt: dayDate,
        qualityState: "VERIFIED",
        isUserConfirmed: true,
        isVerified: true,
        isEstimated: false
      });

      // 5. Workout Records
      if (hasWorkout) {
        workouts.push({
          id: `workout_d${dayNumber}`,
          userId,
          workoutType: dayNumber > 60 ? "CrossFit / HIIT" : "Cardio Run",
          durationMinutes: workoutDuration,
          intensity: workoutIntensity,
          averageHeartRate: dayNumber > 60 ? 155 : 138,
          maxHeartRate: dayNumber > 60 ? 178 : 158,
          steps: Math.round(workoutDuration * 110),
          caloriesBurned: workoutDuration * 9,
          capturedAt: dayDate,
          sourceType: "WEARABLE"
        });
      }

      // 6. Medication Dose Logs (Scheduled every morning at 08:30 AM)
      const doseTime = new Date(dayDate.getTime() + 8.5 * 60 * 60 * 1000);
      const isTaken = dayNumber !== 78 && dayNumber !== 82; // 2 misses in phase 4

      medicationLogs.push({
        id: `med_d${dayNumber}`,
        userId,
        medicationId: "med_lisinopril_10",
        medicationName: "Lisinopril 10mg",
        dosage: "10mg daily",
        scheduledTime: doseTime,
        actualTime: isTaken ? doseTime : undefined,
        eventType: isTaken ? "TAKEN" : "MISSED",
        sourceType: "MANUAL",
        isUserConfirmed: true
      });

      // 7. Days 85 & 87: Symptom Temporal Association Event
      // Dose at 08:30 AM -> Headache logged at 11:15 AM (approx 2h 45m latency)
      if (dayNumber === 85 || dayNumber === 87) {
        const headacheOnset = new Date(doseTime.getTime() + 165 * 60 * 1000); // +2h 45m
        symptomLogs.push({
          id: `sym_headache_d${dayNumber}`,
          userId,
          symptomName: "Frontal Throbbing Headache",
          severity: 6,
          onsetAt: headacheOnset,
          durationHours: 3,
          notes: "Mild nausea and frontal pressure reported ~2.5 hours post-morning routine.",
          sourceType: "MANUAL"
        });
      }
    }

    return {
      userId,
      startDate: new Date(now.getTime() - 90 * msPerDay),
      endDate: now,
      dataPoints,
      workouts,
      sleepSessions,
      medicationLogs,
      symptomLogs
    };
  }
}

export const demoGenerator = new LongitudinalDemoGenerator();
