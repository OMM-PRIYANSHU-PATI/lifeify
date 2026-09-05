import "server-only";
import { prisma } from "@/lib/prisma";
import { frequencyToTimes, slotForTime } from "@/lib/types";
import { startOfDay, addDays } from "@/lib/utils";
import { matchAllergies, matchDuplicateIngredient } from "@/lib/rules";

// Medication workflow engine: schedule generation, dose lifecycle,
// stock tracking, and adherence — all deterministic (Phases 10–14).

export type CreateMedicationInput = {
  userId: string;
  name: string;
  activeIngredient?: string | null;
  dose?: string | null;
  doseUnit?: string | null;
  frequency: string;
  customTimes?: string[];
  durationDays?: number | null;
  condition?: string | null;
  startDate?: Date;
  instructions?: string | null;
  prescribedBy?: string | null;
  prescriptionId?: string | null;
  initialStockQty?: number | null;
  stockUnit?: string;
};

export async function createMedication(input: CreateMedicationInput) {
  const times = frequencyToTimes(input.frequency, input.customTimes ?? []);
  const startDate = input.startDate ?? new Date();
  const endDate = input.durationDays ? addDays(startDate, input.durationDays) : null;

  const medication = await prisma.medication.create({
    data: {
      userId: input.userId,
      prescriptionId: input.prescriptionId,
      name: input.name,
      activeIngredient: input.activeIngredient,
      dose: input.dose,
      doseUnit: input.doseUnit,
      frequency: input.frequency,
      timesOfDay: JSON.stringify(times),
      durationDays: input.durationDays,
      condition: input.condition,
      startDate,
      endDate,
      instructions: input.instructions,
      prescribedBy: input.prescribedBy,
    },
  });

  for (const time of times) {
    await prisma.medicationSchedule.create({
      data: {
        userId: input.userId,
        medicationId: medication.id,
        slot: slotForTime(time),
        time,
      },
    });
  }

  if (input.initialStockQty != null && input.initialStockQty > 0) {
    await prisma.medicationStock.create({
      data: {
        userId: input.userId,
        medicationId: medication.id,
        initialQty: input.initialStockQty,
        initialQuantity: input.initialStockQty,
        remainingQty: input.initialStockQty,
        unit: input.stockUnit ?? "tablets",
      },
    });
  }

  // Generate dose instances for the treatment window (cap 60 days ahead for safety).
  if (times.length > 0) {
    const horizon = endDate ? Math.min(60, input.durationDays ?? 60) : 14;
    const doses: Array<{ userId: string; medicationId: string; scheduledAt: Date }> = [];
    for (let d = 0; d < horizon; d++) {
      const day = addDays(startOfDay(startDate), d);
      if (endDate && day >= endDate) break;
      for (const time of times) {
        const [h, m] = time.split(":").map(Number);
        const at = new Date(day);
        at.setHours(h ?? 9, m ?? 0, 0, 0);
        if (at >= startDate) doses.push({ userId: input.userId, medicationId: medication.id, scheduledAt: at });
      }
    }
    await prisma.medicationDose.createMany({ data: doses });
  }

  return medication;
}

export async function markDose(doseId: string, userId: string, status: "TAKEN" | "SKIPPED" | "MISSED" | "SNOOZED") {
  const dose = await prisma.medicationDose.findFirst({
    where: { id: doseId, userId },
    include: { medication: { include: { stock: true } } },
  });
  if (!dose) throw new Error("DOSE_NOT_FOUND");

  const updated = await prisma.medicationDose.update({
    where: { id: doseId },
    data: {
      status,
      takenAt: status === "TAKEN" ? new Date() : null,
      snoozedUntil: status === "SNOOZED" ? new Date(Date.now() + 30 * 60 * 1000) : null,
    },
  });

  if (status === "TAKEN" && dose.medication.stock) {
    const stock = dose.medication.stock;
    const remaining = Math.max(0, stock.remainingQty - 1);
    await prisma.medicationStock.update({ where: { id: stock.id }, data: { remainingQty: remaining } });
  }

  return updated;
}

export function stockDaysRemaining(remainingQty: number, dailyRequired: number): number {
  if (dailyRequired <= 0) return Infinity;
  return remainingQty / dailyRequired;
}

export type AdherenceStats = { today: number; week: number; treatment: number };

export async function getAdherenceStats(userId: string): Promise<AdherenceStats> {
  const pct = async (gte: Date, lte?: Date): Promise<number> => {
    const where = { userId, scheduledAt: { gte, ...(lte ? { lt: lte } : {}) } };
    const [taken, total] = await Promise.all([
      prisma.medicationDose.count({ where: { ...where, status: "TAKEN" } }),
      prisma.medicationDose.count({ where: { ...where, status: { in: ["TAKEN", "MISSED", "SKIPPED"] } } }),
    ]);
    return total === 0 ? 100 : Math.round((taken / total) * 100);
  };

  const todayStart = startOfDay(new Date());
  const weekStart = addDays(todayStart, -6);
  const today = await pct(todayStart, addDays(todayStart, 1));
  const week = await pct(weekStart);

  const firstMed = await prisma.medication.findFirst({ where: { userId }, orderBy: { startDate: "asc" } });
  const treatment = firstMed ? await pct(firstMed.startDate) : 100;

  return { today, week, treatment };
}

// Allergy matching (Phase 12): compare a candidate medicine/ingredient against
// the user's allergy profile. Explicit confirmation is required by the caller.
export async function checkAllergyMatch(userId: string, name: string, activeIngredient?: string | null) {
  const allergies = await prisma.medicationAllergy.findMany({ where: { userId } });
  const substances = allergies.map((a) => a.substance || a.name).filter(Boolean);
  const matchedSubstances = matchAllergies(substances, name, activeIngredient);
  return allergies.filter((a) => matchedSubstances.includes(a.substance || a.name));
}

// Duplicate detection (Phase 13): same active ingredient across two active
// medications, using the curated DrugReference table (never LLM knowledge).
export async function checkDuplicateIngredient(userId: string, candidateName: string, candidateIngredient?: string | null) {
  const refs = await prisma.drugReference.findMany();
  const drugRefs = refs.map((r) => ({
    brandName: r.brandName || r.name,
    activeIngredient: r.activeIngredient || r.saltName,
  }));

  const activeMeds = await prisma.medication.findMany({ where: { userId, active: true } });
  const candidate = { id: "", name: candidateName, activeIngredient: candidateIngredient ?? null };
  const duplicates = matchDuplicateIngredient(
    activeMeds.map((m) => ({ id: m.id, name: m.name, activeIngredient: m.activeIngredient || m.saltName })),
    candidate,
    drugRefs
  );

  const warnings: string[] = [];
  if (duplicates.length > 0 && duplicates[0].activeIngredient) {
    warnings.push(
      `Possible duplicate active ingredient: "${duplicates[0].activeIngredient}" is already present in ${duplicates.map((d: { name: string }) => d.name).join(", ")}. Please confirm with your doctor or pharmacist before taking both.`
    );
  }
  return { duplicates, warnings };
}
