/**
 * Deterministic Fitness Plan Generator — Non-AI rule engine.
 */

export interface Exercise {
  name: string;
  category: "strength" | "cardio" | "flexibility";
  sets: number;
  reps: string; // e.g. "10-12" or "30 sec"
  restSec: number;
}

export interface WorkoutDay {
  dayName: string; // Monday, Tuesday, etc.
  focus: string; // e.g. "Upper Body", "Lower Body", "Cardio & Core", "Rest"
  isRest: boolean;
  warmupMin: number;
  exercises: Exercise[];
  cooldownMin: number;
}

export interface FitnessPlanResult {
  goal: string;
  level: string;
  daysPerWeek: number;
  minutesPerSession: number;
  weeklySchedule: WorkoutDay[];
}

export function generateFitnessPlan(
  goal: "weight_loss" | "muscle_gain" | "cardiovascular" | "mobility",
  level: "beginner" | "intermediate" | "advanced",
  daysPerWeek: number = 4,
  minutesPerSession: number = 45
): FitnessPlanResult {
  const days: WorkoutDay[] = [];
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Configure rep ranges & volume based on goal & level
  const setMultiplier = level === "advanced" ? 4 : level === "intermediate" ? 3 : 2;
  const restDuration = goal === "muscle_gain" ? 90 : 60;

  // Template exercises based on focus
  const upperExercises: Exercise[] = [
    { name: "Push-ups / Incline Push-ups", category: "strength", sets: setMultiplier, reps: "10-12", restSec: restDuration },
    { name: "Dumbbell or Resistance Band Rows", category: "strength", sets: setMultiplier, reps: "12-15", restSec: restDuration },
    { name: "Overhead Shoulder Press", category: "strength", sets: setMultiplier, reps: "10-12", restSec: restDuration },
    { name: "Plank Hold", category: "strength", sets: 3, reps: level === "advanced" ? "60s" : "30s", restSec: 45 },
  ];

  const lowerExercises: Exercise[] = [
    { name: "Bodyweight / Goblet Squats", category: "strength", sets: setMultiplier, reps: "12-15", restSec: restDuration },
    { name: "Reverse Lunges", category: "strength", sets: setMultiplier, reps: "10 per leg", restSec: restDuration },
    { name: "Glute Bridges", category: "strength", sets: setMultiplier, reps: "15", restSec: 45 },
    { name: "Calf Raises", category: "strength", sets: 3, reps: "20", restSec: 30 },
  ];

  const cardioCoreExercises: Exercise[] = [
    { name: "Brisk Walking / Jogging Intervals", category: "cardio", sets: 1, reps: `${minutesPerSession - 15} mins`, restSec: 0 },
    { name: "Mountain Climbers", category: "cardio", sets: 3, reps: "30s", restSec: 30 },
    { name: "Deadbug Core Stabilization", category: "flexibility", sets: 3, reps: "12 reps", restSec: 45 },
  ];

  const mobilityExercises: Exercise[] = [
    { name: "Cat-Cow Spine Flow", category: "flexibility", sets: 2, reps: "10 reps", restSec: 30 },
    { name: "World's Greatest Stretch", category: "flexibility", sets: 2, reps: "5 per side", restSec: 30 },
    { name: "Hip 90/90 Flow", category: "flexibility", sets: 2, reps: "8 per side", restSec: 30 },
    { name: "Hamstring Active Sweep", category: "flexibility", sets: 2, reps: "10 reps", restSec: 30 },
  ];

  for (let i = 0; i < 7; i++) {
    const dayName = dayNames[i];
    // 3 days per week: Mon, Wed, Fri active
    // 4 days per week: Mon, Tue, Thu, Fri active
    // 5 days per week: Mon, Tue, Wed, Fri, Sat active
    let isActive = false;
    let focus = "Rest & Active Recovery";
    let exercises: Exercise[] = [];

    if (daysPerWeek === 3) {
      if (i === 0) { isActive = true; focus = "Full Body & Mobility"; exercises = [...upperExercises.slice(0, 2), ...lowerExercises.slice(0, 2)]; }
      else if (i === 2) { isActive = true; focus = "Cardio & Core"; exercises = cardioCoreExercises; }
      else if (i === 4) { isActive = true; focus = "Full Body Strength"; exercises = [...lowerExercises.slice(0, 2), ...upperExercises.slice(2, 4)]; }
    } else if (daysPerWeek === 4) {
      if (i === 0) { isActive = true; focus = "Upper Body Strength"; exercises = upperExercises; }
      else if (i === 1) { isActive = true; focus = "Lower Body & Core"; exercises = lowerExercises; }
      else if (i === 3) { isActive = true; focus = "Cardiovascular Conditioning"; exercises = cardioCoreExercises; }
      else if (i === 4) { isActive = true; focus = "Full Body & Mobility"; exercises = [...upperExercises.slice(0, 2), ...mobilityExercises]; }
    } else {
      // 5-6 days
      if (i === 0) { isActive = true; focus = "Upper Body Push"; exercises = upperExercises; }
      else if (i === 1) { isActive = true; focus = "Lower Body Legs"; exercises = lowerExercises; }
      else if (i === 2) { isActive = true; focus = "Core & Mobility"; exercises = mobilityExercises; }
      else if (i === 3) { isActive = true; focus = "Cardio Endurance"; exercises = cardioCoreExercises; }
      else if (i === 4) { isActive = true; focus = "Full Body Hypertrophy"; exercises = [...upperExercises.slice(0, 2), ...lowerExercises.slice(0, 2)]; }
      else if (daysPerWeek === 6 && i === 5) { isActive = true; focus = "Low Intensity Active Recovery"; exercises = mobilityExercises; }
    }

    days.push({
      dayName,
      focus,
      isRest: !isActive,
      warmupMin: isActive ? 5 : 0,
      exercises: isActive ? exercises : [],
      cooldownMin: isActive ? 5 : 0,
    });
  }

  return {
    goal,
    level,
    daysPerWeek,
    minutesPerSession,
    weeklySchedule: days,
  };
}

/**
 * Evaluates completion history to adjust or regenerate plan intensity.
 */
export function evaluatePlanAdaptation(
  completionRate: number // 0 to 1
): { recommendation: "maintain" | "increase_volume" | "deload"; reason: string } {
  if (completionRate < 0.5) {
    return {
      recommendation: "deload",
      reason: "Recent workout completion is below 50%. Reducing frequency to prioritize consistency.",
    };
  } else if (completionRate > 0.9) {
    return {
      recommendation: "increase_volume",
      reason: "Outstanding 90%+ completion streak. Progression to higher volume recommended.",
    };
  }
  return {
    recommendation: "maintain",
    reason: "Current plan matches adherence profile. Continue current cycle.",
  };
}
