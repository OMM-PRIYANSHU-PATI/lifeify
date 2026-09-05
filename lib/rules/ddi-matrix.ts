export type InteractionSeverity = 'CONTRAINDICATED' | 'MAJOR' | 'MODERATE' | 'MINOR';

export interface DrugInteraction {
  id: string;
  drugA: string; // generic canonical name (lowercase)
  drugB: string; // generic canonical name (lowercase)
  severity: InteractionSeverity;
  mechanism: string;
  clinicalRisk: string;
  actionRecommendation: string;
  evidenceLevel: 'DEFINITIVE' | 'PROBABLE' | 'SUSPECTED';
}

export interface FoodInteraction {
  id: string;
  drug: string; // generic canonical name
  foodOrSubstance: string;
  severity: InteractionSeverity;
  mechanism: string;
  clinicalRisk: string;
  dietaryAdvice: string;
}

// Common brand-to-generic alias mapping (especially common in India and worldwide)
export const BRAND_TO_GENERIC_MAP: Record<string, string> = {
  // Diabetes
  glycomet: 'metformin',
  glucophage: 'metformin',
  janumet: 'metformin',
  amaryl: 'glimepiride',
  daonil: 'glibenclamide',
  forxiga: 'dapagliflozin',
  jardiance: 'empagliflozin',
  galvus: 'vildagliptin',
  januvia: 'sitagliptin',
  // Cardiovascular / Hypertension
  lipitor: 'atorvastatin',
  atorva: 'atorvastatin',
  crestor: 'rosuvastatin',
  rozavel: 'rosuvastatin',
  telma: 'telmisartan',
  micardis: 'telmisartan',
  olmetime: 'olmesartan',
  norvasc: 'amlodipine',
  stamlo: 'amlodipine',
  aldactone: 'spironolactone',
  cardace: 'ramipril',
  envas: 'enalapril',
  betaloc: 'metoprolol',
  nebistar: 'nebivolol',
  concor: 'bisoprolol',
  cordarone: 'amiodarone',
  lanoxin: 'digoxin',
  sorbitrate: 'isosorbide dinitrate',
  nitrocontin: 'nitroglycerin',
  // Antiplatelet / Anticoagulant
  ecospirin: 'aspirin',
  disprin: 'aspirin',
  plavix: 'clopidogrel',
  deplatt: 'clopidogrel',
  coumadin: 'warfarin',
  eliquis: 'apixaban',
  xarelto: 'rivaroxaban',
  // Pain / NSAIDs
  combiflam: 'ibuprofen',
  brufen: 'ibuprofen',
  voveran: 'diclofenac',
  dolfen: 'diclofenac',
  naprosyn: 'naproxen',
  dolo: 'paracetamol',
  calpol: 'paracetamol',
  crocin: 'paracetamol',
  ultram: 'tramadol',
  tramazac: 'tramadol',
  // Antibiotics / Anti-infectives
  cipro: 'ciprofloxacin',
  ciptal: 'ciprofloxacin',
  ciprobid: 'ciprofloxacin',
  augentin: 'amoxicillin',
  moxikind: 'amoxicillin',
  azithral: 'azithromycin',
  zithromax: 'azithromycin',
  claribid: 'clarithromycin',
  biaxin: 'clarithromycin',
  sporidex: 'cephalexin',
  doxy: 'doxycycline',
  nizral: 'ketoconazole',
  diflucan: 'fluconazole',
  // Thyroid & Gastro
  eltroxin: 'levothyroxine',
  thyronorm: 'levothyroxine',
  synthroid: 'levothyroxine',
  pan: 'pantoprazole',
  pantocid: 'pantoprazole',
  omez: 'omeprazole',
  prilosec: 'omeprazole',
  nexpro: 'esomeprazole',
  // Neuro / Psych / Men's Health
  zoloft: 'sertraline',
  nexito: 'escitalopram',
  lexapro: 'escitalopram',
  manforce: 'sildenafil',
  viagra: 'sildenafil',
  cialis: 'tadalafil',
  megalis: 'tadalafil',
  calcium: 'calcium',
  shelcal: 'calcium',
  feronia: 'iron',
  autrin: 'iron',
};

