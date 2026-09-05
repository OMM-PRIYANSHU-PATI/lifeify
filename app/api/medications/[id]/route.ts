import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const medication = await prisma.medication.findFirst({
    where: { id, userId: user.id },
    include: {
      stock: true,
      schedule: true,
      doses: {
        orderBy: { scheduledAt: "desc" },
        take: 20,
      },
      sideEffects: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!medication) {
    return NextResponse.json({ error: "Medication not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, medication });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const med = await prisma.medication.findFirst({ where: { id, userId: user.id } });
  if (!med) return NextResponse.json({ error: "Medication not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { dose, doseUnit, instructions, condition, active, status } = body;

    const updated = await prisma.medication.update({
      where: { id },
      data: {
        ...(dose !== undefined && { dose }),
        ...(doseUnit !== undefined && { doseUnit }),
        ...(instructions !== undefined && { instructions }),
        ...(condition !== undefined && { condition }),
        ...(active !== undefined && { active }),
        ...(status !== undefined && { status }),
      },
    });

    await audit({
      userId: user.id,
      action: "MEDICATION_UPDATED",
      entity: "Medication",
      entityId: id,
    });

    return NextResponse.json({ ok: true, medication: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const med = await prisma.medication.findFirst({ where: { id, userId: user.id } });
  if (!med) return NextResponse.json({ error: "Medication not found" }, { status: 404 });

  // Soft delete / archive
  await prisma.medication.update({
    where: { id },
    data: { active: false, status: "archived", archivedAt: new Date() },
  });

  // Cancel future pending doses
  await prisma.medicationDose.updateMany({
    where: { medicationId: id, status: { in: ["scheduled", "PENDING", "snoozed", "SNOOZED"] } },
    data: { status: "missed" },
  });

  await audit({
    userId: user.id,
    action: "MEDICATION_STOPPED",
    entity: "Medication",
    entityId: id,
  });

  return NextResponse.json({ ok: true, message: `${med.name} archived` });
}
