/**
 * LIFIFY Core Health Intelligence Engine — AI Provider Interface
 *
 * Defines the contract for all AI LLM intelligence engines (Gemini, Mock, Local, etc.).
 */

import { HealthContext } from "../types";

export interface SymptomAnalysisResult {
  summary: string;
  potentialConsiderations: string[];
  suggestedQuestionsForDoctor: string[];
  recommendedConservativeSelfCare: string[];
  urgencyLevel: "ROUTINE" | "PROMPT_EVALUATION" | "URGENT";
}

export interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  generateHealthSummary(context: HealthContext): Promise<string>;
  analyzeSymptomPattern(
    symptoms: string[],
    vitals?: Record<string, any>,
    contextSummary?: string
  ): Promise<SymptomAnalysisResult>;
}
