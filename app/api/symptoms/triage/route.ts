import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { evaluateSymptomTriage, SymptomAssessmentInput } from "@/lib/rules/symptom-triage";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: SymptomAssessmentInput = await req.json();
    const triage = evaluateSymptomTriage(body);

    return NextResponse.json({
      ok: true,
      triage,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
