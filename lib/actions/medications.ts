"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { createMedication, markDose, checkAllergyMatch, checkDuplicateIngredient } from "@/services/medications";
import { FREQUENCIES, SEVERITIES } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/logs";

const addMedSchema = z.object({
  name: z.string().trim().min(1, "Medicine name is required").max(100),
  activeIngredient: z.string().trim().max(100).optional(),
  dose: z.string().trim().max(30).optional(),
  doseUnit: z.string().trim().max(20).optional(),
  frequency: z.enum(FREQUENCIES),
  customTimes: z.array(z.string().regex(/^\d{2}:\d{2}$/)).max(6).optional(),
  durationDays: z.number().int().min(1).max(365).optional(),
  condition: z.string().max(60).optional(),
  instructions: z.string().trim().max(300).optional(),
  prescribedBy: z.string().trim().max(100).optional(),
  initialStockQty: z.number().int().min(0).max(1000).optional(),
  stockUnit: z.string().max(20).optional(),
});

export type AddMedInput = z.input<typeof addMedSchema>;

export async function addMedication(input: AddMedInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = addMedSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid medication" };

  const d = parsed.data;
  const allergyMatches = await checkAllergyMatch(user.id, d.name, d.activeIngredient);
  if (allergyMatches.length > 0) {
    return { ok: false, error: `Allergy warning: "${allergyMatches[0].substance}" is in your allergy list. Do not add this medicine without confirming with your doctor.` };
  }

  const { warnings } = await checkDuplicateIngredient(user.id, d.name, d.activeIngredient);
  // Duplicates are allowed after explicit user awareness — surface via notification.
  if (warnings.length > 0) {
    await prisma.medicineDuplicateAlert.createMany({
      data: warnings.map(() => ({ userId: user.id, medicationAId: "", medicationBId: "", ingredient: d.name })),
    }).catch(() => undefined);
  }

  const med = await createMedication({
    userId: user.id,
    name: d.name,
    activeIngredient: d.activeIngredient || null,
    dose: d.dose || null,
    doseUnit: d.doseUnit || null,
    frequency: d.frequency,
    customTimes: d.customTimes,
    durationDays: d.durationDays ?? null,
    condition: d.condition || null,
    instructions: d.instructions || null,
    prescribedBy: d.prescribedBy || null,
    initialStockQty: d.initialStockQty ?? null,
    stockUnit: d.stockUnit,
  });

  await audit({ userId: user.id, action: "MEDICATION_ADDED", entity: "Medication", entityId: med.id, metadata: { name: d.name } });
  revalidatePath("/app/medications");
  revalidatePath("/app/dashboard");
  return { ok: true, message: `${d.name} added to your regimen` };
}

export async function markDoseAction(doseId: string, status: "TAKEN" | "SKIPPED" | "SNOOZED"): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await markDose(doseId, user.id, status);
  } catch {
    return { ok: false, error: "Dose not found" };
  }
  revalidatePath("/app/dashboard");
  revalidatePath("/app/medications");
  return { ok: true, message: status === "TAKEN" ? "Marked as taken" : status === "SKIPPED" ? "Marked as skipped" : "Snoozed 30 minutes" };
}

export async function refillStock(medicationId: string, qty: number): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z.number().int().min(1).max(1000).safeParse(qty);
  if (!parsed.success) return { ok: false, error: "Enter a valid quantity" };
  const stock = await prisma.medicationStock.findFirst({ where: { medicationId, medication: { userId: user.id } } });
  if (!stock) return { ok: false, error: "Stock record not found" };
  await prisma.medicationStock.update({
    where: { id: stock.id },
    data: {
      remainingQty: stock.remainingQty + parsed.data,
      initialQty: (stock.initialQty ?? stock.initialQuantity ?? 0) + parsed.data,
      initialQuantity: stock.initialQuantity + parsed.data,
    },
  });
  await audit({ userId: user.id, action: "STOCK_REFILLED", entity: "Medication", entityId: medicationId, metadata: { qty } });
  revalidatePath("/app/medications");
  return { ok: true, message: `Refilled ${parsed.data} ${stock.unit}` };
}

export async function deactivateMedication(medicationId: string): Promise<ActionResult> {
  const user = await requireUser();
  const med = await prisma.medication.findFirst({ where: { id: medicationId, userId: user.id } });
  if (!med) return { ok: false, error: "Medication not found" };
  await prisma.medication.update({ where: { id: medicationId }, data: { active: false } });
  await prisma.medicationDose.updateMany({
    where: { medicationId, status: { in: ["PENDING", "SNOOZED"] } },
    data: { status: "MISSED" },
  });
  await audit({ userId: user.id, action: "MEDICATION_STOPPED", entity: "Medication", entityId: medicationId });
  revalidatePath("/app/medications");
  return { ok: true, message: `${med.name} marked as stopped` };
}

export async function addAllergy(substance: string, severity?: string, reaction?: string): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z.string().trim().min(1).max(60).safeParse(substance);
  if (!parsed.success) return { ok: false, error: "Enter a valid substance" };
  await prisma.medicationAllergy.create({
    data: { userId: user.id, substance: parsed.data, severity: severity ?? null, reaction: reaction || null },
  });
  revalidatePath("/app/settings");
  return { ok: true, message: "Allergy added" };
}

const checkinSchema = z.object({
  feelingScore: z.number().int().min(1).max(5),
  comparison: z.enum(["WORSE", "SAME", "BETTER"]).optional(),
  sideEffects: z.array(z.string().max(60)).max(10).optional(),
});

