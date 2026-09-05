import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const records = Array.isArray(body.records) ? body.records : [];

    if (records.length === 0) {
      return NextResponse.json({ error: "No records found in payload" }, { status: 400 });
    }

    let insertedCount = 0;
    for (const r of records) {
      if (!r.type || r.value === undefined) continue;

      const sourceId = r.sourceId || nanoid(12);
      const startTime = r.startTime ? new Date(r.startTime) : new Date();
      const endTime = r.endTime ? new Date(r.endTime) : null;

      await prisma.healthMetric.upsert({
        where: {
          userId_type_source_sourceId: {
            userId: user.id,
            type: r.type,
            source: "apple_health",
            sourceId,
          },
        },
        update: {
          value: Number(r.value),
          unit: r.unit || "",
          startTime,
          endTime,
        },
        create: {
          userId: user.id,
          type: r.type,
          value: Number(r.value),
          unit: r.unit || "",
          startTime,
          endTime,
          source: "apple_health",
          sourceId,
        },
      });
      insertedCount++;
    }

    // Ensure datasource is active
    await prisma.healthDataSource.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider: "apple_health",
        },
      },
      update: {
        status: "CONNECTED",
        lastSyncAt: new Date(),
      },
      create: {
        userId: user.id,
        provider: "apple_health",
        status: "CONNECTED",
        lastSyncAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      importedCount: insertedCount,
      message: `Successfully imported ${insertedCount} records from Apple Health.`,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
