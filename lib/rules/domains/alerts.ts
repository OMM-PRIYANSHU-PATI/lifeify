import { Rule } from "../engine";

export type VitalType = "BP" | "GLUCOSE" | "HEART_RATE" | "SPO2" | "WEIGHT";

export interface VitalSample {
  type: VitalType;
  value?: number;
  systolic?: number;
  diastolic?: number;
  takenAt: Date;
}

export interface VitalAlertInput {
  samples: VitalSample[];
  thresholdOutOfRangeCount?: number; // e.g. 2 or 3 in the window
}

export interface VitalAlertOutput {
  shouldAlert: boolean;
  outOfRangeCount: number;
  totalSamples: number;
  metricType: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  informationalMessage: string;
}

export function isSampleInRange(sample: VitalSample): boolean {
  switch (sample.type) {
    case "BP":
      if (sample.systolic == null || sample.diastolic == null) return true;
      return sample.systolic < 130 && sample.diastolic < 85;
    case "GLUCOSE":
      if (sample.value == null) return true;
      return sample.value >= 70 && sample.value <= 140;
    case "HEART_RATE":
      if (sample.value == null) return true;
      return sample.value >= 60 && sample.value <= 100;
    case "SPO2":
      if (sample.value == null) return true;
      return sample.value >= 95;
    default:
      return true;
  }
}

export const vitalAlertRule: Rule<VitalAlertInput, VitalAlertOutput> = {
  id: "rule_vital_alert_v1",
  name: "Range-Aware Informational Vital Alert",
  domain: "alerts",
  evaluate(input: VitalAlertInput) {
    const total = input.samples.length;
    if (total === 0) {
      return {
        output: {
          shouldAlert: false,
          outOfRangeCount: 0,
          totalSamples: 0,
          metricType: "NONE",
          severity: "INFO",
          informationalMessage: "No vitals recorded in the window.",
        },
        explanation: "No vital readings provided to evaluate.",
      };
    }

    const metric = input.samples[0].type;
    const threshold = input.thresholdOutOfRangeCount ?? 2;
    const outOfRange = input.samples.filter((s) => !isSampleInRange(s));
    const outCount = outOfRange.length;

    const shouldAlert = outCount >= threshold;

    let severity: VitalAlertOutput["severity"] = "INFO";
    if (outCount >= 3) severity = "WARNING";

    // Strictly informational copy — NEVER a diagnosis.
    const message = shouldAlert
      ? `Your recorded ${metric.replace("_", " ")} readings have been outside your configured target range ${outCount} time(s) recently. We recommend noting this to share with your healthcare provider.`
      : `All recent recorded ${metric.replace("_", " ")} readings are within standard target ranges.`;

    return {
      output: {
        shouldAlert,
        outOfRangeCount: outCount,
        totalSamples: total,
        metricType: metric,
        severity,
        informationalMessage: message,
      },
      explanation: message,
      details: {
        metric,
        outCount,
        total,
        threshold,
      },
    };
  },
};
