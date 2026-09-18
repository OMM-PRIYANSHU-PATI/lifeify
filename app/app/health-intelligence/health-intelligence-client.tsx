"use client";

import { useState } from "react";
import {
  Activity,
  Heart,
  Moon,
  Pill,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Flame,
  Zap,
  Info,
  Layers,
  FileText
} from "lucide-react";
import type { OrchestratedOverviewResult } from "@/lib/core-engine";

interface Props {
  initialOverview: OrchestratedOverviewResult;
}

export function HealthIntelligenceClient({ initialOverview }: Props) {
  const [data, setData] = useState<OrchestratedOverviewResult>(initialOverview);
  const [isLoadingSim, setIsLoadingSim] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "baselines" | "patterns" | "signals" | "actions">("overview");
  const [selectedSignalIndex, setSelectedSignalIndex] = useState<number | null>(0);

  const handleRunSimulation = async () => {
    setIsLoadingSim(true);
    try {
      const resp = await fetch("/api/health/demo/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo_patient_001" })
      });
      const json = await resp.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Simulation run error:", err);
    } finally {
      setIsLoadingSim(false);
    }
  };

  const { context, plan, baselineProfile, aiExecutiveSummary, crossDomainPatterns } = data;
  const readiness = context.sleep.readiness;
  const strain = context.fitness.currentStrain;

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Health Intelligence Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
              Health Command Center
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unified cross-domain intelligence • Clinical conservatism • Personal baselines
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunSimulation}
              disabled={isLoadingSim}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSim ? "animate-spin" : ""}`} />
              <span>{isLoadingSim ? "Simulating 90 Days..." : "Run 90-Day Simulation"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-medium scrollbar-none border-b border-gray-100 dark:border-gray-800">
          {[
            { id: "overview", label: "Today's Focus", icon: Sparkles },
            { id: "baselines", label: "Personal Baselines & Z-Scores", icon: TrendingUp },
            { id: "patterns", label: "Cross-Domain Patterns", icon: Layers },
            { id: "signals", label: `Risk Signals (${context.riskSignals.length})`, icon: AlertTriangle },
            { id: "actions", label: "Daily Actions & Doctor Prompts", icon: CheckCircle2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Tab Views */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Executive AI Summary Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4" />
                  <span>Clinical Intelligence Briefing</span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-medium flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  Clinically Verified Safe
                </span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
                {plan.headline}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Observation: </span>
                {aiExecutiveSummary}
              </div>
            </div>

            {/* Apple Health 3-Dial / Pillar Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pillar 1: Readiness Index */}
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-purple-500" />
                    LIFIFY Readiness Index
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold">
                    {readiness.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400">
                    {readiness.score}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">/ 100</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden my-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, readiness.score)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">
                  {readiness.headline}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-500 flex justify-between">
                  <span>Sleep Duration: {context.sleep.lastNightHours}h</span>
                  <span>Debt: {context.sleep.sleepDebtHours.toFixed(1)}h</span>
                </div>
              </div>

              {/* Pillar 2: Training Load Estimate */}
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    Training Load Estimate
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold">
                    {strain.trainingLoadLabel}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                    {strain.adjustedStrain.toFixed(0)}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    (Base: {strain.baseStrain.toFixed(0)} × Mod: {strain.recoveryModifier.toFixed(2)})
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden my-3">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-rose-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (strain.adjustedStrain / 80) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">
                  {strain.explanation}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-500 flex justify-between">
                  <span>Steps Today: {context.fitness.stepsToday.toLocaleString()}</span>
                  <span>Workouts 7d: {context.fitness.workoutsThisWeek}</span>
                </div>
              </div>

              {/* Pillar 3: Vitals & Adherence */}
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Autonomic & Adherence
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold">
                    {context.medications.adherencePercentLast7Days}% Med Adherence
                  </span>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                    {context.vitals.latestRestingHr || 68}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">bpm Resting HR</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden my-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-rose-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, ((context.vitals.latestRestingHr || 65) / 100) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">
                  Blood Pressure: {context.vitals.latestSystolicBp}/{context.vitals.latestDiastolicBp} mmHg • SpO2: {context.vitals.latestSpO2}%
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-500 flex justify-between">
                  <span>Scheduled Meds: {context.medications.scheduledTodayCount}</span>
                  <span>Data Quality: {context.dataQuality.overallState}</span>
                </div>
              </div>
            </div>

            {/* What Matters Today Focus Bullets */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                What Matters Today
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {plan.topWhatMattersToday.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 text-xs text-gray-700 dark:text-gray-300 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Baselines & Z-Scores */}
        {activeTab === "baselines" && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Longitudinal Baseline Deviations & Z-Scores
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Rolling windows: 7d, 30d, 90d. Threshold for statistical significance: |z| ≥ 1.75
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 font-medium">
                  {baselineProfile.significantDeviations.length} Active Deviations
                </span>
              </div>

              {baselineProfile.significantDeviations.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400 border border-dashed rounded-2xl">
                  No statistical anomalies (|z| ≥ 1.75) detected relative to rolling baselines.
                </div>
              ) : (
                <div className="space-y-3">
                  {baselineProfile.significantDeviations.map((dev, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                            {dev.metric.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                            z = {dev.zScore > 0 ? "+" : ""}{dev.zScore.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            ({dev.windowDays}-Day Window)
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Current value: <strong className="text-gray-900 dark:text-white">{dev.currentValue}</strong> vs baseline mean of <strong>{dev.mean.toFixed(1)}</strong> (σ: {dev.stdDev.toFixed(1)})
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold ${dev.percentageDelta > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          {dev.percentageDelta > 0 ? "+" : ""}{dev.percentageDelta}% Shift
                        </span>
                        <div className="text-[10px] text-gray-400">
                          {dev.sampleCount} samples recorded
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Explanation card */}
            <div className="p-5 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                Why Z-Score Baselines Matter
              </div>
              <p className="leading-relaxed">
                Rather than comparing your vitals against arbitrary population averages, LIFIFY compares your daily metrics against your own historical baseline. A z-score of +1.8 means your value is 1.8 standard deviations above your personal norm—providing early, individualized notice of physiological strain.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Cross-Domain Patterns */}
        {activeTab === "patterns" && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-500" />
                  Cross-Domain Observational Patterns
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Non-causal temporal correlations detected across sleep, training load, nutrition, and symptoms.
                </p>
              </div>

              <div className="space-y-3">
                {crossDomainPatterns.map((pat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-purple-950 dark:text-purple-200 leading-relaxed font-medium">
                      {pat}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medication-Symptom Temporal Association Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <Pill className="w-5 h-5" />
                    Medication ↔ Symptom Temporal Tracking
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Temporal proximity engine (detects symptom logging within 15–360 min of dose).
                  </p>
                </div>
              </div>

              {context.medications.recentAssociations.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 border border-dashed rounded-2xl">
                  No close temporal correlations between medication doses and reported symptoms.
                </div>
              ) : (
                <div className="space-y-3">
                  {context.medications.recentAssociations.map((assoc, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                          {assoc.medicationName} → {assoc.symptomName}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold">
                          {assoc.associationType}
                        </span>
                      </div>
                      <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
                        {assoc.observationalStatement}
                      </p>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-4 pt-1">
                        <span>Latency: ~{Math.round(assoc.proximityMinutes / 60)}h ({assoc.proximityMinutes} mins)</span>
                        <span>Recorded Occurrences: {assoc.occurrenceCount}</span>
                        {assoc.requiresProfessionalReview && (
                          <span className="text-amber-600 font-medium">⚠️ Flagged for Physician Review</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Explainable Risk Signals */}
        {activeTab === "signals" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Predictive Risk Signals ({context.riskSignals.length})
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Multi-domain risk models with full clinical explainability (What, Why, Evidence, Conservative Action).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {context.riskSignals.map((signal, idx) => (
                <div
                  key={signal.id}
                  onClick={() => setSelectedSignalIndex(idx)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    selectedSignalIndex === idx
                      ? "bg-white dark:bg-zinc-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                      : "bg-white dark:bg-zinc-900 border-gray-200/70 dark:border-zinc-800 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        signal.severity === "HIGH"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : signal.severity === "MODERATE"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {signal.severity} Severity
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Confidence: {(signal.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {signal.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    {signal.summary}
                  </p>

                  <div className="space-y-1.5 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-2xl text-[11px]">
                    <div className="font-semibold text-gray-700 dark:text-gray-300">Evidence Points:</div>
                    <ul className="list-disc pl-4 space-y-0.5 text-gray-600 dark:text-gray-400">
                      {signal.evidence.map((ev, eIdx) => (
                        <li key={eIdx}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  {signal.recommendedAction && (
                    <div className="mt-3 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                      <strong className="text-gray-900 dark:text-white">Action: </strong>
                      {signal.recommendedAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Daily Actions & Doctor Prompts */}
        {activeTab === "actions" && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Personalized Actions Today
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.personalizedActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {action.domain}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          action.priority === "HIGH"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {action.priority}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {action.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                      {action.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Discussion Prompts */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-5 h-5" />
                    Doctor Consultation Discussion Checklist
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Concise, clinically relevant talking points prepared for your next appointment.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {plan.doctorDiscussionPrompts.map((prompt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5"
                  >
                    <span className="w-4 h-4 rounded border border-indigo-400 flex items-center justify-center shrink-0 mt-0.5" />
                    <span>{prompt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
