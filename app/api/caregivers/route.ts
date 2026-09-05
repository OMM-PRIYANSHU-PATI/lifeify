import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Permissions where current user is the target (i.e. patients who granted access to caregivers)
  const grantedCaregivers = await prisma.subjectPermission.findMany({
    where: {
      targetUserId: user.id,
      source: "CAREGIVER",
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      user: true, // the caregiver
    },
  });

  // Permissions where current user is the actor (i.e. care recipients this user looks after)
  const careRecipients = await prisma.subjectPermission.findMany({
    where: {
      actorUserId: user.id,
      source: "CAREGIVER",
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  return NextResponse.json({
    ok: true,
    grantedCaregivers,
    careRecipients,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { caregiverPhone, permissions = ["VIEW_VITALS", "VIEW_MEDS"], durationMonths = 6 } = body;

    if (!caregiverPhone || !/^\d{10}$/.test(caregiverPhone)) {
      return NextResponse.json({ error: "Valid 10-digit caregiver mobile number required" }, { status: 400 });
    }

    let caregiver = await prisma.user.findUnique({ where: { phone: caregiverPhone } });
    if (!caregiver) {
      caregiver = await prisma.user.create({
        data: {
          phone: caregiverPhone,
          role: "caregiver",
        },
      });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + Math.min(12, Math.max(1, durationMonths)));

    const created = [];
    for (const perm of permissions) {
      const grant = await prisma.subjectPermission.upsert({
        where: {
          actorUserId_targetUserId_permissionKey_source: {
            actorUserId: caregiver.id,
            targetUserId: user.id,
            permissionKey: perm,
            source: "CAREGIVER",
          },
        },
        create: {
          actorUserId: caregiver.id,
          targetUserId: user.id,
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
      created.push(grant);
    }

    await audit({
      userId: user.id,
      action: "CAREGIVER_PERMISSIONS_GRANTED",
      entity: "SubjectPermission",
      metadata: { caregiverId: caregiver.id, caregiverPhone, permissions, expiresAt },
    });

    return NextResponse.json({ ok: true, grants: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
