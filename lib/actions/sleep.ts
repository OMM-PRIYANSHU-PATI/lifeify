"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { generateSleepPlan } from "@/lib/rules/domains/sleep";

const sleepSchema = z.object({
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/, "Wake time must be HH:mm"),
  cycles: z.union([z.literal(4), z.literal(5), z.literal(6)]).default(5),
});

export async function createSleepPlanAction(input: z.infer<typeof sleepSchema>) {
  const user = await requireUser();
  const parsed = sleepSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid sleep parameters" };

  const generated = generateSleepPlan(parsed.data.wakeTime, parsed.data.cycles);

  // Deactivate older plans
  await prisma.sleepPlan.updateMany({
    where: { userId: user.id, active: true },
    data: { active: false },
  });

  const plan = await prisma.sleepPlan.create({
    data: {
      userId: user.id,
      targetDurationH: generated.targetDurationH,
      bedtime: generated.bedtime,
      wakeTime: generated.wakeTime,
      caffeineCutoff: generated.caffeineCutoff,
      windDownMinutes: generated.windDownMinutes,
      active: true,
    },
  });

  await audit({
    userId: user.id,
    action: "SLEEP_PLAN_CREATE",
    entity: "SleepPlan",
    entityId: plan.id,
    metadata: parsed.data,
  });

  revalidatePath("/app/plans");
  revalidatePath("/app/plans/sleep");
  return { ok: true, data: plan };
}

export async function getActiveSleepPlan() {
  const user = await requireUser();
  const plan = await prisma.sleepPlan.findFirst({
    where: { userId: user.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  if (!plan) return null;

  // Retrieve default 5 cycles generator for checklist
  const generated = generateSleepPlan(plan.wakeTime, (plan.targetDurationH / 1.5) as 4 | 5 | 6);

  return {
    ...plan,
    windDownStart: generated.windDownStart,
    checklist: generated.checklist,
  };
}
