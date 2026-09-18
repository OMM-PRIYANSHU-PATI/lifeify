/**
 * LIFIFY Core Health Intelligence Engine — Clinical AI Safety Engine
 *
 * Implements strict clinical boundary filters:
 * 1. Blocks unauthorized medication dosage alteration advice.
 * 2. Enforces non-definitive, observational language (prohibits autonomous disease diagnoses).
 * 3. Requires emergency escalation advisory when acute red-flag symptoms are detected.
 * 4. Ensures all generated insights carry appropriate non-causal language.
 */

export interface SafetyValidationResult {
  isSafe: boolean;
  violations: string[];
  sanitizedText: string;
  triggeredEmergencyEscalation: boolean;
}

export class ClinicalSafetyEngine {
  private dangerousMedicationPhrases = [
    /stop taking your/i,
    /increase your dose of/i,
    /decrease your dose of/i,
    /double your dose/i,
    /halve your medication/i,
    /discontinue (the|your) medication/i,
    /start taking \d+mg of/i
  ];

  private definitiveDiagnosticPhrases = [
    /you definitely have/i,
    /you are diagnosed with/i,
    /this confirms you have/i,
    /you have contracted/i,
    /our diagnosis is/i
  ];

  private redFlagEmergencyKeywords = [
    /chest pain/i,
    /difficulty breathing/i,
    /shortness of breath/i,
    /sudden numbness/i,
    /loss of vision/i,
    /slurred speech/i,
    /coughing up blood/i,
    /severe allergic reaction/i,
    /anaphylaxis/i,
    /suicidal/i
  ];

  /**
   * Scans text for clinical safety violations and returns a sanitized, clinically conservative version.
   */
  validateAndSanitize(content: string): SafetyValidationResult {
    const violations: string[] = [];
    let sanitizedText = content;
    let triggeredEmergencyEscalation = false;

    // Check emergency red flags
    for (const pattern of this.redFlagEmergencyKeywords) {
      if (pattern.test(content)) {
        triggeredEmergencyEscalation = true;
        violations.push(`Emergency red flag detected matching: ${pattern}`);
      }
    }

    // Check medication modification violations
    for (const pattern of this.dangerousMedicationPhrases) {
      if (pattern.test(sanitizedText)) {
        violations.push(`Dangerous medication advice detected matching: ${pattern}`);
        sanitizedText = sanitizedText.replace(
          pattern,
          "Consult your prescribing physician or pharmacist before any adjustments to"
        );
      }
    }

    // Check definitive diagnostic claims
    for (const pattern of this.definitiveDiagnosticPhrases) {
      if (pattern.test(sanitizedText)) {
        violations.push(`Definitive autonomous diagnosis detected matching: ${pattern}`);
        sanitizedText = sanitizedText.replace(
          pattern,
          "Your observed metrics are consistent with patterns frequently discussed in the context of"
        );
      }
    }

    if (triggeredEmergencyEscalation) {
      sanitizedText =
        "⚠️ CLINICAL ALERT: If you or someone you are caring for is experiencing severe symptoms such as acute chest pressure, breathing difficulty, or sudden weakness, seek emergency medical care immediately (call 911 / 112 / local emergency services).\n\n" +
        sanitizedText;
    }

    const isSafe = violations.length === 0 || (!violations.some(v => v.includes("Dangerous medication")));

    return {
      isSafe,
      violations,
      sanitizedText,
      triggeredEmergencyEscalation
    };
  }

  /**
   * Appends mandatory LIFIFY medical disclaimer
   */
  appendStandardDisclaimer(text: string): string {
    return `${text}\n\n*LIFIFY is an observational health intelligence system. It does not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider.*`;
  }
}

export const safetyEngine = new ClinicalSafetyEngine();
