"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const caregiverGrantSchema = z.object({
  caregiverPhone: z.string().regex(/^\d{10}$/, "Enter valid 10-digit mobile number"),
  permissions: z.array(z.enum(["VIEW_VITALS", "VIEW_MEDS", "MANAGE_MEDS", "EMERGENCY_ACCESS"])).min(1),
  durationMonths: z.number().int().min(1).max(12),
});

export async function grantCaregiverPermissionAction(input: z.infer<typeof caregiverGrantSchema>) {
  const patient = await requireUser();
  const parsed = caregiverGrantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid grant parameters" };

  let caregiver = await prisma.user.findUnique({
    where: { phone: parsed.data.caregiverPhone },
  });

  if (!caregiver) {
    caregiver = await prisma.user.create({
      data: {
        phone: parsed.data.caregiverPhone,
        role: "caregiver",
      },
    });
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + parsed.data.durationMonths);

  // Create or update SubjectPermission records
  const createdGrants = [];
  for (const perm of parsed.data.permissions) {
    const grant = await prisma.subjectPermission.upsert({
      where: {
        actorUserId_targetUserId_permissionKey_source: {
          actorUserId: caregiver.id,
          targetUserId: patient.id,
          permissionKey: perm,
          source: "CAREGIVER",
        },
      },
      create: {
        actorUserId: caregiver.id,
        targetUserId: patient.id,
        permissionKey: perm,
        scope: "FULL",
        source: "CAREGIVER",
        expiresAt,
      },
      update: {
        expiresAt,
        revokedAt: null,
      },
    });
    createdGrants.push(grant);
  }

  await audit({
    userId: patient.id,
    targetUserId: caregiver.id,
    action: "CAREGIVER_GRANT_CREATED",
    entity: "SubjectPermission",
    metadata: { permissions: parsed.data.permissions, durationMonths: parsed.data.durationMonths, expiresAt },
  });

  revalidatePath("/app/family");
  return { ok: true, data: createdGrants };
}

export async function revokeCaregiverPermissionAction(permissionId: string) {
  const patient = await requireUser();
  const grant = await prisma.subjectPermission.findFirst({
    where: { id: permissionId, targetUserId: patient.id },
  });

  if (!grant) return { ok: false, error: "Permission grant not found" };

  await prisma.subjectPermission.update({
    where: { id: grant.id },
    data: { revokedAt: new Date() },
  });

  await audit({
    userId: patient.id,
    targetUserId: grant.actorUserId,
    action: "CAREGIVER_GRANT_REVOKED",
    entity: "SubjectPermission",
    entityId: grant.id,
    metadata: { permissionKey: grant.permissionKey },
  });

  revalidatePath("/app/family");
  return { ok: true };
}

export async function getActiveCaregiverGrants() {
  const patient = await requireUser();
  const now = new Date();

  return prisma.subjectPermission.findMany({
    where: {
      targetUserId: patient.id,
      source: "CAREGIVER",
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: {
      user: {
        select: { id: true, name: true, phone: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
