/**
 * LIFIFY Core Health Intelligence Engine — Mock AI Provider
 *
 * Provides deterministic, offline-capable AI responses for testing and robust fallbacks.
 */

import { AIProvider, SymptomAnalysisResult } from "./ai-provider.interface";
import { HealthContext } from "../types";

export class MockAIProvider implements AIProvider {
  name = "MockAIProvider";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateHealthSummary(context: HealthContext): Promise<string> {
    const readiness = context.sleep.readiness.score;
    const strain = context.fitness.currentStrain.adjustedStrain;
    const adherence = context.medications.adherencePercentLast7Days;

    return `LIFIFY Intelligence Synthesis:
Readiness Index stands at ${readiness}/100 with a recent training load estimate of ${strain.toFixed(0)}.
7-day medication adherence is ${adherence}%. All baseline metrics reflect stable autonomic and metabolic recovery.`;
  }

  async analyzeSymptomPattern(
    symptoms: string[],
    vitals?: Record<string, any>,
    contextSummary?: string
  ): Promise<SymptomAnalysisResult> {
    const joinedSymptoms = symptoms.join(", ");
    return {
      summary: `Observational analysis of reported symptoms: ${joinedSymptoms}. Vitals remain within manageable parameters.`,
      potentialConsiderations: [
        "Tension or physical fatigue secondary to physical workload",
        "Mild dehydration or electrolyte shifts",
        "Environmental or postural strain"
      ],
      suggestedQuestionsForDoctor: [
        `How long have these symptoms (${joinedSymptoms}) persisted?`,
        "Do the symptoms correlate with medication timing or workout intensity?",
        "Should further lab panels or vitals tracking be scheduled?"
      ],
      recommendedConservativeSelfCare: [
        "Ensure 500-750ml fluid replenishment with electrolytes.",
        "Take a 20-minute screen rest in a darkened, quiet room.",
        "Maintain a structured symptom log if symptoms recur."
      ],
      urgencyLevel: "ROUTINE"
    };
  }
}

export const mockAIProvider = new MockAIProvider();
