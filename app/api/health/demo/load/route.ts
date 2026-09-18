import { NextResponse } from "next/server";
import { healthIntelligenceEngine } from "@/lib/core-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId || "demo_patient_001";

    const result = healthIntelligenceEngine.load90DayDemoScenario(userId);

    return NextResponse.json({
      success: true,
      message: "Successfully initialized 90-day synthetic longitudinal dataset",
      data: result
    });
  } catch (error: any) {
    console.error("[HEALTH_DEMO_LOAD_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load demo scenario" },
      { status: 500 }
    );
  }
}
