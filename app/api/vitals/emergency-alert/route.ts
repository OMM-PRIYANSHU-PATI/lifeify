import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateVitalEmergency, VitalInput } from "@/lib/rules/emergency-triage";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: VitalInput = await req.json();
    const evaluation = evaluateVitalEmergency(body);

    // If critical or warning, fan out to active RPM enrollments
    if (evaluation.hasEmergency || evaluation.hasUrgentWarning) {
      const activeEnrollments = await prisma.rpmEnrollment.findMany({
        where: {
          patientId: user.id,
          status: "ACTIVE",
        },
      });

      const alertSeverity = evaluation.hasEmergency ? "CRITICAL" : "WARNING";

      for (const alertItem of evaluation.alerts) {
        for (const enrollment of activeEnrollments) {
          await prisma.rpmAlert.create({
            data: {
              enrollmentId: enrollment.id,
              userId: user.id,
              vitalType: alertItem.vitalType,
              value: alertItem.measuredValue,
              severity: alertSeverity,
              doctorNotes: `Automated alert triggered: ${alertItem.thresholdViolated}`,
            },
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      evaluation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
