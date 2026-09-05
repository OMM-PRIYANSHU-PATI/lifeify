import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { activity, diet, smoking, alcohol, sleepGoal, waterGoal, stepTarget } = body;

    const lifestyle = await prisma.lifestyleProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        activity: activity ?? "moderate",
        diet: diet ?? "veg",
        smoking: !!smoking,
        alcohol: !!alcohol,
        sleepGoal: sleepGoal ? Number(sleepGoal) : 8,
        waterGoal: waterGoal ? Number(waterGoal) : 2000,
        stepTarget: stepTarget ? Number(stepTarget) : 6000,
      },
      update: {
        activity: activity ?? undefined,
        diet: diet ?? undefined,
        smoking: smoking !== undefined ? !!smoking : undefined,
        alcohol: alcohol !== undefined ? !!alcohol : undefined,
        sleepGoal: sleepGoal ? Number(sleepGoal) : undefined,
        waterGoal: waterGoal ? Number(waterGoal) : undefined,
        stepTarget: stepTarget ? Number(stepTarget) : undefined,
      },
    });

    return NextResponse.json({ ok: true, lifestyle });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
