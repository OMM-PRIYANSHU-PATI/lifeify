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

  // Revoke doctor's access to this patient
  await prisma.subjectPermission.updateMany({
    where: {
      targetUserId: id,
      actorUserId: user.id,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  await audit({
    userId: user.id,
    action: "DOCTOR_PATIENT_ACCESS_REVOKED",
    entity: "SubjectPermission",
    metadata: { patientUserId: id },
  });

  return NextResponse.json({ ok: true, message: "Patient access revoked" });
}
