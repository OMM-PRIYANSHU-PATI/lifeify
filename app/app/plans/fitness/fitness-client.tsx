"use client";

import { useState } from "react";
import { createFitnessPlanAction } from "@/lib/actions/fitness";
import { WorkoutDay } from "@/lib/rules/domains/fitness";

export function FitnessClient({
  plan,
}: {
  plan: {
    id: string;
    goal: string;
    fitnessLevel: string;
    daysPerWeek: number;
    minutesPerSession: number;
    generatedSchedule: WorkoutDay[];
  } | null;
}) {
  const [showModal, setShowModal] = useState(!plan);
  const [goal, setGoal] = useState<"weight_loss" | "muscle_gain" | "cardiovascular" | "mobility">("weight_loss");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [minutes, setMinutes] = useState(45);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createFitnessPlanAction({
        goal,
        fitnessLevel: level,
        daysPerWeek,
        minutesPerSession: minutes,
      });
      if (res.ok) {
        setShowModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Weekly Fitness Schedule</h1>
          <p className="text-sm text-ink-soft">
            {plan
              ? `Personalized ${plan.fitnessLevel} program for ${plan.goal.replace(/_/g, " ")} (${plan.daysPerWeek} days/week, ${plan.minutesPerSession} mins/session)`
              : "Generate a custom, deterministic weekly routine."}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="lif-btn-secondary px-3 py-1.5 text-xs font-semibold"
        >
          ⚙️ Adjust / Regenerate Plan
        </button>
      </div>

      {plan ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plan.generatedSchedule.map((day, idx) => (
            <div
              key={idx}
              className={`lif-card space-y-3 ${
                day.isRest ? "bg-surface-subtle/50 opacity-80" : "border-primary/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink">{day.dayName}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    day.isRest ? "bg-ink-muted/10 text-ink-muted" : "bg-primary-soft text-primary-dark"
                  }`}
                >
                  {day.isRest ? "Rest Day" : day.focus}
                </span>
              </div>

              {day.isRest ? (
                <p className="text-xs text-ink-muted py-6 text-center">
                  Active recovery: Light walking, stretching, and tissue recovery.
                </p>
              ) : (
                <div className="space-y-2 pt-1 text-xs">
                  <div className="text-[11px] text-ink-muted">
                    Warm-up: {day.warmupMin} mins • Cooldown: {day.cooldownMin} mins
                  </div>
                  <div className="divide-y divide-line/60">
                    {day.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="py-2 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-ink">{ex.name}</p>
                          <p className="text-[11px] text-ink-muted capitalize">
                            {ex.sets} sets × {ex.reps} ({ex.restSec}s rest)
                          </p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 rounded text-primary focus:ring-primary" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="lif-card text-center py-12 text-sm text-ink-muted">
          No workout plan generated yet. Click &quot;Adjust / Regenerate Plan&quot; to begin.
        </div>
      )}

      {/* Generator Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="lif-card w-full max-w-md space-y-4">
            <h3 className="font-bold text-ink">Generate Rule-Based Fitness Plan</h3>
            <form onSubmit={handleGenerate} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-ink-soft">Primary Health Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as typeof goal)}
                  className="lif-input w-full"
                >
                  <option value="weight_loss">Weight Loss & Fat Burning</option>
                  <option value="muscle_gain">Muscle Hypertrophy & Strength</option>
                  <option value="cardiovascular">Cardiovascular Endurance</option>
                  <option value="mobility">Joint Mobility & Flexibility</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Current Fitness Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as typeof level)}
                  className="lif-input w-full"
                >
                  <option value="beginner">Beginner (0-6 months experience)</option>
                  <option value="intermediate">Intermediate (6-24 months regular training)</option>
                  <option value="advanced">Advanced (2+ years disciplined training)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Days Per Week</label>
                  <select
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="lif-input w-full"
                  >
                    <option value={3}>3 Days (Full Body)</option>
                    <option value={4}>4 Days (Upper / Lower)</option>
                    <option value={5}>5 Days (Split)</option>
                    <option value={6}>6 Days (Push/Pull/Legs)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Minutes / Session</label>
                  <select
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="lif-input w-full"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button type="submit" disabled={loading} className="lif-btn-primary flex-1 py-2">
                  {loading ? "Generating..." : "Generate Weekly Schedule"}
                </button>
                {plan && (
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
