"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function requestDataExportAction(format: "json" | "csv") {
  const user = await requireUser();

  // Fetch full user health profile, logs, and meds
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

  revalidatePath("/app/privacy");
  return { ok: true, data: exportRecord };
}

export async function deleteAccountAction() {
  const user = await requireUser();

  await audit({
    userId: user.id,
    action: "ACCOUNT_DELETION_REQUESTED",
    entity: "User",
    entityId: user.id,
  });

  // Cascade delete user
  await prisma.user.delete({
    where: { id: user.id },
  });

  return { ok: true };
}
