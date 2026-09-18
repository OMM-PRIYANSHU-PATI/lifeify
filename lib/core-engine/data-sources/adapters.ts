import { HealthDataPoint, HealthSourceType } from "../types";
import { createHealthDataPoint } from "./provenance";

export interface HealthSourceAdapter {
  sourceType: HealthSourceType;
  adapt(rawPayload: Record<string, any>, userId: string): HealthDataPoint[];
}

export class AppleHealthAdapter implements HealthSourceAdapter {
  sourceType: HealthSourceType = "APPLE_HEALTH";

  adapt(rawPayload: Record<string, any>, userId: string): HealthDataPoint[] {
    const points: HealthDataPoint[] = [];
    const timestamp = rawPayload.startDate ? new Date(rawPayload.startDate) : new Date();

    if (rawPayload.stepCount !== undefined) {
      points.push(
        createHealthDataPoint({
          userId,
          sourceType: this.sourceType,
          metricType: "step_count",
          value: Number(rawPayload.stepCount),
          unit: "count",
          capturedAt: timestamp,
          isVerified: true,
          qualityState: "VERIFIED",
        })
      );
    }

    if (rawPayload.activeEnergyBurned !== undefined) {
      points.push(
        createHealthDataPoint({
          userId,
          sourceType: this.sourceType,
          metricType: "calories_active",
          value: Number(rawPayload.activeEnergyBurned),
          unit: "kcal",
          capturedAt: timestamp,
          isVerified: true,
          qualityState: "VERIFIED",
        })
      );
    }

    if (rawPayload.heartRate !== undefined) {
      points.push(
        createHealthDataPoint({
          userId,
          sourceType: this.sourceType,
          metricType: "heart_rate",
          value: Number(rawPayload.heartRate),
          unit: "bpm",
          capturedAt: timestamp,
          isVerified: true,
          qualityState: "VERIFIED",
        })
      );
    }

    if (rawPayload.sleepDurationHours !== undefined) {
      points.push(
        createHealthDataPoint({
          userId,
          sourceType: this.sourceType,
          metricType: "sleep_duration",
          value: Number(rawPayload.sleepDurationHours),
          unit: "hours",
          capturedAt: timestamp,
          isVerified: true,
          qualityState: "VERIFIED",
        })
      );
    }

    return points;
  }
}

export class HealthConnectAdapter implements HealthSourceAdapter {
  sourceType: HealthSourceType = "HEALTH_CONNECT";

  adapt(rawPayload: Record<string, any>, userId: string): HealthDataPoint[] {
    const points: HealthDataPoint[] = [];
    const timestamp = rawPayload.startTime ? new Date(rawPayload.startTime) : new Date();

    if (rawPayload.steps !== undefined) {
      points.push(
        createHealthDataPoint({
          userId,
          sourceType: this.sourceType,
          metricType: "step_count",
          value: Number(rawPayload.steps),
          unit: "count",
          capturedAt: timestamp,
          isVerified: true,
          qualityState: "VERIFIED",
        })
      );
    }

    if (rawPayload.bloodGlucoseMgDl !== undefined) {
      points.push(
        createHealthDataPoint({
          userId,
          sourceType: this.sourceType,
          metricType: "blood_glucose",
          value: Number(rawPayload.bloodGlucoseMgDl),
          unit: "mg/dL",
          capturedAt: timestamp,
          isVerified: true,
          qualityState: "VERIFIED",
        })
      );
    }

    return points;
  }
}

export class WearableAdapter implements HealthSourceAdapter {
  sourceType: HealthSourceType = "WEARABLE";

  adapt(rawPayload: Record<string, any>, userId: string): HealthDataPoint[] {
    const points: HealthDataPoint[] = [];
    const timestamp = rawPayload.timestamp ? new Date(rawPayload.timestamp) : new Date();

    if (rawPayload.restingHeartRate !== undefined) {
      points.push(
        createHealthDataPoint({
          userId,
          sourceType: this.sourceType,
          metricType: "resting_heart_rate",
          value: Number(rawPayload.restingHeartRate),
          unit: "bpm",
          capturedAt: timestamp,
          isVerified: true,
          qualityState: "VERIFIED",
        })
      );
    }

    if (rawPayload.hrvRmssd !== undefined) {
      points.push(
        createHealthDataPoint({
          userId,
          sourceType: this.sourceType,
          metricType: "hrv_rmssd",
          value: Number(rawPayload.hrvRmssd),
          unit: "ms",
          capturedAt: timestamp,
          isVerified: true,
          qualityState: "VERIFIED",
        })
      );
    }

    if (rawPayload.spO2 !== undefined) {
      points.push(
        createHealthDataPoint({
          userId,
          sourceType: this.sourceType,
          metricType: "spo2",
          value: Number(rawPayload.spO2),
          unit: "%",
          capturedAt: timestamp,
          isVerified: true,
          qualityState: "VERIFIED",
        })
      );
    }

    return points;
  }
}

export class ManualInputAdapter implements HealthSourceAdapter {
  sourceType: HealthSourceType = "MANUAL";

  adapt(rawPayload: Record<string, any>, userId: string): HealthDataPoint[] {
    return [
      createHealthDataPoint({
        userId,
        sourceType: this.sourceType,
        metricType: rawPayload.metricType || "general_log",
        value: rawPayload.value,
        unit: rawPayload.unit,
        capturedAt: rawPayload.capturedAt ? new Date(rawPayload.capturedAt) : new Date(),
        isUserConfirmed: true,
        qualityState: "USER_REPORTED",
        metadata: rawPayload.metadata,
      }),
    ];
  }
}

export class DoctorInputAdapter implements HealthSourceAdapter {
  sourceType: HealthSourceType = "DOCTOR";

  adapt(rawPayload: Record<string, any>, userId: string): HealthDataPoint[] {
    return [
      createHealthDataPoint({
        userId,
        sourceType: this.sourceType,
        metricType: rawPayload.metricType,
        value: rawPayload.value,
        unit: rawPayload.unit,
        capturedAt: rawPayload.capturedAt ? new Date(rawPayload.capturedAt) : new Date(),
        isVerified: true,
        qualityState: "VERIFIED",
        confidence: 0.99,
        metadata: {
          doctorId: rawPayload.doctorId,
          clinicalContext: rawPayload.clinicalContext,
        },
      }),
    ];
  }
}
