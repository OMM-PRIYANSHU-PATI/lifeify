export type CanonicalMetricType =
  | "steps"
  | "distance"
  | "active_minutes"
  | "calories_burned"
  | "sleep_duration"
  | "heart_rate"
  | "resting_heart_rate"
  | "spo2"
  | "respiratory_rate"
  | "blood_glucose"
  | "blood_pressure_systolic"
  | "blood_pressure_diastolic"
  | "body_temperature"
  | "weight"
  | "body_fat"
  | "water";

export interface RawProviderMetric {
  externalId: string;
  type: string;
  value: number;
  unit: string;
  startTime: string | Date;
  endTime?: string | Date | null;
  metadata?: Record<string, unknown>;
}

export interface CanonicalMetric {
  userId: string;
  type: CanonicalMetricType;
  value: number;
  unit: string;
  startTime: Date;
  endTime?: Date | null;
  source: string;
  sourceId: string;
  metadata?: Record<string, unknown>;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  duplicatesSkipped: number;
  errors: string[];
}

export interface WearableProviderAdapter {
  readonly providerId: string;
  readonly displayName: string;
  connect(userId: string, authData?: Record<string, unknown>): Promise<{ success: boolean; error?: string }>;
  disconnect(userId: string): Promise<boolean>;
  sync(userId: string, since?: Date): Promise<SyncResult>;
  normalize(userId: string, raw: RawProviderMetric[]): CanonicalMetric[];
}
