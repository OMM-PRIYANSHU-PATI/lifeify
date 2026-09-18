import { NextResponse } from "next/server";
import { healthIntelligenceEngine } from "@/lib/core-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId = "demo_patient_001", type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: "Type and data are required" },
        { status: 400 }
      );
    }

    if (type === "WORKOUT") {
      healthIntelligenceEngine.recordWorkout({
        id: `wo_${Date.now()}`,
        userId,
        workoutType: data.workoutType || "Conditioning",
        durationMinutes: Number(data.durationMinutes) || 30,
        intensity: data.intensity || "MODERATE",
        averageHeartRate: data.averageHeartRate ? Number(data.averageHeartRate) : undefined,
        caloriesBurned: data.caloriesBurned ? Number(data.caloriesBurned) : undefined,
        capturedAt: new Date(),
        sourceType: "MANUAL"
      });
    } else if (type === "SLEEP") {
      const durationMin = Math.round((Number(data.durationHours) || 7.5) * 60);
      healthIntelligenceEngine.recordSleep({
        id: `sl_${Date.now()}`,
        userId,
        startTime: new Date(Date.now() - durationMin * 60 * 1000),
        endTime: new Date(),
        totalDurationMinutes: durationMin,
        efficiencyPercent: Number(data.efficiencyPercent) || 90,
        awakeningsCount: Number(data.awakeningsCount) || 1,
        deepSleepMinutes: Math.round(durationMin * 0.2),
        lightSleepMinutes: Math.round(durationMin * 0.55),
        remSleepMinutes: Math.round(durationMin * 0.2),
        awakeMinutes: Math.round(durationMin * 0.05),
        restingHeartRate: data.restingHeartRate ? Number(data.restingHeartRate) : undefined,
        sourceType: "MANUAL"
      });
    } else if (type === "MEDICATION") {
      healthIntelligenceEngine.recordMedication({
        id: `med_${Date.now()}`,
        userId,
        medicationId: data.medicationId || "med_custom",
        medicationName: data.medicationName || "Prescribed Medication",
        dosage: data.dosage || "Standard Dose",
        scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : new Date(),
        actualTime: data.actualTime
          ? new Date(data.actualTime)
          : data.eventType === "TAKEN"
          ? data.scheduledTime
            ? new Date(data.scheduledTime)
            : new Date()
          : undefined,
        eventType: data.eventType || "TAKEN",
        sourceType: "MANUAL",
        isUserConfirmed: true
      });
    } else if (type === "SYMPTOM") {
      healthIntelligenceEngine.recordSymptom({
        id: `sym_${Date.now()}`,
        userId,
        symptomName: data.symptomName || "General Discomfort",
        severity: Number(data.severity) || 5,
        onsetAt: data.onsetAt ? new Date(data.onsetAt) : new Date(),
        durationHours: Number(data.durationHours) || 2,
        notes: data.notes,
        sourceType: "MANUAL"
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported log type" },
        { status: 400 }
      );
    }

    // Return the recalculated health overview
    const updatedOverview = healthIntelligenceEngine.generateOverviewSync(userId);

    return NextResponse.json({
      success: true,
      message: `${type} recorded successfully`,
      data: updatedOverview
    });
  } catch (error: any) {
    console.error("[HEALTH_LOG_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record health event" },
      { status: 500 }
    );
  }
}
