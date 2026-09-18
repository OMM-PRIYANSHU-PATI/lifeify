/**
 * LIFIFY Core Health Intelligence Engine
 * Public entrypoint and module exports
 */

export * from "./types";
export * from "./data-sources";
export * from "./ingestion/normalizer";
export * from "./ingestion/ingestion-engine";
export * from "./events/event-bus";
export * from "./baseline/baseline-engine";
export * from "./fitness/fitness-engine";
export * from "./nutrition/nutrition-engine";
export * from "./sleep/sleep-engine";
export * from "./medication/medication-engine";
export * from "./context/context-engine";
export * from "./predictive/explainability";
export * from "./predictive/risk-signal-engine";
export * from "./personalization/personalization-engine";
export * from "./doctor/doctor-preference-engine";
export * from "./safety/safety-engine";
export * from "./providers";
export * from "./demo/demo-generator";
export * from "./orchestrator";
