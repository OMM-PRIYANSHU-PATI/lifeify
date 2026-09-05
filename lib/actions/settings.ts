"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { grantConsent, revokeConsent, ConsentType, CONSENT_TYPES } from "@/lib/consent";

const profileEditSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  age: z.coerce.number().int().min(1).max(120).optional(),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  heightCm: z.coerce.number().min(50).max(260).optional(),
  weightKg: z.coerce.number().min(20).max(300).optional(),
  bloodGroup: z.string().max(5).optional(),
  dietType: z.enum(["VEG", "NON_VEG", "EGGETARIAN", "VEGAN"]).optional(),
  activityLevel: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "ATHLETE"]).optional(),
  sleepTargetH: z.coerce.number().min(4).max(12).optional(),
  waterTargetMl: z.coerce.number().int().min(500).max(6000).optional(),
  stepTarget: z.coerce.number().int().min(1000).max(30000).optional(),
});

export async function updateProfileAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  const raw = Object.fromEntries(formData.entries());

  const parsed = profileEditSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { name: d.name },
    });

    await tx.healthProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        age: d.age,
        sex: d.sex,
        heightCm: d.heightCm,
        weightKg: d.weightKg,
        bloodGroup: d.bloodGroup || null,
        activityLevel: d.activityLevel,
        dietType: d.dietType,
        sleepTargetH: d.sleepTargetH,
        waterTargetMl: d.waterTargetMl,
        stepTarget: d.stepTarget,
      },
      update: {
        age: d.age,
        sex: d.sex,
        heightCm: d.heightCm,
        weightKg: d.weightKg,
        bloodGroup: d.bloodGroup || null,
        activityLevel: d.activityLevel,
        dietType: d.dietType,
        sleepTargetH: d.sleepTargetH,
        waterTargetMl: d.waterTargetMl,
        stepTarget: d.stepTarget,
      },
    });

    await tx.lifestyleProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        dietType: d.dietType,
        activityLevel: d.activityLevel,
        sleepTargetH: d.sleepTargetH,
        waterTargetMl: d.waterTargetMl,
        stepTarget: d.stepTarget,
      },
      update: {
        dietType: d.dietType,
        activityLevel: d.activityLevel,
        sleepTargetH: d.sleepTargetH,
        waterTargetMl: d.waterTargetMl,
        stepTarget: d.stepTarget,
      },
    });
  });

  await audit({
    userId: user.id,
    action: "PROFILE_UPDATED",
    entity: "User",
    entityId: user.id,
  });

  revalidatePath("/settings/profile");
  return { ok: true, message: "Profile updated successfully." };
}

export async function toggleConsentAction(type: string, targetState: boolean) {
  const user = await requireUser();
  if (!CONSENT_TYPES.includes(type as ConsentType)) {
    throw new Error("Invalid consent type");
  }

  const consentType = type as ConsentType;

  if (targetState) {
    await grantConsent(user.id, consentType);
  } else {
    await revokeConsent(user.id, consentType);
  }

  revalidatePath("/settings/privacy");
  return { ok: true, type, granted: targetState };
}
