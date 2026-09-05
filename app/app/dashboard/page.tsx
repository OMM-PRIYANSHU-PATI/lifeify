import React from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateHealthScore } from "@/services/health-score";
import { getTodaySummary } from "@/services/logs";
import { getAllFeatures } from "@/lib/features/registry";
import { AppleHealthDashboard } from "@/components/health/apple-health-dashboard";

export const metadata = {
  title: "Dashboard | LIFEIFY Personal Health OS",
  description: "Minimalist Apple Health-inspired dashboard and complete 316-feature clinical directory.",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const [healthScoreData, todaySummary, allFeatures] = await Promise.all([
    calculateHealthScore(user.id),
    getTodaySummary(user.id),
    getAllFeatures(),
  ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [pendingDoses, connectedDevicesCount, latestBp] = await Promise.all([
    prisma.medicationDose.findMany({
      where: {
        userId: user.id,
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: "scheduled",
      },
      include: { medication: true },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.healthDataSource.count({
      where: { userId: user.id, status: "CONNECTED" },
    }),
    prisma.vitalReading.findFirst({
      where: { userId: user.id, type: "BP" },
      orderBy: { takenAt: "desc" },
    }),
  ]);

  return (
    <AppleHealthDashboard
      user={user}
      todaySummary={todaySummary}
      healthScoreData={healthScoreData}
      pendingDoses={pendingDoses}
      latestBp={latestBp}
      connectedDevicesCount={connectedDevicesCount}
      allFeatures={allFeatures}
    />
  );
}
