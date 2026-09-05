import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFitnessPlan } from "@/lib/rules/domains/fitness";
import { generateNutritionPlan } from "@/lib/rules/domains/nutrition";
import { generateSleepPlan } from "@/lib/rules/domains/sleep";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { type, ...params } = body;

    if (type === "fitness") {
      const {
        goal = "weight_loss",
        level = "beginner",
        daysPerWeek = 4,
        minutesPerSession = 45,
      } = params;

      const planData = generateFitnessPlan(goal, level, Number(daysPerWeek), Number(minutesPerSession));

      // Deactivate old fitness plans
      await prisma.fitnessPlan.updateMany({
        where: { userId: user.id },
        data: { active: false },
      });

      const plan = await prisma.fitnessPlan.create({
        data: {
          userId: user.id,
          goal,
          fitnessLevel: level,
          daysPerWeek: Number(daysPerWeek),
          minutesPerSession: Number(minutesPerSession),
          active: true,
        },
      });

      await audit({
        userId: user.id,
        action: "FITNESS_PLAN_GENERATED",
        entity: "FitnessPlan",
        entityId: plan.id,
      });

      return NextResponse.json({ ok: true, plan, planData }, { status: 201 });
    }

    if (type === "nutrition") {
      const {
        weightKg = 70,
        heightCm = 175,
        age = 30,
        sex = "male",
        activityLevel = "moderate",
        goal = "maintenance",
        dietType = "veg",
      } = params;

      const planData = generateNutritionPlan(
        Number(weightKg),
        Number(heightCm),
        Number(age),
        sex,
        activityLevel,
        goal,
        dietType
      );

      await prisma.nutritionPlan.updateMany({
        where: { userId: user.id },
        data: { active: false },
      });

      const plan = await prisma.nutritionPlan.create({
        data: {
          userId: user.id,
          calorieTarget: planData.calorieTarget,
          proteinTarget: planData.proteinTargetG,
          carbTarget: planData.carbTargetG,
          fatTarget: planData.fatTargetG,
          dietType,
          mealsPerDay: planData.meals.length,
          active: true,
        },
      });

      await audit({
        userId: user.id,
        action: "NUTRITION_PLAN_GENERATED",
        entity: "NutritionPlan",
        entityId: plan.id,
      });

      return NextResponse.json({ ok: true, plan, planData }, { status: 201 });
    }

    if (type === "sleep") {
      const { wakeTime = "06:30", cycles = 5 } = params;
      const planData = generateSleepPlan(wakeTime, (cycles === 4 || cycles === 6) ? cycles : 5);

      await prisma.sleepPlan.updateMany({
        where: { userId: user.id },
        data: { active: false },
      });

      const plan = await prisma.sleepPlan.create({
        data: {
          userId: user.id,
          targetDurationH: planData.targetDurationH,
          bedtime: planData.bedtime,
          wakeTime: planData.wakeTime,
          caffeineCutoff: planData.caffeineCutoff,
          windDownMinutes: planData.windDownMinutes,
          active: true,
        },
      });

      await audit({
        userId: user.id,
        action: "SLEEP_PLAN_GENERATED",
        entity: "SleepPlan",
        entityId: plan.id,
      });

      return NextResponse.json({ ok: true, plan, planData }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid plan type. Use 'fitness', 'nutrition', or 'sleep'" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