// Known Drug-Drug Interactions database
export const KNOWN_DDI_DATABASE: DrugInteraction[] = [
  {
    id: 'ddi-sildenafil-nitrates',
    drugA: 'sildenafil',
    drugB: 'nitroglycerin',
    severity: 'CONTRAINDICATED',
    mechanism: 'Potentiation of cGMP-mediated vasodilation causing severe systemic hypotension.',
    clinicalRisk: 'Profound hypotension, myocardial infarction, collapse, or death.',
    actionRecommendation: 'Concomitant use is strictly contraindicated. Do not co-prescribe or administer together under any circumstances.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-sildenafil-isosorbide',
    drugA: 'sildenafil',
    drugB: 'isosorbide dinitrate',
    severity: 'CONTRAINDICATED',
    mechanism: 'Synergistic nitric oxide/cGMP pathway amplification leading to massive drop in blood pressure.',
    clinicalRisk: 'Life-threatening refractory hypotension and syncope.',
    actionRecommendation: 'Absolute contraindication. Nitrates must not be taken within 24–48 hours of PDE5 inhibitors.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-warfarin-aspirin',
    drugA: 'warfarin',
    drugB: 'aspirin',
    severity: 'CONTRAINDICATED',
    mechanism: 'Combined anticoagulant effect (vitamin K antagonism) and antiplatelet inhibition plus gastric mucosal irritation.',
    clinicalRisk: 'Severe gastrointestinal bleeding, cerebral hemorrhage, and unmanageable coagulopathy.',
    actionRecommendation: 'Avoid concurrent use unless strictly indicated under specialist cardiovascular monitoring with gastroprotection.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-warfarin-ibuprofen',
    drugA: 'warfarin',
    drugB: 'ibuprofen',
    severity: 'MAJOR',
    mechanism: 'NSAID-induced platelet dysfunction and GI mucosal damage combined with vitamin K antagonism.',
    clinicalRisk: 'Markedly elevated risk of major internal gastrointestinal bleeding.',
    actionRecommendation: 'Avoid NSAIDs in patients on warfarin. Recommend paracetamol (up to 2g/day) as analgesic of choice.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-warfarin-clopidogrel',
    drugA: 'warfarin',
    drugB: 'clopidogrel',
    severity: 'MAJOR',
    mechanism: 'Additive disruption of primary and secondary hemostatic pathways.',
    clinicalRisk: 'Significant risk of major bleeding.',
    actionRecommendation: 'Combination (triple/double therapy) must only be used under specialist cardiologist supervision with shortened duration and INR target 2.0–2.5.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-aspirin-ibuprofen',
    drugA: 'aspirin',
    drugB: 'ibuprofen',
    severity: 'MAJOR',
    mechanism: 'Ibuprofen competitively blocks the COX-1 active site, preventing irreversible acetylation by low-dose cardio-aspirin.',
    clinicalRisk: 'Loss of cardioprotective antiplatelet effect of aspirin plus heightened risk of peptic ulceration.',
    actionRecommendation: 'Avoid regular ibuprofen in patients taking cardioprotective aspirin. If ibuprofen is needed, take it at least 2 hours after or 8 hours before aspirin.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-atorvastatin-clarithromycin',
    drugA: 'atorvastatin',
    drugB: 'clarithromycin',
    severity: 'MAJOR',
    mechanism: 'Potent inhibition of CYP3A4-mediated statin metabolism by clarithromycin.',
    clinicalRisk: 'Marked increase in statin plasma concentrations leading to severe myopathy and life-threatening rhabdomyolysis.',
    actionRecommendation: 'Temporarily withhold atorvastatin during clarithromycin treatment course, or choose an alternative macrolide (e.g. azithromycin) that does not inhibit CYP3A4.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-atorvastatin-ketoconazole',
    drugA: 'atorvastatin',
    drugB: 'ketoconazole',
    severity: 'MAJOR',
    mechanism: 'Strong CYP3A4 inhibition elevates atorvastatin AUC dramatically.',
    clinicalRisk: 'High risk of acute skeletal muscle necrosis (rhabdomyolysis) and acute kidney injury.',
    actionRecommendation: 'Avoid concurrent therapy. Suspend statin during systemic azole antifungal therapy.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-amlodipine-simvastatin',
    drugA: 'amlodipine',
    drugB: 'simvastatin',
    severity: 'MODERATE',
    mechanism: 'Amlodipine inhibits CYP3A4, increasing simvastatin blood levels.',
    clinicalRisk: 'Increased risk of statin-associated muscle pain and toxicity.',
    actionRecommendation: 'Limit simvastatin dose to a maximum of 20 mg daily when co-administered with amlodipine.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-telmisartan-spironolactone',
    drugA: 'telmisartan',
    drugB: 'spironolactone',
    severity: 'MAJOR',
    mechanism: 'Dual suppression of aldosterone action and renal potassium excretion.',
    clinicalRisk: 'Severe hyperkalemia (>5.5 mEq/L) leading to fatal cardiac arrhythmias.',
    actionRecommendation: 'Monitor serum potassium and creatinine within 1–2 weeks of initiation and regularly thereafter. Caution patients against potassium-rich salt substitutes.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-ramipril-spironolactone',
    drugA: 'ramipril',
    drugB: 'spironolactone',
    severity: 'MAJOR',
    mechanism: 'Additive aldosterone inhibition decreasing renal potassium clearance.',
    clinicalRisk: 'Dangerous hyperkalemia and acute renal insufficiency.',
    actionRecommendation: 'Strict monitoring of serum potassium and renal function required. Start spironolactone at lowest dose (12.5–25 mg).',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-ramipril-telmisartan',
    drugA: 'ramipril',
    drugB: 'telmisartan',
    severity: 'MAJOR',
    mechanism: 'Dual renin-angiotensin-aldosterone system (RAAS) blockade.',
    clinicalRisk: 'Increased rate of renal impairment, severe hypotension, and hyperkalemia without added cardiovascular benefit (ONTARGET trial).',
    actionRecommendation: 'Dual RAAS blockade is contraindicated or strongly discouraged in routine clinical practice.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-metformin-contrast',
    drugA: 'metformin',
    drugB: 'iodinated contrast',
    severity: 'MAJOR',
    mechanism: 'Contrast-induced nephropathy leads to acute metformin accumulation.',
    clinicalRisk: 'High risk of severe lactic acidosis, with mortality up to 50%.',
    actionRecommendation: 'Withhold metformin 48 hours prior to or at the time of intravascular iodinated contrast administration and restart only 48 hours after verifying stable eGFR.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-ciprofloxacin-calcium',
    drugA: 'ciprofloxacin',
    drugB: 'calcium',
    severity: 'MODERATE',
    mechanism: 'Chelation between fluoroquinolones and polyvalent cations forming insoluble non-absorbable complexes.',
    clinicalRisk: 'Markedly reduced antibiotic bioavailability causing therapeutic failure.',
    actionRecommendation: 'Administer ciprofloxacin at least 2 hours before or 6 hours after calcium supplements or dairy products.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-ciprofloxacin-iron',
    drugA: 'ciprofloxacin',
    drugB: 'iron',
    severity: 'MODERATE',
    mechanism: 'Chelation with iron ions reduces fluoroquinolone absorption by up to 70%.',
    clinicalRisk: 'Antibiotic underdosing and treatment failure.',
    actionRecommendation: 'Space doses at least 2 hours before or 6 hours after iron preparations.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-levothyroxine-iron',
    drugA: 'levothyroxine',
    drugB: 'iron',
    severity: 'MODERATE',
    mechanism: 'Ferrous ions bind to thyroxine in gastrointestinal tract forming an insoluble complex.',
    clinicalRisk: 'Reduced thyroxine absorption causing refractory hypothyroidism and elevated TSH.',
    actionRecommendation: 'Separate administration by at least 4 hours. Take levothyroxine on an empty stomach 30–60 min before breakfast.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-levothyroxine-calcium',
    drugA: 'levothyroxine',
    drugB: 'calcium',
    severity: 'MODERATE',
    mechanism: 'Calcium carbonate adsorbs levothyroxine in the acidic milieu of the stomach.',
    clinicalRisk: 'Blunted levothyroxine absorption.',
    actionRecommendation: 'Separate intake by at least 4 hours.',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-sertraline-tramadol',
    drugA: 'sertraline',
    drugB: 'tramadol',
    severity: 'CONTRAINDICATED',
    mechanism: 'Dual elevation of intrasynaptic serotonin through SSRI reuptake inhibition and tramadol serotonin releasing action.',
    clinicalRisk: 'Serotonin Syndrome (hyperthermia, autonomic instability, hyperreflexia, agitation, clonus).',
    actionRecommendation: 'Avoid concurrent use. Use alternative non-serotonergic analgesics (e.g. paracetamol).',
    evidenceLevel: 'DEFINITIVE',
  },
  {
    id: 'ddi-digoxin-amiodarone',
    drugA: 'digoxin',
    drugB: 'amiodarone',
    severity: 'MAJOR',
    mechanism: 'Amiodarone inhibits P-glycoprotein efflux transporter, doubling digoxin blood concentration.',
    clinicalRisk: 'Digitalis toxicity (nausea, xanthopsia, ventricular arrhythmias, heart block).',
    actionRecommendation: 'Reduce digoxin dose by 50% immediately upon starting amiodarone and monitor serum digoxin levels closely.',
    evidenceLevel: 'DEFINITIVE',
  },
];

