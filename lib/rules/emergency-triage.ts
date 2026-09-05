export type VitalAlertSeverity = 'NORMAL' | 'ELEVATED' | 'URGENT_WARNING' | 'CRITICAL_EMERGENCY';

export interface VitalInput {
  systolicBp?: number;
  diastolicBp?: number;
  glucoseMgDl?: number;
  glucoseContext?: 'FASTING' | 'POST_PRANDIAL' | 'RANDOM';
  spo2Percent?: number;
  heartRateBpm?: number;
  temperatureF?: number;
}

export interface VitalAlertItem {
  vitalType: 'BLOOD_PRESSURE' | 'GLUCOSE' | 'SPO2' | 'HEART_RATE' | 'TEMPERATURE';
  severity: VitalAlertSeverity;
  measuredValue: string;
  thresholdViolated: string;
  clinicalMessage: string;
  immediateAction: string;
}

export interface EmergencyEvaluationResult {
  hasEmergency: boolean;
  hasUrgentWarning: boolean;
  overallSeverity: VitalAlertSeverity;
  alerts: VitalAlertItem[];
  requiresSosModal: boolean;
  playAlarmAudio: boolean;
  emergencyNumbers: { label: string; number: string }[];
  suggestedActionHeadline?: string;
}

export function evaluateVitalEmergency(vitals: VitalInput): EmergencyEvaluationResult {
  const alerts: VitalAlertItem[] = [];

  // 1. Blood Pressure Check
  if (vitals.systolicBp != null || vitals.diastolicBp != null) {
    const sbp = vitals.systolicBp ?? 120;
    const dbp = vitals.diastolicBp ?? 80;

    if (sbp >= 180 || dbp >= 120) {
      alerts.push({
        vitalType: 'BLOOD_PRESSURE',
        severity: 'CRITICAL_EMERGENCY',
        measuredValue: `${sbp}/${dbp} mmHg`,
        thresholdViolated: 'Systolic ≥ 180 or Diastolic ≥ 120 mmHg',
        clinicalMessage: 'Hypertensive Crisis. Extreme risk of acute target-organ damage (stroke, encephalopathy, acute coronary syndrome, aortic dissection).',
        immediateAction: 'Sit down and remain completely calm. Do not engage in any physical activity. Seek emergency medical care or call 112/108 immediately.',
      });
    } else if (sbp < 90 || dbp < 60) {
      alerts.push({
        vitalType: 'BLOOD_PRESSURE',
        severity: 'URGENT_WARNING',
        measuredValue: `${sbp}/${dbp} mmHg`,
        thresholdViolated: 'Systolic < 90 or Diastolic < 60 mmHg',
        clinicalMessage: 'Hypotension / Low Blood Pressure. Risk of cerebral hypoperfusion, dizziness, fainting, or shock.',
        immediateAction: 'Lie down with feet elevated above heart level. Drink oral rehydration fluids or water if conscious. Seek medical assessment if persistent.',
      });
    } else if (sbp >= 140 || dbp >= 90) {
      alerts.push({
        vitalType: 'BLOOD_PRESSURE',
        severity: 'URGENT_WARNING',
        measuredValue: `${sbp}/${dbp} mmHg`,
        thresholdViolated: 'Stage 2 Hypertension (≥ 140/90 mmHg)',
        clinicalMessage: 'Elevated blood pressure requiring medical review and medication optimization.',
        immediateAction: 'Log reading, rest for 5 minutes, re-check, and discuss with prescribing physician.',
      });
    }
  }

  // 2. Glucose Check
  if (vitals.glucoseMgDl != null) {
    const g = vitals.glucoseMgDl;
    if (g < 54) {
      alerts.push({
        vitalType: 'GLUCOSE',
        severity: 'CRITICAL_EMERGENCY',
        measuredValue: `${g} mg/dL`,
        thresholdViolated: 'Blood Glucose < 54 mg/dL',
        clinicalMessage: 'Severe Neuroglycopenia / Hypoglycemia Alert! Imminent danger of confusion, seizures, loss of consciousness, or diabetic coma.',
        immediateAction: 'Rule of 15: Ingest 15–20 grams of fast-acting glucose immediately (e.g. 3-4 teaspoons of sugar in water, 1/2 cup fruit juice, or glucose tablets). Recheck in 15 minutes. Call for help.',
      });
    } else if (g < 70) {
      alerts.push({
        vitalType: 'GLUCOSE',
        severity: 'URGENT_WARNING',
        measuredValue: `${g} mg/dL`,
        thresholdViolated: 'Blood Glucose < 70 mg/dL',
        clinicalMessage: 'Mild-to-Moderate Hypoglycemia.',
        immediateAction: 'Consume 15g fast carbohydrate snack. Rest and verify blood glucose in 15 minutes.',
      });
    } else if (g >= 300) {
      alerts.push({
        vitalType: 'GLUCOSE',
        severity: 'CRITICAL_EMERGENCY',
        measuredValue: `${g} mg/dL`,
        thresholdViolated: 'Blood Glucose ≥ 300 mg/dL',
        clinicalMessage: 'Severe Hyperglycemia. Danger of Diabetic Ketoacidosis (DKA) or Hyperosmolar Hyperglycemic State (HHS).',
        immediateAction: 'Check urine ketones if available. Drink plenty of water (no sugar). Contact your endocrinologist or visit the emergency department.',
      });
    }
  }

  // 3. SpO2 Oxygen Saturation Check
  if (vitals.spo2Percent != null) {
    const spo2 = vitals.spo2Percent;
    if (spo2 < 90) {
      alerts.push({
        vitalType: 'SPO2',
        severity: 'CRITICAL_EMERGENCY',
        measuredValue: `${spo2}%`,
        thresholdViolated: 'Oxygen Saturation < 90%',
        clinicalMessage: 'Severe Hypoxemia / Respiratory Distress. Inadequate tissue oxygen delivery.',
        immediateAction: 'Administer supplemental oxygen if prescribed. Sit upright. Call emergency ambulance (108/112) immediately.',
      });
    } else if (spo2 < 94) {
      alerts.push({
        vitalType: 'SPO2',
        severity: 'URGENT_WARNING',
        measuredValue: `${spo2}%`,
        thresholdViolated: 'Oxygen Saturation < 94%',
        clinicalMessage: 'Subnormal oxygen saturation.',
        immediateAction: 'Rest quietly, verify finger probe placement and warmth, recheck in 2 minutes. Notify doctor if oxygen stays below 94%.',
      });
    }
  }

  // 4. Heart Rate Check
  if (vitals.heartRateBpm != null) {
    const hr = vitals.heartRateBpm;
    if (hr > 140) {
      alerts.push({
        vitalType: 'HEART_RATE',
        severity: 'CRITICAL_EMERGENCY',
        measuredValue: `${hr} bpm`,
        thresholdViolated: 'Resting Heart Rate > 140 bpm',
        clinicalMessage: 'Severe Tachycardia / Arrhythmia Risk (SVT, AF with rapid ventricular response).',
        immediateAction: 'Sit quietly. If accompanied by chest pain, dizziness, or shortness of breath, seek immediate emergency care.',
      });
    } else if (hr < 40) {
      alerts.push({
        vitalType: 'HEART_RATE',
        severity: 'CRITICAL_EMERGENCY',
        measuredValue: `${hr} bpm`,
        thresholdViolated: 'Heart Rate < 40 bpm',
        clinicalMessage: 'Severe Bradycardia / Conduction Block Risk.',
        immediateAction: 'Lie flat. Seek urgent medical evaluation if feeling dizzy, faint, or lightheaded.',
      });
    }
  }

  // 5. Temperature Check
  if (vitals.temperatureF != null) {
    const temp = vitals.temperatureF;
    if (temp >= 104.0) {
      alerts.push({
        vitalType: 'TEMPERATURE',
        severity: 'CRITICAL_EMERGENCY',
        measuredValue: `${temp}°F`,
        thresholdViolated: 'Core Temperature ≥ 104°F',
        clinicalMessage: 'Hyperpyrexia / Heat Stroke / Severe Systemic Infection.',
        immediateAction: 'Apply tepid sponging. Administer antipyretic if prescribed. Transfer to urgent medical care.',
      });
    } else if (temp <= 95.0) {
      alerts.push({
        vitalType: 'TEMPERATURE',
        severity: 'CRITICAL_EMERGENCY',
        measuredValue: `${temp}°F`,
        thresholdViolated: 'Core Temperature ≤ 95°F',
        clinicalMessage: 'Hypothermia alert.',
        immediateAction: 'Rewarm slowly with blankets and warm drinks. Seek medical assessment.',
      });
    }
  }

  const hasEmergency = alerts.some((a) => a.severity === 'CRITICAL_EMERGENCY');
  const hasUrgentWarning = alerts.some((a) => a.severity === 'URGENT_WARNING');

  let overallSeverity: VitalAlertSeverity = 'NORMAL';
  if (hasEmergency) overallSeverity = 'CRITICAL_EMERGENCY';
  else if (hasUrgentWarning) overallSeverity = 'URGENT_WARNING';
  else if (alerts.length > 0) overallSeverity = 'ELEVATED';

  const emergencyNumbers = [
    { label: 'India National Emergency', number: '112' },
    { label: 'Medical Ambulance (India)', number: '108' },
    { label: 'Maternity / Child Helpline', number: '102' },
  ];

  let suggestedActionHeadline: string | undefined = undefined;
  if (hasEmergency) {
    suggestedActionHeadline = 'CRITICAL CLINICAL VITAL READING DETECTED — SEEK IMMEDIATE MEDICAL ATTENTION';
  } else if (hasUrgentWarning) {
    suggestedActionHeadline = 'Abnormal Vital Reading Detected — Monitor Closely & Contact Physician';
  }

  return {
    hasEmergency,
    hasUrgentWarning,
    overallSeverity,
    alerts,
    requiresSosModal: hasEmergency,
    playAlarmAudio: hasEmergency,
    emergencyNumbers,
    suggestedActionHeadline,
  };
}
