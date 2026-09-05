export * from "./engine";
export * from "./domains/health-score";
export * from "./domains/adherence";
export * from "./domains/stock";
export * from "./domains/alerts";
export * from "./domains/checkin-selection";
export * from "./ddi-matrix";
export * from "./pharmacokinetics";
export * from "./risk-scores/idrs";
export * from "./risk-scores/framingham";
export * from "./emergency-triage";
export * from "./symptom-triage";

// Re-export core pure helpers
export {
  computeHealthScore,
  isVitalInRange,
  stockDaysRemaining,
  adherencePct,
  classifyAnswer,
  matchAllergies,
  matchDuplicateIngredient,
  isRedFlagSideEffect,
  RED_FLAG_MESSAGE,
  RED_FLAG_SIDE_EFFECTS,
} from "../rules";
