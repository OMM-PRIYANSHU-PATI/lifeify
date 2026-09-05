"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { parseVoiceTranscript, ParsedVoiceIntent } from "@/lib/voice/parser";

export async function processVoiceTranscriptAction(transcript: string) {
  const user = await requireUser();
  const parsed = parseVoiceTranscript(transcript);

  // Store unconfirmed draft VoiceLog
  const voiceLog = await prisma.voiceLog.create({
    data: {
      userId: user.id,
      transcript,
      intent: parsed.intent,
      parsedJson: JSON.stringify(parsed),
      confirmed: false,
    },
  });

  return {
    ok: true,
    voiceLogId: voiceLog.id,
    transcript,
    parsed,
  };
}

export async function confirmVoiceLogAction(voiceLogId: string, customData?: Record<string, unknown>) {
  const user = await requireUser();
  const voiceLog = await prisma.voiceLog.findFirst({
    where: { id: voiceLogId, userId: user.id },
  });

  if (!voiceLog) return { ok: false, error: "Draft voice log not found" };
  if (voiceLog.confirmed) return { ok: false, error: "Log has already been confirmed" };

  const parsed: ParsedVoiceIntent = customData
    ? (customData as unknown as ParsedVoiceIntent)
    : JSON.parse(voiceLog.parsedJson ?? "{}");

  const now = new Date();

  // Route to corresponding database model based on intent
  if (parsed.intent === "water" || parsed.intent === "steps" || parsed.intent === "sleep" || parsed.intent === "weight" || parsed.intent === "mood") {
    const val = Number(parsed.data.value ?? parsed.data.score ?? 0);
    const unit = String(parsed.data.unit ?? "");

    await prisma.healthLog.create({
      data: {
        userId: user.id,
        type: String(parsed.data.type ?? parsed.intent),
        value: val,
        unit,
        startTime: now,
        source: "voice",
        metadata: JSON.stringify({ transcript: voiceLog.transcript }),
      },
    });
  } else if (parsed.intent === "vital_bp") {
    await prisma.vitalReading.create({
      data: {
        userId: user.id,
        type: "BP",
        systolic: Number(parsed.data.systolic),
        diastolic: Number(parsed.data.diastolic),
        unit: "mmHg",
        takenAt: now,
        source: "voice",
      },
    });
  } else if (parsed.intent === "vital_glucose") {
    await prisma.vitalReading.create({
      data: {
        userId: user.id,
        type: "GLUCOSE",
        value: Number(parsed.data.value),
        unit: "mg/dL",
        context: String(parsed.data.context ?? "random"),
        takenAt: now,
        source: "voice",
      },
    });
  } else if (parsed.intent === "medication") {
    // Find matching medication
    const medName = String(parsed.data.medicineName ?? "");
    const matchingMed = await prisma.medication.findFirst({
      where: {
        userId: user.id,
        name: { contains: medName },
        active: true,
      },
    });

    if (matchingMed) {
      await prisma.medicationDose.create({
        data: {
          userId: user.id,
          medicationId: matchingMed.id,
          scheduledAt: now,
          takenAt: now,
          status: "taken",
          notes: `Logged via voice: "${voiceLog.transcript}"`,
        },
      });
    }
  }

  // Mark draft as confirmed
  await prisma.voiceLog.update({
    where: { id: voiceLog.id },
    data: { confirmed: true },
  });

  await audit({
    userId: user.id,
    action: "VOICE_LOG_CONFIRMED",
    entity: "VoiceLog",
    entityId: voiceLog.id,
    metadata: { intent: parsed.intent, transcript: voiceLog.transcript },
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/voice");
  revalidatePath("/app/medications");

  return { ok: true, message: "Logged to your health record!" };
}
