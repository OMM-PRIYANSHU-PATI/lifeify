import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const range = searchParams.get("range") || "7d";

  const days = range === "30d" ? 30 : range === "90d" ? 90 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const whereClause: Record<string, unknown> = {
    userId: user.id,
    startTime: { gte: startDate },
  };
  if (type) whereClause.type = type;

  const logs = await prisma.healthLog.findMany({
    where: whereClause,
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { type, value, unit, timestamp } = body;

    const log = await prisma.healthLog.create({
      data: {
        userId: user.id,
        type,
        value: Number(value),
        unit: unit ?? null,
        startTime: timestamp ? new Date(timestamp) : new Date(),
        source: "manual",
      },
    });

    return NextResponse.json({ ok: true, log });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
