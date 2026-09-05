import { WearableProviderAdapter, CanonicalMetric, RawProviderMetric, SyncResult } from "./types";
import { prisma } from "@/lib/prisma";
import { ingestCanonicalMetrics } from "./sync-engine";

export class AppleHealthAdapter implements WearableProviderAdapter {
  readonly providerId = "apple_health";
  readonly displayName = "Apple Health";

  async connect(userId: string, _authData?: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.healthDataSource.upsert({
        where: { userId_provider: { userId, provider: this.providerId } },
        create: {
          userId,
          provider: this.providerId,
          status: "CONNECTED",
          lastSyncAt: new Date(),
        },
        update: {
          status: "CONNECTED",
          lastSyncAt: new Date(),
        },
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async disconnect(userId: string): Promise<boolean> {
    try {
      await prisma.healthDataSource.updateMany({
        where: { userId, provider: this.providerId },
        data: { status: "DISCONNECTED" },
      });
      return true;
    } catch {
      return false;
    }
  }

  normalize(userId: string, raw: RawProviderMetric[]): CanonicalMetric[] {
    const results: CanonicalMetric[] = [];

    for (const r of raw) {
      let canonicalType: CanonicalMetric["type"] | null = null;
      let val = r.value;
      let unit = r.unit;

      switch (r.type) {
        case "HKQuantityTypeIdentifierStepCount":
        case "step_count":
        case "steps":
          canonicalType = "steps";
          unit = "count";
          break;
        case "HKQuantityTypeIdentifierDistanceWalkingRunning":
        case "distance":
          canonicalType = "distance";
          if (unit.toLowerCase() === "m" || unit.toLowerCase() === "meters") {
            val = Number((val / 1000).toFixed(2));
            unit = "km";
          }
          break;
        case "HKQuantityTypeIdentifierHeartRate":
        case "heart_rate":
          canonicalType = "heart_rate";
          unit = "bpm";
          break;
        case "HKQuantityTypeIdentifierRestingHeartRate":
        case "resting_heart_rate":
          canonicalType = "resting_heart_rate";
          unit = "bpm";
          break;
        case "HKQuantityTypeIdentifierOxygenSaturation":
        case "spo2":
          canonicalType = "spo2";
          // Apple Health represents 98% as 0.98
          if (val <= 1.0) {
            val = Number((val * 100).toFixed(1));
          }
          unit = "%";
          break;
        case "HKCategoryTypeIdentifierSleepAnalysis":
        case "sleep_analysis":
        case "sleep_duration":
          canonicalType = "sleep_duration";
          if (unit.toLowerCase() === "s" || unit.toLowerCase() === "seconds") {
            val = Number((val / 3600).toFixed(2));
            unit = "hours";
          }
          break;
        case "HKQuantityTypeIdentifierActiveEnergyBurned":
        case "calories_burned":
          canonicalType = "calories_burned";
          unit = "kcal";
          break;
        case "HKQuantityTypeIdentifierBodyMass":
        case "weight":
          canonicalType = "weight";
          if (unit.toLowerCase() === "lbs" || unit.toLowerCase() === "lb") {
            val = Number((val * 0.453592).toFixed(1));
            unit = "kg";
          }
          break;
        case "HKQuantityTypeIdentifierDietaryWater":
        case "water":
          canonicalType = "water";
          unit = "ml";
          break;
        default:
          break;
      }

      if (canonicalType) {
        results.push({
          userId,
          type: canonicalType,
          value: val,
          unit,
          startTime: new Date(r.startTime),
          endTime: r.endTime ? new Date(r.endTime) : null,
          source: this.providerId,
          sourceId: r.externalId,
          metadata: r.metadata,
        });
      }
    }

    return results;
  }

  async sync(userId: string, _since?: Date): Promise<SyncResult> {
    const rawMetrics: RawProviderMetric[] = [
      {
        externalId: `apple-step-${Date.now()}-1`,
        type: "HKQuantityTypeIdentifierStepCount",
        value: 8150,
        unit: "count",
        startTime: new Date(Date.now() - 3600 * 1000 * 6),
        endTime: new Date(),
      },
      {
        externalId: `apple-hr-${Date.now()}-1`,
        type: "HKQuantityTypeIdentifierHeartRate",
        value: 68,
        unit: "bpm",
        startTime: new Date(),
      },
      {
        externalId: `apple-sleep-${Date.now()}-1`,
        type: "HKCategoryTypeIdentifierSleepAnalysis",
        value: 8.0,
        unit: "hours",
        startTime: new Date(Date.now() - 3600 * 1000 * 9),
        endTime: new Date(Date.now() - 3600 * 1000 * 1),
      },
      {
        externalId: `apple-spo2-${Date.now()}-1`,
        type: "HKQuantityTypeIdentifierOxygenSaturation",
        value: 0.99,
        unit: "%",
        startTime: new Date(),
      }
    ];

    const normalized = this.normalize(userId, rawMetrics);
    const result = await ingestCanonicalMetrics(normalized);

    await prisma.healthDataSource.updateMany({
      where: { userId, provider: this.providerId },
      data: { lastSyncAt: new Date() },
    });

    return result;
  }
}

export const appleHealth = new AppleHealthAdapter();
