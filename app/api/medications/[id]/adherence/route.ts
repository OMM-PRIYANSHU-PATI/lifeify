import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const medication = await prisma.medication.findFirst({
    where: { id, userId: user.id },
  });

  if (!medication) {
    return NextResponse.json({ error: "Medication not found" }, { status: 404 });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [allDoses, doses7d, doses30d] = await Promise.all([
    prisma.medicationDose.findMany({
      where: { medicationId: id, scheduledAt: { lte: now } },
      orderBy: { scheduledAt: "desc" },
    }),
    prisma.medicationDose.findMany({
      where: { medicationId: id, scheduledAt: { gte: sevenDaysAgo, lte: now } },
    }),
    prisma.medicationDose.findMany({
      where: { medicationId: id, scheduledAt: { gte: thirtyDaysAgo, lte: now } },
    }),
  ]);

  const calcRate = (doses: typeof allDoses) => {
    const relevant = doses.filter((d) => ["taken", "TAKEN", "missed", "MISSED", "skipped", "SKIPPED"].includes(d.status));
    if (relevant.length === 0) return 100;
    const taken = relevant.filter((d) => d.status.toLowerCase() === "taken").length;
    return Math.round((taken / relevant.length) * 100);
  };

  const rate7d = calcRate(doses7d);
  const rate30d = calcRate(doses30d);
  const overallRate = calcRate(allDoses);

  // Calculate current streak
  let currentStreak = 0;
  const dosesByDay = new Map<string, typeof allDoses>();
  for (const dose of allDoses) {
    const dayKey = dose.scheduledAt.toISOString().slice(0, 10);
    if (!dosesByDay.has(dayKey)) dosesByDay.set(dayKey, []);
    dosesByDay.get(dayKey)!.push(dose);
  }

  const sortedDays = Array.from(dosesByDay.keys()).sort().reverse();
  for (const day of sortedDays) {
    const dayDoses = dosesByDay.get(day)!;
    const allTaken = dayDoses.every((d) => d.status.toLowerCase() === "taken");
    if (allTaken) {
      currentStreak++;
    } else {
      break;
    }
  }

  return NextResponse.json({
    ok: true,
    adherence: {
      rate7d,
      rate30d,
      overallRate,
      currentStreak,
      totalDosesLogged: allDoses.length,
      takenDoses: allDoses.filter((d) => d.status.toLowerCase() === "taken").length,
      skippedDoses: allDoses.filter((d) => d.status.toLowerCase() === "skipped").length,
      missedDoses: allDoses.filter((d) => d.status.toLowerCase() === "missed").length,
    },
  });
}
