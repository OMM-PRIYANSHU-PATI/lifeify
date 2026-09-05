"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const medCheckinSchema = z.object({
  medicationId: z.string().optional(),
  weekNumber: z.number().int().min(1).max(52),
  feelingScore: z.number().int().min(1).max(5),
  comparison: z.enum(["much_better", "better", "same", "worse", "much_worse"]).default("same"),
  sideEffects: z.string().optional(),
  adherence: z.number().int().min(0).max(100).optional(),
});

export async function submitMedCheckinAction(input: z.infer<typeof medCheckinSchema>) {
  const user = await requireUser();
  const parsed = medCheckinSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid check-in" };

  const checkin = await prisma.medCheckin.create({
    data: {
      userId: user.id,
      medicationId: parsed.data.medicationId || null,
      weekNumber: parsed.data.weekNumber,
      feelingScore: parsed.data.feelingScore,
      comparison: parsed.data.comparison,
      sideEffects: parsed.data.sideEffects || null,
      adherence: parsed.data.adherence ?? null,
    },
  });

  await audit({
    userId: user.id,
    action: "MED_CHECKIN_SUBMIT",
    entity: "MedCheckin",
    entityId: checkin.id,
    metadata: parsed.data,
  });

  revalidatePath("/app/medications");
  return { ok: true, data: checkin };
}

export async function getMedCheckinHistory() {
  const user = await requireUser();
  return prisma.medCheckin.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
