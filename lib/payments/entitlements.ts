export interface PlanEntitlements {
  planName: "FREE" | "PREMIUM";
  maxRecords: number;
  maxFamilyMembers: number;
  hasWearableSync: boolean;
  hasAdvancedAnalytics: boolean;
  hasDoctorAccessCodes: boolean;
}

export const PLAN_LIMITS: Record<"FREE" | "PREMIUM", PlanEntitlements> = {
  FREE: {
    planName: "FREE",
    maxRecords: 5,
    maxFamilyMembers: 1,
    hasWearableSync: false,
    hasAdvancedAnalytics: false,
    hasDoctorAccessCodes: true,
  },
  PREMIUM: {
    planName: "PREMIUM",
    maxRecords: 999999,
    maxFamilyMembers: 6,
    hasWearableSync: true,
    hasAdvancedAnalytics: true,
    hasDoctorAccessCodes: true,
  },
};

export function checkUsageStatus(current: number, limit: number): {
  isHardCapped: boolean;
  isSoftCapped: boolean;
  percentage: number;
} {
  const percentage = limit > 0 ? Math.round((current / limit) * 100) : 0;
  return {
    isHardCapped: current >= limit,
    isSoftCapped: percentage >= 80 && current < limit,
    percentage,
  };
}
