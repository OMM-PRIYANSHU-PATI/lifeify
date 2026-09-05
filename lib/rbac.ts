import "server-only";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

// V2 RBAC foundation. Permission keys follow "<resource>.<action>".
// canAccess() is the single gate every cross-user read/write must pass.

export const PERMISSIONS = [
  "medication.read",
  "medical.read",
  "vitals.read",
  "adherence.read",
  "profile.read",
  "emergency.read",
  "summary.read",
  "appointment.read",
  "appointment.write",
  "note.read",
  "note.write",
] as const;
export type PermissionKey = (typeof PERMISSIONS)[number];

export const ROLE_TEMPLATES: Record<string, PermissionKey[]> = {
  self: [...PERMISSIONS],
  "caregiver.basic": ["profile.read", "medication.read", "emergency.read", "summary.read"],
  "caregiver.medical": ["profile.read", "medication.read", "emergency.read", "summary.read", "medical.read", "vitals.read", "adherence.read", "appointment.read"],
  "doctor.gp": ["profile.read", "medication.read", "medical.read", "vitals.read", "adherence.read", "summary.read", "appointment.read", "appointment.write", "note.read", "note.write"],
  "doctor.specialist": ["profile.read", "medication.read", "medical.read", "vitals.read", "adherence.read", "summary.read", "appointment.read", "appointment.write", "note.read", "note.write"],
};

export async function canAccess(actorId: string, targetUserId: string, permission: PermissionKey): Promise<boolean> {
  if (actorId === targetUserId) return true; // self always has full access

  const actor = await prisma.user.findUnique({ where: { id: actorId } });
  if (!actor || actor.status !== "ACTIVE") return false;
  if (actor.role === "ADMIN") return true;

  const grants = await prisma.subjectPermission.findMany({
    where: {
      actorUserId: actorId,
      targetUserId,
      permissionKey: permission,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  return grants.length > 0;
}

export async function requireAccess(actorId: string, targetUserId: string, permission: PermissionKey): Promise<void> {
  const ok = await canAccess(actorId, targetUserId, permission);
  await audit({ userId: actorId, targetUserId, action: ok ? "ACCESS_GRANTED_CHECK" : "ACCESS_DENIED", permission, entity: "PermissionCheck", metadata: { permission } });
  if (!ok) throw new Error("FORBIDDEN");
}

// Materialize permission rows for a caregiver or doctor grant.
export async function grantPermissions(params: {
  actorUserId: string;
  targetUserId: string;
  source: "CAREGIVER" | "DOCTOR";
  permissions: PermissionKey[];
  caregiverId?: string;
  doctorPatientId?: string;
  expiresAt?: Date | null;
}): Promise<void> {
  for (const key of params.permissions) {
    await prisma.subjectPermission.upsert({
      where: {
        actorUserId_targetUserId_permissionKey_source: {
          actorUserId: params.actorUserId,
          targetUserId: params.targetUserId,
          permissionKey: key,
          source: params.source,
        },
      },
      create: {
        actorUserId: params.actorUserId,
        targetUserId: params.targetUserId,
        permissionKey: key,
        source: params.source,
        caregiverId: params.caregiverId,
        doctorPatientId: params.doctorPatientId,
        expiresAt: params.expiresAt ?? null,
        revokedAt: null,
      },
      update: { revokedAt: null, expiresAt: params.expiresAt ?? null },
    });
  }
}

export async function revokeAllPermissions(actorUserId: string, targetUserId: string, source: "CAREGIVER" | "DOCTOR"): Promise<void> {
  await prisma.subjectPermission.updateMany({
    where: { actorUserId, targetUserId, source },
    data: { revokedAt: new Date() },
  });
}
