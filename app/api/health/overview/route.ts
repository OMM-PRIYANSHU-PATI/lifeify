import { NextResponse } from "next/server";
import { healthIntelligenceEngine } from "@/lib/core-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo_patient_001";

    const overview = await healthIntelligenceEngine.generateOverviewAsync(userId);

    return NextResponse.json({
      success: true,
      data: overview
    });
  } catch (error: any) {
    console.error("[HEALTH_OVERVIEW_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate health intelligence overview"
      },
      { status: 500 }
    );
  }
}
