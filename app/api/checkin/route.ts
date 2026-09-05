import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/utils";
import { audit } from "@/lib/audit";
import { awardGamificationPoints } from "@/lib/actions/gamification";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { moodScore, answers } = body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    const today = startOfDay(new Date());

    // Upsert the DailyCheckIn
    const checkIn = await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
        moodScore: typeof moodScore === "number" ? moodScore : undefined,
      },
      create: {
        userId: user.id,
        date: today,
        completed: true,
        completedAt: new Date(),
        moodScore: typeof moodScore === "number" ? moodScore : 3,
      },
    });

    // Save individual question responses
    for (const ans of answers) {
      if (!ans.questionId) continue;
      const strVal = String(ans.value ?? ans.answer ?? "");
      
      // Check red-flag response deterministically
      const numVal = Number(strVal);
      const isRedFlag =
        strVal.toLowerCase() === "severe" ||
        strVal.toLowerCase() === "worse" ||
        (!isNaN(numVal) && numVal <= 1 && ans.questionId.includes("mood"));

      await prisma.checkInResponse.create({
        data: {
          userId: user.id,
          checkInId: checkIn.id,
          questionId: ans.questionId,
          value: strVal,
          answer: ans.answer || strVal,
          flag: isRedFlag ? "ALERT" : "NORMAL",
        },
      });
    }

    // Award gamification points deterministically
    await awardGamificationPoints("checkin").catch(() => undefined);

    await audit({
      userId: user.id,
      action: "CHECKIN_COMPLETED",
      entity: "DailyCheckIn",
      entityId: checkIn.id,
      metadata: { moodScore, answeredCount: answers.length },
    });

    return NextResponse.json({
      ok: true,
      message: "Daily check-in saved successfully",
      checkInId: checkIn.id,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