// Known Drug-Food Interactions database
export const KNOWN_FOOD_INTERACTIONS: FoodInteraction[] = [
  {
    id: 'dfi-atorvastatin-grapefruit',
    drug: 'atorvastatin',
    foodOrSubstance: 'Grapefruit juice',
    severity: 'MAJOR',
    mechanism: 'Intestinal CYP3A4 inhibition by furanocoumarins in grapefruit dramatically elevates statin bioavailability.',
    clinicalRisk: 'Increased blood levels leading to myopathy and rhabdomyolysis.',
    dietaryAdvice: 'Avoid large quantities of grapefruit or grapefruit juice (>1 glass daily) while taking atorvastatin.',
  },
  {
    id: 'dfi-amlodipine-grapefruit',
    drug: 'amlodipine',
    foodOrSubstance: 'Grapefruit juice',
    severity: 'MODERATE',
    mechanism: 'CYP3A4 inhibition moderately increases amlodipine plasma exposure.',
    clinicalRisk: 'Excessive vasodilation, headache, peripheral edema, and lightheadedness.',
    dietaryAdvice: 'Avoid excessive intake of grapefruit juice.',
  },
  {
    id: 'dfi-warfarin-vitamin-k',
    drug: 'warfarin',
    foodOrSubstance: 'Leafy green vegetables (Spinach, Kale, Methi, Sarson)',
    severity: 'MAJOR',
    mechanism: 'Direct antagonism of warfarin-mediated vitamin K epoxide reductase inhibition.',
    clinicalRisk: 'Unpredictable fluctuations in INR, subtherapeutic anticoagulation, and thrombosis risk.',
    dietaryAdvice: 'Maintain a consistent, stable weekly intake of green leafy vegetables. Do not suddenly increase or restrict intake.',
  },
  {
    id: 'dfi-metformin-alcohol',
    drug: 'metformin',
    foodOrSubstance: 'Alcohol',
    severity: 'MAJOR',
    mechanism: 'Alcohol inhibits hepatic gluconeogenesis and lactate clearance by impairing pyruvate conversion.',
    clinicalRisk: 'Profound hypoglycemia and potentially fatal lactic acidosis.',
    dietaryAdvice: 'Avoid excessive acute or chronic alcohol consumption while taking metformin.',
  },
  {
    id: 'dfi-paracetamol-alcohol',
    drug: 'paracetamol',
    foodOrSubstance: 'Alcohol',
    severity: 'MODERATE',
    mechanism: 'Chronic ethanol induces CYP2E1, converting paracetamol into toxic metabolite NAPQI, depleting glutathione.',
    clinicalRisk: 'Heightened susceptibility to hepatic toxicity even at therapeutic doses.',
    dietaryAdvice: 'Limit or avoid alcohol consumption. Never exceed 2–3g of paracetamol per 24 hours if consuming alcohol.',
  },
  {
    id: 'dfi-ciprofloxacin-dairy',
    drug: 'ciprofloxacin',
    foodOrSubstance: 'Dairy products / High Calcium Milk',
    severity: 'MODERATE',
    mechanism: 'Calcium in milk/yogurt binds to ciprofloxacin in the gut lumen preventing systemic uptake.',
    clinicalRisk: 'Failure of antibiotic treatment for active infections.',
    dietaryAdvice: 'Do not take ciprofloxacin simultaneously with milk, yogurt, or calcium-fortified juices alone. Take with normal balanced meals or 2 hours apart.',
  },
  {
    id: 'dfi-levothyroxine-coffee',
    drug: 'levothyroxine',
    foodOrSubstance: 'Coffee / Espresso',
    severity: 'MODERATE',
    mechanism: 'Coffee sequesters thyroxine in the intestinal lumen, decreasing intestinal absorption up to 36%.',
    clinicalRisk: 'Fluctuating thyroid hormone levels and elevated serum TSH.',
    dietaryAdvice: 'Wait at least 30 to 60 minutes after taking levothyroxine before drinking morning coffee or tea.',
  },
];

