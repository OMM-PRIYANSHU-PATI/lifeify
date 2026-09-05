import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdherenceStats } from "@/services/medications";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile, conditions, medications, vitals, sideEffects, adherence] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId: user.id } }),
    prisma.condition.findMany({ where: { userId: user.id } }),
    prisma.medication.findMany({
      where: { userId: user.id, active: true },
      include: { stock: true },
    }),
    prisma.vitalReading.findMany({
      where: { userId: user.id },
      orderBy: { takenAt: "desc" },
      take: 15,
    }),
    prisma.sideEffect.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    getAdherenceStats(user.id).catch(() => ({ today: 100, week: 100, treatment: 100 })),
  ]);

  return NextResponse.json({
    ok: true,
    summary: {
      patient: {
        name: user.name ?? "Patient",
        email: user.email,
        phone: user.phone,
        age: profile?.age ?? "—",
        sex: profile?.sex ?? "—",
        bloodGroup: profile?.bloodGroup ?? "—",
        heightCm: profile?.heightCm ?? "—",
        weightKg: profile?.weightKg ?? "—",
      },
      conditions: conditions.map((c) => ({ type: c.type, notes: c.notes })),
      medications: medications.map((m) => ({
        name: m.name,
        dose: m.dose,
        frequency: m.frequency,
        instructions: m.instructions,
        remainingStock: m.stock?.remainingQty ?? null,
      })),
      adherence,
      vitals,
      sideEffects,
    },
  });
}
