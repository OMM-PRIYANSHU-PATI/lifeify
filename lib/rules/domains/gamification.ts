export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  category: "adherence" | "streak" | "wellness";
  tier: "bronze" | "silver" | "gold" | "diamond";
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    code: "MED_BRONZE",
    name: "Consistent Start",
    description: "7 consecutive days of 100% medication adherence.",
    category: "adherence",
    tier: "bronze",
  },
  {
    code: "MED_SILVER",
    name: "Adherence Champion",
    description: "30 consecutive days of 100% medication adherence.",
    category: "adherence",
    tier: "silver",
  },
  {
    code: "MED_GOLD",
    name: "Treatment Master",
    description: "90 consecutive days of disciplined adherence.",
    category: "adherence",
    tier: "gold",
  },
  {
    code: "MED_DIAMOND",
    name: "Healthcare Legend",
    description: "365 days of unbroken medication management.",
    category: "adherence",
    tier: "diamond",
  },
  {
    code: "CHECKIN_STREAK_7",
    name: "Mindful Health",
    description: "7 daily check-ins logged consecutively.",
    category: "streak",
    tier: "bronze",
  },
  {
    code: "HYDRATION_HERO",
    name: "Hydration Hero",
    description: "Hit your daily water target 7 consecutive days.",
    category: "wellness",
    tier: "bronze",
  },
  {
    code: "HEALTH_PIONEER",
    name: "Health Pioneer",
    description: "Completed full biometric calibration and onboarding.",
    category: "wellness",
    tier: "bronze",
  },
];

export const POINT_VALUES: Record<string, number> = {
  DOSE_TAKEN: 10,
  CHECKIN_COMPLETED: 15,
  WORKOUT_COMPLETED: 20,
  WATER_GOAL_HIT: 5,
  VITAL_LOGGED: 10,
  PROFILE_COMPLETED: 100,
};

export function calculateNewLevel(points: number): number {
  // Level 1: 0-99, Level 2: 100-249, Level 3: 250-499, Level 4: 500+
  if (points >= 1000) return 5;
  if (points >= 500) return 4;
  if (points >= 250) return 3;
  if (points >= 100) return 2;
  return 1;
}