/**
 * Normalizes input drug string into canonical generic identifier
 */
export function normalizeDrugName(rawName: string): string {
  if (!rawName) return '';
  const clean = rawName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = clean.split(/\s+/).filter(Boolean);

  // Check direct alias mapping
  for (const token of tokens) {
    if (BRAND_TO_GENERIC_MAP[token]) {
      return BRAND_TO_GENERIC_MAP[token];
    }
  }

  // Check known generic names
  const knownGenerics = [
    'metformin', 'atorvastatin', 'rosuvastatin', 'amlodipine', 'telmisartan',
    'ramipril', 'spironolactone', 'aspirin', 'clopidogrel', 'warfarin',
    'apixaban', 'rivaroxaban', 'ibuprofen', 'diclofenac', 'paracetamol',
    'tramadol', 'ciprofloxacin', 'amoxicillin', 'azithromycin', 'clarithromycin',
    'levothyroxine', 'sertraline', 'sildenafil', 'tadalafil', 'digoxin',
    'amiodarone', 'nitroglycerin', 'calcium', 'iron'
  ];

  for (const token of tokens) {
    if (knownGenerics.includes(token)) {
      return token;
    }
  }

  return tokens[0] || '';
}

export interface InteractionReport {
  analyzedDrugs: { original: string; canonical: string }[];
  drugDrugInteractions: DrugInteraction[];
  foodInteractions: FoodInteraction[];
  riskLevel: 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  requiresImmediateAction: boolean;
  blockingNotice?: string;
}

