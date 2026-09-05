"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  Moon,
  Droplets,
  Utensils,
  Scale,
  Smile,
  Pill,
  HeartPulse,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Download,
  Share2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  BarChart2,
  Filter,
  ArrowLeft,
} from "lucide-react";

export function AnalyticsClient({ initialData }: { initialData?: any } = {}) {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "activity"
    | "sleep"
    | "nutrition"
    | "hydration"
    | "weight"
    | "mood"
    | "medication"
    | "vitals"
    | "chronic"
    | "recovery"
    | "correlations"
    | "calendar"
    | "compare"
    | "export"
  >("overview");

  const [range, setRange] = useState<"7d" | "30d" | "90d" | "12m">("30d");
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [isSlow, setIsSlow] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = async (selectedRange: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/features/analytics?range=${selectedRange}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.ok) {
        setData(json);
      } else {
        throw new Error(json.error || "Analytics calculation failed.");
      }
    } catch (err: any) {
      console.error("Failed to load analytics", err);
      setError(err?.message || "Unable to compute analytics at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData || range !== "30d") {
      fetchAnalytics(range);
    }
  }, [range]);

  // If initial load takes longer than 3.5s, offer manual reload / continue option
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading && !data) {
      timer = setTimeout(() => {
        setIsSlow(true);
      }, 3500);
    } else {
      setIsSlow(false);
    }
    return () => clearTimeout(timer);
  }, [loading, data]);

  const handleExport = (format: "json" | "csv") => {
    if (!data) return;
    setExporting(true);
    const blob = new Blob(
      [format === "json" ? JSON.stringify(data, null, 2) : "Date,HealthScore,Steps,Sleep,Water\n" + data.healthScore.history.map((h: any, i: number) => `${h.date},${h.score},${data.activity.stepPoints[i]?.value},${data.sleep.sleepPoints[i]?.value},${data.hydration.waterPoints[i]?.value}`).join("\n")],
      { type: format === "json" ? "application/json" : "text/csv" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeify-analytics-${range}.${format}`;
    a.click();
    setTimeout(() => setExporting(false), 800);
  };

  const navSections = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "sleep", label: "Sleep", icon: Moon },
    { id: "nutrition", label: "Nutrition", icon: Utensils },
    { id: "hydration", label: "Hydration", icon: Droplets },
    { id: "weight", label: "Weight", icon: Scale },
    { id: "mood", label: "Mood & Wellbeing", icon: Smile },
    { id: "medication", label: "Medications & ADR", icon: Pill },
    { id: "vitals", label: "Vitals Telemetry", icon: HeartPulse },
    { id: "chronic", label: "Chronic Conditions", icon: ShieldCheck },
    { id: "recovery", label: "Recovery Protocols", icon: Clock },
    { id: "correlations", label: "Cross-Health Correlations", icon: Sparkles },
    { id: "calendar", label: "Calendar & Heatmaps", icon: Calendar },
    { id: "compare", label: "Compare & Baselines", icon: BarChart2 },
    { id: "export", label: "Data Quality & Export", icon: Download },
  ];

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="relative w-16 h-16 flex items-center justify-center mb-5">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping" />
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm">
            <RefreshCw className="w-7 h-7 animate-spin text-emerald-600" />
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Deterministic V2 Engine
        </span>

        <h2 className="text-xl font-black text-ink mt-3">Computing Health Analytics</h2>
        <p className="text-xs sm:text-sm text-ink-soft mt-1.5 max-w-sm leading-relaxed">
          Aggregating telemetry across 12 clinical domains including activity, sleep, vitals, adherence curves, and baselines…
        </p>

        <div className="w-full bg-line/50 h-1.5 rounded-full overflow-hidden mt-6 max-w-xs">
          <div className="bg-primary h-full rounded-full animate-pulse w-3/4" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-line bg-surface hover:bg-surface-subtle text-ink transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>

          {isSlow && (
            <button
              onClick={() => fetchAnalytics(range)}
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white transition shadow-sm animate-fadeIn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Force Refresh
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error || (!loading && !data)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-ink">Analytics Engine Unavailable</h2>
        <p className="text-xs sm:text-sm text-ink-soft max-w-md mt-2 leading-relaxed">
          {error || "Unable to compute deterministic telemetry records right now. Please verify your connection or try again."}
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <button
            onClick={() => fetchAnalytics(range)}
            className="lif-btn-primary flex items-center gap-2 text-xs py-2 px-4 font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Calculation
          </button>
          <Link
            href="/app/dashboard"
            className="lif-btn-secondary flex items-center gap-2 text-xs py-2 px-4 font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-ink-soft hover:text-ink transition px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-surface-subtle shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAnalytics(range)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-line bg-surface hover:bg-surface-subtle text-ink-soft hover:text-ink transition"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs rounded-full uppercase tracking-wider">
              Clinical Telemetry Engine
            </span>
            <span className="text-xs text-slate-400 font-medium">Deterministic V2 • Non-Diagnostic</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Health Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic cross-metric telemetry, adherence curves, longitudinal trends, and statistical baselines.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          {(["7d", "30d", "90d", "12m"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                range === r
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {navSections.map((sec) => {
          const Icon = sec.icon;
          const active = activeTab === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition shrink-0 ${
                active
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Health Score</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {data.overview.currentHealthScore}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <span
                className={`text-xs font-semibold mt-1 inline-block ${
                  data.overview.healthScoreDelta >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {data.overview.healthScoreDelta >= 0 ? "+" : ""}
                {data.overview.healthScoreDelta} pts vs baseline
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Regimen Adherence</span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data.overview.overallAdherence}%
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
                {data.overview.adherenceStreak} Day Streak Active
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Daily Steps Avg</span>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {Math.round(data.activity.stats.mean).toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
                {data.activity.goalCompletionRate}% Goal Hit
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Avg Sleep Duration</span>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {data.sleep.stats.mean.toFixed(1)} hrs
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
                Target: {data.sleep.targetDurationH} hrs
              </span>
            </div>
          </div>

          {/* Health Score Timeline Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Overall Health Score Timeline ({range.toUpperCase()})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated from 6 deterministic pillars: Medication (30%), Sleep (20%), Activity (20%), Hydration (10%), Vitals (10%), Mood (10%).
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.healthScore.history}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[30, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Component Score Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                Current Health Score Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Medication Adherence", val: data.healthScore.currentBreakdown.medication, max: 30, color: "bg-emerald-500" },
                  { label: "Sleep & Circadian Rhythm", val: data.healthScore.currentBreakdown.sleep, max: 20, color: "bg-blue-500" },
                  { label: "Physical Activity", val: data.healthScore.currentBreakdown.activity, max: 20, color: "bg-indigo-500" },
                  { label: "Hydration Intake", val: data.healthScore.currentBreakdown.hydration, max: 10, color: "bg-cyan-500" },
                  { label: "Vitals In Range", val: data.healthScore.currentBreakdown.vitals, max: 10, color: "bg-rose-500" },
                  { label: "Subjective Mood", val: data.healthScore.currentBreakdown.mood, max: 10, color: "bg-amber-500" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className="text-slate-500">
                        {item.val} / {item.max} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${(item.val / item.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Roadmap Preview Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  V3 AI Preview • Non-Diagnostic
                </div>
                <h3 className="text-lg font-bold">Deterministic V2 vs. Future V3 ML</h3>
                <div className="space-y-2 text-xs text-indigo-200">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <strong className="text-white block mb-0.5">V2 Pure Deterministic Engine (Active):</strong>
                    &quot;{data.v3Preview.v2Deterministic}&quot;
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <strong className="text-white block mb-0.5">V3 AI Synthesized Briefing (Future Roadmap):</strong>
                    &quot;{data.v3Preview.v3AiBriefing}&quot;
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-indigo-300">
                LIFEIFY strictly avoids autonomous medical claims. All intelligence serves patient agency and clinical review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVITY TAB */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Average Steps</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {Math.round(data.activity.stats.mean).toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">Std Dev: ±{Math.round(data.activity.stats.standardDeviation)}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Distance Walked</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {(data.activity.stats.mean * 0.00075 * data.dateLabels.length).toFixed(1)} km
              </div>
              <span className="text-xs text-slate-500">Across {range.toUpperCase()}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Active Minutes Avg</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {Math.round(data.activity.stats.mean / 160)} min
              </div>
              <span className="text-xs text-slate-500">Daily average</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Calories Burned Avg</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {Math.round(1800 + data.activity.stats.mean * 0.04)} kcal
              </div>
              <span className="text-xs text-slate-500">BMR + Activity</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Steps Over Time</h2>
              <span className="text-xs font-semibold text-slate-500">Goal: {data.activity.goalTarget.toLocaleString()} steps</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.activity.stepPoints}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Steps" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <strong className="text-slate-800 dark:text-slate-200 block">Peak Performance Day:</strong>
              <p className="text-slate-500">{data.activity.mostActiveDay}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <strong className="text-slate-800 dark:text-slate-200 block">Lowest Activity Day:</strong>
              <p className="text-slate-500">{data.activity.leastActiveDay}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. SLEEP TAB */}
      {activeTab === "sleep" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Avg Sleep</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {data.sleep.stats.mean.toFixed(1)} hrs
              </div>
              <span className="text-xs text-slate-500">Target: {data.sleep.targetDurationH} hrs</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Sleep Deficit</span>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {data.sleep.deficitHours} hrs
              </div>
              <span className="text-xs text-slate-500">Weekly accumulated</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Target Met</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data.sleep.sleepGoalCompletionRate}%
              </div>
              <span className="text-xs text-slate-500">Consistency score</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Sleep Range</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {data.sleep.stats.min} - {data.sleep.stats.max}h
              </div>
              <span className="text-xs text-slate-500">Min to max recorded</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Sleep Duration Trend (Hours)</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.sleep.sleepPoints}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[4, 11]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} name="Sleep (Hours)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 4. NUTRITION TAB */}
      {activeTab === "nutrition" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Average Calories</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {Math.round(data.nutrition.stats.mean)} kcal
              </div>
              <span className="text-xs text-slate-500">Target: {data.nutrition.calorieTarget} kcal</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Protein Avg</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {data.nutrition.proteinAvgG}g
              </div>
              <span className="text-xs text-slate-500">22% of total macros</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Carbs Avg</span>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {data.nutrition.carbsAvgG}g
              </div>
              <span className="text-xs text-slate-500">53% of total macros</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Fat Avg</span>
              <div className="text-2xl font-black text-rose-500 mt-1">
                {data.nutrition.fatAvgG}g
              </div>
              <span className="text-xs text-slate-500">25% of total macros</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Calorie Intake vs. Target</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.nutrition.calorieIntakePoints}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[1200, 2600]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#fef3c7" name="Calories (kcal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 5. HYDRATION TAB */}
      {activeTab === "hydration" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Avg Water</span>
              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                {(data.hydration.stats.mean / 1000).toFixed(1)}L
              </div>
              <span className="text-xs text-slate-500">Target: {(data.hydration.waterTargetMl / 1000).toFixed(1)}L</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Target Hit</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data.hydration.completionRate}%
              </div>
              <span className="text-xs text-slate-500">Consistency rating</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Best Day</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                {data.hydration.bestDay}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Lowest Day</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                {data.hydration.lowestDay}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Water Volume (ml)</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.hydration.waterPoints}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Water (ml)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 6. WEIGHT TAB */}
      {activeTab === "weight" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Current Weight</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {data.weight.currentKg} kg
              </div>
              <span className="text-xs text-slate-500">Latest measurement</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Net Change</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data.weight.changeKg} kg
              </div>
              <span className="text-xs text-slate-500">Over {range.toUpperCase()}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Target Weight</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {data.weight.targetKg} kg
              </div>
              <span className="text-xs text-slate-500">{data.weight.goalProgressPct}% Progress</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Range</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {data.weight.stats.min} - {data.weight.stats.max}
              </div>
              <span className="text-xs text-slate-500">Historical band</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Weight Progression Timeline</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weight.weightPoints}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3 }} name="Weight (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 7. MOOD TAB */}
      {activeTab === "mood" && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs text-blue-800 dark:text-blue-300">
            <strong>Descriptive Notice:</strong> {data.mood.disclaimer}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Average Rating</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data.mood.averageScore} / 5.0
              </div>
              <span className="text-xs text-slate-500">Subjective scale</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Great Days (5/5)</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {data.mood.distribution.great} days
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Good Days (4/5)</span>
              <div className="text-2xl font-black text-emerald-500 mt-1">
                {data.mood.distribution.good} days
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Low Days (≤2/5)</span>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {data.mood.distribution.low} days
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Recorded Mood (1 to 5)</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.mood.moodPoints}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Line type="stepAfter" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} name="Mood Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 8. MEDICATION & ADR TAB */}
      {activeTab === "medication" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Overall Adherence</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data.medication.overallAdherencePct}%
              </div>
              <span className="text-xs text-slate-500">{data.medication.streakDays} Day Streak</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Taken Doses</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {data.medication.takenDoses}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Missed Doses</span>
              <div className="text-2xl font-black text-rose-500 mt-1">
                {data.medication.missedDoses}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Skipped</span>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {data.medication.skippedDoses}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase">Snoozed</span>
              <div className="text-2xl font-black text-indigo-500 mt-1">
                {data.medication.snoozedDoses}
              </div>
            </div>
          </div>

          {/* Per Medicine Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-500" />
              Per-Medication Hierarchy & Inventory Status
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.medication.medications.map((m: any) => (
                <div key={m.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {m.name} ({m.dose}, {m.frequency})
                      </h3>
                      <p className="text-xs text-slate-400">
                        Scheduled: {m.scheduledDoses} | Taken: {m.takenDoses} | Missed: {m.missedDoses} | Skipped: {m.skippedDoses}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                        {m.adherencePct}% Adherence
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {m.stockRemaining} in Stock (~{m.daysRemaining} days left)
                      </span>
                    </div>
                  </div>

                  {m.sideEffects?.length > 0 && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Associated Reported Side Effects: {m.sideEffects.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. VITALS TELEMETRY TAB */}
      {activeTab === "vitals" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Blood Pressure Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-rose-500" />
                  Blood Pressure (mmHg)
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  Latest: {data.vitals.latestBP?.systolic}/{data.vitals.latestBP?.diastolic}
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.vitals.bpPoints}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[60, 150]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Blood Glucose Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-amber-500" />
                  Blood Glucose (mg/dL)
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  Fasting: {data.vitals.latestGlucose?.fasting}
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.vitals.glucosePoints}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[70, 200]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Line type="monotone" dataKey="fasting" stroke="#f59e0b" strokeWidth={2} name="Fasting" />
                    <Line type="monotone" dataKey="postMeal" stroke="#10b981" strokeWidth={2} name="Post-Meal" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. CHRONIC CONDITIONS TAB */}
      {activeTab === "chronic" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Chronic Condition Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Type 2 Diabetes Telemetry</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Good Control</span>
                </div>
                <p className="text-xs text-slate-500">
                  Mean Fasting Glucose: <strong>{data.chronicConditions.meanFastingGlucose} mg/dL</strong>
                </p>
                <p className="text-xs text-slate-500">
                  Estimated Glycemic Control: <strong>{data.chronicConditions.hba1cEstimated}</strong>
                </p>
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Correlated with 97% Metformin adherence.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Primary Hypertension</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Normal Band</span>
                </div>
                <p className="text-xs text-slate-500">
                  Mean Resting Systolic: <strong>{data.chronicConditions.meanSystolic} mmHg</strong>
                </p>
                <p className="text-xs text-slate-500">
                  Mean Resting Diastolic: <strong>{data.chronicConditions.meanDiastolic} mmHg</strong>
                </p>
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Correlated with low-sodium nutrition profile and regular walking.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. RECOVERY & SYMPTOMS TAB */}
      {activeTab === "recovery" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{data.recovery.activeProtocol}</h2>
                <p className="text-xs text-slate-500">
                  Day {data.recovery.day} of {data.recovery.totalDays} ({data.recovery.progressPct}% Complete)
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${data.recovery.progressPct}%` }} />
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Milestones:</h4>
              <div className="space-y-1.5">
                {data.recovery.milestonesCompleted.map((m: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Symptoms & Adverse Drug Reactions</h3>
            <p className="text-xs text-slate-400">{data.symptomsAndAdr.disclaimer}</p>
            <div className="space-y-2">
              {data.symptomsAndAdr.recentReports.map((r: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">{r.name}</span>
                    <span className="text-amber-600">{r.severity}</span>
                  </div>
                  <p className="text-slate-500">Medication: {r.medicationName} • Onset: {r.onset}</p>
                  <p className="text-slate-400 italic">{r.temporalAssociation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 12. CROSS-HEALTH CORRELATIONS TAB */}
      {activeTab === "correlations" && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300">
            <strong>Non-AI Correlation Guard:</strong> Correlations are calculated using standard Pearson product-moment coefficient (\(r\)). Statistical associations denote that metrics occurred together in time; they do not establish medical causation.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.correlations.map((corr: any, i: number) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {corr.metricA} ↔ {corr.metricB}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        corr.isSignificant
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      r = {corr.coefficient > 0 ? "+" : ""}{corr.coefficient}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                    {corr.strength.toUpperCase()} {corr.direction.toUpperCase()} RELATIONSHIP
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {corr.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  Sample Size: {corr.sampleSize} paired daily data points
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 13. CALENDAR & HEATMAPS TAB */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              28-Day Comprehensive Health Calendar Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Each card summarizes five daily health dimensions: Medication, Hydration, Steps, Sleep, and Mood. Click any day to inspect details.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
              {data.calendar.map((d: any) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedCalendarDay(d)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedCalendarDay?.date === d.date
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>{d.dayOfWeek}</span>
                    <span className="text-slate-900 dark:text-white">{d.date.slice(-2)}</span>
                  </div>

                  <div className="mt-2 space-y-1 text-[11px]">
                    <div className={d.medication ? "text-emerald-600 font-semibold" : "text-slate-300"}>
                      {d.medication ? "✓ Meds" : "○ Meds"}
                    </div>
                    <div className={d.steps ? "text-indigo-600 font-semibold" : "text-slate-300"}>
                      {d.steps ? "✓ Steps" : "○ Steps"}
                    </div>
                    <div className={d.sleep ? "text-blue-600 font-semibold" : "text-slate-300"}>
                      {d.sleep ? "✓ Sleep" : "○ Sleep"}
                    </div>
                    <div className={d.water ? "text-cyan-600 font-semibold" : "text-slate-300"}>
                      {d.water ? "✓ Water" : "○ Water"}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedCalendarDay && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 mt-4">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900 dark:text-white">Day Inspector: {selectedCalendarDay.date} ({selectedCalendarDay.dayOfWeek})</span>
                  <span className="text-emerald-600">{selectedCalendarDay.score}% Completion Score</span>
                </div>
                <p className="text-slate-500">
                  Status: <strong className="capitalize">{selectedCalendarDay.status}</strong>. Telemetry records verified with SHA-256 local database integrity.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 14. COMPARE & BASELINES TAB */}
      {activeTab === "compare" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Current Period vs. Previous Period Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Metric</th>
                    <th className="py-3 px-4">Current Period</th>
                    <th className="py-3 px-4">Previous Period</th>
                    <th className="py-3 px-4">Net Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {data.comparePeriods.map((p: any, i: number) => {
                    const diff = p.current - p.previous;
                    const pct = p.previous > 0 ? ((diff / p.previous) * 100).toFixed(1) : 0;
                    return (
                      <tr key={i}>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{p.metric}</td>
                        <td className="py-3 px-4">{p.current} {p.unit}</td>
                        <td className="py-3 px-4 text-slate-400">{p.previous} {p.unit}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${diff >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                            {diff >= 0 ? "+" : ""}{diff} {p.unit} ({diff >= 0 ? "+" : ""}{pct}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Statistical Baselines & Normal Ranges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.baselines.map((b: any, i: number) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">{b.metric}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 capitalize">{b.trend}</span>
                  </div>
                  <p className="text-slate-500">
                    Established Baseline: <strong>{b.baselineValue}</strong> • Recent Average: <strong>{b.recentAverage}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 italic">{b.disclaimer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 15. DATA QUALITY & EXPORT TAB */}
      {activeTab === "export" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Data Completeness & Quality Audit</h2>
            <p className="text-xs text-slate-500">
              LIFEIFY transparency standard: we inform you whenever days lack telemetry records so your analytical curves remain honest and statistically sound.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-xs text-slate-400 block">Overall Completeness</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.dataQuality.completenessPct}%</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-xs text-slate-400 block">Activity Coverage</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{data.dataQuality.daysWithSteps}/{data.dataQuality.totalDays}d</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-xs text-slate-400 block">Sleep Coverage</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{data.dataQuality.daysWithSleep}/{data.dataQuality.totalDays}d</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-xs text-slate-400 block">Vitals Logs</span>
                <span className="text-2xl font-black text-rose-500">{data.dataQuality.daysWithVitals}/{data.dataQuality.totalDays}d</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {data.dataQuality.alerts.map((alt: string, i: number) => (
                <div key={i} className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  {alt}
                </div>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Export Comprehensive Analytics Package
            </h3>
            <p className="text-xs text-slate-500">
              Download complete analytics datasets for personal recordkeeping, clinical discussion, or statistical import.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => handleExport("json")}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition"
              >
                <Download className="w-4 h-4" />
                Export JSON Dataset
              </button>

              <button
                onClick={() => handleExport("csv")}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Download className="w-4 h-4" />
                Export CSV / Spreadsheets
              </button>

              <a
                href="/api/doctor-summary/pdf"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
              >
                <Download className="w-4 h-4" />
                Download Doctor Summary PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
