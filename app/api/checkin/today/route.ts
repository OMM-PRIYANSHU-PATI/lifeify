import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = startOfDay(new Date());

  const [existingCheckIn, questions, conditions, activeMeds] = await Promise.all([
    prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      include: {
        responses: {
          include: { question: true },
        },
      },
    }),
    prisma.checkInQuestion.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.condition.findMany({
      where: { userId: user.id },
    }),
    prisma.medication.findMany({
      where: { userId: user.id, active: true },
    }),
  ]);

  // Filter questions dynamically based on conditions and medication regimen
  const hasConditions = conditions.length > 0;
  const hasMeds = activeMeds.length > 0;

  const relevantQuestions = questions.filter((q) => {
    if (q.category === "condition" && !hasConditions) return false;
    if (q.category === "medication" && !hasMeds) return false;
    return true;
  });

  return NextResponse.json({
    ok: true,
    completed: existingCheckIn?.completed ?? false,
    checkIn: existingCheckIn,
    questions: relevantQuestions,
    conditions: conditions.map((c) => c.type),
    activeMedsCount: activeMeds.length,
  });
}
