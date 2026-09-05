export type TriageUrgency = 'EMERGENCY' | 'URGENT_CARE' | 'PRIMARY_CARE' | 'SELF_CARE';

export interface SymptomAssessmentInput {
  primaryComplaint: 'CHEST_PAIN' | 'HEADACHE' | 'BREATHLESSNESS' | 'ABDOMINAL_PAIN' | 'FEVER' | 'COUGH' | 'OTHER';
  durationHours: number;
  severityScale: number; // 1 to 10
  // Red flag checkboxes
  hasChestPressureRadiating: boolean; // chest pain radiating to jaw/left arm/back
  hasShortnessOfBreathAtRest: boolean;
  hasSuddenNeurologicalDeficit: boolean; // facial droop, arm drift, slurred speech (FAST)
  hasConfusionOrDrowsiness: boolean;
  hasStiffNeckWithFever: boolean; // meningism
  hasSevereAbdominalRigidity: boolean;
  hasBloodyVomitOrStool: boolean;
  hasHighFeverUnresponsive: boolean; // > 103F unresponsive to antipyretics
  hasPersistentVomitingDehydration: boolean;
  // Patient context
  age: number;
  hasKnownCardiacHistory: boolean;
  hasDiabetes: boolean;
  hasImmunocompromise: boolean;
}

export interface TriageResult {
  urgency: TriageUrgency;
  urgencyHeadline: string;
  recommendedActionTimeframe: string;
  identifiedRedFlags: string[];
  clinicalRationale: string;
  immediateInstructions: string[];
  homeCareAdvice: string[];
  warningSignsToReassess: string[];
  disclaimer: string;
}

