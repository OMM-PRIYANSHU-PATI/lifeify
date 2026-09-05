"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { generateNutritionPlan } from "@/lib/rules/domains/nutrition";
import { INDIAN_FOOD_DATABASE } from "@/lib/rules/indian-foods";

const planSchema = z.object({
  weightKg: z.number().positive(),
  heightCm: z.number().positive(),
  age: z.number().int().min(12).max(120),
  sex: z.enum(["male", "female", "other"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active"]),
  goal: z.enum(["weight_loss", "muscle_gain", "maintenance"]),
  dietType: z.enum(["veg", "nonveg", "vegan", "jain"]),
});

export async function createNutritionPlanAction(input: z.infer<typeof planSchema>) {
  const user = await requireUser();
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const d = parsed.data;
  const calculated = generateNutritionPlan(
    d.weightKg,
    d.heightCm,
    d.age,
    d.sex,
    d.activityLevel,
    d.goal,
    d.dietType
  );

  // Deactivate prior plans
  await prisma.nutritionPlan.updateMany({
    where: { userId: user.id, active: true },
    data: { active: false },
  });

  const plan = await prisma.nutritionPlan.create({
    data: {
      userId: user.id,
      calorieTarget: calculated.calorieTarget,
      proteinTarget: calculated.proteinTargetG,
      carbTarget: calculated.carbTargetG,
      fatTarget: calculated.fatTargetG,
      dietType: d.dietType,
      mealsPerDay: 4,
      active: true,
    },
  });

  await audit({
    userId: user.id,
    action: "NUTRITION_PLAN_CREATE",
    entity: "NutritionPlan",
    entityId: plan.id,
    metadata: parsed.data,
  });

  revalidatePath("/app/plans");
  revalidatePath("/app/plans/nutrition");
  return { ok: true, data: plan };
}

export async function logFoodItemAction(item: {
  foodName: string;
  portion: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const user = await requireUser();
  const log = await prisma.foodLog.create({
    data: {
      userId: user.id,
      foodName: item.foodName,
      portion: item.portion,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    },
  });

  revalidatePath("/app/plans/nutrition");
  revalidatePath("/app/dashboard");
  return { ok: true, data: log };
}

export async function getActiveNutritionPlan() {
  const user = await requireUser();
  const plan = await prisma.nutritionPlan.findFirst({
    where: { userId: user.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayLogs = await prisma.foodLog.findMany({
    where: { userId: user.id, loggedAt: { gte: todayStart } },
    orderBy: { loggedAt: "desc" },
  });

  const totalCalories = todayLogs.reduce((acc, l) => acc + l.calories, 0);
  const totalProtein = todayLogs.reduce((acc, l) => acc + l.protein, 0);
  const totalCarbs = todayLogs.reduce((acc, l) => acc + l.carbs, 0);
  const totalFat = todayLogs.reduce((acc, l) => acc + l.fat, 0);

  return {
    plan,
    todayLogs,
    consumed: {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
    },
    indianFoods: INDIAN_FOOD_DATABASE,
  };
}
