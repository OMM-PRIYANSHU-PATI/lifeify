import { Rule, clamp } from "../engine";

export interface AdherenceInput {
  scheduledDoses: number;
  takenDoses: number;
  windowDays?: number;
}

export interface AdherenceOutput {
  percentage: number;
  taken: number;
  scheduled: number;
  status: "EXCELLENT" | "GOOD" | "ATTENTION_NEEDED" | "CRITICAL";
}

export const adherenceRule: Rule<AdherenceInput, AdherenceOutput> = {
  id: "rule_adherence_v1",
  name: "Medication Adherence Window Calculator",
  domain: "adherence",
  evaluate(input: AdherenceInput) {
    const scheduled = Math.max(0, input.scheduledDoses);
    const taken = Math.max(0, input.takenDoses);

    const percentage = scheduled === 0 ? 100 : clamp(Math.round((taken / scheduled) * 100), 0, 100);

    let status: AdherenceOutput["status"] = "EXCELLENT";
    if (percentage < 50) status = "CRITICAL";
    else if (percentage < 75) status = "ATTENTION_NEEDED";
    else if (percentage < 90) status = "GOOD";

    const daysText = input.windowDays ? `over the last ${input.windowDays} days` : "for this period";
    const explanation =
      scheduled === 0
        ? `No doses scheduled ${daysText}.`
        : `${taken} of ${scheduled} doses recorded as taken (${percentage}% adherence ${daysText}).`;

    return {
      output: {
        percentage,
        taken,
        scheduled,
        status,
      },
      explanation,
      details: { percentage, taken, scheduled, status },
    };
  },
};
