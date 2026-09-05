export type FeatureVersion = 'V1' | 'V2' | 'V3';

export type FeatureStatus = 'ACTIVE' | 'CONFIGURED' | 'IN_PROGRESS';

export interface FeatureIndexItem {
  number: number;
  name: string;
  version: FeatureVersion;
  category: string;
  slug: string;
  filename: string;
}

export interface FeatureMapping {
  route: string;
  api: string;
  models: string[];
  status: FeatureStatus;
}

export interface FeatureSections {
  metadata?: string;
  purpose?: string;
  userExperience?: string;
  dataRequired?: string[];
  dataSources?: {
    primary?: string;
    fallback?: string;
    quiz?: string;
  };
  trackingFrequency?: string;
  dataModel?: string[];
  validation?: string[];
  userConfirmation?: string;
  analytics?: string;
  dependencies?: string;
  notifications?: string;
  privacy?: string;
  edgeCases?: string[];
  emptyState?: string;
  failureState?: string;
  medicalSafetyNotes?: string[];
}

export interface FeatureSpec extends FeatureIndexItem {
  mapping: FeatureMapping;
  sections?: FeatureSections;
  rawMarkdown?: string;
}

export interface FeatureStats {
  total: number;
  byVersion: {
    V1: number;
    V2: number;
    V3: number;
  };
  byCategory: Record<string, number>;
  byStatus: Record<FeatureStatus, number>;
  completionPercentage: number;
}
