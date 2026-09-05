"use client";

import { useState } from "react";
import { createNutritionPlanAction, logFoodItemAction } from "@/lib/actions/nutrition";
import { IndianFoodItem } from "@/lib/rules/indian-foods";

interface NutritionClientProps {
  plan: {
    calorieTarget: number;
    proteinTarget: number;
    carbTarget: number;
    fatTarget: number;
    dietType: string;
  } | null;
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  todayLogs: {
    id: string;
    foodName: string;
    portion: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    loggedAt: Date | string;
  }[];
  indianFoods: IndianFoodItem[];
}

export function NutritionClient({ plan, consumed, todayLogs, indianFoods }: NutritionClientProps) {
  const [showPlanModal, setShowPlanModal] = useState(!plan);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Form state
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [age, setAge] = useState("30");
  const [sex, setSex] = useState<"male" | "female" | "other">("male");
  const [activity, setActivity] = useState<"sedentary" | "light" | "moderate" | "active">("moderate");
  const [goal, setGoal] = useState<"weight_loss" | "muscle_gain" | "maintenance">("weight_loss");
  const [dietType, setDietType] = useState<"veg" | "nonveg" | "vegan" | "jain">("veg");

  const filteredFoods = indianFoods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.nameHi && f.nameHi.includes(searchQuery))
  );

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createNutritionPlanAction({
        weightKg: Number(weight),
        heightCm: Number(height),
        age: Number(age),
        sex,
        activityLevel: activity,
        goal,
        dietType,
      });
      if (res.ok) setShowPlanModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = async (food: IndianFoodItem) => {
    await logFoodItemAction({
      foodName: food.name,
      portion: 1,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
  };

  const calTarget = plan ? plan.calorieTarget : 2000;
  const calPercent = Math.min(100, Math.round((consumed.calories / calTarget) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Nutrition & Indian Meals</h1>
          <p className="text-sm text-ink-soft">
            TDEE-calibrated macro targets with authentic Indian food database and healthy substitutions.
          </p>
        </div>
        <button
          onClick={() => setShowPlanModal(true)}
          className="lif-btn-secondary px-3 py-1.5 text-xs font-semibold"
        >
          ⚙️ Recalculate Nutrition Plan
        </button>
      </div>

      {/* Daily Macro Progress Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="lif-card">
          <div className="flex justify-between items-center text-xs text-ink-muted">
            <span>Calories</span>
            <span>{consumed.calories} / {calTarget} kcal</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-ink">{consumed.calories} <span className="text-xs font-normal">kcal</span></div>
          <div className="w-full bg-line rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${calPercent}%` }} />
          </div>
        </div>

        <div className="lif-card">
          <div className="flex justify-between items-center text-xs text-ink-muted">
            <span>Protein</span>
            <span>{consumed.protein} / {plan?.proteinTarget ?? 100}g</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-ink">{consumed.protein} <span className="text-xs font-normal">g</span></div>
          <div className="w-full bg-line rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.round((consumed.protein / (plan?.proteinTarget ?? 100)) * 100))}%` }} />
          </div>
        </div>

        <div className="lif-card">
          <div className="flex justify-between items-center text-xs text-ink-muted">
            <span>Carbohydrates</span>
            <span>{consumed.carbs} / {plan?.carbTarget ?? 220}g</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-ink">{consumed.carbs} <span className="text-xs font-normal">g</span></div>
          <div className="w-full bg-line rounded-full h-1.5 mt-2">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.round((consumed.carbs / (plan?.carbTarget ?? 220)) * 100))}%` }} />
          </div>
        </div>

        <div className="lif-card">
          <div className="flex justify-between items-center text-xs text-ink-muted">
            <span>Healthy Fats</span>
            <span>{consumed.fat} / {plan?.fatTarget ?? 55}g</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-ink">{consumed.fat} <span className="text-xs font-normal">g</span></div>
          <div className="w-full bg-line rounded-full h-1.5 mt-2">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.round((consumed.fat / (plan?.fatTarget ?? 55)) * 100))}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Curated Indian Food Quick Logger */}
        <div className="lif-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink">Indian Food Database & Quick Log</h3>
            <span className="text-xs text-ink-muted">{indianFoods.length} items cataloged</span>
          </div>

          <input
            type="text"
            placeholder="Search Roti, Dal, Paneer, Idli, Khichdi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="lif-input w-full text-xs"
          />

          <div className="max-h-80 overflow-y-auto divide-y divide-line/60">
            {filteredFoods.map((food) => (
              <div key={food.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-ink">
                    {food.name} {food.nameHi && <span className="text-[11px] text-ink-muted font-normal">({food.nameHi})</span>}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {food.servingLabel} • {food.calories} kcal • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                  </p>
                  {food.substitutionAlternative && (
                    <p className="text-[10px] text-primary-dark font-medium mt-0.5">
                      💡 Swap tip: {food.substitutionAlternative} ({food.substitutionReason})
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleQuickLog(food)}
                  className="lif-btn-primary px-2.5 py-1 text-xs whitespace-nowrap ml-2"
                >
                  + Log
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Meals Logged */}
        <div className="lif-card space-y-4">
          <h3 className="font-bold text-sm text-ink">Today&apos;s Consumed Items</h3>
          {todayLogs.length === 0 ? (
            <p className="text-xs text-ink-muted py-8 text-center">
              No food items logged today. Click &quot;+ Log&quot; on any food on the left.
            </p>
          ) : (
            <div className="divide-y divide-line/60">
              {todayLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-ink">{log.foodName}</p>
                    <p className="text-[11px] text-ink-muted">
                      {log.portion} portion • P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g
                    </p>
                  </div>
                  <span className="font-bold text-primary-dark">{log.calories} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plan Generation Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="lif-card w-full max-w-md space-y-4">
            <h3 className="font-bold text-ink">Calculate Personalized TDEE & Nutrition Plan</h3>
            <form onSubmit={handleGeneratePlan} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="lif-input w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Height (cm)</label>
                  <input
                    type="number"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="lif-input w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="lif-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Biological Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as typeof sex)}
                    className="lif-input w-full"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Dietary Pattern</label>
                  <select
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value as typeof dietType)}
                    className="lif-input w-full"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="nonveg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="jain">Jain (No Root Veg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Activity Level</label>
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value as typeof activity)}
                    className="lif-input w-full"
                  >
                    <option value="sedentary">Sedentary (Desk job)</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="active">Very Active</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as typeof goal)}
                    className="lif-input w-full"
                  >
                    <option value="weight_loss">Weight Loss (-400 kcal)</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="muscle_gain">Muscle Gain (+300 kcal)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button type="submit" disabled={loading} className="lif-btn-primary flex-1 py-2">
                  {loading ? "Calculating..." : "Save Nutrition Plan"}
                </button>
                {plan && (
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(false)}
                    className="lif-btn-secondary py-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
