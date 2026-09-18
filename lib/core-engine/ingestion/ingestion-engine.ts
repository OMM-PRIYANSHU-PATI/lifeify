import { HealthDataPoint, HealthSourceType } from "../types";
import { normalizeMetricValue } from "./normalizer";
import { createHealthDataPoint } from "../data-sources/provenance";

export interface IngestionPayload {
  userId: string;
  sourceType: HealthSourceType;
  metricType: string;
  value: number | string;
  unit?: string;
  sourceId?: string;
  idempotencyKey?: string;
  capturedAt?: Date | string;
  isUserConfirmed?: boolean;
  metadata?: Record<string, any>;
}

export interface IngestionResult {
  success: boolean;
  isDuplicate: boolean;
  accepted?: boolean;
  dataPoint?: HealthDataPoint;
  error?: string;
}

// In-memory idempotency cache (keyed by idempotencyKey or hash)
const processedEvents = new Map<string, HealthDataPoint>();

export class IngestionEngine {
  /**
   * Ingests a raw health data payload with idempotency, unit normalization, and provenance.
   */
  static async ingest(payload: IngestionPayload): Promise<IngestionResult> {
    if (!payload.userId || !payload.metricType || payload.value === undefined) {
      return { success: false, isDuplicate: false, error: "Missing required fields (userId, metricType, value)" };
    }

    // 1. Idempotency & Deduplication
    const eventKey =
      payload.idempotencyKey ||
      `${payload.userId}_${payload.metricType}_${payload.sourceType}_${new Date(payload.capturedAt || Date.now()).toISOString().slice(0, 16)}`;

    if (processedEvents.has(eventKey)) {
      return {
        success: true,
        isDuplicate: true,
        accepted: false,
        dataPoint: processedEvents.get(eventKey),
      };
    }

    // 2. Unit Normalization
    const { normalizedValue, normalizedUnit } = normalizeMetricValue(
      payload.metricType,
      payload.value,
      payload.unit
    );

    // 3. Provenance & Point Creation
    const capturedAt = payload.capturedAt ? new Date(payload.capturedAt) : new Date();
    const dataPoint = createHealthDataPoint({
      userId: payload.userId,
      sourceType: payload.sourceType,
      sourceId: payload.sourceId,
      metricType: payload.metricType,
      value: normalizedValue,
      unit: normalizedUnit,
      capturedAt,
      isUserConfirmed: payload.isUserConfirmed ?? (payload.sourceType === "MANUAL"),
      isVerified: ["WEARABLE", "APPLE_HEALTH", "HEALTH_CONNECT", "DOCTOR"].includes(payload.sourceType),
      isEstimated: payload.sourceType === "SYSTEM" || payload.sourceType === "OCR",
      metadata: payload.metadata,
    });

    // 4. Record to memory store
    processedEvents.set(eventKey, dataPoint);

    return {
      success: true,
      isDuplicate: false,
      accepted: true,
      dataPoint,
    };
  }

  /**
   * Ingests a pre-constructed HealthDataPoint with idempotency check
   */
  static ingestPoint(point: HealthDataPoint): { accepted: boolean; isDuplicate: boolean; dataPoint: HealthDataPoint } {
    const key = `${point.userId}_${point.metricType}_${new Date(point.capturedAt).getTime()}_${point.value}`;
    if (processedEvents.has(key)) {
      return {
        accepted: false,
        isDuplicate: true,
        dataPoint: processedEvents.get(key)!
      };
    }

    processedEvents.set(key, point);
    return {
      accepted: true,
      isDuplicate: false,
      dataPoint: point
    };
  }

  static getRecentPoints(userId: string, limit = 50): HealthDataPoint[] {
    return Array.from(processedEvents.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime())
      .slice(0, limit);
  }

  static getPointsByMetric(userId: string, metricType: string): HealthDataPoint[] {
    return Array.from(processedEvents.values())
      .filter((p) => p.userId === userId && p.metricType === metricType)
      .sort((a, b) => a.capturedAt.getTime() - b.capturedAt.getTime());
  }

  static clear(): void {
    processedEvents.clear();
  }

  // Instance wrappers
  ingest(payload: IngestionPayload) {
    return IngestionEngine.ingest(payload);
  }

  ingestPoint(point: HealthDataPoint) {
    return IngestionEngine.ingestPoint(point);
  }

  getRecentPoints(userId: string, limit = 50) {
    return IngestionEngine.getRecentPoints(userId, limit);
  }

  getPointsByMetric(userId: string, metricType: string) {
    return IngestionEngine.getPointsByMetric(userId, metricType);
  }

  clear() {
    IngestionEngine.clear();
  }
}

export const ingestionEngine = new IngestionEngine();
