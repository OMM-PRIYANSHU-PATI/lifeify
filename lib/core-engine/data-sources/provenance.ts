import { HealthDataPoint, HealthSourceType, DataQualityState } from "../types";

export function createHealthDataPoint(params: {
  userId: string;
  sourceType: HealthSourceType;
  metricType: string;
  value: number | string;
  unit?: string;
  sourceId?: string;
  capturedAt?: Date;
  confidence?: number;
  qualityState?: DataQualityState;
  isUserConfirmed?: boolean;
  isVerified?: boolean;
  isEstimated?: boolean;
  metadata?: Record<string, any>;
}): HealthDataPoint {
  const now = new Date();
    const isVerified = params.isVerified ?? (params.sourceType === "APPLE_HEALTH" || params.sourceType === "HEALTH_CONNECT" || params.sourceType === "WEARABLE" || params.sourceType === "DOCTOR");
    const isEstimated = params.isEstimated ?? (params.sourceType === "SYSTEM" || params.sourceType === "OCR");
    const isUserConfirmed = params.isUserConfirmed ?? (params.sourceType === "MANUAL");

    return {
      id: `hdp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: params.userId,
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      metricType: params.metricType,
      value: params.value,
      unit: params.unit,
      capturedAt: params.capturedAt || now,
      createdAt: now,
      updatedAt: now,
      confidence: params.confidence ?? (isVerified ? 0.95 : 0.85),
      qualityState:
        params.qualityState ||
        (isVerified
          ? "VERIFIED"
          : isEstimated
          ? "ESTIMATED"
          : isUserConfirmed
          ? "USER_REPORTED"
          : "UNVERIFIED"),
      isUserConfirmed,
      isVerified,
      isEstimated,
      metadata: params.metadata,
    };
  }

export const createProvenancePoint = createHealthDataPoint;
