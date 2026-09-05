import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { evaluateVitalEmergency } from "@/lib/rules/emergency-triage";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // BP, GLUCOSE, WEIGHT, HEART_RATE, SPO2
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: any = { userId: user.id };
  if (type) {
    where.type = type.toUpperCase();
  }

  const vitals = await prisma.vitalReading.findMany({
    where,
    orderBy: { takenAt: "desc" },
    take: Math.min(limit, 100),
  });

  return NextResponse.json({ ok: true, vitals });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      type, // BP | GLUCOSE | WEIGHT | HEART_RATE | SPO2
      value,
      unit,
      systolic,
      diastolic,
      context, // fasting, post_meal, resting
      takenAt,
    } = body;

    if (!type) {
      return NextResponse.json({ error: "Vital type is required" }, { status: 400 });
    }

    const readingType = type.toUpperCase();
    let defaultUnit = unit || "";

    if (!defaultUnit) {
      if (readingType === "BP") defaultUnit = "mmHg";
      else if (readingType === "GLUCOSE") defaultUnit = "mg/dL";
      else if (readingType === "WEIGHT") defaultUnit = "kg";
      else if (readingType === "HEART_RATE") defaultUnit = "bpm";
      else if (readingType === "SPO2") defaultUnit = "%";
    }

    const vital = await prisma.vitalReading.create({
      data: {
        userId: user.id,
        type: readingType,
        value: typeof value === "number" ? value : parseFloat(value) || null,
        unit: defaultUnit,
        systolic: systolic ? parseInt(systolic) : null,
        diastolic: diastolic ? parseInt(diastolic) : null,
        context: context || null,
        takenAt: takenAt ? new Date(takenAt) : new Date(),
        measuredAt: takenAt ? new Date(takenAt) : new Date(),
        source: "MANUAL",
      },
    });

    await audit({
      userId: user.id,
      action: "VITAL_LOGGED",
      entity: "VitalReading",
      entityId: vital.id,
      metadata: { type: readingType, systolic, diastolic, value },
    });

    // Evaluate clinical emergency thresholds
    const numVal = typeof value === "number" ? value : parseFloat(value) || undefined;
    const emergencyEvaluation = evaluateVitalEmergency({
      systolicBp: systolic ? parseInt(systolic) : undefined,
      diastolicBp: diastolic ? parseInt(diastolic) : undefined,
      glucoseMgDl: readingType === "GLUCOSE" ? numVal : undefined,
      spo2Percent: readingType === "SPO2" ? numVal : undefined,
      heartRateBpm: readingType === "HEART_RATE" ? numVal : undefined,
    });

    if (emergencyEvaluation.hasEmergency || emergencyEvaluation.hasUrgentWarning) {
      const activeEnrollments = await prisma.rpmEnrollment.findMany({
        where: { patientId: user.id, status: "ACTIVE" },
      });

      for (const alertItem of emergencyEvaluation.alerts) {
        for (const enrollment of activeEnrollments) {
          await prisma.rpmAlert.create({
            data: {
              enrollmentId: enrollment.id,
              userId: user.id,
              vitalType: alertItem.vitalType,
              value: alertItem.measuredValue,
              severity: emergencyEvaluation.hasEmergency ? "CRITICAL" : "WARNING",
              doctorNotes: `Automatic vital alarm: ${alertItem.thresholdViolated}`,
            },
          });
        }
      }
    }

    return NextResponse.json(
      { ok: true, vital, emergencyEvaluation },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
