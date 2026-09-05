/**
 * Framingham 10-Year Cardiovascular Disease (CVD) Risk Calculator
 * Based on the Framingham Heart Study risk prediction algorithms (D'Agostino et al., Circulation 2008)
 */

export interface FraminghamInput {
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  totalCholesterolMgDl: number;
  hdlCholesterolMgDl: number;
  systolicBp: number;
  isBpTreated: boolean;
  isSmoker: boolean;
  hasDiabetes: boolean;
}

export interface FraminghamResult {
  tenYearRiskPercent: number;
  riskCategory: 'LOW' | 'INTERMEDIATE' | 'HIGH';
  points: number;
  heartAgeYears: number;
  modifiableRiskFactors: string[];
  recommendations: string[];
}

export function calculateFraminghamCvdRisk(input: FraminghamInput): FraminghamResult {
  const isMale = input.gender !== 'FEMALE';
  let points = 0;
  const modifiableRiskFactors: string[] = [];

  // 1. Age
  if (isMale) {
    if (input.age < 35) points += -9;
    else if (input.age <= 39) points += -4;
    else if (input.age <= 44) points += 0;
    else if (input.age <= 49) points += 3;
    else if (input.age <= 54) points += 6;
    else if (input.age <= 59) points += 8;
    else if (input.age <= 64) points += 10;
    else if (input.age <= 69) points += 11;
    else if (input.age <= 74) points += 12;
    else points += 13;
  } else {
    // Female
    if (input.age < 35) points += -7;
    else if (input.age <= 39) points += -3;
    else if (input.age <= 44) points += 0;
    else if (input.age <= 49) points += 3;
    else if (input.age <= 54) points += 6;
    else if (input.age <= 59) points += 8;
    else if (input.age <= 64) points += 10;
    else if (input.age <= 69) points += 12;
    else if (input.age <= 74) points += 14;
    else points += 16;
  }

  // 2. Total Cholesterol (stratified by age brackets)
  const age = input.age;
  const tc = input.totalCholesterolMgDl;
  if (isMale) {
    if (tc < 160) points += 0;
    else if (tc <= 199) {
      if (age < 40) points += 4;
      else if (age < 50) points += 3;
      else if (age < 60) points += 2;
      else if (age < 70) points += 1;
      else points += 0;
    } else if (tc <= 239) {
      if (age < 40) points += 7;
      else if (age < 50) points += 5;
      else if (age < 60) points += 3;
      else if (age < 70) points += 1;
      else points += 0;
    } else if (tc <= 279) {
      if (age < 40) points += 9;
      else if (age < 50) points += 6;
      else if (age < 60) points += 4;
      else if (age < 70) points += 2;
      else points += 1;
    } else {
      // >= 280
      if (age < 40) points += 11;
      else if (age < 50) points += 8;
      else if (age < 60) points += 5;
      else if (age < 70) points += 3;
      else points += 1;
    }
  } else {
    // Female
    if (tc < 160) points += 0;
    else if (tc <= 199) {
      if (age < 40) points += 4;
      else if (age < 50) points += 3;
      else if (age < 60) points += 2;
      else if (age < 70) points += 1;
      else points += 1;
    } else if (tc <= 239) {
      if (age < 40) points += 8;
      else if (age < 50) points += 6;
      else if (age < 60) points += 4;
      else if (age < 70) points += 2;
      else points += 1;
    } else if (tc <= 279) {
      if (age < 40) points += 11;
      else if (age < 50) points += 8;
      else if (age < 60) points += 5;
      else if (age < 70) points += 3;
      else points += 2;
    } else {
      // >= 280
      if (age < 40) points += 13;
      else if (age < 50) points += 10;
      else if (age < 60) points += 7;
      else if (age < 70) points += 4;
      else points += 2;
    }
  }

  if (tc >= 200) {
    modifiableRiskFactors.push(`Elevated Total Cholesterol (${tc} mg/dL)`);
  }

  // 3. HDL Cholesterol
  const hdl = input.hdlCholesterolMgDl;
  if (hdl >= 60) points += -1;
  else if (hdl >= 50) points += 0;
  else if (hdl >= 40) points += 1;
  else {
    points += 2;
    modifiableRiskFactors.push(`Low HDL Cholesterol (${hdl} mg/dL)`);
  }

  // 4. Systolic Blood Pressure (treated vs untreated)
  const sbp = input.systolicBp;
  const treated = input.isBpTreated;
  if (isMale) {
    if (sbp < 120) points += 0;
    else if (sbp <= 129) points += treated ? 1 : 0;
    else if (sbp <= 139) points += treated ? 2 : 1;
    else if (sbp <= 159) points += treated ? 2 : 1;
    else points += treated ? 3 : 2; // >= 160
  } else {
    // Female
    if (sbp < 120) points += 0;
    else if (sbp <= 129) points += treated ? 3 : 1;
    else if (sbp <= 139) points += treated ? 4 : 2;
    else if (sbp <= 159) points += treated ? 5 : 3;
    else points += treated ? 6 : 4;
  }

  if (sbp >= 130) {
    modifiableRiskFactors.push(`Elevated Systolic Blood Pressure (${sbp} mmHg)`);
  }

  // 5. Cigarette Smoking
  if (input.isSmoker) {
    modifiableRiskFactors.push('Active Tobacco Use');
    if (isMale) {
      if (age < 40) points += 8;
      else if (age < 50) points += 5;
      else if (age < 60) points += 3;
      else if (age < 70) points += 1;
      else points += 1;
    } else {
      if (age < 40) points += 9;
      else if (age < 50) points += 7;
      else if (age < 60) points += 4;
      else if (age < 70) points += 2;
      else points += 1;
    }
  }

  // 6. Diabetes
  if (input.hasDiabetes) {
    modifiableRiskFactors.push('Type 2 Diabetes');
    if (isMale) points += 2;
    else points += 4;
  }

  // Mapping Points to 10-Year Risk %
  let tenYearRiskPercent = 1.0;
  if (isMale) {
    if (points <= -3) tenYearRiskPercent = 0.5;
    else if (points <= -1) tenYearRiskPercent = 1.0;
    else if (points === 0) tenYearRiskPercent = 1.6;
    else if (points === 1) tenYearRiskPercent = 1.9;
    else if (points === 2) tenYearRiskPercent = 2.3;
    else if (points === 3) tenYearRiskPercent = 2.8;
    else if (points === 4) tenYearRiskPercent = 3.5;
    else if (points === 5) tenYearRiskPercent = 4.4;
    else if (points === 6) tenYearRiskPercent = 5.5;
    else if (points === 7) tenYearRiskPercent = 6.9;
    else if (points === 8) tenYearRiskPercent = 8.7;
    else if (points === 9) tenYearRiskPercent = 11.0;
    else if (points === 10) tenYearRiskPercent = 13.7;
    else if (points === 11) tenYearRiskPercent = 17.2;
    else if (points === 12) tenYearRiskPercent = 21.6;
    else if (points === 13) tenYearRiskPercent = 26.8;
    else tenYearRiskPercent = 30.0;
  } else {
    // Female
    if (points <= -2) tenYearRiskPercent = 0.5;
    else if (points <= 0) tenYearRiskPercent = 1.2;
    else if (points <= 2) tenYearRiskPercent = 1.7;
    else if (points <= 4) tenYearRiskPercent = 2.4;
    else if (points <= 6) tenYearRiskPercent = 3.3;
    else if (points <= 8) tenYearRiskPercent = 4.5;
    else if (points <= 10) tenYearRiskPercent = 6.3;
    else if (points <= 12) tenYearRiskPercent = 8.6;
    else if (points === 13) tenYearRiskPercent = 10.0;
    else if (points === 14) tenYearRiskPercent = 11.7;
    else if (points === 15) tenYearRiskPercent = 13.7;
    else if (points === 16) tenYearRiskPercent = 15.9;
    else if (points === 17) tenYearRiskPercent = 18.5;
    else if (points === 18) tenYearRiskPercent = 21.5;
    else if (points === 19) tenYearRiskPercent = 24.8;
    else tenYearRiskPercent = 30.0;
  }

  // Heart age approximation
  const heartAgeYears = Math.min(85, Math.max(input.age, Math.round(input.age + (points > 5 ? (points - 5) * 1.5 : 0))));

  let riskCategory: FraminghamResult['riskCategory'] = 'LOW';
  const recommendations: string[] = [];

  if (tenYearRiskPercent >= 20) {
    riskCategory = 'HIGH';
    recommendations.push(
      'High 10-year cardiovascular risk (≥ 20%). Immediate consultation with a cardiologist or physician is indicated.',
      'Comprehensive lipid management (statin therapy consideration) and strict blood pressure control target < 130/80 mmHg.',
      'Complete smoking cessation and antiplatelet therapy evaluation.'
    );
  } else if (tenYearRiskPercent >= 10) {
    riskCategory = 'INTERMEDIATE';
    recommendations.push(
      'Intermediate risk (10–19.9%). Lifestyle intervention with dietary optimization (Mediterranean/DASH diet) and 150 min/wk exercise.',
      'Consider coronary artery calcium (CAC) scoring if treatment decisions are uncertain.',
      'Target LDL cholesterol reduction and regular annual blood pressure monitoring.'
    );
  } else {
    riskCategory = 'LOW';
    recommendations.push(
      'Low 10-year risk (< 10%). Maintain healthy dietary habits, weight, and regular physical activity.',
      'Re-calculate cardiovascular profile every 4–6 years.'
    );
  }

  return {
    tenYearRiskPercent,
    riskCategory,
    points,
    heartAgeYears,
    modifiableRiskFactors,
    recommendations,
  };
}
