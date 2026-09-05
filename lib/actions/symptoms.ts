"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const symptomSchema = z.object({
  name: z.string().trim().min(2, "Symptom name required").max(100),
  medicationId: z.string().optional(),
  severity: z.enum(["mild", "moderate", "severe"]),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().max(500).optional(),
  notes: z.string().max(500).optional(), // suspected triggers
});

const RED_FLAG_SYMPTOMS = [
  "chest pain",
  "shortness of breath",
  "difficulty breathing",
  "swelling of face",
  "swelling of lips",
  "severe dizziness",
  "fainting",
  "sudden weakness",
  "severe rash",
];

export async function logSymptomAction(input: z.infer<typeof symptomSchema>) {
  const user = await requireUser();
  const parsed = symptomSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid symptom input" };

  const nameLower = parsed.data.name.toLowerCase();
  const isRedFlag = RED_FLAG_SYMPTOMS.some((flag) => nameLower.includes(flag)) || parsed.data.severity === "severe";

  const symptom = await prisma.sideEffect.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      medicationId: parsed.data.medicationId || null,
      severity: parsed.data.severity,
      frequency: parsed.data.frequency || null,
      duration: parsed.data.duration || null,
      description: parsed.data.description || null,
      notes: parsed.data.notes || null,
      redFlag: isRedFlag,
      startedAt: new Date(),
    },
  });

  await audit({
    userId: user.id,
    action: "SYMPTOM_LOG",
    entity: "SideEffect",
    entityId: symptom.id,
    metadata: { ...parsed.data, isRedFlag },
  });

  revalidatePath("/app/medications");
  return { ok: true, data: symptom, isRedFlag };
}

export async function getSymptomHistory() {
  const user = await requireUser();
  return prisma.sideEffect.findMany({
    where: { userId: user.id },
    include: { medication: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function createADRReportAction(sideEffectId: string) {
  const user = await requireUser();
  const effect = await prisma.sideEffect.findFirst({
    where: { id: sideEffectId, userId: user.id },
    include: { medication: true },
  });

  if (!effect) return { ok: false, error: "Symptom record not found" };

  const report = await prisma.aDRReport.create({
    data: {
      userId: user.id,
      sideEffectId: effect.id,
      medicationId: effect.medicationId,
      summary: `Adverse Drug Reaction Report: ${effect.name} (${effect.severity}) associated with ${effect.medication?.name ?? "unspecified medication"}.`,
      content: JSON.stringify({
        symptom: effect.name,
        severity: effect.severity,
        frequency: effect.frequency,
        duration: effect.duration,
        medication: effect.medication?.name,
        activeIngredient: effect.medication?.activeIngredient,
        reportedAt: new Date().toISOString(),
      }),
      status: "ready",
    },
  });

  await audit({
    userId: user.id,
    action: "ADR_REPORT_GENERATE",
    entity: "ADRReport",
    entityId: report.id,
  });

  revalidatePath("/app/medications");
  return { ok: true, data: report };
}
