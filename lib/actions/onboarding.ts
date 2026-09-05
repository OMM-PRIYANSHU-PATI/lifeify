"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { CONDITIONS, FAMILY_CONDITIONS, FAMILY_RELATIONS } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().trim().max(80).optional().transform((v) => (v && v.length > 0 ? v : "Health Explorer")),
  age: z.number().int().min(1).max(120),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
  heightCm: z.number().min(50).max(260),
  weightKg: z.number().min(20).max(300),
  bloodGroup: z.string().max(5).optional(),
  activityLevel: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "ATHLETE"]),
  dietType: z.enum(["VEG", "NON_VEG", "EGGETARIAN", "VEGAN"]),
  sleepTargetH: z.number().min(3).max(12),
  waterTargetMl: z.number().int().min(500).max(6000),
  stepTarget: z.number().int().min(1000).max(30000),
  goals: z.array(z.string()).max(10),
  conditions: z.array(z.enum(CONDITIONS)).max(10),
  allergies: z.array(z.string().trim().min(1).max(60)).max(20),
  familyHistory: z
    .array(z.object({ condition: z.enum(FAMILY_CONDITIONS), relationship: z.enum(FAMILY_RELATIONS), notes: z.string().max(200).optional() }))
    .max(15),
  currentMedications: z
    .array(z.object({ name: z.string().trim().max(100), activeIngredient: z.string().trim().max(100).optional(), dose: z.string().max(30).optional(), doseUnit: z.string().max(20).optional(), frequency: z.string().max(10).default("OD"), durationDays: z.number().int().min(1).max(365).optional() }))
    .max(15)
    .default([]),
  consentHealthData: z.boolean().refine((v) => v, "Health data consent is required to use LIFEIFY"),
});

export type OnboardingInput = z.input<typeof profileSchema>;
export type OnboardingResult = { ok: true } | { ok: false; errors: Record<string, string> };

export async function saveOnboarding(raw: OnboardingInput): Promise<OnboardingResult> {
  try {
    const user = await requireUser();
    const parsed = profileSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) errors[issue.path.join(".")] = issue.message;
      return { ok: false, errors };
    }
    const d = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { name: d.name, onboardingComplete: true },
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
        conditions: JSON.stringify(d.conditions),
        allergies: JSON.stringify(d.allergies),
        goals: JSON.stringify(d.goals),
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
        conditions: JSON.stringify(d.conditions),
        allergies: JSON.stringify(d.allergies),
        goals: JSON.stringify(d.goals),
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

    await tx.consent.upsert({
      where: { userId_type: { userId: user.id, type: "HEALTH_DATA" } },
      create: { userId: user.id, type: "HEALTH_DATA", version: "1.0", granted: d.consentHealthData },
      update: { granted: d.consentHealthData, revokedAt: null },
    });

    await tx.consent.upsert({
      where: { userId_type: { userId: user.id, type: "data_processing" } },
      create: { userId: user.id, type: "data_processing", version: "1.0", granted: true },
      update: { granted: true, revokedAt: null },
    });

    await tx.familyMedicalHistory.deleteMany({ where: { userId: user.id } });
    if (d.familyHistory.length > 0) {
      await tx.familyMedicalHistory.createMany({
        data: d.familyHistory.map((f) => ({ userId: user.id, condition: f.condition, relationship: f.relationship, notes: f.notes })),
      });
    }

    if (d.allergies.length > 0) {
      await tx.medicationAllergy.deleteMany({ where: { userId: user.id, notes: "onboarding" } });
      await tx.medicationAllergy.createMany({
        data: d.allergies.map((a) => ({ userId: user.id, substance: a, notes: "onboarding" })),
      });
    }
  });

  await audit({ userId: user.id, action: "ONBOARDING_COMPLETE", entity: "User", entityId: user.id });

  // Onboarded medications become real, active prescriptions (schedule + doses generated).
  if (d.currentMedications.length > 0) {
    const { createMedication } = await import("@/services/medications");
    for (const m of d.currentMedications) {
      if (!m.name.trim()) continue;
      await createMedication({
        userId: user.id,
        name: m.name.trim(),
        activeIngredient: m.activeIngredient || null,
        dose: m.dose || null,
        doseUnit: m.doseUnit || null,
        frequency: m.frequency || "OD",
        durationDays: m.durationDays ?? null,
      });
    }
  }

  // Award onboarding XP & First Quest Completion Badge
  try {
    const { awardGamificationPoints } = await import("@/lib/actions/gamification");
    await awardGamificationPoints("PROFILE_COMPLETED");
    await prisma.userBadge.upsert({
      where: { userId_badgeCode: { userId: user.id, badgeCode: "HEALTH_PIONEER" } },
      create: { userId: user.id, badgeCode: "HEALTH_PIONEER", name: "Health Pioneer", earnedAt: new Date() },
      update: {},
    });
  } catch {
    // Non-blocking gamification initialization
  }

  return { ok: true };
  } catch (err: any) {
    console.error("saveOnboarding error:", err);
    return {
      ok: false,
      errors: {
        _general: err?.message || "Failed to save health baseline. Please try again.",
      },
    };
  }
}