/**
 * Deterministic engine checking all pairwise DDI and food interactions
 */
export function checkDrugInteractions(
  rawDrugs: string[],
  options?: { foodsOrSubstances?: string[] }
): InteractionReport {
  const analyzedDrugs = rawDrugs.map((d) => ({
    original: d,
    canonical: normalizeDrugName(d),
  }));

  const drugDrugInteractions: DrugInteraction[] = [];
  const foundInteractionIds = new Set<string>();

  // Check pairwise DDI
  for (let i = 0; i < analyzedDrugs.length; i++) {
    for (let j = i + 1; j < analyzedDrugs.length; j++) {
      const a = analyzedDrugs[i].canonical;
      const b = analyzedDrugs[j].canonical;
      if (!a || !b || a === b) continue;

      for (const ddi of KNOWN_DDI_DATABASE) {
        const matches =
          (ddi.drugA === a && ddi.drugB === b) ||
          (ddi.drugA === b && ddi.drugB === a);

        if (matches && !foundInteractionIds.has(ddi.id)) {
          foundInteractionIds.add(ddi.id);
          drugDrugInteractions.push(ddi);
        }
      }
    }
  }

  // Check Food Interactions
  const foodInteractions: FoodInteraction[] = [];
  const activeCanonicalDrugs = new Set(analyzedDrugs.map((d) => d.canonical).filter(Boolean));

  for (const fi of KNOWN_FOOD_INTERACTIONS) {
    if (activeCanonicalDrugs.has(fi.drug)) {
      if (
        !options?.foodsOrSubstances ||
        options.foodsOrSubstances.length === 0 ||
        options.foodsOrSubstances.some((f) =>
          fi.foodOrSubstance.toLowerCase().includes(f.toLowerCase())
        )
      ) {
        foodInteractions.push(fi);
      }
    }
  }

  // Calculate overall risk level
  let riskLevel: InteractionReport['riskLevel'] = 'SAFE';
  let requiresImmediateAction = false;
  let blockingNotice: string | undefined = undefined;

  const hasContraindicated = drugDrugInteractions.some(
    (d) => d.severity === 'CONTRAINDICATED'
  );
  const hasMajor =
    drugDrugInteractions.some((d) => d.severity === 'MAJOR') ||
    foodInteractions.some((f) => f.severity === 'MAJOR');
  const hasModerate =
    drugDrugInteractions.some((d) => d.severity === 'MODERATE') ||
    foodInteractions.some((f) => f.severity === 'MODERATE');

  if (hasContraindicated) {
    riskLevel = 'CRITICAL';
    requiresImmediateAction = true;
    blockingNotice =
      'CRITICAL CLINICAL ALERT: One or more drug pairs are CONTRAINDICATED. Concomitant administration carries severe life-threatening risk. Physician consultation required immediately.';
  } else if (hasMajor) {
    riskLevel = 'HIGH';
    requiresImmediateAction = true;
    blockingNotice =
      'MAJOR CLINICAL WARNING: Significant drug or nutrient interactions detected that require medical adjustment or monitoring.';
  } else if (hasModerate) {
    riskLevel = 'MODERATE';
  } else if (drugDrugInteractions.length > 0 || foodInteractions.length > 0) {
    riskLevel = 'LOW';
  }

  return {
    analyzedDrugs,
    drugDrugInteractions,
    foodInteractions,
    riskLevel,
    requiresImmediateAction,
    blockingNotice,
  };
}
