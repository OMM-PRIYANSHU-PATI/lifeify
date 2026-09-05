import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exports = await prisma.dataExportRequest.findMany({
    where: { userId: user.id },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json({ ok: true, exports });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const format = body.format === "csv" ? "csv" : "json";

    const fullData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        lifestyle: true,
        healthLogs: { take: 1000 },
        vitalReadings: { take: 1000 },
        medications: { include: { stock: true } },
        sideEffects: true,
        medicalRecords: true,
        healthScores: { take: 30 },
      },
    });

    const exportRecord = await prisma.dataExportRequest.create({
      data: {
        userId: user.id,
        format,
        status: "READY",
        downloadUrl: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(fullData, null, 2))}`,
      },
    });

    await audit({
      userId: user.id,
      action: "DATA_EXPORT_REQUESTED",
      entity: "DataExportRequest",
      entityId: exportRecord.id,
      metadata: { format },
    });

    return NextResponse.json({ ok: true, export: exportRecord }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
