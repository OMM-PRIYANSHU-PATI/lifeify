import fs from 'fs';
import path from 'path';
import {
  FeatureIndexItem,
  FeatureMapping,
  FeatureSections,
  FeatureSpec,
  FeatureStats,
  FeatureStatus,
  FeatureVersion,
} from './types';

let cachedIndex: FeatureIndexItem[] | null = null;
let cachedSpecs: Map<number, FeatureSpec> = new Map();

function getSpecsDir(): string {
  const possiblePaths = [
    path.join(process.cwd(), 'lifeify_feature_specs'),
    path.join(process.cwd(), '..', 'lifeify_feature_specs'),
    'e:/project/lifeify/lifeify_feature_specs',
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(process.cwd(), 'lifeify_feature_specs');
}

export function loadFeatureIndex(): FeatureIndexItem[] {
  if (cachedIndex) return cachedIndex;
  const dir = getSpecsDir();
  const indexPath = path.join(dir, '_feature_index.json');
  if (!fs.existsSync(indexPath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(indexPath, 'utf8');
    cachedIndex = JSON.parse(raw);
    return cachedIndex || [];
  } catch (e) {
    console.error('Failed to load _feature_index.json:', e);
    return [];
  }
}

export function resolveFeatureMapping(item: FeatureIndexItem): FeatureMapping {
  const cat = item.category;
  const slug = item.slug;

  let route = '/app/dashboard';
  let api = '/api/dashboard/today';
  let models: string[] = ['User'];
  let status: FeatureStatus = 'ACTIVE';

  if (cat === 'Account & Onboarding') {
    route = slug.includes('login') || slug.includes('signup') ? '/login' : '/onboarding';
    api = '/api/auth/otp/verify';
    models = ['User', 'OtpCode', 'HealthProfile', 'LifestyleProfile', 'Consent'];
  } else if (cat === 'Dashboard') {
    route = '/app/dashboard';
    api = '/api/dashboard/today';
    models = ['HealthScore', 'HealthLog', 'MedicationDose'];
  } else if (cat === 'Health Tracking') {
    const trackType = slug.includes('step') || slug.includes('walk') || slug.includes('run') || slug.includes('distance')
      ? 'steps'
      : slug.includes('sleep')
      ? 'sleep'
      : slug.includes('water')
      ? 'water'
      : slug.includes('mood')
      ? 'mood'
      : slug.includes('weight')
      ? 'weight'
      : 'food';
    route = `/app/track/${trackType}`;
    api = '/api/logs';
    models = ['HealthLog', 'FoodLog', 'VitalReading', 'HealthMetric'];
  } else if (cat === 'Medical Records') {
    route = '/app/records';
    api = '/api/records';
    models = ['MedicalRecord', 'MedicalFile'];
  } else if (cat === 'Prescription') {
    route = '/app/scan';
    api = '/api/ocr/parse';
    models = ['Prescription', 'PrescriptionMedicine'];
  } else if (['Medication', 'Medicine Stock', 'Medication Safety', 'Medication Adherence'].includes(cat)) {
    route = '/app/medications';
    api = cat === 'Medication Safety' ? '/api/medications/interactions' : '/api/medications';
    models = ['Medication', 'MedicationSchedule', 'MedicationDose', 'MedicationStock', 'DrugReference'];
  } else if (cat === 'Daily Check-ins') {
    route = '/app/check-in';
    api = '/api/checkin';
    models = ['DailyCheckIn', 'CheckInQuestion', 'CheckInResponse'];
  } else if (cat === 'Side Effects & ADR') {
    route = '/app/medications';
    api = '/api/side-effects';
    models = ['SideEffect', 'ADRReport'];
  } else if (cat === 'Chronic Health') {
    route = '/app/conditions';
    api = '/api/vitals';
    models = ['Condition', 'VitalReading'];
  } else if (cat === 'Recovery') {
    route = '/app/recovery';
    api = '/api/recovery';
    models = ['Condition', 'FollowUp'];
  } else if (cat === 'Emergency') {
    route = '/app/emergency-card';
    api = '/api/emergency-card';
    models = ['EmergencyMedicalCard', 'EmergencyContact', 'EmergencyAccessLog'];
  } else if (cat === 'Doctor Reports' || cat === 'Doctor Collaboration') {
    route = '/doctor';
    api = '/api/doctor-summary';
    models = ['DoctorProfile', 'DoctorNote', 'Appointment'];
  } else if (cat === 'Notifications' || cat === 'Advanced Notifications') {
    route = '/app/notifications';
    api = '/api/notifications';
    models = ['Notification'];
  } else if (cat === 'Basic Analytics' || cat === 'Advanced Analytics') {
    route = '/app/analytics';
    api = '/api/features/analytics';
    models = ['HealthScore', 'HealthMetric'];
  } else if (cat === 'Account & Privacy' || cat === 'Privacy & Sharing') {
    route = '/app/privacy';
    api = '/api/consent';
    models = ['Consent', 'AuditLog', 'DataExportRequest'];
  } else if (cat === 'Health Integrations & Sync') {
    route = '/app/wearables';
    api = '/api/connect/google';
    models = ['HealthDataSource', 'HealthMetric'];
  } else if (cat === 'Fitness Planning') {
    route = '/app/plans/fitness';
    api = '/api/plans/generate';
    models = ['FitnessPlan'];
  } else if (cat === 'Nutrition Planning') {
    route = '/app/plans/nutrition';
    api = '/api/plans/generate';
    models = ['NutritionPlan'];
  } else if (cat === 'Sleep Planning') {
    route = '/app/plans/sleep';
    api = '/api/plans/generate';
    models = ['SleepPlan'];
  } else if (cat === 'Advanced Medication & Engagement') {
    route = '/app/medications';
    api = '/api/badges';
    models = ['GamificationProfile', 'UserBadge'];
  } else if (cat === 'Symptoms') {
    route = '/app/symptom-checker';
    api = '/api/symptoms/triage';
    models = ['SideEffect', 'Condition'];
  } else if (cat === 'Family & Caregivers') {
    route = '/app/family';
    api = '/api/family/dashboard';
    models = ['Family', 'FamilyMember', 'SubjectPermission'];
  } else if (cat === 'Voice Logging') {
    route = '/app/voice';
    api = '/api/voice/transcribe';
    models = ['VoiceLog'];
  } else if (cat === 'Accessibility & Localization') {
    route = '/settings/profile';
    api = '/api/account';
    models = ['User'];
  } else if (cat === 'Subscriptions & Billing') {
    route = '/app/subscription';
    api = '/api/subscription/checkout';
    models = ['Subscription', 'Payment', 'UsageCounter'];
  } else if (cat === 'PWA & Offline') {
    route = '/app/dashboard';
    api = '/api/logs';
    models = ['HealthLog'];
  } else if (cat === 'AI Assistant & Memory') {
    route = '/assistant';
    api = '/api/insights';
    models = ['AIConversation'];
  } else if (cat === 'AI Report Analysis') {
    route = '/app/records';
    api = '/api/ocr/parse';
    models = ['MedicalRecord', 'AIConversation'];
  } else if (cat === 'AI Symptom Intelligence') {
    route = '/app/symptom-checker';
    api = '/api/symptoms/triage';
    models = ['SideEffect', 'Condition'];
  } else if (cat === 'AI Insights') {
    route = '/app/insights';
    api = '/api/insights';
    models = ['HealthScore', 'AIConversation'];
  } else if (['AI Fitness', 'AI Nutrition', 'AI Sleep'].includes(cat)) {
    route = '/app/plans';
    api = '/api/plans/generate';
    models = ['FitnessPlan', 'NutritionPlan', 'SleepPlan'];
  } else if (cat === 'AI Medication Intelligence') {
    route = '/app/medications';
    api = '/api/medications/interactions';
    models = ['Medication', 'DrugReference'];
  } else if (cat === 'AI Recovery Intelligence') {
    route = '/app/recovery';
    api = '/api/recovery';
    models = ['Condition'];
  } else if (cat === 'ML Modeling & Prediction') {
    route = '/app/risk-assessment';
    api = '/api/risk-scores';
    models = ['DiseaseRiskAssessment'];
  } else if (cat === 'AI Doctor Support') {
    route = '/doctor';
    api = '/api/doctor-summary';
    models = ['DoctorNote'];
  } else if (cat === 'AI Coaching & Context') {
    route = '/assistant';
    api = '/api/insights';
    models = ['AIConversation'];
  } else if (cat === 'Knowledge Retrieval & Embeddings') {
    route = '/assistant';
    api = '/api/insights';
    models = ['MedicalRecord'];
    status = 'CONFIGURED';
  } else if (cat === 'AI Governance') {
    route = '/app/privacy';
    api = '/api/consent';
    models = ['AuditLog'];
    status = 'CONFIGURED';
  }

  return { route, api, models, status };
}

export function parseMarkdownSpec(filename: string): { sections: FeatureSections; raw: string } {
  const dir = getSpecsDir();
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) {
    return { sections: {}, raw: '' };
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const sections: FeatureSections = {};

  const lines = raw.split('\n');
  let currentHeader = '';
  let buffer: string[] = [];

  const flush = () => {
    if (!currentHeader) return;
    const text = buffer.join('\n').trim();
    if (currentHeader === 'Purpose') sections.purpose = text;
    else if (currentHeader === 'User Experience') sections.userExperience = text;
    else if (currentHeader === 'Tracking Frequency') sections.trackingFrequency = text;
    else if (currentHeader === 'User Confirmation') sections.userConfirmation = text;
    else if (currentHeader === 'Analytics') sections.analytics = text;
    else if (currentHeader === 'Dependencies') sections.dependencies = text;
    else if (currentHeader === 'Notifications') sections.notifications = text;
    else if (currentHeader === 'Privacy') sections.privacy = text;
    else if (currentHeader === 'Empty State') sections.emptyState = text;
    else if (currentHeader === 'Failure State') sections.failureState = text;
    else if (currentHeader === 'Data Required') {
      sections.dataRequired = text
        .split('\n')
        .map((l) => l.replace(/^[-*]\s*`?/, '').replace(/`?$/, '').trim())
        .filter(Boolean);
    } else if (currentHeader === 'Data Model') {
      sections.dataModel = text
        .split('\n')
        .map((l) => l.replace(/^[-*]\s*`?/, '').replace(/`?$/, '').trim())
        .filter(Boolean);
    } else if (currentHeader === 'Validation') {
      sections.validation = text
        .split('\n')
        .map((l) => l.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
    } else if (currentHeader === 'Edge Cases') {
      sections.edgeCases = text
        .split('\n')
        .map((l) => l.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
    } else if (currentHeader === 'Medical Safety Notes') {
      sections.medicalSafetyNotes = text
        .split('\n')
        .map((l) => l.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
    }
  };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flush();
      currentHeader = line.replace('## ', '').trim();
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  flush();

  return { sections, raw };
}

export function getAllFeatures(): FeatureSpec[] {
  const index = loadFeatureIndex();
  return index.map((item) => {
    const mapping = resolveFeatureMapping(item);
    return {
      ...item,
      mapping,
    };
  });
}

export function getFeatureByNumber(num: number): FeatureSpec | null {
  if (cachedSpecs.has(num)) {
    return cachedSpecs.get(num)!;
  }
  const index = loadFeatureIndex();
  const item = index.find((x) => x.number === num);
  if (!item) return null;

  const mapping = resolveFeatureMapping(item);
  const { sections, raw } = parseMarkdownSpec(item.filename);

  const spec: FeatureSpec = {
    ...item,
    mapping,
    sections,
    rawMarkdown: raw,
  };

  cachedSpecs.set(num, spec);
  return spec;
}

export function getFeatureBySlug(slug: string): FeatureSpec | null {
  const index = loadFeatureIndex();
  const item = index.find((x) => x.slug === slug);
  if (!item) return null;
  return getFeatureByNumber(item.number);
}

export function getFeatureStats(): FeatureStats {
  const features = getAllFeatures();
  const byVersion: { V1: number; V2: number; V3: number } = { V1: 0, V2: 0, V3: 0 };
  const byCategory: Record<string, number> = {};
  const byStatus: Record<FeatureStatus, number> = { ACTIVE: 0, CONFIGURED: 0, IN_PROGRESS: 0 };

  for (const f of features) {
    if (f.version === 'V1') byVersion.V1++;
    else if (f.version === 'V2') byVersion.V2++;
    else if (f.version === 'V3') byVersion.V3++;

    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
    byStatus[f.mapping.status] = (byStatus[f.mapping.status] || 0) + 1;
  }

  const activeCount = byStatus.ACTIVE;
  const completionPercentage = features.length > 0 ? Math.round((activeCount / features.length) * 100) : 0;

  return {
    total: features.length,
    byVersion,
    byCategory,
    byStatus,
    completionPercentage,
  };
}
