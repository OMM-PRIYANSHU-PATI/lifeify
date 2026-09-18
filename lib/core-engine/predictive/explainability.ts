/**
 * LIFIFY Core Health Intelligence Engine — Explainability Module
 *
 * Implements transparent, human-auditable reasoning structures for risk signals
 * and clinical suggestions. Every insight must explicitly answer:
 * 1. What changed?
 * 2. Why might it matter?
 * 3. What data contributed?
 * 4. What is the recommended conservative action?
 */

import { RiskSignal, MetricBaselineSummary } from "../types";

export interface ExplainabilityReport {
  signalId: string;
  title: string;
  severity: "INFO" | "LOW" | "MODERATE" | "HIGH";
  confidenceScore: number;
  whatChanged: string;
  whyItMatters: string;
  contributingDataPoints: string[];
  recommendedConservativeAction: string;
  clinicalSafetyDisclaimer: string;
}

export class ExplainabilityEngine {
  /**
   * Generates a structured explainability dossier for any risk signal.
   */
  generateExplanation(signal: RiskSignal): ExplainabilityReport {
    let whatChanged = signal.summary;
    if (signal.baselineComparison) {
      const { current, baseline, unit, percentageDelta } = signal.baselineComparison;
      const sign = percentageDelta > 0 ? "+" : "";
      whatChanged = `${signal.observedMetrics.join(", ")} shifted from baseline of ${baseline} ${unit} to current ${current} ${unit} (${sign}${percentageDelta}% deviation).`;
    }

    let whyItMatters =
      "Longitudinal shifts across physiological markers reflect underlying shifts in recovery, systemic stress, or metabolic load.";
    if (signal.type.includes("CARDIOVASCULAR") || signal.type.includes("HR_DRIFT")) {
      whyItMatters =
        "Upward resting heart rate drift often correlates with accumulated fatigue, subclinical infection, dehydration, or heightened sympathetic autonomic tone.";
    } else if (signal.type.includes("OVERTRAINING") || signal.type.includes("STRAIN")) {
      whyItMatters =
        "Sustained elevated strain without adequate sleep and parasympathetic recovery impairs tissue remodeling and suppresses immune function.";
    } else if (signal.type.includes("MEDICATION_ADHERENCE")) {
      whyItMatters =
        "Consistent dosing is critical for steady therapeutic plasma concentrations. Omissions can cause rebound symptoms or diminished therapeutic efficacy.";
    } else if (signal.type.includes("METABOLIC")) {
      whyItMatters =
        "Repeated caloric surpluses coupled with low expenditure disrupt glycemic homeostasis and lipid processing over rolling multi-week windows.";
    }

    const contributingDataPoints =
      signal.evidence.length > 0
        ? signal.evidence
        : signal.observedMetrics.map((m) => `Monitored metric: ${m}`);

    const recommendedConservativeAction =
      signal.recommendedAction ||
      "Log your symptoms, maintain steady hydration and sleep hygiene, and review these observations with your primary care provider if trends persist.";

    return {
      signalId: signal.id,
      title: signal.title,
      severity: signal.severity,
      confidenceScore: signal.confidence,
      whatChanged,
      whyItMatters,
      contributingDataPoints,
      recommendedConservativeAction,
      clinicalSafetyDisclaimer:
        "LIFIFY provides observational health pattern analysis. It does not diagnose medical conditions. Consult a qualified healthcare professional for medical evaluation."
    };
  }

  /**
   * Formats baseline deviations into human-readable narrative bullet points
   */
  formatBaselineExplanations(deviations: MetricBaselineSummary[]): string[] {
    return deviations.map((dev) => {
      const direction = dev.zScore > 0 ? "elevated above" : "depressed below";
      const zFormatted = Math.abs(dev.zScore).toFixed(2);
      return `${dev.metric} is currently ${dev.currentValue} (${direction} ${dev.windowDays}-day baseline mean of ${dev.mean.toFixed(1)}, z-score: ${zFormatted}).`;
    });
  }
}

export const explainabilityEngine = new ExplainabilityEngine();
