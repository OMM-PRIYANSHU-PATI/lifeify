import {
  MacroTargets,
  NutritionIntakeSummary,
  NutritionVarianceResult,
} from "../types";

export interface IndianFoodItem {
  name: string;
  regionalAliases: string[];
  cuisine: "North Indian" | "South Indian" | "East Indian" | "West Indian" | "Pan-Indian";
  standardServingUnit: "roti" | "katori" | "bowl" | "plate" | "piece" | "glass" | "cup" | "gram" | "ml";
  caloriesPerUnit: number;
  proteinGPerUnit: number;
  carbsGPerUnit: number;
  fatGPerUnit: number;
  fiberGPerUnit: number;
  isVegetarian: boolean;
  isVegan: boolean;
}

export const INDIAN_FOOD_DATABASE: IndianFoodItem[] = [
  {
    name: "Roti / Chapati / Phulka",
    regionalAliases: ["roti", "chapati", "phulka", "rotli"],
    cuisine: "Pan-Indian",
    standardServingUnit: "roti",
    caloriesPerUnit: 104,
    proteinGPerUnit: 3.1,
    carbsGPerUnit: 20.0,
    fatGPerUnit: 0.8,
    fiberGPerUnit: 2.8,
    isVegetarian: true,
    isVegan: true,
  },
  {
    name: "Dal Tadka / Yellow Dal",
    regionalAliases: ["dal", "daal", "dal tadka", "toor dal", "moong dal"],
    cuisine: "Pan-Indian",
    standardServingUnit: "katori",
    caloriesPerUnit: 145,
    proteinGPerUnit: 8.5,
    carbsGPerUnit: 21.0,
    fatGPerUnit: 3.5,
    fiberGPerUnit: 4.2,
    isVegetarian: true,
    isVegan: true,
  },
  {
    name: "Steamed Basmati Rice",
    regionalAliases: ["rice", "chawal", "bhat", "steamed rice"],
    cuisine: "Pan-Indian",
    standardServingUnit: "katori",
    caloriesPerUnit: 130,
    proteinGPerUnit: 2.7,
    carbsGPerUnit: 28.0,
    fatGPerUnit: 0.3,
    fiberGPerUnit: 0.4,
    isVegetarian: true,
    isVegan: true,
  },
  {
    name: "Plain Curd / Dahi",
    regionalAliases: ["curd", "dahi", "yogurt", "thayir"],
    cuisine: "Pan-Indian",
    standardServingUnit: "katori",
    caloriesPerUnit: 98,
    proteinGPerUnit: 6.2,
    carbsGPerUnit: 4.5,
    fatGPerUnit: 4.2,
    fiberGPerUnit: 0.0,
    isVegetarian: true,
    isVegan: false,
  },
  {
    name: "Paneer Bhurji / Curry",
    regionalAliases: ["paneer", "paneer bhurji", "cottage cheese"],
    cuisine: "North Indian",
    standardServingUnit: "katori",
    caloriesPerUnit: 240,
    proteinGPerUnit: 14.5,
    carbsGPerUnit: 5.0,
    fatGPerUnit: 18.0,
    fiberGPerUnit: 1.2,
    isVegetarian: true,
    isVegan: false,
  },
  {
    name: "Idli (Steamed Rice Cake)",
    regionalAliases: ["idli", "iddly"],
    cuisine: "South Indian",
    standardServingUnit: "piece",
    caloriesPerUnit: 58,
    proteinGPerUnit: 2.0,
    carbsGPerUnit: 12.0,
    fatGPerUnit: 0.2,
    fiberGPerUnit: 0.8,
    isVegetarian: true,
    isVegan: true,
  },
  {
    name: "Masala Dosa with Chutney",
    regionalAliases: ["dosa", "masala dosa", "dosai"],
    cuisine: "South Indian",
    standardServingUnit: "piece",
    caloriesPerUnit: 280,
    proteinGPerUnit: 5.5,
    carbsGPerUnit: 42.0,
    fatGPerUnit: 10.5,
    fiberGPerUnit: 3.2,
    isVegetarian: true,
    isVegan: true,
  },
  {
    name: "Chole / Chana Masala",
    regionalAliases: ["chole", "chana", "chickpeas", "chana masala"],
    cuisine: "North Indian",
    standardServingUnit: "bowl",
    caloriesPerUnit: 220,
    proteinGPerUnit: 11.0,
    carbsGPerUnit: 32.0,
    fatGPerUnit: 5.8,
    fiberGPerUnit: 7.5,
    isVegetarian: true,
    isVegan: true,
  },
  {
    name: "Buttermilk / Chaas",
    regionalAliases: ["chaas", "buttermilk", "mor", "mattha"],
    cuisine: "Pan-Indian",
    standardServingUnit: "glass",
    caloriesPerUnit: 45,
    proteinGPerUnit: 2.2,
    carbsGPerUnit: 3.8,
    fatGPerUnit: 1.5,
    fiberGPerUnit: 0.0,
    isVegetarian: true,
    isVegan: false,
  },
];

