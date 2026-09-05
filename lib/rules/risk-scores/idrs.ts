/**
 * Indian Diabetes Risk Score (IDRS)
 * Developed and validated by the Madras Diabetes Research Foundation (MDRF - Dr. V. Mohan)
 * Endorsed by ICMR for community-level type-2 diabetes screening in South Asians.
 */

export interface IDRSInput {
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  waistCircumferenceCm: number;
  physicalActivity: 'VIGOROUS' | 'MODERATE' | 'MILD_SEDENTARY' | 'NO_EXERCISE';
  familyHistory: 'NONE' | 'ONE_PARENT' | 'BOTH_PARENTS';
}

export interface IDRSResult {
  score: number; // 0 to 100
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH';
  estimatedPrevalenceRiskPercent: string;
  componentBreakdown: {
    agePoints: number;
    waistPoints: number;
    activityPoints: number;
    familyHistoryPoints: number;
  };
  recommendations: string[];
}

export function calculateIDRS(input: IDRSInput): IDRSResult {
  // 1. Age Points
  let agePoints = 0;
  if (input.age >= 50) {
    agePoints = 30;
  } else if (input.age >= 35) {
    agePoints = 20;
  } else {
    agePoints = 0;
  }

  // 2. Abdominal Obesity (Waist Circumference) Points (South Asian cutoffs)
  let waistPoints = 0;
  const isFemale = input.gender === 'FEMALE';

  if (isFemale) {
    if (input.waistCircumferenceCm < 80) {
      waistPoints = 0;
    } else if (input.waistCircumferenceCm <= 89) {
      waistPoints = 10;
    } else {
      waistPoints = 20;
    }
  } else {
    // Male & Other
    if (input.waistCircumferenceCm < 85) {
      waistPoints = 0;
    } else if (input.waistCircumferenceCm <= 89) {
      waistPoints = 10;
    } else {
      waistPoints = 20;
    }
  }

  // 3. Physical Activity Points
  let activityPoints = 0;
  switch (input.physicalActivity) {
    case 'VIGOROUS':
      activityPoints = 0;
      break;
    case 'MODERATE':
      activityPoints = 10;
      break;
    case 'MILD_SEDENTARY':
      activityPoints = 20;
      break;
    case 'NO_EXERCISE':
    default:
      activityPoints = 30;
      break;
  }

  // 4. Family History Points
  let familyHistoryPoints = 0;
  switch (input.familyHistory) {
    case 'BOTH_PARENTS':
      familyHistoryPoints = 20;
      break;
    case 'ONE_PARENT':
      familyHistoryPoints = 10;
      break;
    case 'NONE':
    default:
      familyHistoryPoints = 0;
      break;
  }

  const totalScore = agePoints + waistPoints + activityPoints + familyHistoryPoints;

  let riskCategory: IDRSResult['riskCategory'] = 'LOW';
  let estimatedPrevalenceRiskPercent = '< 5%';
  const recommendations: string[] = [];

  if (totalScore >= 60) {
    riskCategory = 'HIGH';
    estimatedPrevalenceRiskPercent = '> 60% probability of dysglycemia / diabetes';
    recommendations.push(
      'Schedule a confirmatory fasting plasma glucose and HbA1c test with your primary physician.',
      'Adopt minimum 150 minutes of moderate aerobic physical activity per week.',
      'Consult a clinical nutritionist to manage abdominal adiposity and dietary glycemic index.'
    );
  } else if (totalScore >= 30) {
    riskCategory = 'MODERATE';
    estimatedPrevalenceRiskPercent = '~15-20% likelihood of impaired glucose tolerance';
    recommendations.push(
      'Routine annual screening with fasting blood glucose is recommended.',
      'Maintain or initiate regular 30-minute daily brisk walking.',
      'Focus on high-fiber whole grains and reducing refined carbohydrates.'
    );
  } else {
    riskCategory = 'LOW';
    estimatedPrevalenceRiskPercent = '< 5% risk';
    recommendations.push(
      'Maintain your healthy active lifestyle and waist circumference.',
      'Re-assess risk every 3 years or upon significant lifestyle changes.'
    );
  }

  return {
    score: totalScore,
    riskCategory,
    estimatedPrevalenceRiskPercent,
    componentBreakdown: {
      agePoints,
      waistPoints,
      activityPoints,
      familyHistoryPoints,
    },
    recommendations,
  };
}