export function evaluateSymptomTriage(input: SymptomAssessmentInput): TriageResult {
  const identifiedRedFlags: string[] = [];
  const immediateInstructions: string[] = [];
  const homeCareAdvice: string[] = [];
  const warningSignsToReassess: string[] = [
    'Sudden worsening in symptom severity or spread',
    'Onset of new chest pain, dizziness, or shortness of breath',
    'Inability to tolerate oral fluids or keep down medication',
    'Confusion, lethargy, or extreme weakness',
  ];

  const disclaimer =
    'LIFEIFY Symptom Triage is an automated clinical decision-support screening aid. It is NOT a medical diagnosis or prescription. If you believe you are experiencing a life-threatening medical emergency, call 112 or 108 immediately.';

  // 1. Critical Red Flag Interceptor (Immediate Emergency)
  if (input.hasChestPressureRadiating) {
    identifiedRedFlags.push('Chest pain radiating to arm/jaw/back (Suspected Acute Coronary Syndrome)');
  }
  if (input.hasSuddenNeurologicalDeficit) {
    identifiedRedFlags.push('Sudden focal neurological deficit (Facial droop / Arm weakness / Slurred speech - FAST stroke signs)');
  }
  if (input.hasShortnessOfBreathAtRest && (input.severityScale >= 7 || input.primaryComplaint === 'BREATHLESSNESS')) {
    identifiedRedFlags.push('Severe acute dyspnea / breathlessness at rest');
  }
  if (input.hasStiffNeckWithFever) {
    identifiedRedFlags.push('Fever with neck stiffness and photophobia (Meningeal irritation signs)');
  }
  if (input.hasSevereAbdominalRigidity) {
    identifiedRedFlags.push('Severe rigid board-like abdomen (Suspected acute peritonitis / visceral perforation)');
  }
  if (input.hasBloodyVomitOrStool) {
    identifiedRedFlags.push('Acute gastrointestinal hemorrhage (Hematemesis or melena)');
  }

  if (identifiedRedFlags.length > 0) {
    immediateInstructions.push(
      'CALL EMERGENCY AMBULANCE (112 or 108) IMMEDIATELY.',
      'Do not attempt to drive yourself to the emergency department.',
      'Sit or lie down in a comfortable position, loosen tight clothing.',
      input.hasChestPressureRadiating
        ? 'If instructed by an emergency medical dispatcher, chew 300mg soluble aspirin unless contraindicated.'
        : 'Keep the patient still and observe airway, breathing, and level of consciousness.'
    );

    return {
      urgency: 'EMERGENCY',
      urgencyHeadline: 'EMERGENCY: Immediate Medical Care Required (Call 112 / 108)',
      recommendedActionTimeframe: 'IMMEDIATELY (Within minutes)',
      identifiedRedFlags,
      clinicalRationale: `Critical red flag signs detected: ${identifiedRedFlags.join(', ')}. These symptoms require immediate emergency hospital evaluation.`,
      immediateInstructions,
      homeCareAdvice: [],
      warningSignsToReassess,
      disclaimer,
    };
  }

  // 2. Urgent Care Evaluation (Needs in-person doctor evaluation within 6-12 hours)
  const urgentTriggers: string[] = [];
  if (input.hasHighFeverUnresponsive) {
    urgentTriggers.push('Fever exceeding 103°F unresponsive to standard antipyretics');
  }
  if (input.hasPersistentVomitingDehydration) {
    urgentTriggers.push('Intractable vomiting preventing hydration with signs of clinical dehydration');
  }
  if (input.severityScale >= 8) {
    urgentTriggers.push(`Severe self-reported pain score (${input.severityScale}/10)`);
  }
  if (input.primaryComplaint === 'CHEST_PAIN' && input.hasKnownCardiacHistory) {
    urgentTriggers.push('New chest discomfort in patient with pre-existing coronary artery disease');
  }
  if (input.primaryComplaint === 'FEVER' && input.hasImmunocompromise) {
    urgentTriggers.push('Febrile episode in immunocompromised patient (Neutropenic fever risk)');
  }

  if (urgentTriggers.length > 0) {
    immediateInstructions.push(
      'Visit an urgent care center or outpatient clinic today.',
      'Maintain resting posture and do not undergo physical stress.',
      'Have someone accompany you to the clinic.'
    );

    return {
      urgency: 'URGENT_CARE',
      urgencyHeadline: 'URGENT: In-Person Medical Review Needed Today',
      recommendedActionTimeframe: 'Within 6 to 12 hours',
      identifiedRedFlags: urgentTriggers,
      clinicalRationale: `Signs warranting urgent clinical evaluation detected: ${urgentTriggers.join(', ')}.`,
      immediateInstructions,
      homeCareAdvice: [
        'Sip oral rehydration salts (ORS) or electrolyte fluids.',
        'Record temperature and vital signs hourly until seen by a physician.',
      ],
      warningSignsToReassess,
      disclaimer,
    };
  }

  // 3. Primary Care vs Self Care
  const isPrimaryCare =
    input.durationHours > 72 || // lasting more than 3 days
    input.severityScale >= 5 ||
    input.age >= 65 ||
    input.hasDiabetes;

  if (isPrimaryCare) {
    immediateInstructions.push(
      'Book a consultation with your family physician or general practitioner.',
      'Keep a written log of when symptoms occur, their triggers, and medications taken.',
      'Bring all your current prescription bottles to the consultation.'
    );

    return {
      urgency: 'PRIMARY_CARE',
      urgencyHeadline: 'PRIMARY CARE: Schedule Physician Consultation',
      recommendedActionTimeframe: 'Within 24 to 72 hours',
      identifiedRedFlags: [],
      clinicalRationale:
        'Your symptoms are stable without immediate acute danger signs, but their duration, severity, or underlying medical profile indicates professional outpatient evaluation is advised.',
      immediateInstructions,
      homeCareAdvice: [
        'Get adequate restorative sleep and stay well hydrated.',
        'Avoid strenuous exertion or heavy meals.',
      ],
      warningSignsToReassess,
      disclaimer,
    };
  }

  // 4. Self Care
  return {
    urgency: 'SELF_CARE',
    urgencyHeadline: 'SELF CARE: Home Monitoring & Rest',
    recommendedActionTimeframe: 'Monitor at home; consult doctor if no improvement in 48-72 hours',
    identifiedRedFlags: [],
    clinicalRationale:
      'Mild, short-duration symptoms with no red flags identified. Suitable for supportive home care and hydration.',
    immediateInstructions: [
      'Ensure adequate fluid intake (2 to 2.5 liters of water/electrolytes daily).',
      'Rest in a comfortable, quiet environment.',
      'Avoid sudden strenuous physical exercise.',
    ],
    homeCareAdvice: [
      'Monitor symptoms twice daily.',
      'Eat light, easily digestible home-cooked meals.',
      'Over-the-counter soothing measures (steam inhalation for mild congestion, warm salt water gargle).',
    ],
    warningSignsToReassess,
    disclaimer,
  };
}
