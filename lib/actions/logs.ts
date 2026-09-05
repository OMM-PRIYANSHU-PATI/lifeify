"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { startOfDay } from "@/lib/utils";
import { calculateHealthScore } from "@/services/health-score";
import { getTodaySummary } from "@/services/logs";
import { awardGamificationPoints } from "@/lib/actions/gamification";

const waterSchema = z.object({ ml: z.number().int().min(50).max(2000) });
const moodSchema = z.object({ score: z.number().int().min(1).max(5) });
const weightSchema = z.object({ kg: z.number().min(20).max(300) });
const stepsSchema = z.object({ steps: z.number().int().min(1).max(100000) });
const sleepSchema = z.object({ hours: z.number().min(0).max(24), quality: z.number().int().min(1).max(5).optional() });
const activitySchema = z.object({ kind: z.enum(["WALK", "RUN"]), minutes: z.number().int().min(1).max(600), distanceKm: z.number().min(0).max(200).optional() });
const foodSchema = z.object({ foodId: z.string().min(1), servings: z.number().min(0.25).max(10).default(1), meal: z.enum(["breakfast", "lunch", "dinner", "snack"]).default("snack") });
const vitalSchema = z.object({
  type: z.enum(["BP", "GLUCOSE", "WEIGHT", "HEART_RATE", "SPO2"]),
  systolic: z.number().int().min(50).max(300).optional(),
  diastolic: z.number().int().min(30).max(200).optional(),
  value: z.number().min(0).max(10000).optional(),
});

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

export async function logWater(ml: number): Promise<ActionResult> {
  const parsed = waterSchema.safeParse({ ml });
  if (!parsed.success) return { ok: false, error: "Enter a valid amount" };
  const user = await requireUser();
  await prisma.healthLog.create({ data: { userId: user.id, logType: "WATER", value: parsed.data.ml, unit: "ml" } });
  return { ok: true, message: `Logged ${parsed.data.ml} ml of water` };
}

export async function logMood(score: number): Promise<ActionResult> {
  const parsed = moodSchema.safeParse({ score });
  if (!parsed.success) return { ok: false, error: "Invalid mood" };
  const user = await requireUser();
  await prisma.healthLog.create({
    data: { userId: user.id, logType: "MOOD", value: parsed.data.score, unit: "score", metadata: JSON.stringify({ source: "quick-log" }) },
  });
  return { ok: true, message: "Mood logged for today" };
}

export async function logWeight(kg: number): Promise<ActionResult> {
  const parsed = weightSchema.safeParse({ kg });
  if (!parsed.success) return { ok: false, error: "Enter a valid weight" };
  const user = await requireUser();
  await prisma.healthLog.create({ data: { userId: user.id, logType: "WEIGHT", value: parsed.data.kg, unit: "kg" } });
  await prisma.vitalReading.create({ data: { userId: user.id, type: "WEIGHT", value: parsed.data.kg, unit: "kg" } });
  await prisma.healthProfile.updateMany({ where: { userId: user.id }, data: { weightKg: parsed.data.kg } });
  return { ok: true, message: `Weight of ${parsed.data.kg} kg logged` };
}

export async function logSteps(steps: number): Promise<ActionResult> {
  const parsed = stepsSchema.safeParse({ steps });
  if (!parsed.success) return { ok: false, error: "Enter valid steps" };
  const user = await requireUser();
  await prisma.healthLog.create({ data: { userId: user.id, logType: "STEPS", value: parsed.data.steps, unit: "steps" } });
  return { ok: true, message: `${parsed.data.steps.toLocaleString()} steps logged` };
}

export async function logSleep(hours: number, quality?: number): Promise<ActionResult> {
  const parsed = sleepSchema.safeParse({ hours, quality });
  if (!parsed.success) return { ok: false, error: "Enter valid sleep hours" };
  const user = await requireUser();
  await prisma.healthLog.create({
    data: { userId: user.id, logType: "SLEEP", value: parsed.data.hours, unit: "hours", metadata: quality ? JSON.stringify({ quality }) : undefined },
  });
  return { ok: true, message: `Sleep of ${parsed.data.hours} h logged` };
}

