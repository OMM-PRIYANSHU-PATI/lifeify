/**
 * LIFEIFY Deterministic Rule Engine Foundation
 * Pure functions only. Zero AI/LLM. Zero non-deterministic calls.
 * Every rule output carries an `explanation` for transparency to the patient and doctor.
 */

export type RuleDomain =
  | "health_score"
  | "adherence"
  | "stock"
  | "alerts"
  | "checkin_selection";

export interface RuleResult<TOutput> {
  output: TOutput;
  explanation: string;
  details?: Record<string, unknown>;
}

export interface Rule<TInput, TOutput> {
  id: string;
  name: string;
  domain: RuleDomain;
  evaluate: (input: TInput) => RuleResult<TOutput>;
}

/**
 * Execute a single deterministic rule with its input.
 */
export function evaluateRule<TInput, TOutput>(
  rule: Rule<TInput, TOutput>,
  input: TInput
): RuleResult<TOutput> {
  return rule.evaluate(input);
}

/**
 * Helper to safely clamp values between min and max.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
