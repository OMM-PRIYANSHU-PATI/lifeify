import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const enrollment = await prisma.rpmEnrollment.findFirst({
      where: {
        id,
        doctorId: user.id,
      },
      include: {
        patient: {
          include: {
            vitalReadings: {
              orderBy: { takenAt: "desc" },
              take: 50,
            },
            medications: {
              where: { active: true },
              include: {
                stock: true,
                schedule: true,
              },
            },
            healthScores: {
              orderBy: { calculatedAt: "desc" },
              take: 14,
            },
          },
        },
        alerts: {
          orderBy: { createdAt: "desc" },
        },
        auditLogs: {
          orderBy: { loggedAt: "desc" },
          take: 30,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "RPM Enrollment not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, enrollment });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      acknowledgeAlertId,
      status,
      doctorNotes,
      durationSeconds = 180,
      activityType = "TELEMETRY_REVIEW",
      minSystolic,
      maxSystolic,
      minDiastolic,
      maxDiastolic,
      minGlucose,
      maxGlucose,
      minSpo2,
    } = body;

    const enrollment = await prisma.rpmEnrollment.findFirst({
      where: { id, doctorId: user.id },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "RPM Enrollment not found" }, { status: 404 });
    }

    // Acknowledge specific alert
    if (acknowledgeAlertId) {
      await prisma.rpmAlert.update({
        where: { id: acknowledgeAlertId },
        data: {
          acknowledged: true,
          acknowledgedAt: new Date(),
          doctorNotes: doctorNotes || "Reviewed and acknowledged by physician.",
        },
      });
    }

    // Update thresholds or status if provided
    const updateData: any = {};
    if (status) updateData.status = status;
    if (minSystolic != null) updateData.minSystolic = Number(minSystolic);
    if (maxSystolic != null) updateData.maxSystolic = Number(maxSystolic);
    if (minDiastolic != null) updateData.minDiastolic = Number(minDiastolic);
    if (maxDiastolic != null) updateData.maxDiastolic = Number(maxDiastolic);
    if (minGlucose != null) updateData.minGlucose = Number(minGlucose);
    if (maxGlucose != null) updateData.maxGlucose = Number(maxGlucose);
    if (minSpo2 != null) updateData.minSpo2 = Number(minSpo2);

    if (Object.keys(updateData).length > 0) {
      await prisma.rpmEnrollment.update({
        where: { id },
        data: updateData,
      });
    }

    // Log RPM clinical time for billing and audit compliance
    if (doctorNotes || durationSeconds) {
      await prisma.rpmAuditLog.create({
        data: {
          enrollmentId: id,
          doctorUserId: user.id,
          durationSeconds: Number(durationSeconds),
          activityType,
          notes: doctorNotes || "Routine RPM physiological telemetry review.",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "RPM record and clinical review updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