export async function logActivity(kind: "WALK" | "RUN", minutes: number, distanceKm?: number): Promise<ActionResult> {
  const parsed = activitySchema.safeParse({ kind, minutes, distanceKm });
  if (!parsed.success) return { ok: false, error: "Enter valid activity details" };
  const user = await requireUser();
  const meta: Record<string, unknown> = { minutes };
  if (parsed.data.distanceKm) meta.distanceKm = parsed.data.distanceKm;
  await prisma.healthLog.create({ data: { userId: user.id, logType: kind, value: minutes, unit: "minutes", metadata: JSON.stringify(meta) } });
  return { ok: true, message: `${kind === "WALK" ? "Walk" : "Run"} of ${minutes} min logged` };
}

export async function searchFoods(query: string) {
  const user = await requireUser();
  void user;
  const q = query.trim();
  if (q.length < 2) return [];
  const foods = await prisma.food.findMany({
    where: { OR: [{ name: { contains: q } }, { nameHi: { contains: q } }] },
    take: 12,
    orderBy: { name: "asc" },
  });
  return foods.map((f) => ({ id: f.id, name: f.name, servingLabel: f.servingLabel, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat }));
}

export async function logFood(foodId: string, servings: number, meal: "breakfast" | "lunch" | "dinner" | "snack"): Promise<ActionResult> {
  const parsed = foodSchema.safeParse({ foodId, servings, meal });
  if (!parsed.success) return { ok: false, error: "Invalid food entry" };
  const user = await requireUser();
  const food = await prisma.food.findUnique({ where: { id: parsed.data.foodId } });
  if (!food) return { ok: false, error: "Food not found" };

  const factor = parsed.data.servings;
  await prisma.healthLog.create({
    data: {
      userId: user.id,
      logType: "FOOD",
      value: Math.round(food.calories * factor),
      unit: "kcal",
      metadata: JSON.stringify({ foodId: food.id, foodName: food.name, meal, servings: factor, protein: food.protein * factor, carbs: food.carbs * factor, fat: food.fat * factor }),
    },
  });
  return { ok: true, message: `${food.name} logged (${Math.round(food.calories * factor)} kcal)` };
}

export async function logVital(input: { type: "BP" | "GLUCOSE" | "WEIGHT" | "HEART_RATE" | "SPO2"; systolic?: number; diastolic?: number; value?: number }): Promise<ActionResult> {
  const parsed = vitalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter valid readings" };
  const user = await requireUser();
  const d = parsed.data;

  if (d.type === "BP" && (!d.systolic || !d.diastolic)) return { ok: false, error: "BP needs systolic and diastolic values" };
  if (d.type !== "BP" && d.value == null) return { ok: false, error: "Enter a value" };

  const units: Record<string, string> = { BP: "mmHg", GLUCOSE: "mg/dL", WEIGHT: "kg", HEART_RATE: "bpm", SPO2: "%" };
  await prisma.vitalReading.create({
    data: {
      userId: user.id,
      type: d.type,
      systolic: d.systolic ?? null,
      diastolic: d.diastolic ?? null,
      value: d.value ?? null,
      unit: units[d.type],
    },
  });
  if (d.type === "WEIGHT" && d.value != null) {
    await prisma.healthLog.create({ data: { userId: user.id, logType: "WEIGHT", value: d.value, unit: "kg" } });
    await prisma.healthProfile.updateMany({ where: { userId: user.id }, data: { weightKg: d.value } });
  }
  return { ok: true, message: "Reading saved" };
}

export async function completeDailyCheckIn(moodScore: number): Promise<ActionResult> {
  const user = await requireUser();
  const date = startOfDay(new Date());
  await prisma.dailyCheckIn.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: { userId: user.id, date, completed: true, moodScore },
    update: { completed: true, moodScore },
  });
  return { ok: true, message: "Daily check-in complete 🔥" };
}