export async function submitMedCheckin(medicationId: string, feelingScore: number, comparison?: "WORSE" | "SAME" | "BETTER", sideEffects?: string[]): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = checkinSchema.safeParse({ feelingScore, comparison, sideEffects });
  if (!parsed.success) return { ok: false, error: "Invalid check-in" };

  const med = await prisma.medication.findFirst({ where: { id: medicationId, userId: user.id } });
  if (!med) return { ok: false, error: "Medication not found" };

  const daysOnMed = Math.max(1, Math.ceil((Date.now() - new Date(med.startDate).getTime()) / 86_400_000));
  const weekNumber = Math.ceil(daysOnMed / 7);

  const weekStart = new Date(Date.now() - 7 * 86_400_000);
  const [taken, scheduled] = await Promise.all([
    prisma.medicationDose.count({ where: { medicationId, scheduledAt: { gte: weekStart }, status: "TAKEN" } }),
    prisma.medicationDose.count({ where: { medicationId, scheduledAt: { gte: weekStart }, status: { in: ["TAKEN", "MISSED", "SKIPPED"] } } }),
  ]);
  const adherence = scheduled > 0 ? Math.round((taken / scheduled) * 100) : null;

  await prisma.medCheckin.create({
    data: {
      userId: user.id,
      medicationId,
      weekNumber,
      feelingScore: parsed.data.feelingScore,
      comparison: parsed.data.comparison,
      sideEffects: parsed.data.sideEffects ? JSON.stringify(parsed.data.sideEffects) : undefined,
      adherence,
    },
  });
  await audit({ userId: user.id, action: "MED_CHECKIN", entity: "Medication", entityId: medicationId });
  revalidatePath("/app/medications");
  return { ok: true, message: "Weekly check-in complete" };
}

const sideEffectSchema = z.object({
  medicationId: z.string().min(1),
  name: z.string().trim().min(1, "Describe the side effect").max(120),
  startedAt: z.string().optional(),
  severity: z.enum(SEVERITIES),
  frequency: z.string().max(20).optional(),
  duration: z.string().max(60).optional(),
  description: z.string().max(1000).optional(),
});

const RED_FLAG_SIDE_EFFECTS = [
  "anaphylaxis", "swelling of face", "swelling of throat", "difficulty breathing", "chest pain",
  "severe rash", "yellowing of skin", "yellowing of eyes", "blood in stool", "blood in urine",
  "fainting", "severe dizziness", "irregular heartbeat",
];

export async function reportSideEffect(input: {
  medicationId: string; name: string; startedAt?: string; severity: "MILD" | "MODERATE" | "SEVERE";
  frequency?: string; duration?: string; description?: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = sideEffectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid report" };
  const d = parsed.data;

  const med = await prisma.medication.findFirst({ where: { id: d.medicationId, userId: user.id } });
  if (!med) return { ok: false, error: "Medication not found" };

  const redFlag = RED_FLAG_SIDE_EFFECTS.some((f) => d.name.toLowerCase().includes(f)) || d.severity === "SEVERE";

  const sideEffect = await prisma.sideEffect.create({
    data: {
      userId: user.id,
      medicationId: d.medicationId,
      name: d.name,
      startedAt: d.startedAt ? new Date(d.startedAt) : null,
      severity: d.severity,
      frequency: d.frequency || null,
      duration: d.duration || null,
      description: d.description || null,
      redFlag,
    },
  });

  await audit({ userId: user.id, action: "SIDE_EFFECT_REPORTED", entity: "SideEffect", entityId: sideEffect.id, metadata: { redFlag } });
  revalidatePath("/app/side-effects");
  return { ok: true, message: redFlag
    ? "Reported. Your description includes a serious symptom — please contact your doctor or seek medical care promptly. Do not wait."
    : "Side effect reported. You can generate a doctor summary from the ADR page." };
}

export async function resolveSideEffect(sideEffectId: string): Promise<ActionResult> {
  const user = await requireUser();
  const se = await prisma.sideEffect.findFirst({ where: { id: sideEffectId, userId: user.id } });
  if (!se) return { ok: false, error: "Report not found" };
  await prisma.sideEffect.update({ where: { id: sideEffectId }, data: { resolved: true, resolvedAt: new Date() } });
  revalidatePath("/app/side-effects");
  return { ok: true, message: "Marked as resolved" };
}

export async function generateAdrReport(sideEffectId: string): Promise<ActionResult> {
  const user = await requireUser();
  const se = await prisma.sideEffect.findFirst({
    where: { id: sideEffectId, userId: user.id },
    include: { medication: true },
  });
  if (!se) return { ok: false, error: "Report not found" };

  const profile = await prisma.healthProfile.findUnique({ where: { userId: user.id } });
  const content = {
    patient: { name: user.name ?? "—", age: profile?.age ?? null, sex: profile?.sex ?? null, weightKg: profile?.weightKg ?? null },
    medication: { name: se.medication?.name ?? "—", dose: se.medication?.dose ? `${se.medication.dose}${se.medication.doseUnit ?? ""}` : "—", startDate: se.medication?.startDate ?? null },
    reaction: { name: se.name, onset: se.startedAt, severity: se.severity, frequency: se.frequency, duration: se.duration, description: se.description, outcome: se.resolved ? "Resolved" : "Ongoing" },
    timeline: { reportDate: new Date().toISOString(), reactionStart: se.startedAt?.toISOString() ?? null },
    disclaimer: "Structured consumer ADR report generated by LIFEIFY for discussion with a healthcare professional. Not a regulatory submission. PvPI-format export is gated behind legal/regulatory review.",
  };

  const report = await prisma.aDRReport.create({
    data: { userId: user.id, medicationId: se.medicationId, sideEffectId: se.id, content: JSON.stringify(content) },
  });
  await audit({ userId: user.id, action: "ADR_REPORT_GENERATED", entity: "ADRReport", entityId: report.id });
  revalidatePath("/app/side-effects");
  return { ok: true, message: "ADR report created — download the PDF below." };
}
