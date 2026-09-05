import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getActiveFitnessPlan } from "@/lib/actions/fitness";
import { getActiveNutritionPlan } from "@/lib/actions/nutrition";
import { getActiveSleepPlan } from "@/lib/actions/sleep";

export default async function PlansPage() {
  await requireUser();
  const fitness = await getActiveFitnessPlan();
  const nutrition = await getActiveNutritionPlan();
  const sleep = await getActiveSleepPlan();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Personalized Wellness Plans</h1>
        <p className="text-sm text-ink-soft">
          Deterministic, rule-based programs tailored to your biometrics, daily schedule, and dietary preferences.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {/* Fitness Card */}
        <div className="lif-card flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🏋️‍♂️</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${fitness ? "bg-emerald-100 text-emerald-800" : "bg-ink-muted/10 text-ink-muted"}`}>
                {fitness ? "Active" : "Not configured"}
              </span>
            </div>
            <h3 className="font-bold text-ink">Fitness & Workouts</h3>
            <p className="text-xs text-ink-soft">
              {fitness
                ? `${fitness.daysPerWeek} days/week • ${fitness.minutesPerSession} mins • ${fitness.goal.replace(/_/g, " ")}`
                : "Deterministic weekly workout plan structured around your goal and experience."}
            </p>
          </div>
          <Link href="/app/plans/fitness" className="lif-btn-primary text-center py-2 text-xs font-semibold">
            {fitness ? "View Workout Schedule" : "Generate Fitness Plan"}
          </Link>
        </div>

        {/* Nutrition Card */}
        <div className="lif-card flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🥗</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${nutrition.plan ? "bg-emerald-100 text-emerald-800" : "bg-ink-muted/10 text-ink-muted"}`}>
                {nutrition.plan ? "Active" : "Not configured"}
              </span>
            </div>
            <h3 className="font-bold text-ink">Nutrition & Indian Meals</h3>
            <p className="text-xs text-ink-soft">
              {nutrition.plan
                ? `${nutrition.plan.calorieTarget} kcal/day • ${nutrition.plan.proteinTarget}g Protein • ${nutrition.plan.dietType}`
                : "TDEE-based macro distribution with curated authentic Indian staples."}
            </p>
          </div>
          <Link href="/app/plans/nutrition" className="lif-btn-primary text-center py-2 text-xs font-semibold">
            {nutrition.plan ? "View Meal Plan & Log" : "Generate Nutrition Plan"}
          </Link>
        </div>

        {/* Sleep Card */}
        <div className="lif-card flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🌙</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sleep ? "bg-emerald-100 text-emerald-800" : "bg-ink-muted/10 text-ink-muted"}`}>
                {sleep ? "Active" : "Not configured"}
              </span>
            </div>
            <h3 className="font-bold text-ink">Sleep & Circadian Rhythm</h3>
            <p className="text-xs text-ink-soft">
              {sleep
                ? `${sleep.targetDurationH}h target • Bedtime ${sleep.bedtime} • Wake ${sleep.wakeTime}`
                : "90-minute sleep cycle optimization with caffeine cutoffs and wind-down checklists."}
            </p>
          </div>
          <Link href="/app/plans/sleep" className="lif-btn-primary text-center py-2 text-xs font-semibold">
            {sleep ? "View Sleep Routine" : "Generate Sleep Plan"}
          </Link>
        </div>
      </div>
    </div>
  );
}