export async function recalculateScore(): Promise<{ score: number } | { error: string }> {
  try {
    const user = await requireUser();
    const { score } = await calculateHealthScore(user.id);
    return { score };
  } catch {
    return { error: "Not signed in" };
  }
}

export async function getTodayStats() {
  const user = await requireUser();
  return getTodaySummary(user.id);
}

const recoverySchema = z.object({
  score: z.number().min(0).max(100),
  status: z.string().optional(),
});

const triFactorSchema = z.object({
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().min(0).max(100),
  moodScore: z.number().int().min(1).max(5),
  moodValence: z.string().optional(),
  recoveryScore: z.number().min(0).max(100),
  recoveryStatus: z.string().optional(),
  answers: z.record(z.string()).optional(),
});

export async function logRecovery(score: number, status?: string): Promise<ActionResult> {
  const parsed = recoverySchema.safeParse({ score, status });
  if (!parsed.success) return { ok: false, error: "Enter valid recovery score (0-100)" };
  const user = await requireUser();
  await prisma.healthLog.create({
    data: {
      userId: user.id,
      logType: "RECOVERY",
      type: "recovery",
      value: parsed.data.score,
      unit: "%",
      metadata: parsed.data.status ? JSON.stringify({ status: parsed.data.status }) : undefined,
    },
  });
  return { ok: true, message: `Recovery readiness of ${parsed.data.score}% logged` };
}

export async function logTriFactorQuiz(input: {
  sleepHours: number;
  sleepQuality: number;
  moodScore: number;
  moodValence?: string;
  recoveryScore: number;
  recoveryStatus?: string;
  answers?: Record<string, string>;
}): Promise<ActionResult> {
  const parsed = triFactorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid quiz metrics provided" };
  const user = await requireUser();
  const d = parsed.data;
  const now = new Date();
  const date = startOfDay(now);

  // 1. Log Sleep
  await prisma.healthLog.create({
    data: {
      userId: user.id,
      logType: "SLEEP",
      type: "sleep",
      value: d.sleepHours,
      unit: "hours",
      metadata: JSON.stringify({
        quality: d.sleepQuality,
        source: "tri-factor-quiz",
        predicted: true,
      }),
    },
  });

  // 2. Log Mood
  await prisma.healthLog.create({
    data: {
      userId: user.id,
      logType: "MOOD",
      type: "mood",
      value: d.moodScore,
      unit: "score",
      metadata: JSON.stringify({
        valence: d.moodValence ?? "Balanced",
        source: "tri-factor-quiz",
        predicted: true,
      }),
    },
  });

  // 3. Log Recovery
  await prisma.healthLog.create({
    data: {
      userId: user.id,
      logType: "RECOVERY",
      type: "recovery",
      value: d.recoveryScore,
      unit: "%",
      metadata: JSON.stringify({
        status: d.recoveryStatus ?? "OPTIMAL",
        source: "tri-factor-quiz",
        predicted: true,
        answers: d.answers,
      }),
    },
  });

  // 4. Mark today's DailyCheckIn
  await prisma.dailyCheckIn.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: { userId: user.id, date, completed: true, moodScore: d.moodScore },
    update: { completed: true, moodScore: d.moodScore },
  });

  // 5. Award gamification points & update health score
  try {
    await awardGamificationPoints("checkin");
    await calculateHealthScore(user.id);
  } catch {}

  // 6. Revalidate cache
  try {
    revalidatePath("/app/dashboard");
    revalidatePath("/app/recovery");
    revalidatePath("/app/check-in");
    revalidatePath("/app/track/sleep");
    revalidatePath("/app/track/mood");
    revalidatePath("/app/track/recovery");
  } catch {}

  return { ok: true, message: "Tri-Factor predictions locked in! +20 XP awarded 🎯" };
}
