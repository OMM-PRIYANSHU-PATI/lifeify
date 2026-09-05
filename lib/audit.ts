import "server-only";
import { prisma } from "@/lib/prisma";

export async function audit(params: {
  userId?: string | null;
  targetUserId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  permission?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? undefined,
        targetUserId: params.targetUserId ?? undefined,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        permission: params.permission,
        ip: params.ip,
        userAgent: params.userAgent,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      },
    });
  } catch (err) {
    // Audit logging must never break the main flow, but failures are surfaced.
    console.error("[LIFEIFY] audit log write failed:", err);
  }
}
