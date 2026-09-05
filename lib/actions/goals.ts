"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const goalSchema = z.object({
  type: z.enum(["steps", "water", "sleep", "weight", "adherence"]),
  target: z.number().positive(),
  unit: z.string().min(1).max(20),
  period: z.enum(["DAILY", "WEEKLY"]).default("DAILY"),
});

export type GoalInput = z.infer<typeof goalSchema>;

export async function createGoalAction(input: GoalInput) {
  const user = await requireUser();
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid goal input" };
  }

  const goal = await prisma.healthGoal.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      target: parsed.data.target,
      unit: parsed.data.unit,
      period: parsed.data.period,
      status: "ACTIVE",
    },
  });

  await audit({
    userId: user.id,
    action: "GOAL_CREATE",
    entity: "HealthGoal",
    entityId: goal.id,
    metadata: parsed.data,
  });

  revalidatePath("/app/insights");
  revalidatePath("/app/dashboard");
  return { ok: true, data: goal };
}

export async function logGoalProgressAction(goalId: string, achieved: number) {
  const user = await requireUser();
  const goal = await prisma.healthGoal.findFirst({
    where: { id: goalId, userId: user.id },
  });

  if (!goal) return { ok: false, error: "Goal not found" };

  const periodKey = new Date().toISOString().slice(0, 10);
  const hit = achieved >= goal.target;

  const progress = await prisma.healthGoalProgress.upsert({
    where: { goalId_periodKey: { goalId, periodKey } },
    create: {
      userId: user.id,
      goalId,
      periodKey,
      achieved,
      target: goal.target,
      hit,
    },
    update: {
      achieved,
      hit,
    },
  });

  revalidatePath("/app/insights");
  revalidatePath("/app/dashboard");
  return { ok: true, data: progress };
}

export async function getUserGoalsWithProgress() {
  const user = await requireUser();
  const todayKey = new Date().toISOString().slice(0, 10);

  const goals = await prisma.healthGoal.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: {
      progress: {
        where: { periodKey: todayKey },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return goals.map((g) => {
    const todayProgress = g.progress[0];
    const achieved = todayProgress ? todayProgress.achieved : 0;
    const hit = todayProgress ? todayProgress.hit : false;
    const percent = Math.min(100, Math.round((achieved / g.target) * 100));

    return {
      id: g.id,
      type: g.type,
      target: g.target,
      unit: g.unit,
      period: g.period,
      achieved,
      hit,
      percent,
    };
  });
}