export class NutritionEngine {
  /**
   * Compares actual consumption vs personalized targets
   */
  static evaluateVariance(targets: MacroTargets, actual: NutritionIntakeSummary): NutritionVarianceResult {
    const calorieVariance = actual.consumedCalories - targets.dailyCalories;
    const proteinVariance = actual.consumedProtein - targets.proteinGrams;
    const carbVariance = actual.consumedCarbs - targets.carbsGrams;
    const fatVariance = actual.consumedFat - targets.fatGrams;
    const hydrationVariance = actual.consumedWaterMl - targets.waterMl;

    const calorieVariancePct = targets.dailyCalories > 0 ? (calorieVariance / targets.dailyCalories) * 100 : 0;
    const proteinVariancePct = targets.proteinGrams > 0 ? (proteinVariance / targets.proteinGrams) * 100 : 0;
    const hydrationVariancePct = targets.waterMl > 0 ? (hydrationVariance / targets.waterMl) * 100 : 0;

    let status: NutritionVarianceResult["status"] = "ON_TRACK";
    if (calorieVariancePct > 15) status = "SURPLUS";
    else if (calorieVariancePct < -15) status = "DEFICIT";

    const practicalAdjustments: string[] = [];

    if (proteinVariance < -25) {
      practicalAdjustments.push(
        `Protein intake is ${Math.abs(Math.round(proteinVariance))}g below today's target. Consider adding paneer, dal, greek yogurt, or eggs to your next meal.`
      );
    }

    if (hydrationVariance < -500) {
      practicalAdjustments.push(
        `Hydration is ${Math.abs(Math.round(hydrationVariance))}mL behind target. Drink 1–2 glasses of water or chaas before your next workout.`
      );
    }

    if (status === "DEFICIT" && actual.mealCount >= 3) {
      practicalAdjustments.push(
        "Calorie intake is pacing lower than baseline energy expenditure. Maintain adequate complex carbohydrate and healthy fat intake."
      );
    }

    return {
      calorieVariance: Math.round(calorieVariance),
      proteinVariance: Math.round(proteinVariance),
      carbVariance: Math.round(carbVariance),
      fatVariance: Math.round(fatVariance),
      hydrationVariance: Math.round(hydrationVariance),
      calorieVariancePct: Math.round(calorieVariancePct),
      proteinVariancePct: Math.round(proteinVariancePct),
      hydrationVariancePct: Math.round(hydrationVariancePct),
      status,
      practicalAdjustments,
    };
  }

  /**
   * Parses natural language Indian food text (e.g. "2 rotis + dal + rice + curd")
   */
  static parseNaturalIndianFoodString(input: string): {
    items: Array<{ name: string; quantity: number; unit: string; calories: number; proteinG: number; isEstimated: boolean }>;
    totalCalories: number;
    totalProteinG: number;
  } {
    const raw = input.toLowerCase();
    const parsedItems: Array<{
      name: string;
      quantity: number;
      unit: string;
      calories: number;
      proteinG: number;
      isEstimated: boolean;
    }> = [];

    for (const food of INDIAN_FOOD_DATABASE) {
      for (const alias of food.regionalAliases) {
        if (raw.includes(alias)) {
          // Look for preceding digit like "2 rotis" or "1 katori dal"
          const regex = new RegExp(`(\\d+)\\s*(?:${alias})`, "i");
          const match = raw.match(regex);
          const quantity = match ? Number(match[1]) : 1;

          parsedItems.push({
            name: food.name,
            quantity,
            unit: food.standardServingUnit,
            calories: Math.round(food.caloriesPerUnit * quantity),
            proteinG: Number((food.proteinGPerUnit * quantity).toFixed(1)),
            isEstimated: true,
            isIndianItem: true,
          });
          break;
        }
      }
    }

    const totalCalories = parsedItems.reduce((acc, i) => acc + i.calories, 0);
    const totalProteinG = Number(parsedItems.reduce((acc, i) => acc + i.proteinG, 0).toFixed(1));

    return {
      items: parsedItems,
      totalCalories,
      totalProteinG,
    };
  }

  // Instance wrappers
  calculateVariance(p1: any, p2: any) {
    if (p1 && "consumedCalories" in p1) {
      return NutritionEngine.evaluateVariance(p2, p1);
    }
    return NutritionEngine.evaluateVariance(p1, p2);
  }

  parseFoodString(input: string) {
    return NutritionEngine.parseNaturalIndianFoodString(input).items;
  }

  parseNaturalIndianFoodString(input: string) {
    return NutritionEngine.parseNaturalIndianFoodString(input);
  }
}

export const nutritionEngine = new NutritionEngine();
