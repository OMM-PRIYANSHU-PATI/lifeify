import { NextRequest, NextResponse } from "next/server";
import {
  analyzeSymptomsWithGemini,
  SymptomToDiseaseAnalysisInput,
} from "@/lib/medical/gemini-symptom-analyzer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SymptomToDiseaseAnalysisInput;

    if (
      (!body.symptoms || !Array.isArray(body.symptoms) || body.symptoms.length === 0) &&
      !body.freeText
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please provide at least one symptom or describe your symptoms in text.",
        },
        { status: 400 }
      );
    }

    const result = await analyzeSymptomsWithGemini({
      symptoms: body.symptoms || [],
      freeText: body.freeText,
      age: body.age ? Number(body.age) : 35,
      gender: body.gender || "MALE",
      severity: body.severity ? Number(body.severity) : 5,
      durationDays: body.durationDays ? Number(body.durationDays) : 3,
      vitals: body.vitals,
      answeredQuestions: body.answeredQuestions,
    });

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Symptom to Disease Analyzer API error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to analyze symptoms",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symptomsParam = searchParams.get("symptoms") || searchParams.get("q") || "Fever,Cough,Fatigue";
    const symptoms = symptomsParam.split(",").map((s) => s.trim()).filter(Boolean);

    const result = await analyzeSymptomsWithGemini({
      symptoms,
      age: 35,
      severity: 6,
      durationDays: 3,
    });

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to process query" },
      { status: 500 }
    );
  }
}
