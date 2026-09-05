import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conditionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conditionId } = await params;

  const condition = await prisma.condition.findFirst({
    where: { id: conditionId, userId: user.id },
  });

  if (!condition) {
    return NextResponse.json({ error: "Condition record not found" }, { status: 404 });
  }

  // Fetch related vitals and side effects
  const [recentVitals, recentSideEffects] = await Promise.all([
    prisma.vitalReading.findMany({
      where: { userId: user.id },
      orderBy: { takenAt: "desc" },
      take: 10,
    }),
    prisma.sideEffect.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    condition,
    recentVitals,
    recentSideEffects,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conditionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conditionId } = await params;

  try {
    const body = await req.json();
    const { notes, status } = body;

    const condition = await prisma.condition.findFirst({
      where: { id: conditionId, userId: user.id },
    });

    if (!condition) {
      return NextResponse.json({ error: "Condition not found" }, { status: 404 });
    }

    const updated = await prisma.condition.update({
      where: { id: conditionId },
      data: {
        ...(notes !== undefined && { notes }),
      },
    });

    await audit({
      userId: user.id,
      action: "CONDITION_RECOVERY_UPDATED",
      entity: "Condition",
      entityId: conditionId,
      metadata: { status },
    });

    return NextResponse.json({ ok: true, condition: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
