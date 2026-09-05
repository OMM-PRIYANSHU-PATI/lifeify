import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const records = await prisma.medicalRecord.findMany({
    where: { userId: user.id },
    include: { file: true, prescriptions: { include: { medicines: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ records });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, type = "prescription", notes, fileUrl } = body;

    const record = await prisma.medicalRecord.create({
      data: {
        userId: user.id,
        title,
        type,
        notes: notes ?? null,
        fileUrl: fileUrl ?? null,
      },
    });

    await audit({
      userId: user.id,
      action: "RECORD_UPLOAD",
      entity: "MedicalRecord",
      entityId: record.id,
    });

    return NextResponse.json({ ok: true, record });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
