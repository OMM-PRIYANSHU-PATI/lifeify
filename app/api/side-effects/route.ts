import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const RED_FLAG_SYMPTOMS = [
  "chest pain",
  "shortness of breath",
  "difficulty breathing",
  "swelling of face",
  "swelling of lips",
  "swelling of throat",
  "severe dizziness",
  "fainting",
  "sudden weakness",
  "severe rash",
  "yellowing of skin",
  "yellowing of eyes",
  "blood in stool",
  "blood in urine",
];

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sideEffects = await prisma.sideEffect.findMany({
    where: { userId: user.id },
    include: {
      medication: true,
      adrReports: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, sideEffects });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      name,
      medicationId,
      severity = "moderate",
      frequency,
      duration,
      description,
      notes,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Symptom or side effect name is required" }, { status: 400 });
    }

    const nameLower = name.trim().toLowerCase();
    const isRedFlag =
      RED_FLAG_SYMPTOMS.some((flag) => nameLower.includes(flag)) ||
      severity.toLowerCase() === "severe";

    const sideEffect = await prisma.sideEffect.create({
      data: {
        userId: user.id,
        medicationId: medicationId || null,
        name: name.trim(),
        severity: severity.toLowerCase(),
        frequency: frequency || null,
        duration: duration || null,
        description: description || null,
        notes: notes || null,
        redFlag: isRedFlag,
        startedAt: new Date(),
      },
      include: {
        medication: true,
      },
    });

    await audit({
      userId: user.id,
      action: "SIDE_EFFECT_REPORTED",
      entity: "SideEffect",
      entityId: sideEffect.id,
      metadata: { name: sideEffect.name, redFlag: isRedFlag },
    });

    return NextResponse.json({
      ok: true,
      sideEffect,
      redFlagWarning: isRedFlag
        ? "Warning: Your report includes high-urgency symptoms. Please seek professional medical evaluation immediately."
        : null,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
