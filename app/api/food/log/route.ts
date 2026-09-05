import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const logs = await prisma.foodLog.findMany({
    where: { userId: user.id, loggedAt: { gte: todayStart } },
    orderBy: { loggedAt: "desc" },
  });

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { foodId, foodName, portion = 1, calories, protein, carbs, fat } = body;

    const log = await prisma.foodLog.create({
      data: {
        userId: user.id,
        foodId: foodId ?? null,
        foodName,
        portion: Number(portion),
        calories: Number(calories),
        protein: Number(protein ?? 0),
        carbs: Number(carbs ?? 0),
        fat: Number(fat ?? 0),
      },
    });

    return NextResponse.json({ ok: true, log });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
