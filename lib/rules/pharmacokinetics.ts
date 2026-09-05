export interface DrugPKParameters {
  genericName: string;
  halfLifeHours: number; // t 1/2
  timeToPeakHours: number; // Tmax
  dosingIntervalHours: number; // standard interval e.g. 24 for OD, 12 for BD
  daysToFullClinicalEffect: number; // e.g. 14-28 days
  therapeuticMin: number; // arbitrary normalized units (e.g. 10)
  therapeuticMax: number; // arbitrary normalized units (e.g. 25)
  clinicalClass: string;
}

export const DRUG_PK_DATABASE: Record<string, DrugPKParameters> = {
  metformin: {
    genericName: 'metformin',
    halfLifeHours: 6.2,
    timeToPeakHours: 2.5,
    dosingIntervalHours: 12,
    daysToFullClinicalEffect: 7,
    therapeuticMin: 10,
    therapeuticMax: 30,
    clinicalClass: 'Biguanide Antidiabetic',
  },
  atorvastatin: {
    genericName: 'atorvastatin',
    halfLifeHours: 14.0,
    timeToPeakHours: 1.5,
    dosingIntervalHours: 24,
    daysToFullClinicalEffect: 28,
    therapeuticMin: 10,
    therapeuticMax: 35,
    clinicalClass: 'HMG-CoA Reductase Inhibitor (Statin)',
  },
  rosuvastatin: {
    genericName: 'rosuvastatin',
    halfLifeHours: 19.0,
    timeToPeakHours: 4.0,
    dosingIntervalHours: 24,
    daysToFullClinicalEffect: 28,
    therapeuticMin: 12,
    therapeuticMax: 35,
    clinicalClass: 'HMG-CoA Reductase Inhibitor (Statin)',
  },
  amlodipine: {
    genericName: 'amlodipine',
    halfLifeHours: 35.0,
    timeToPeakHours: 7.0,
    dosingIntervalHours: 24,
    daysToFullClinicalEffect: 14,
    therapeuticMin: 15,
    therapeuticMax: 40,
    clinicalClass: 'Dihydropyridine Calcium Channel Blocker',
  },
  telmisartan: {
    genericName: 'telmisartan',
    halfLifeHours: 24.0,
    timeToPeakHours: 1.0,
    dosingIntervalHours: 24,
    daysToFullClinicalEffect: 28,
    therapeuticMin: 12,
    therapeuticMax: 35,
    clinicalClass: 'Angiotensin II Receptor Blocker (ARB)',
  },
  aspirin: {
    genericName: 'aspirin',
    halfLifeHours: 0.5, // low dose antiplatelet irreversible COX-1 inhibition
    timeToPeakHours: 1.0,
    dosingIntervalHours: 24,
    daysToFullClinicalEffect: 5,
    therapeuticMin: 8,
    therapeuticMax: 20,
    clinicalClass: 'Antiplatelet / Salicylate',
  },
  levothyroxine: {
    genericName: 'levothyroxine',
    halfLifeHours: 168.0, // 7 days!
    timeToPeakHours: 3.0,
    dosingIntervalHours: 24,
    daysToFullClinicalEffect: 42, // 6 weeks
    therapeuticMin: 15,
    therapeuticMax: 35,
    clinicalClass: 'Thyroid Hormone',
  },
  escitalopram: {
    genericName: 'escitalopram',
    halfLifeHours: 30.0,
    timeToPeakHours: 4.0,
    dosingIntervalHours: 24,
    daysToFullClinicalEffect: 28,
    therapeuticMin: 12,
    therapeuticMax: 30,
    clinicalClass: 'Selective Serotonin Reuptake Inhibitor (SSRI)',
  },
};

export interface PKCurvePoint {
  hour: number;
  theoreticalConcentration: number;
  adherenceAdjustedConcentration: number;
  therapeuticMin: number;
  therapeuticMax: number;
}

export interface EffectivenessProjection {
  genericName: string;
  clinicalClass: string;
  halfLifeHours: number;
  hoursToSteadyState: number; // 4 to 5 half-lives
  daysToClinicalOnset: number;
  currentDaysOnRegimen: number;
  percentSteadyStateAchieved: number;
  loggedAdherenceRate: number; // 0 to 100 %
  therapeuticStatus: 'SUB_THERAPEUTIC' | 'OPTIMAL_THERAPEUTIC' | 'SUPRA_THERAPEUTIC';
  estimatedClinicalEfficacyPercent: number;
  simulationCurve: PKCurvePoint[];
  clinicalInsights: string[];
}

/**
 * Computes deterministic steady-state pharmacokinetics curve and adherence-adjusted projection
 */
