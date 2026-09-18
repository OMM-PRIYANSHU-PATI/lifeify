import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  predictFutureDiseases,
  FutureDiseasePredictorInputs,
} from "@/lib/rules/risk-scores/future-disease-predictor";

export async function GET() {
  try {
    const user = await getCurrentUser();

    // Default baseline inputs
    let inputs: FutureDiseasePredictorInputs = {
      age: 38,
      gender: "MALE",
      heightCm: 172,
      weightKg: 78,
      waistCircumferenceCm: 88,
      systolicBp: 128,
      diastolicBp: 82,
      restingHeartRate: 72,
      fastingGlucoseMgDl: 104,
      hba1cPercent: 5.7,
      totalCholesterolMgDl: 202,
      hdlCholesterolMgDl: 44,
      triglyceridesMgDl: 165,
      serumCreatinineMgDl: 0.9,
      familyDiabetes: "ONE_PARENT",
      familyPrematureCad: false,
      familyHypertension: true,
      familyStroke: false,
      familyCkd: false,
      dailySteps: 5200,
      sleepHours: 6.5,
      smokingStatus: "NEVER",
      alcoholFrequency: "OCCASIONAL",
      dietType: "BALANCED",
      stressLevel: 6,
      symptoms: {
        frequentThirstOrUrination: false,
        morningHeadaches: false,
        breathlessnessOnExertion: false,
        chronicJointStiffness: false,
        postMealBrainFog: true,
        unexplainedFatigue: false,
        ankleSwelling: false,
      },
    };

    if (user) {
      const profile = user.healthProfile;
      const lifestyle = user.lifestyleProfile;

      // Extract vitals if recorded
      const latestBp = await prisma.vitalReading.findFirst({
        where: { userId: user.id, type: "blood_pressure" },
        orderBy: { takenAt: "desc" },
      });

      const latestGlucose = await prisma.vitalReading.findFirst({
        where: { userId: user.id, type: "glucose" },
        orderBy: { takenAt: "desc" },
      });

      const latestHr = await prisma.vitalReading.findFirst({
        where: { userId: user.id, type: "heart_rate" },
        orderBy: { takenAt: "desc" },
      });

      const famHistory = await prisma.familyMedicalHistory.findMany({
        where: { userId: user.id },
      });

      const hasFamCad = famHistory.some(
        (f) =>
          f.condition.toLowerCase().includes("heart") ||
          f.condition.toLowerCase().includes("cad") ||
          f.condition.toLowerCase().includes("infarct")
      );
      const hasFamDm = famHistory.some((f) =>
        f.condition.toLowerCase().includes("diabet")
      );
      const hasFamHtn = famHistory.some((f) =>
        f.condition.toLowerCase().includes("hypertens") ||
        f.condition.toLowerCase().includes("bp")
      );

      inputs = {
        ...inputs,
        age: profile?.age || inputs.age,
        gender: profile?.sex?.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE",
        heightCm: profile?.heightCm || profile?.height || inputs.heightCm,
        weightKg: profile?.weightKg || profile?.weight || inputs.weightKg,
        waistCircumferenceCm: inputs.waistCircumferenceCm,
        systolicBp: latestBp?.systolic ? Number(latestBp.systolic) : (latestBp ? Number(latestBp.value) : inputs.systolicBp),
        diastolicBp: latestBp?.diastolic ? Number(latestBp.diastolic) : inputs.diastolicBp,
        restingHeartRate: latestHr
          ? Number(latestHr.value)
          : inputs.restingHeartRate,
        fastingGlucoseMgDl: latestGlucose
          ? Number(latestGlucose.value)
          : inputs.fastingGlucoseMgDl,
        familyDiabetes: hasFamDm ? "ONE_PARENT" : "NONE",
        familyPrematureCad: hasFamCad,
        familyHypertension: hasFamHtn,
        dailySteps: lifestyle?.stepTarget || inputs.dailySteps,
        sleepHours: lifestyle?.sleepTargetH || inputs.sleepHours,
        smokingStatus: lifestyle?.smoking ? "CURRENT" : "NEVER",
        alcoholFrequency: lifestyle?.alcohol ? "MODERATE" : "NONE",
      };
    }

    const report = predictFutureDiseases(inputs);

    return NextResponse.json({
      ok: true,
      inputs,
      report,
    });
  } catch (error: any) {
    console.error("Future Disease Predictor GET Error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await getCurrentUser();

    const inputs: FutureDiseasePredictorInputs = body.inputs;
    if (!inputs) {
      return NextResponse.json(
        { ok: false, error: "Missing predictive inputs payload" },
        { status: 400 }
      );
    }

    const report = predictFutureDiseases(inputs);

    if (user && body.saveAssessment) {
      try {
        await prisma.diseaseRiskAssessment.create({
          data: {
            userId: user.id,
            diseaseType: "FUTURE_DISEASE_PROGNOSTIC",
            score: report.overallFutureRiskIndex,
            riskCategory: report.overallRiskTier,
            riskPercent: report.topFutureThreats[0]?.tenYearRiskPercent ?? 0,
            factors: JSON.stringify({
              bmi: report.bmi,
              waistToHeightRatio: report.waistToHeightRatio,
              topThreats: report.topFutureThreats.map((t) => ({
                id: t.id,
                name: t.name,
                tenYearRisk: t.tenYearRiskPercent,
                tier: t.riskTier,
              })),
            }),
            recommendations: JSON.stringify(
              report.topFutureThreats.flatMap((t) =>
                t.preventionProtocol.map((p) => p.action)
              )
            ),
          },
        });
      } catch (saveErr) {
        console.warn("Non-fatal: could not persist assessment log:", saveErr);
      }
    }

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error: any) {
    console.error("Future Disease Predictor POST Error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
