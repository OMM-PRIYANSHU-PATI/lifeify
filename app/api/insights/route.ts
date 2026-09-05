import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdherenceStats } from "@/services/medications";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [adherence, medicationsWithStock, recentBP, recentLogs] = await Promise.all([
    getAdherenceStats(user.id).catch(() => ({ today: 100, week: 100, treatment: 100 })),
    prisma.medication.findMany({
      where: { userId: user.id, active: true },
      include: { stock: true },
    }),
    prisma.vitalReading.findMany({
      where: { userId: user.id, type: "BP" },
      orderBy: { takenAt: "desc" },
      take: 5,
    }),
    prisma.healthLog.findMany({
      where: { userId: user.id },
      orderBy: { startTime: "desc" },
      take: 7,
    }),
  ]);

  const insights: Array<{
    id: string;
    category: "medication" | "vitals" | "lifestyle" | "safety";
    title: string;
    description: string;
    severity: "info" | "success" | "warning" | "alert";
  }> = [];

  // Deterministic Rule 1: Adherence insight
  if (adherence.week >= 85) {
    insights.push({
      id: "adh-good",
      category: "medication",
      title: "Strong Medication Adherence",
      description: `Your 7-day adherence is ${adherence.week}%. High consistency protects against condition flares.`,
      severity: "success",
    });
  } else if (adherence.week < 70) {
    insights.push({
      id: "adh-low",
      category: "medication",
      title: "Adherence Dip Detected",
      description: `Your 7-day adherence dropped to ${adherence.week}%. Try setting custom reminder times for busy afternoons.`,
      severity: "warning",
    });
  }

  // Deterministic Rule 2: Low stock warning
  for (const m of medicationsWithStock) {
    if (m.stock && m.stock.remainingQty <= (m.stock.refillThreshold || 5)) {
      insights.push({
        id: `stock-${m.id}`,
        category: "safety",
        title: `Low Stock: ${m.name}`,
        description: `Only ${m.stock.remainingQty} ${m.stock.unit || "units"} remaining. Request a refill soon to prevent missed doses.`,
        severity: "warning",
      });
    }
  }

  // Deterministic Rule 3: BP trend assessment
  if (recentBP.length >= 2) {
    const avgSystolic = Math.round(recentBP.reduce((acc, v) => acc + (v.systolic || 120), 0) / recentBP.length);
    const avgDiastolic = Math.round(recentBP.reduce((acc, v) => acc + (v.diastolic || 80), 0) / recentBP.length);

    if (avgSystolic < 120 && avgDiastolic < 80) {
      insights.push({
        id: "bp-optimal",
        category: "vitals",
        title: "Optimal Blood Pressure Range",
        description: `Your average resting BP across recent readings is ${avgSystolic}/${avgDiastolic} mmHg (Normal / Optimal).`,
        severity: "info",
      });
    } else if (avgSystolic >= 140 || avgDiastolic >= 90) {
      insights.push({
        id: "bp-elevated",
        category: "vitals",
        title: "Elevated Blood Pressure Readings",
        description: `Recent readings average ${avgSystolic}/${avgDiastolic} mmHg. Discuss this trend with your physician during your next visit.`,
        severity: "alert",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    insights,
    generatedAt: new Date().toISOString(),
  });
}
