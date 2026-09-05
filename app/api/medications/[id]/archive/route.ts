import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const med = await prisma.medication.findFirst({ where: { id, userId: user.id } });
  if (!med) return NextResponse.json({ error: "Medication not found" }, { status: 404 });

  await prisma.medication.update({
    where: { id },
    data: { active: false, status: "archived", archivedAt: new Date() },
  });

  await prisma.medicationDose.updateMany({
    where: { medicationId: id, status: { in: ["scheduled", "PENDING", "snoozed", "SNOOZED"] } },
    data: { status: "missed" },
  });

  await audit({
    userId: user.id,
    action: "MEDICATION_ARCHIVED",
    entity: "Medication",
    entityId: id,
  });

  return NextResponse.json({ ok: true, message: `${med.name} successfully archived` });
}
