import "server-only";
import { prisma } from "@/lib/prisma";
import { getTodaySummary, getStreak } from "@/services/logs";
import { computeHealthScore, isVitalInRange, clamp } from "@/lib/rules";

// Rule-based Health Score (0–100), deterministic — no AI.
// Components (weights): activity 20, hydration 15, sleep 20, mood 15,
// medication adherence 20, vitals-in-range 10. Pure math lives in lib/rules.ts.

export type ScoreComponents = {
  activity: number;
  hydration: number;
  sleep: number;
  mood: number;
  medication: number;
  vitals: number;
};

export async function calculateHealthScore(userId: string): Promise<{ score: number; components: ScoreComponents }> {
  const [today, , profile] = await Promise.all([
    getTodaySummary(userId),
    getStreak(userId),
    prisma.healthProfile.findUnique({ where: { userId } }),
  ]);

  const targets = {
    stepTarget: profile?.stepTarget ?? 6000,
    waterTargetMl: profile?.waterTargetMl ?? 2000,
    sleepTargetH: profile?.sleepTargetH ?? 8,
  };

  const adherence = await getRecentAdherence(userId, 7);
  const vitalsRatio = await vitalsInRangeRatio(userId);

  const score = computeHealthScore(
    {
      steps: today.steps,
      waterMl: today.waterMl,
      sleepHours: today.sleepHours,
      mood: today.mood,
      adherencePct: adherence,
      vitalsInRangeRatio: vitalsRatio,
    },
    targets
  );

  const activity = clamp(Math.round((today.steps / Math.max(1, targets.stepTarget)) * 20), 0, 20);
  const hydration = clamp(Math.round((today.waterMl / Math.max(1, targets.waterTargetMl)) * 15), 0, 15);
  const components: ScoreComponents = {
    activity,
    hydration,
    sleep: today.sleepHours != null ? (today.sleepHours / targets.sleepTargetH >= 0.85 ? 20 : 10) : 0,
    mood: today.mood != null ? Math.round(((today.mood - 1) / 4) * 15) : 0,
    medication: Math.round((adherence / 100) * 20),
    vitals: vitalsRatio == null ? 5 : Math.round(vitalsRatio * 10),
  };

  return { score, components };
}

export async function getRecentAdherence(userId: string, days: number): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const [taken, missed, skipped] = await Promise.all([
    prisma.medicationDose.count({ where: { userId, scheduledAt: { gte: start }, status: "TAKEN" } }),
    prisma.medicationDose.count({ where: { userId, scheduledAt: { gte: start }, status: "MISSED" } }),
    prisma.medicationDose.count({ where: { userId, scheduledAt: { gte: start }, status: "SKIPPED" } }),
  ]);
  const scheduled = taken + missed + skipped;
  if (scheduled === 0) return 100; // no medication obligations — not penalized
  return Math.round((taken / scheduled) * 100);
}

async function vitalsInRangeRatio(userId: string): Promise<number | null> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const vitals = await prisma.vitalReading.findMany({
    where: { userId, measuredAt: { gte: cutoff } },
    orderBy: { measuredAt: "desc" },
    take: 40,
  });
  if (vitals.length === 0) return null;
  const inRange = vitals.filter((v) => isVitalInRange(v.type, v.systolic ?? null, v.diastolic ?? null, v.value ?? null)).length;
  return inRange / vitals.length;
}

export async function saveHealthScore(userId: string): Promise<{ score: number; components: ScoreComponents }> {
  const { score, components } = await calculateHealthScore(userId);
  await prisma.healthScore.create({
    data: { userId, score, components: JSON.stringify(components) },
  });
  return { score, components };
}
