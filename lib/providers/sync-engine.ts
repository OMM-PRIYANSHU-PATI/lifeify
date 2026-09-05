import { prisma } from "@/lib/prisma";
import { CanonicalMetric, SyncResult } from "./types";

export async function ingestCanonicalMetrics(metrics: CanonicalMetric[]): Promise<SyncResult> {
  let synced = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const m of metrics) {
    try {
      const existing = await prisma.healthMetric.findUnique({
        where: {
          userId_type_source_sourceId: {
            userId: m.userId,
            type: m.type,
            source: m.source,
            sourceId: m.sourceId,
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.healthMetric.create({
        data: {
          userId: m.userId,
          type: m.type,
          value: m.value,
          unit: m.unit,
          startTime: m.startTime,
          endTime: m.endTime ?? null,
          source: m.source,
          sourceId: m.sourceId,
          metadata: m.metadata ? JSON.stringify(m.metadata) : null,
        },
      });
      synced++;
    } catch (err) {
      errors.push(`Failed to ingest metric ${m.type} (${m.sourceId}): ${(err as Error).message}`);
    }
  }

  return {
    success: errors.length === 0,
    recordsSynced: synced,
    duplicatesSkipped: skipped,
    errors,
  };
}

/**
 * Reconciles metrics for a user: manual entries supersede wearable entries within a 24-hour window.
 */
export async function getReconciledMetrics(
  userId: string,
  type: string,
  startDate: Date,
  endDate: Date = new Date()
) {
  const allMetrics = await prisma.healthMetric.findMany({
    where: {
      userId,
      type,
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { startTime: "asc" },
  });

  // Also fetch manual HealthLog entries
  const manualLogs = await prisma.healthLog.findMany({
    where: {
      userId,
      type,
      startTime: {
        gte: startDate,
        lte: endDate,
      },
      source: "manual",
    },
    orderBy: { startTime: "asc" },
  });

  // Group by day YYYY-MM-DD
  const daysMap = new Map<string, { value: number; unit: string; source: string; time: Date }>();

  for (const m of allMetrics) {
    const dayKey = m.startTime.toISOString().slice(0, 10);
    daysMap.set(dayKey, {
      value: m.value,
      unit: m.unit,
      source: m.source,
      time: m.startTime,
    });
  }

  // Manual logs override wearable logs for that day
  for (const ml of manualLogs) {
    const dayKey = ml.startTime.toISOString().slice(0, 10);
    daysMap.set(dayKey, {
      value: ml.value,
      unit: ml.unit ?? "",
      source: "manual",
      time: ml.startTime,
    });
  }

  return Array.from(daysMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
