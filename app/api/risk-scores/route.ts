import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateIDRS } from "@/lib/rules/risk-scores/idrs";
import { calculateFraminghamCvdRisk } from "@/lib/rules/risk-scores/framingham";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assessments = await prisma.diseaseRiskAssessment.findMany({
      where: { userId: user.id },
      orderBy: { assessedAt: "desc" },
      take: 20,
    });

    const parsed = assessments.map((a) => ({
      ...a,
      factors: JSON.parse(a.factors || "{}"),
      recommendations: JSON.parse(a.recommendations || "[]"),
    }));

    return NextResponse.json({ ok: true, assessments: parsed });
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
    const { type, inputs } = body;

    if (!type || !inputs) {
      return NextResponse.json(
        { error: "Missing required fields: type and inputs" },
        { status: 400 }
      );
    }

    let score = 0;
    let category = "LOW";
    let riskPercent: number | null = null;
    let recommendations: string[] = [];
    let fullResult: any = null;

    if (type === "IDRS") {
      const idrsResult = calculateIDRS({
        age: Number(inputs.age) || 30,
        gender: inputs.gender || "MALE",
        waistCircumferenceCm: Number(inputs.waistCircumferenceCm) || 80,
        physicalActivity: inputs.physicalActivity || "MODERATE",
        familyHistory: inputs.familyHistory || "NONE",
      });
      score = idrsResult.score;
      category = idrsResult.riskCategory;
      recommendations = idrsResult.recommendations;
      fullResult = idrsResult;
    } else if (type === "FRAMINGHAM_CVD") {
      const framinghamResult = calculateFraminghamCvdRisk({
        age: Number(inputs.age) || 45,
        gender: inputs.gender || "MALE",
        totalCholesterolMgDl: Number(inputs.totalCholesterolMgDl) || 190,
        hdlCholesterolMgDl: Number(inputs.hdlCholesterolMgDl) || 50,
        systolicBp: Number(inputs.systolicBp) || 120,
        isBpTreated: Boolean(inputs.isBpTreated),
        isSmoker: Boolean(inputs.isSmoker),
        hasDiabetes: Boolean(inputs.hasDiabetes),
      });
      score = framinghamResult.points;
      category = framinghamResult.riskCategory;
      riskPercent = framinghamResult.tenYearRiskPercent;
      recommendations = framinghamResult.recommendations;
      fullResult = framinghamResult;
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be IDRS or FRAMINGHAM_CVD." },
        { status: 400 }
      );
    }

    const saved = await prisma.diseaseRiskAssessment.create({
      data: {
        userId: user.id,
        type,
        score,
        category,
        riskPercent,
        factors: JSON.stringify(inputs),
        recommendations: JSON.stringify(recommendations),
      },
    });

    return NextResponse.json({
      ok: true,
      assessment: {
        ...saved,
        factors: inputs,
        recommendations,
      },
      result: fullResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
