import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrivacyClient } from "./privacy-client";

export default async function PrivacyCenterPage() {
  const user = await requireUser();
  const now = new Date();

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [{ userId: user.id }, { targetUserId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const activeGrants = await prisma.subjectPermission.findMany({
    where: {
      targetUserId: user.id,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: {
      user: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const emergencyLogs = await prisma.emergencyAccessLog.findMany({
    where: { userId: user.id },
    orderBy: { accessedAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Privacy & Permissions Center</h1>
        <p className="text-sm text-ink-soft">
          Review immutable access history, manage doctor and caregiver grants, and export your personal data archive.
        </p>
      </div>

      <PrivacyClient
        auditLogs={auditLogs}
        activeGrants={activeGrants}
        emergencyLogs={emergencyLogs}
      />
    </div>
  );
}
