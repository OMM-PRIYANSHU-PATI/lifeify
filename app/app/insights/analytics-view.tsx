"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DescriptiveStats, CorrelationResult, BaselineResult, TimeSeriesPoint } from "@/lib/analytics/stats";
import { createGoalAction, logGoalProgressAction, GoalInput } from "@/lib/actions/goals";

interface GoalItem {
  id: string;
  type: string;
  target: number;
  unit: string;
  period: string;
  achieved: number;
  hit: boolean;
  percent: number;
}

export function AnalyticsView({
  stepHistory,
  sleepHistory,
  stepStats,
  sleepStats,
  baselineStep,
  correlation,
  goals,
}: {
  stepHistory: TimeSeriesPoint[];
  sleepHistory: TimeSeriesPoint[];
  stepStats: DescriptiveStats;
  sleepStats: DescriptiveStats;
  baselineStep: BaselineResult;
  correlation: CorrelationResult | null;
  goals: GoalItem[];
}) {
  const [activeTab, setActiveTab] = useState<"trends" | "baselines" | "correlations" | "goals">("trends");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalType, setGoalType] = useState<GoalInput["type"]>("steps");
  const [goalTarget, setGoalTarget] = useState("8000");
  const [goalUnit, setGoalUnit] = useState("steps");
  const [loading, setLoading] = useState(false);

  // Combine step and sleep points for multi-line chart
  const combinedChartData = stepHistory.map((s) => {
    const matchingSleep = sleepHistory.find((sl) => sl.date === s.date);
    return {
      date: s.date.slice(5), // MM-DD
      steps: s.value,
      sleep: matchingSleep ? matchingSleep.value : null,
    };
  });

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createGoalAction({
        type: goalType,
        target: Number(goalTarget),
        unit: goalUnit,
        period: "DAILY",
      });
      if (res.ok) {
        setShowGoalModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogProgress = async (goalId: string, current: number) => {
    const inputVal = prompt("Enter today's progress value:", String(current));
    if (inputVal !== null && !isNaN(Number(inputVal))) {
      await logGoalProgressAction(goalId, Number(inputVal));
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-line text-sm font-medium">
        <button
          onClick={() => setActiveTab("trends")}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === "trends"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          📈 12-Month Trends
        </button>
        <button
          onClick={() => setActiveTab("baselines")}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === "baselines"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          🎯 14-Day Baselines
        </button>
        <button
          onClick={() => setActiveTab("correlations")}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === "correlations"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          🔗 Cross-Metric Correlations
        </button>
        <button
          onClick={() => setActiveTab("goals")}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === "goals"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          🏆 Goal Progress
        </button>
      </div>

      {/* TAB 1: 12-MONTH TRENDS */}
      {activeTab === "trends" && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="lif-card">
              <span className="text-xs font-semibold text-ink-muted">Daily Mean Steps</span>
              <p className="mt-1 text-2xl font-bold text-ink">{stepStats.mean.toLocaleString()}</p>
              <span className="text-[11px] text-ink-muted">Median: {stepStats.median.toLocaleString()}</span>
            </div>
            <div className="lif-card">
              <span className="text-xs font-semibold text-ink-muted">7-Day Moving Avg</span>
              <p className="mt-1 text-2xl font-bold text-primary-dark">
                {stepStats.movingAverage7d ? stepStats.movingAverage7d.toLocaleString() : "—"}
              </p>
              <span className="text-[11px] text-ink-muted">Steps/day</span>
            </div>
            <div className="lif-card">
              <span className="text-xs font-semibold text-ink-muted">Avg Sleep Duration</span>
              <p className="mt-1 text-2xl font-bold text-ink">{sleepStats.mean} hrs</p>
              <span className="text-[11px] text-ink-muted">Median: {sleepStats.median} hrs</span>
            </div>
            <div className="lif-card">
              <span className="text-xs font-semibold text-ink-muted">Active Tracking Span</span>
              <p className="mt-1 text-2xl font-bold text-ink">{stepStats.count} days</p>
              <span className="text-[11px] text-ink-muted">Recorded data points</span>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="lif-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">Historical Step Trend & Daily Progression</h3>
              <span className="text-xs text-ink-muted">Sample size: {stepHistory.length} recordings</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="steps"
                    name="Daily Steps"
                    stroke="#0E7C6B"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BASELINES */}
      {activeTab === "baselines" && (
        <div className="space-y-6">
          <div className="lif-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-semibold text-ink">14-Day Step Baseline</h3>
                  <p className="text-xs text-ink-muted">Rolling baseline calculated from 14-day trailing average</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  baselineStep.trend === "elevated"
                    ? "bg-emerald-100 text-emerald-800"
                    : baselineStep.trend === "decreased"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-ink-muted/10 text-ink"
                }`}
              >
                {baselineStep.trend === "elevated"
                  ? `▲ +${baselineStep.deltaPercent}%`
                  : baselineStep.trend === "decreased"
                  ? `▼ ${baselineStep.deltaPercent}%`
                  : "Stable"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg bg-surface-subtle p-3">
                <span className="text-[11px] text-ink-muted">14-Day Baseline</span>
                <p className="text-xl font-bold text-ink">{baselineStep.baselineValue.toLocaleString()} steps</p>
              </div>
              <div className="rounded-lg bg-surface-subtle p-3">
                <span className="text-[11px] text-ink-muted">Recent 3-Day Average</span>
                <p className="text-xl font-bold text-primary-dark">{baselineStep.recentAverage.toLocaleString()} steps</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-ink-soft bg-surface-subtle/50 p-3 rounded">
              {baselineStep.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: CORRELATIONS */}
      {activeTab === "correlations" && (
        <div className="space-y-6">
          <div className="lif-card space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <h3 className="font-semibold text-ink">Cross-Metric Pearson Correlation</h3>
                <p className="text-xs text-ink-muted">
                  Deterministic bivariate analysis (|r| ≥ 0.3 required with n ≥ 14 paired observation days)
                </p>
              </div>
            </div>

            {correlation ? (
              <div className="rounded-xl border border-line bg-surface-subtle p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-ink">
                    {correlation.metricA} ↔ {correlation.metricB}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      correlation.isSignificant
                        ? "bg-primary-soft text-primary-dark"
                        : "bg-ink-muted/10 text-ink-muted"
                    }`}
                  >
                    r = {correlation.coefficient} ({correlation.strength})
                  </span>
                </div>
                <p className="text-xs text-ink-soft">{correlation.description}</p>
                <div className="text-[11px] text-ink-muted italic">
                  * LIFEIFY does not extrapolate clinical causation from statistical correlation.
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-line p-6 text-center text-xs text-ink-muted">
                Insufficient paired days. Sync or log at least 14 days of simultaneous steps and sleep data to generate confident correlations.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GOALS */}
      {activeTab === "goals" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-ink">Active Health Goals</h3>
              <p className="text-xs text-ink-muted">Daily targets and verified hit status</p>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="lif-btn-primary px-3 py-1.5 text-xs font-semibold"
            >
              + Add Goal
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="lif-card text-center py-8 text-xs text-ink-muted">
              No health goals configured yet. Set a daily step, water, or sleep target to track progress.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {goals.map((g) => (
                <div key={g.id} className="lif-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize text-ink">{g.type} Target</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        g.hit ? "bg-emerald-100 text-emerald-800" : "bg-primary-soft text-primary-dark"
                      }`}
                    >
                      {g.hit ? "Goal Achieved 🎉" : `${g.percent}%`}
                    </span>
                  </div>

                  <div className="w-full bg-line rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, g.percent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span>
                      {g.achieved.toLocaleString()} / {g.target.toLocaleString()} {g.unit}
                    </span>
                    <button
                      onClick={() => handleLogProgress(g.id, g.achieved)}
                      className="text-primary hover:underline font-medium"
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Goal Modal */}
          {showGoalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="lif-card w-full max-w-sm space-y-4">
                <h3 className="font-bold text-ink">Set New Health Goal</h3>
                <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
                  <div>
                    <label className="block mb-1 font-medium text-ink-soft">Goal Metric</label>
                    <select
                      value={goalType}
                      onChange={(e) => {
                        const t = e.target.value as GoalInput["type"];
                        setGoalType(t);
                        if (t === "steps") { setGoalTarget("8000"); setGoalUnit("steps"); }
                        else if (t === "water") { setGoalTarget("2500"); setGoalUnit("ml"); }
                        else if (t === "sleep") { setGoalTarget("8"); setGoalUnit("hours"); }
                        else if (t === "weight") { setGoalTarget("70"); setGoalUnit("kg"); }
                        else if (t === "adherence") { setGoalTarget("100"); setGoalUnit("%"); }
                      }}
                      className="lif-input w-full"
                    >
                      <option value="steps">Daily Steps</option>
                      <option value="water">Daily Water Intake</option>
                      <option value="sleep">Daily Sleep Duration</option>
                      <option value="weight">Target Weight</option>
                      <option value="adherence">Medication Adherence</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-ink-soft">Target Value</label>
                    <input
                      type="number"
                      required
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="lif-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-ink-soft">Unit</label>
                    <input
                      type="text"
                      required
                      value={goalUnit}
                      onChange={(e) => setGoalUnit(e.target.value)}
                      className="lif-input w-full"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={loading} className="lif-btn-primary flex-1 py-2">
                      {loading ? "Saving..." : "Save Goal"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGoalModal(false)}
                      className="lif-btn-secondary py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
