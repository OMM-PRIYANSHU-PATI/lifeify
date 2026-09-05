import { INDIAN_FOOD_DATABASE, IndianFoodItem } from "../indian-foods";

export interface NutritionPlanResult {
  tdee: number;
  calorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  dietType: string;
  meals: {
    mealName: string;
    targetCalories: number;
    recommendedItems: IndianFoodItem[];
  }[];
}

/**
 * Calculates BMR using the Mifflin-St Jeor equation and applies activity multiplier.
 */
export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: "male" | "female" | "other",
  activityLevel: "sedentary" | "light" | "moderate" | "active"
): number {
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "female") {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  const mult = multipliers[activityLevel] ?? 1.2;
  return Math.round(bmr * mult);
}

export function generateNutritionPlan(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: "male" | "female" | "other",
  activityLevel: "sedentary" | "light" | "moderate" | "active",
  goal: "weight_loss" | "muscle_gain" | "maintenance",
  dietType: "veg" | "nonveg" | "vegan" | "jain" = "veg"
): NutritionPlanResult {
  const tdee = calculateTDEE(weightKg, heightCm, age, sex, activityLevel);

  let calorieTarget = tdee;
  if (goal === "weight_loss") calorieTarget = Math.max(1200, tdee - 400);
  else if (goal === "muscle_gain") calorieTarget = tdee + 300;

  // Protein targets: 1.8g/kg for muscle gain/loss, 1.4g/kg maintenance
  const proteinPerKg = goal === "muscle_gain" ? 1.8 : goal === "weight_loss" ? 1.6 : 1.4;
  const proteinTargetG = Math.round(weightKg * proteinPerKg);
  const proteinCalories = proteinTargetG * 4;

  // Fat: 25% of total calories
  const fatCalories = calorieTarget * 0.25;
  const fatTargetG = Math.round(fatCalories / 9);

  // Carbs: remaining calories
  const carbCalories = Math.max(0, calorieTarget - proteinCalories - fatCalories);
  const carbTargetG = Math.round(carbCalories / 4);

  // Filter foods by dietary preference
  const allowedFoods = INDIAN_FOOD_DATABASE.filter((f) => {
    if (dietType === "vegan") return f.tags.includes("vegan");
    if (dietType === "jain") return f.tags.includes("jain");
    if (dietType === "veg") return f.tags.includes("veg") || f.tags.includes("vegan");
    return true; // nonveg allows all
  });

  const breakfastItems = allowedFoods.filter((f) => f.category === "breakfast" || f.category === "dairy");
  const lunchDinnerItems = allowedFoods.filter((f) => f.category === "bread_rice" || f.category === "dal_curry" || f.category === "main_course");
  const snackItems = allowedFoods.filter((f) => f.category === "snack" || f.category === "dairy");

  return {
    tdee,
    calorieTarget,
    proteinTargetG,
    carbTargetG,
    fatTargetG,
    dietType,
    meals: [
      {
        mealName: "Breakfast (25% calories)",
        targetCalories: Math.round(calorieTarget * 0.25),
        recommendedItems: breakfastItems.slice(0, 3),
      },
      {
        mealName: "Lunch (35% calories)",
        targetCalories: Math.round(calorieTarget * 0.35),
        recommendedItems: lunchDinnerItems.slice(0, 4),
      },
      {
        mealName: "Evening Snack (15% calories)",
        targetCalories: Math.round(calorieTarget * 0.15),
        recommendedItems: snackItems.slice(0, 2),
      },
      {
        mealName: "Dinner (25% calories)",
        targetCalories: Math.round(calorieTarget * 0.25),
        recommendedItems: lunchDinnerItems.slice(2, 6),
      },
    ],
  };
}
