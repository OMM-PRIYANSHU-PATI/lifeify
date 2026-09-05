import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const grant = await prisma.subjectPermission.findFirst({
    where: {
      id,
      targetUserId: user.id, // Only patient can revoke
    },
  });

  if (!grant) {
    return NextResponse.json({ error: "Caregiver grant not found or unauthorized" }, { status: 404 });
  }

  await prisma.subjectPermission.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  await audit({
    userId: user.id,
    action: "CAREGIVER_REVOKED",
    entity: "SubjectPermission",
    entityId: id,
    metadata: { caregiverUserId: grant.actorUserId },
  });

  return NextResponse.json({ ok: true, message: "Caregiver access revoked immediately" });
}