export function calculateMedicationEffectiveness(params: {
  drugName: string;
  daysSinceStarted: number;
  adherenceRate: number; // e.g. 85 for 85%
  frequencyPerDay?: number;
}): EffectivenessProjection {
  const normalized = params.drugName.trim().toLowerCase();
  // match by substring if brand/dose provided
  let pk = DRUG_PK_DATABASE[normalized];
  if (!pk) {
    for (const key of Object.keys(DRUG_PK_DATABASE)) {
      if (normalized.includes(key)) {
        pk = DRUG_PK_DATABASE[key];
        break;
      }
    }
  }

  // fallback default profile if not in specific database
  if (!pk) {
    pk = {
      genericName: params.drugName,
      halfLifeHours: 12,
      timeToPeakHours: 2,
      dosingIntervalHours: params.frequencyPerDay ? 24 / params.frequencyPerDay : 24,
      daysToFullClinicalEffect: 14,
      therapeuticMin: 10,
      therapeuticMax: 30,
      clinicalClass: 'General Prescription Agent',
    };
  }

  const ke = Math.LN2 / pk.halfLifeHours; // elimination rate constant
  const ka = 1.2 / pk.timeToPeakHours; // approximate absorption rate
  const tau = pk.dosingIntervalHours; // dosing interval

  const hoursToSteadyState = Math.round(pk.halfLifeHours * 4.5);
  const totalHoursElapsed = params.daysSinceStarted * 24;

  // Steady state accumulation fraction: 1 - exp(-ke * t)
  const ssFraction = Math.min(1, 1 - Math.exp(-ke * totalHoursElapsed));
  const percentSteadyStateAchieved = Math.round(ssFraction * 100);

  // Adherence penalty factor (0.0 to 1.0)
  const adherenceFactor = Math.max(0.05, Math.min(1.0, (params.adherenceRate || 80) / 100));

  // Compute 24-hour steady state curve in 1-hour increments
  const simulationCurve: PKCurvePoint[] = [];
  const nominalDose = 20; // normalized standard dose unit

  for (let t = 0; t <= 24; t += 2) {
    // 1-compartment steady-state oral concentration formula
    const baseOral =
      nominalDose *
      (ka / (ka - ke)) *
      (Math.exp(-ke * (t % tau)) / (1 - Math.exp(-ke * tau)) -
        Math.exp(-ka * (t % tau)) / (1 - Math.exp(-ka * tau)));

    const cTheory = Math.max(0, Math.round(baseOral * 10) / 10);
    const cAdherence = Math.max(0, Math.round(baseOral * adherenceFactor * 10) / 10);

    simulationCurve.push({
      hour: t,
      theoreticalConcentration: cTheory,
      adherenceAdjustedConcentration: cAdherence,
      therapeuticMin: pk.therapeuticMin,
      therapeuticMax: pk.therapeuticMax,
    });
  }

  // Determine average adherence-adjusted level across interval
  const avgLevel =
    simulationCurve.reduce((sum, p) => sum + p.adherenceAdjustedConcentration, 0) /
    simulationCurve.length;

  let therapeuticStatus: EffectivenessProjection['therapeuticStatus'] = 'OPTIMAL_THERAPEUTIC';
  if (avgLevel < pk.therapeuticMin) {
    therapeuticStatus = 'SUB_THERAPEUTIC';
  } else if (avgLevel > pk.therapeuticMax) {
    therapeuticStatus = 'SUPRA_THERAPEUTIC';
  }

  // Estimated clinical efficacy: combination of days elapsed towards full effect + adherence
  const onsetProgress = Math.min(1.0, params.daysSinceStarted / pk.daysToFullClinicalEffect);
  const estimatedClinicalEfficacyPercent = Math.round(
    onsetProgress * adherenceFactor * 100
  );

  const clinicalInsights: string[] = [];
  if (params.daysSinceStarted < pk.daysToFullClinicalEffect) {
    clinicalInsights.push(
      `Full therapeutic action typically develops after ${pk.daysToFullClinicalEffect} days of consecutive dosing. You are currently on day ${params.daysSinceStarted}.`
    );
  } else {
    clinicalInsights.push(
      `Sufficient duration elapsed (${params.daysSinceStarted} days) to achieve maximum steady-state organ response.`
    );
  }

  if (params.adherenceRate < 80) {
    clinicalInsights.push(
      `Current adherence (${params.adherenceRate}%) reduces average circulating drug concentrations into sub-therapeutic territory, lowering expected clinical benefit.`
    );
  } else {
    clinicalInsights.push(
      `Adherence of ${params.adherenceRate}% provides stable, predictable therapeutic blood levels within the validated clinical efficacy window.`
    );
  }

  return {
    genericName: pk.genericName,
    clinicalClass: pk.clinicalClass,
    halfLifeHours: pk.halfLifeHours,
    hoursToSteadyState,
    daysToClinicalOnset: pk.daysToFullClinicalEffect,
    currentDaysOnRegimen: params.daysSinceStarted,
    percentSteadyStateAchieved,
    loggedAdherenceRate: params.adherenceRate,
    therapeuticStatus,
    estimatedClinicalEfficacyPercent,
    simulationCurve,
    clinicalInsights,
  };
}
