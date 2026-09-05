import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.healthProfile.findUnique({
    where: { userId: user.id },
  });
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { age, sex, height, weight, bloodGroup } = body;

    const profile = await prisma.healthProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        age: age ? Number(age) : null,
        sex: sex ?? null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        bloodGroup: bloodGroup ?? null,
      },
      update: {
        age: age ? Number(age) : undefined,
        sex: sex ?? undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        bloodGroup: bloodGroup ?? undefined,
      },
    });

    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
