import { Rule, clamp } from "../engine";

export interface HealthScoreInput {
  adherencePct: number;          // 0..100
  sleepHours: number | null;     // recorded sleep
  sleepTargetH: number;          // e.g. 8
  steps: number;                 // steps taken today
  stepTarget: number;            // e.g. 6000
  waterMl: number;               // water logged in ml
  waterTargetMl: number;         // e.g. 2000
  mood: number | null;           // 1..5 scale (null if not logged)
  vitalsInRangeRatio: number | null; // 0..1 (null if no vitals measured)
  checkInCompleted: boolean;     // whether daily check-in was completed
}

export interface HealthScoreBreakdown {
  score: number;                 // 0..100
  components: {
    adherence: number;           // max 30
    sleep: number;               // max 20
    activity: number;            // max 20
    hydration: number;           // max 10
    mood: number;                // max 5
    vitals: number;              // max 10
    checkIn: number;             // max 5
  };
}

export const healthScoreRule: Rule<HealthScoreInput, HealthScoreBreakdown> = {
  id: "rule_health_score_v1",
  name: "Daily Health Score Calculator",
  domain: "health_score",
  evaluate(input: HealthScoreInput) {
    // 1. Adherence (30 points max)
    const adherenceScore = Math.round((clamp(input.adherencePct, 0, 100) / 100) * 30);

    // 2. Sleep (20 points max)
    let sleepScore = 0;
    if (input.sleepHours != null && input.sleepTargetH > 0) {
      const ratio = input.sleepHours / input.sleepTargetH;
      if (ratio >= 0.85 && ratio <= 1.25) {
        sleepScore = 20;
      } else if (ratio >= 0.7 && ratio <= 1.4) {
        sleepScore = 14;
      } else if (ratio >= 0.5) {
        sleepScore = 8;
      } else {
        sleepScore = 3;
      }
    }

    // 3. Activity (20 points max)
    const stepTarget = Math.max(1, input.stepTarget);
    const activityScore = clamp(Math.round((input.steps / stepTarget) * 20), 0, 20);

    // 4. Hydration (10 points max)
    const waterTarget = Math.max(1, input.waterTargetMl);
    const hydrationScore = clamp(Math.round((input.waterMl / waterTarget) * 10), 0, 10);

    // 5. Mood (5 points max)
    let moodScore = 0;
    if (input.mood != null) {
      moodScore = clamp(Math.round(((input.mood - 1) / 4) * 5), 0, 5);
    }

    // 6. Vitals in range (10 points max, neutral 5 if none taken)
    const vitalsScore = input.vitalsInRangeRatio == null
      ? 5
      : clamp(Math.round(input.vitalsInRangeRatio * 10), 0, 10);

    // 7. Check-in completion (5 points max)
    const checkInScore = input.checkInCompleted ? 5 : 0;

    const totalScore = clamp(
      adherenceScore + sleepScore + activityScore + hydrationScore + moodScore + vitalsScore + checkInScore,
      0,
      100
    );

    const breakdown: HealthScoreBreakdown = {
      score: totalScore,
      components: {
        adherence: adherenceScore,
        sleep: sleepScore,
        activity: activityScore,
        hydration: hydrationScore,
        mood: moodScore,
        vitals: vitalsScore,
        checkIn: checkInScore,
      },
    };

    const reasons: string[] = [];
    if (adherenceScore === 30) reasons.push("100% medication adherence (+30)");
    else if (adherenceScore > 0) reasons.push(`${input.adherencePct}% medication adherence (+${adherenceScore})`);

    if (activityScore >= 18) reasons.push("step goal achieved (+20)");
    else if (activityScore > 0) reasons.push(`${input.steps}/${input.stepTarget} steps (+${activityScore})`);

    if (hydrationScore === 10) reasons.push("hydration target met (+10)");
    if (sleepScore === 20) reasons.push("optimal sleep duration (+20)");
    if (checkInScore === 5) reasons.push("daily check-in completed (+5)");

    const explanation = reasons.length > 0
      ? `Health score of ${totalScore}/100 driven by: ${reasons.join(", ")}.`
      : `Health score is ${totalScore}/100 based on recorded activity and logged routines.`;

    return {
      output: breakdown,
      explanation,
      details: { ...breakdown.components, totalScore },
    };
  },
};
