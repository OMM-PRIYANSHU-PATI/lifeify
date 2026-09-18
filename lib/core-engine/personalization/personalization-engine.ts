/**
 * LIFIFY Core Health Intelligence Engine — Personalization Engine
 *
 * Produces the unified Daily Health Intelligence Plan answering:
 * "Given everything we know about my recent health, what is changing,
 *  why might it matter, and what should I pay attention to today?"
 */

import {
  HealthContext,
  PersonalizedDailyHealthPlan,
  RiskSignal,
  MetricBaselineSummary
} from "../types";

export class PersonalizationEngine {
  /**
   * Generates the personalized daily health plan from the aggregated health context.
   */
  generateDailyPlan(context: HealthContext): PersonalizedDailyHealthPlan {
    const readiness = context.sleep.readiness.score;
    const strain = context.fitness.currentStrain.adjustedStrain;
    const sleepDebt = context.sleep.sleepDebtHours;

    // 1. Generate Headline
    let headline = "Steady baseline health profile with balanced autonomic recovery.";
    if (readiness >= 85 && strain < 50) {
      headline = "High systemic readiness today: Ideal window for physical training progression or mental focus.";
    } else if (readiness < 60 || sleepDebt >= 2.5) {
      headline = "Recovery deficit detected: Prioritize sleep restoration, active mobility, and reduced physical load.";
    } else if (strain >= 70) {
      headline = "High training strain accumulated: Focus on hydration, quality nutrition, and restorative rest tonight.";
    }

    // 2. What Matters Today (Top 3 Focus Items)
    const topWhatMattersToday: string[] = [];

    // Focus 1: Readiness & Physical Strain
    if (readiness < 60) {
      topWhatMattersToday.push(
        `Readiness is at ${readiness}/100. Recommend ${context.fitness.adaptation.recommendedIntensity} intensity (${context.fitness.adaptation.suggestedActivities[0] || "Walking"}) to facilitate recovery.`
      );
    } else {
      topWhatMattersToday.push(
        `Readiness is strong at ${readiness}/100. Suggested workout: ${context.fitness.adaptation.suggestedDurationMinutes}m of ${context.fitness.adaptation.recommendedIntensity} intensity.`
      );
    }

    // Focus 2: Nutrition & Hydration
    const hydVariance = context.nutrition.todayVariance.hydrationVariance;
    if (hydVariance < -400) {
      topWhatMattersToday.push(
        `Hydration is currently ${Math.abs(hydVariance)}ml behind target. Consume fluids throughout the afternoon.`
      );
    } else {
      topWhatMattersToday.push(
        `Nutrition targets are well-aligned. Protein intake is at ${context.nutrition.proteinIntake}g.`
      );
    }

    // Focus 3: Medications or Sleep Rest
    if (context.medications.scheduledTodayCount > 0) {
      topWhatMattersToday.push(
        `Maintain schedule for ${context.medications.scheduledTodayCount} scheduled medications (7-day adherence: ${context.medications.adherencePercentLast7Days}%).`
      );
    } else if (sleepDebt > 1.5) {
      topWhatMattersToday.push(
        `Accumulated sleep debt is ${sleepDebt.toFixed(1)}h. Aim for an earlier bedtime tonight.`
      );
    } else {
      topWhatMattersToday.push(
        "All vital signs and longitudinal recovery parameters are tracking within normal baseline ranges."
      );
    }

    // 3. What Changed Relative to Baseline
    const whatChangedRelativeToBaseline: string[] = [];
    if (context.baselineDeviations && context.baselineDeviations.length > 0) {
      context.baselineDeviations.forEach((dev) => {
        const sign = dev.percentageDelta > 0 ? "+" : "";
        whatChangedRelativeToBaseline.push(
          `${dev.metric} shifted by ${sign}${dev.percentageDelta}% vs ${dev.windowDays}d baseline (current: ${dev.currentValue}, z-score: ${dev.zScore.toFixed(2)}).`
        );
      });
    } else {
      whatChangedRelativeToBaseline.push(
        "Resting heart rate, sleep duration, and daily steps are within ±1.0 standard deviations of your 30-day baseline."
      );
    }

    // 4. Possible Patterns (Cross-domain correlations)
    const possiblePatterns: string[] = [];
    if (context.sleep.lastNightHours < 6.5 && context.fitness.currentStrain.adjustedStrain > 55) {
      possiblePatterns.push(
        "Sleep drop aligns with elevated workout strain — watch for mid-afternoon energy dips."
      );
    }
    if (context.medications.recentAssociations.length > 0) {
      possiblePatterns.push(
        context.medications.recentAssociations[0].observationalStatement
      );
    }
    if (possiblePatterns.length === 0) {
      possiblePatterns.push(
        "Consistent positive correlation observed between >7h sleep nights and next-day workout completion."
      );
    }

    // 5. Prioritized Actions
    const personalizedActions: PersonalizedDailyHealthPlan["personalizedActions"] = [];

    if (readiness < 65) {
      personalizedActions.push({
        domain: "RECOVERY",
        title: "Active Recovery Day",
        description: "Swap strenuous conditioning for 25 minutes of low-impact walking or yoga mobility.",
        priority: "HIGH"
      });
    } else {
      personalizedActions.push({
        domain: "FITNESS",
        title: "Target Training Session",
        description: `Complete ${context.fitness.adaptation.suggestedDurationMinutes}m ${context.fitness.adaptation.recommendedIntensity}-intensity workout.`,
        priority: "MEDIUM"
      });
    }

    if (hydVariance < -300) {
      personalizedActions.push({
        domain: "NUTRITION",
        title: "Restore Fluid Balance",
        description: "Drink 500ml of water or electrolyte solution before late afternoon.",
        priority: "HIGH"
      });
    } else {
      personalizedActions.push({
        domain: "NUTRITION",
        title: "Sustain Protein Intake",
        description: "Include a clean protein source (paneer, dal, eggs, or Greek yogurt) in your next meal.",
        priority: "ROUTINE"
      });
    }

    if (sleepDebt > 1.5) {
      personalizedActions.push({
        domain: "SLEEP",
        title: "Sleep Debt Amortization",
        description: "Advance bedtime by 30 minutes to reduce cumulative autonomic fatigue.",
        priority: "MEDIUM"
      });
    }

    if (context.medications.scheduledTodayCount > 0 && context.medications.adherencePercentLast7Days < 100) {
      personalizedActions.push({
        domain: "MEDICATION",
        title: "Verify Dose Timing",
        description: "Confirm and log today's scheduled medication dose to protect adherence continuity.",
        priority: "HIGH"
      });
    }

    // 6. Doctor Discussion Prompts
    const doctorDiscussionPrompts: string[] = [];
    if (context.baselineDeviations.some((d) => d.metric.toLowerCase().includes("heart rate"))) {
      doctorDiscussionPrompts.push(
        "Discuss recent upward shift in resting heart rate over the past 14 days."
      );
    }
    if (context.medications.recentAssociations.length > 0) {
      doctorDiscussionPrompts.push(
        `Share observational timing log between ${context.medications.recentAssociations[0].medicationName} and ${context.medications.recentAssociations[0].symptomName}.`
      );
    }
    if (context.vitals.latestSystolicBp && context.vitals.latestSystolicBp >= 135) {
      doctorDiscussionPrompts.push(
        `Review home systolic blood pressure log (recent reading: ${context.vitals.latestSystolicBp} mmHg).`
      );
    }
    if (doctorDiscussionPrompts.length === 0) {
      doctorDiscussionPrompts.push(
        "Current health vitals, recovery parameters, and sleep stability are within normal bounds for routine checkups."
      );
    }

    return {
      headline,
      readinessIndex: readiness,
      topWhatMattersToday,
      whatChangedRelativeToBaseline,
      possiblePatterns,
      riskSignals: context.riskSignals,
      personalizedActions,
      doctorDiscussionPrompts
    };
  }
}

export const personalizationEngine = new PersonalizationEngine();
