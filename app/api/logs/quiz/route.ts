import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  logTriFactorQuiz,
  logSleepFromQuiz,
  logRecoveryFromQuiz,
  logMoodFromQuiz,
} from "@/lib/actions/logs";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Please log in to save your quiz results" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { quizType, payload } = body;

    if (!quizType || !payload) {
      return NextResponse.json(
        { ok: false, error: "Missing quizType or payload" },
        { status: 400 }
      );
    }

    let result;
    if (quizType === "simulation" || quizType === "lightning") {
      result = await logTriFactorQuiz(payload);
    } else if (quizType === "sleep") {
      result = await logSleepFromQuiz(payload);
    } else if (quizType === "recovery") {
      result = await logRecoveryFromQuiz(payload);
    } else if (quizType === "mood") {
      result = await logMoodFromQuiz(payload);
    } else {
      return NextResponse.json(
        { ok: false, error: `Unknown quiz type: ${quizType}` },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Failed to save quiz log:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to save quiz" },
      { status: 500 }
    );
  }
}
