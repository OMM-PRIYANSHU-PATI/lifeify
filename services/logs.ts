import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfDay, addDays } from "@/lib/utils";
import type { LogType } from "@/lib/types";

export type TodaySummary = {
  steps: number;
  waterMl: number;
  sleepHours: number | null;
  mood: number | null;
  recoveryScore: number | null;
  weightKg: number | null;
  calories: number;
  lastLogAt: Date | null;
};

export async function getTodaySummary(userId: string): Promise<TodaySummary> {
  const start = startOfDay(new Date());
  const end = addDays(start, 1);

  const logs = await prisma.healthLog.findMany({
    where: { userId, loggedAt: { gte: start, lt: end } },
    orderBy: { loggedAt: "asc" },
  });

  const summary: TodaySummary = {
    steps: 0,
    waterMl: 0,
    sleepHours: null,
    mood: null,
    recoveryScore: null,
    weightKg: null,
    calories: 0,
    lastLogAt: null,
  };
  for (const log of logs) {
    summary.lastLogAt = log.loggedAt;
    const kind = (log.logType ?? log.type ?? "").toUpperCase();
    switch (kind) {
      case "STEPS":
        summary.steps += log.value;
        break;
      case "WATER":
        summary.waterMl += log.value;
        break;
      case "SLEEP":
        summary.sleepHours = log.value;
        break;
      case "MOOD":
        summary.mood = log.value;
        break;
      case "RECOVERY":
        summary.recoveryScore = log.value;
        break;
      case "WEIGHT":
        summary.weightKg = log.value;
        break;
      case "FOOD":
        summary.calories += log.value;
        break;
      default:
        break;
    }
  }
  return summary;
}

export async function getLogSeries(userId: string, logType: LogType | LogType[], days: number): Promise<Array<{ date: string; value: number }>> {
  const types = Array.isArray(logType) ? logType : [logType];
  const start = addDays(startOfDay(new Date()), -(days - 1));
  const logs = await prisma.healthLog.findMany({
    where: { userId, logType: { in: types }, loggedAt: { gte: start } },
    orderBy: { loggedAt: "asc" },
  });

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    byDay.set(start.toISOString().slice(0, 10), 0);
    start.setDate(start.getDate() + 1);
  }
  for (const log of logs) {
    const logDate = log.loggedAt ?? log.startTime;
    const key = logDate.toISOString().slice(0, 10);
    if (byDay.has(key)) {
      byDay.set(key, (byDay.get(key) ?? 0) + log.value);
    }
  }
  return [...byDay.entries()].map(([date, value]) => ({ date, value }));
}

export async function getStreak(userId: string): Promise<number> {
  const checkIns = await prisma.dailyCheckIn.findMany({
    where: { userId, completed: true },
    orderBy: { date: "desc" },
    take: 400,
  });
  if (checkIns.length === 0) return 0;
  const daySet = new Set(checkIns.map((c) => c.date.toISOString().slice(0, 10)));
  let streak = 0;
  let cursor = startOfDay(new Date());
  // Allow today to be missing without breaking yesterday's streak
  if (!daySet.has(cursor.toISOString().slice(0, 10))) cursor = addDays(cursor, -1);
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// Latest weight from either health logs or vitals (vitals win).
export async function getLatestWeight(userId: string): Promise<{ kg: number; at: Date } | null> {
  const vital = await prisma.vitalReading.findFirst({
    where: { userId, type: "WEIGHT" },
    orderBy: { measuredAt: "desc" },
  });
  if (vital?.value) return { kg: vital.value, at: vital.measuredAt ?? vital.takenAt };
  const log = await prisma.healthLog.findFirst({
    where: { userId, logType: "WEIGHT" },
    orderBy: { loggedAt: "desc" },
  });
  if (log) return { kg: log.value, at: log.loggedAt ?? log.startTime };
  return null;
}
