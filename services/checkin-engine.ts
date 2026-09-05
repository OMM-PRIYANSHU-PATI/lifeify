import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/utils";

// Daily check-in engine (Phase 15) — rule-based question selection.
// Base questions always; contextual questions added when their triggerRule
// matches the user's conditions, active medications, or previous responses.
// (AI-driven adaptive questioning is explicitly V3.)

export type EngineQuestion = {
  id: string;
  code: string;
  question: string;
  type: string;
  options: string[];
};

type TriggerRule = { condition?: string; requiresActiveMed?: boolean; previousFlag?: string };

export async function buildTodayQuestions(userId: string): Promise<EngineQuestion[]> {
  const [questions, profile, activeMeds, todayCheckIn, recentResponses] = await Promise.all([
    prisma.checkInQuestion.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.healthProfile.findUnique({ where: { userId } }),
    prisma.medication.findMany({ where: { userId, active: true } }),
    prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId, date: startOfDay(new Date()) } },
      include: { responses: true },
    }),
    prisma.checkInResponse.findMany({
      where: { userId, flag: { not: "NORMAL" } },
      orderBy: { id: "desc" },
      take: 10,
    }),
  ]);

  const conditions = JSON.parse(profile?.conditions ?? "[]") as string[];
  const flaggedCodes = new Set(recentResponses.map((r) => r.questionId));

  const out: EngineQuestion[] = [];
  for (const q of questions) {
    if (!q.triggerRule) {
      out.push(toEngine(q));
      continue;
    }
    const rule = JSON.parse(q.triggerRule) as TriggerRule;
    if (rule.condition && conditions.includes(rule.condition)) {
      out.push(toEngine(q));
      continue;
    }
    if (rule.requiresActiveMed && activeMeds.length > 0) {
      out.push(toEngine(q));
      continue;
    }
    if (rule.previousFlag && flaggedCodes.has(q.id)) {
      out.push(toEngine(q));
      continue;
    }
  }
  return out;
}

function toEngine(q: { id: string; code: string; question: string; type: string; options: string | null }): EngineQuestion {
  return { id: q.id, code: q.code, question: q.question, type: q.type, options: q.options ? (JSON.parse(q.options) as string[]) : [] };
}

// Red flags: certain answers must route the user to seek care (never diagnose).
export function classifyAnswer(questionCode: string, answer: string): "NORMAL" | "WARNING" | "RED_FLAG" {
  const RED_FLAGS: Record<string, string[]> = {
    new_symptoms: ["chest pain", "difficulty breathing", "severe bleeding", "fainting", "slurred speech", "face drooping", "seizure", "unconscious"],
    worsening_symptoms: ["yes"],
    side_effect_present: ["anaphylaxis", "swelling of face", "swelling of throat", "severe rash"],
  };
  const WARNING_CODES = new Set(["worsening_symptoms", "side_effect_present", "missed_doses", "glucose_concern", "bp_concern"]);

  const a = answer.toLowerCase().trim();
  for (const phrase of RED_FLAGS[questionCode] ?? []) {
    if (a.includes(phrase)) return "RED_FLAG";
  }
  if (WARNING_CODES.has(questionCode) && a && a !== "no" && a !== "none") return "WARNING";
  return "NORMAL";
}

export const RED_FLAG_MESSAGE =
  "Your response includes a symptom that may need urgent attention. Please contact your doctor or local emergency services right away. LIFEIFY does not diagnose — when in doubt, seek professional care immediately.";
