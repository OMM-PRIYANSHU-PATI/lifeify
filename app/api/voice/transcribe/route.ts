import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseVoiceCommand } from "@/lib/voice/parser";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { transcript, audioUrl } = body;

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return NextResponse.json({ error: "Transcript text is required" }, { status: 400 });
    }

    // Deterministic rule-based grammar parsing
    const parsed = parseVoiceCommand(transcript.trim());

    // Save draft voice log (non-committed)
    const voiceLog = await prisma.voiceLog.create({
      data: {
        userId: user.id,
        transcript: transcript.trim(),
        audioPath: audioUrl || null,
        intent: parsed.action,
        parsedJson: JSON.stringify(parsed.data),
        confirmed: false,
      },
    });

    return NextResponse.json({
      ok: true,
      logId: voiceLog.id,
      transcript: transcript.trim(),
      action: parsed.action,
      data: parsed.data,
      requiresConfirmation: true,
      confirmationPrompt: `Are you sure you want to log: ${parsed.action} with ${JSON.stringify(parsed.data)}?`,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
