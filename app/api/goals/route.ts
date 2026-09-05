import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.healthGoal.findMany({
    where: { userId: user.id },
    include: { progress: { take: 5, orderBy: { recordedAt: "desc" } } },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json({ goals });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { type, target, unit, period = "DAILY" } = body;

    const goal = await prisma.healthGoal.create({
      data: {
        userId: user.id,
        type,
        target: Number(target),
        unit,
        period,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ ok: true, goal });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
