import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const consents = await prisma.consent.findMany({
    where: { userId: user.id },
    orderBy: { grantedAt: "desc" },
  });
  return NextResponse.json({ consents });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { type, granted, version = "1.0" } = body;

    const consent = await prisma.consent.upsert({
      where: { userId_type: { userId: user.id, type } },
      create: {
        userId: user.id,
        type,
        version,
        granted: !!granted,
        grantedAt: new Date(),
        revokedAt: granted ? null : new Date(),
      },
      update: {
        version,
        granted: !!granted,
        grantedAt: granted ? new Date() : undefined,
        revokedAt: granted ? null : new Date(),
      },
    });

    return NextResponse.json({ ok: true, consent });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
