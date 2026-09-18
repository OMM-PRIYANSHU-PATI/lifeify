import { NextResponse } from "next/server";
import { productionGeminiProvider } from "@/lib/core-engine/providers/gemini-provider";
import { safetyEngine } from "@/lib/core-engine/safety/safety-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, symptoms, vitals, contextSummary } = body;

    if (action === "ANALYZE_SYMPTOMS") {
      if (!Array.isArray(symptoms) || symptoms.length === 0) {
        return NextResponse.json(
          { success: false, error: "Symptoms array is required" },
          { status: 400 }
        );
      }

      const analysis = await productionGeminiProvider.analyzeSymptomPattern(
        symptoms,
        vitals,
        contextSummary
      );

      const safetyCheck = safetyEngine.validateAndSanitize(analysis.summary);
      analysis.summary = safetyCheck.sanitizedText;

      return NextResponse.json({
        success: true,
        data: analysis,
        safety: {
          isSafe: safetyCheck.isSafe,
          triggeredEmergencyEscalation: safetyCheck.triggeredEmergencyEscalation
        }
      });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported intelligence action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[HEALTH_INTELLIGENCE_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process intelligence request" },
      { status: 500 }
    );
  }
}
