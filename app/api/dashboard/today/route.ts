import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { calculateHealthScore } from "@/services/health-score";
import { getTodaySummary, getStreak } from "@/services/logs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [scoreData, today, streak] = await Promise.all([
    calculateHealthScore(user.id),
    getTodaySummary(user.id),
    getStreak(user.id),
  ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const pendingDosesCount = await prisma.medicationDose.count({
    where: {
      userId: user.id,
      scheduledAt: { gte: todayStart },
      status: "scheduled",
    },
  });

  return NextResponse.json({
    healthScore: scoreData.score,
    scoreComponents: scoreData.components,
    today: {
      steps: today.steps,
      waterMl: today.waterMl,
      sleepHours: today.sleepHours,
      mood: today.mood,
      weight: today.weightKg,
    },
    streak,
    pendingDosesCount,
  });
}
