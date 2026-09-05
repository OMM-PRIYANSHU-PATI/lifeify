import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // steps, hr, sleep, etc.
  const limit = parseInt(searchParams.get("limit") || "100");

  const where: any = { userId: user.id };
  if (type) {
    where.type = type;
  }

  const metrics = await prisma.healthMetric.findMany({
    where,
    orderBy: { startTime: "desc" },
    take: Math.min(limit, 500),
  });

  return NextResponse.json({ ok: true, metrics });
}
