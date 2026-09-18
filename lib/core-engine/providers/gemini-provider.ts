/**
 * LIFIFY Core Health Intelligence Engine — Production Gemini AI Provider
 *
 * Implements AIProvider using Google's Gemini models with:
 * - Graceful fallback to MockAIProvider when offline or unconfigured
 * - Integration with ClinicalSafetyEngine to sanitize outputs
 * - Conservative prompt engineering adhering to clinical guidelines
 */

import { AIProvider, SymptomAnalysisResult } from "./ai-provider.interface";
import { MockAIProvider } from "./mock-provider";
import { HealthContext } from "../types";
import { safetyEngine } from "../safety/safety-engine";

export class ProductionGeminiProvider implements AIProvider {
  name = "ProductionGeminiProvider";
  private fallbackProvider = new MockAIProvider();

  private getApiKey(): string {
    return (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      ""
    );
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.getApiKey());
  }

  async generateHealthSummary(context: HealthContext): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return this.fallbackProvider.generateHealthSummary(context);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const prompt = `You are LIFIFY's Senior Health Intelligence AI.
Given the following structured health context for user ${context.userId}:
- Readiness Index: ${context.sleep.readiness.score}/100 (${context.sleep.readiness.label})
- Training Load Estimate: ${context.fitness.currentStrain.adjustedStrain.toFixed(0)} (${context.fitness.currentStrain.trainingLoadLabel})
- Sleep Last Night: ${context.sleep.lastNightHours}h (Debt: ${context.sleep.sleepDebtHours.toFixed(1)}h)
- 7-Day Medication Adherence: ${context.medications.adherencePercentLast7Days}%
- Active Risk Signals: ${context.riskSignals.length}

Produce a concise, 3-4 sentence clinical overview answering:
1. What is changing?
2. Why does it matter?
3. What is the single highest leverage habit to maintain today?

CLINICAL BOUNDARIES:
- Never diagnose diseases autonomously.
- Never suggest stopping or changing medication dosages.
- Use conservative observational language.`;

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 350
          }
        })
      });

      if (!resp.ok) {
        return this.fallbackProvider.generateHealthSummary(context);
      }

      const data = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return this.fallbackProvider.generateHealthSummary(context);
      }

      const { sanitizedText } = safetyEngine.validateAndSanitize(rawText);
      return safetyEngine.appendStandardDisclaimer(sanitizedText);
    } catch {
      return this.fallbackProvider.generateHealthSummary(context);
    }
  }

  async analyzeSymptomPattern(
    symptoms: string[],
    vitals?: Record<string, any>,
    contextSummary?: string
  ): Promise<SymptomAnalysisResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return this.fallbackProvider.analyzeSymptomPattern(symptoms, vitals, contextSummary);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const prompt = `You are LIFIFY's Clinical Diagnostic Intelligence Assistant.
Analyze these reported symptoms: ${symptoms.join(", ")}.
Vitals: ${JSON.stringify(vitals || {})}.
Context: ${contextSummary || "None provided"}.

Output a JSON object ONLY with the following schema:
{
  "summary": "Concise observational overview of reported symptoms",
  "potentialConsiderations": ["Differential consideration 1", "Differential consideration 2"],
  "suggestedQuestionsForDoctor": ["Question 1 to ask physician", "Question 2"],
  "recommendedConservativeSelfCare": ["Restorative step 1", "Step 2"],
  "urgencyLevel": "ROUTINE" | "PROMPT_EVALUATION" | "URGENT"
}

CLINICAL RULES:
- Never provide definitive diagnosis.
- Never recommend drug alteration.
- Return valid JSON only.`;

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      if (!resp.ok) {
        return this.fallbackProvider.analyzeSymptomPattern(symptoms, vitals, contextSummary);
      }

      const data = await resp.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) {
        return this.fallbackProvider.analyzeSymptomPattern(symptoms, vitals, contextSummary);
      }

      const parsed = JSON.parse(rawJson);
      const sanitizedSummary = safetyEngine.validateAndSanitize(parsed.summary || "").sanitizedText;

      return {
        summary: sanitizedSummary,
        potentialConsiderations: parsed.potentialConsiderations || [],
        suggestedQuestionsForDoctor: parsed.suggestedQuestionsForDoctor || [],
        recommendedConservativeSelfCare: parsed.recommendedConservativeSelfCare || [],
        urgencyLevel: parsed.urgencyLevel || "ROUTINE"
      };
    } catch {
      return this.fallbackProvider.analyzeSymptomPattern(symptoms, vitals, contextSummary);
    }
  }
}

export const productionGeminiProvider = new ProductionGeminiProvider();
