"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { generateFitnessPlan } from "@/lib/rules/domains/fitness";

const planSchema = z.object({
  goal: z.enum(["weight_loss", "muscle_gain", "cardiovascular", "mobility"]),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.number().int().min(3).max(6),
  minutesPerSession: z.number().int().min(20).max(90),
});

export async function createFitnessPlanAction(input: z.infer<typeof planSchema>) {
  const user = await requireUser();
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  // Deactivate existing plans
  await prisma.fitnessPlan.updateMany({
    where: { userId: user.id, active: true },
    data: { active: false },
  });

  const plan = await prisma.fitnessPlan.create({
    data: {
      userId: user.id,
      goal: parsed.data.goal,
      fitnessLevel: parsed.data.fitnessLevel,
      daysPerWeek: parsed.data.daysPerWeek,
      minutesPerSession: parsed.data.minutesPerSession,
      active: true,
    },
  });

  await audit({
    userId: user.id,
    action: "FITNESS_PLAN_CREATE",
    entity: "FitnessPlan",
    entityId: plan.id,
    metadata: parsed.data,
  });

  revalidatePath("/app/plans");
  revalidatePath("/app/plans/fitness");
  return { ok: true, data: plan };
}

export async function getActiveFitnessPlan() {
  const user = await requireUser();
  const plan = await prisma.fitnessPlan.findFirst({
    where: { userId: user.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  if (!plan) return null;

  const generated = generateFitnessPlan(
    plan.goal as "weight_loss" | "muscle_gain" | "cardiovascular" | "mobility",
    plan.fitnessLevel as "beginner" | "intermediate" | "advanced",
    plan.daysPerWeek,
    plan.minutesPerSession
  );

  return {
    ...plan,
    generatedSchedule: generated.weeklySchedule,
  };
}
