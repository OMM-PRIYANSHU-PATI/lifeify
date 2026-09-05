import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const enrollments = await prisma.rpmEnrollment.findMany({
      where: { doctorId: user.id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            vitalReadings: {
              orderBy: { takenAt: "desc" },
              take: 5,
            },
            healthScores: {
              orderBy: { calculatedAt: "desc" },
              take: 1,
            },
          },
        },
        alerts: {
          where: { acknowledged: false },
          orderBy: { createdAt: "desc" },
        },
        auditLogs: {
          orderBy: { loggedAt: "desc" },
          take: 3,
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return NextResponse.json({ ok: true, enrollments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      patientId,
      patientPhone,
      patientEmail,
      minSystolic = 90,
      maxSystolic = 140,
      minDiastolic = 60,
      maxDiastolic = 90,
      minGlucose = 70,
      maxGlucose = 180,
      minSpo2 = 94,
      notes,
    } = body;

    let targetPatientId = patientId;

    if (!targetPatientId) {
      const patient = await prisma.user.findFirst({
        where: {
          OR: [
            patientPhone ? { phone: patientPhone } : undefined,
            patientEmail ? { email: patientEmail } : undefined,
          ].filter(Boolean) as any[],
        },
      });

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found with the provided phone or email." },
          { status: 404 }
        );
      }
      targetPatientId = patient.id;
    }

    // Check if already enrolled
    const existing = await prisma.rpmEnrollment.findFirst({
      where: {
        doctorId: user.id,
        patientId: targetPatientId,
        status: "ACTIVE",
      },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: "Patient is already actively enrolled in your RPM program.",
        enrollment: existing,
      });
    }

    const enrollment = await prisma.rpmEnrollment.create({
      data: {
        doctorId: user.id,
        patientId: targetPatientId,
        status: "ACTIVE",
        minSystolic: Number(minSystolic),
        maxSystolic: Number(maxSystolic),
        minDiastolic: Number(minDiastolic),
        maxDiastolic: Number(maxDiastolic),
        minGlucose: Number(minGlucose),
        maxGlucose: Number(maxGlucose),
        minSpo2: Number(minSpo2),
        notes: notes || "Standard RPM cardiovascular and metabolic monitoring protocol",
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    // Create initial audit log
    await prisma.rpmAuditLog.create({
      data: {
        enrollmentId: enrollment.id,
        doctorUserId: user.id,
        durationSeconds: 120,
        activityType: "ENROLLMENT",
        notes: "Enrolled patient in Remote Patient Monitoring and established vital thresholds.",
      },
    });

    return NextResponse.json({ ok: true, enrollment });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
