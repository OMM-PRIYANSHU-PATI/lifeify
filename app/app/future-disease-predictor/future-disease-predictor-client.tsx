"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FutureDiseasePredictorInputs,
  FutureDiseasePredictionReport,
  predictFutureDiseases,
} from "@/lib/rules/risk-scores/future-disease-predictor";

interface Props {
  initialInputs: FutureDiseasePredictorInputs;
  initialReport: FutureDiseasePredictionReport;
}

export function FutureDiseasePredictorClient({
  initialInputs,
  initialReport,
}: Props) {
  const [inputs, setInputs] = useState<FutureDiseasePredictorInputs>(initialInputs);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [showTuner, setShowTuner] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Simulation controls state
  const [weightLossKg, setWeightLossKg] = useState(0);
  const [extraSteps, setExtraSteps] = useState(0);
  const [bpReductionMmHg, setBpReductionMmHg] = useState(0);
  const [quitSmoking, setQuitSmoking] = useState(false);
  const [optimizedDiet, setOptimizedDiet] = useState(false);

  // Expanded condition card state for details
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Dynamically compute report with active simulation overrides
  const currentReport = useMemo(() => {
    const isSimulating =
      weightLossKg > 0 ||
      extraSteps > 0 ||
      bpReductionMmHg > 0 ||
      quitSmoking ||
      optimizedDiet;

    return predictFutureDiseases({
      ...inputs,
      simulationOverrides: isSimulating
        ? {
            weightReductionKg: weightLossKg,
            stepIncrease: extraSteps,
            bpReductionMmHg: bpReductionMmHg,
            quitSmoking,
            optimizedDiet,
          }
        : undefined,
    });
  }, [inputs, weightLossKg, extraSteps, bpReductionMmHg, quitSmoking, optimizedDiet]);

  const hasActiveSimulation =
    weightLossKg > 0 ||
    extraSteps > 0 ||
    bpReductionMmHg > 0 ||
    quitSmoking ||
    optimizedDiet;

  const resetSimulation = () => {
    setWeightLossKg(0);
    setExtraSteps(0);
    setBpReductionMmHg(0);
    setQuitSmoking(false);
    setOptimizedDiet(false);
  };

  const handleSaveAssessment = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/future-disease-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs,
          saveAssessment: true,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Save error", e);
    } finally {
      setSaving(false);
    }
  };

  const categories = ["ALL", "Cardiometabolic", "Cardiovascular", "Hepatic", "Renal", "Cerebrovascular"];

  const filteredConditions = useMemo(() => {
    if (activeCategory === "ALL") return currentReport.allPredictedConditions;
    return currentReport.allPredictedConditions.filter(
      (c) => c.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [currentReport, activeCategory]);

  // Risk tier color helpers
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "HIGH":
        return {
          badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-900",
          bar: "bg-rose-500",
          text: "text-rose-600 dark:text-rose-400",
        };
      case "ELEVATED":
        return {
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900",
          bar: "bg-amber-500",
          text: "text-amber-600 dark:text-amber-400",
        };
      case "MODERATE":
        return {
          badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900",
          bar: "bg-yellow-500",
          text: "text-yellow-600 dark:text-yellow-400",
        };
      case "LOW":
        return {
          badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
          bar: "bg-emerald-500",
          text: "text-emerald-600 dark:text-emerald-400",
        };
      default:
        return {
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900",
          bar: "bg-blue-500",
          text: "text-blue-600 dark:text-blue-400",
        };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Longevity & Prognostic Forecast
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-soft text-primary-dark border border-primary/20">
              ICMR + FRAMINGHAM
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink mt-1">
            Future Disease Predictor
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl">
            Prognostic multi-condition trajectory modeling over 5-year and 10-year horizons.
            Simulate evidence-based interventions in real-time to reverse risk before onset.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowTuner(!showTuner)}
            className="lif-btn-secondary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <span>⚙️</span>
            <span>{showTuner ? "Hide Tuner" : "Tune Biometrics"}</span>
          </button>
          <button
            onClick={handleSaveAssessment}
            disabled={saving}
            className="lif-btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <span>{savedSuccess ? "✓ Saved" : saving ? "Saving..." : "💾 Save Record"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO COMPOSITE RISK OVERVIEW                                   */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Circular Risk Meter */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="relative flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl ring-4 ring-primary/20">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono">
                  {currentReport.overallFutureRiskIndex}
                </span>
                <span className="text-xs font-bold text-slate-400 block -mt-1">/ 100</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-light block mt-1">
                  Risk Index
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  getTierColor(currentReport.overallRiskTier).badge
                }`}
              >
                {currentReport.overallRiskTier} Vulnerability
              </span>
            </div>
            <span className="text-[11px] text-ink-muted mt-1.5 font-medium">
              Based on {inputs.age}y {inputs.gender.toLowerCase()} · BMI {currentReport.bmi}
            </span>
          </div>

          {/* Headline & Threat Summary */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Longitudinal Prognosis Analysis
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-0.5">
                {currentReport.summaryHeadline}
              </h2>
              <p className="text-xs sm:text-sm text-ink-soft mt-2 leading-relaxed">
                {currentReport.simulationInsights.primaryActionForMaxImpact}
              </p>
            </div>

            {/* Top 3 Future Vulnerabilities Summary Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {currentReport.topFutureThreats.map((threat) => {
                const tierStyle = getTierColor(threat.riskTier);
                return (
                  <div
                    key={threat.id}
                    className="p-3.5 rounded-2xl border border-line bg-surface-subtle/60 flex flex-col justify-between hover:border-line/80 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{threat.icon}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierStyle.badge}`}>
                          {threat.tenYearRiskPercent}% 10-Yr
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-ink mt-2 line-clamp-1">{threat.name}</h4>
                      <p className="text-[11px] text-ink-muted mt-0.5">{threat.estimatedOnsetHorizon}</p>
                    </div>

                    {threat.relativeRiskReductionPercent > 0 && (
                      <div className="mt-2 pt-2 border-t border-line text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span>↓</span> {threat.relativeRiskReductionPercent}% preventable
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: INTERACTIVE "WHAT-IF" SIMULATION LAB                           */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-50/40 via-surface to-surface p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎛️</span>
              <h3 className="text-lg font-extrabold tracking-tight text-ink">
                Interactive What-If Simulation Lab
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                REAL-TIME REVERSIBILITY
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Drag the sliders below to discover how targeted lifestyle adjustments proactively lower your 10-year disease probabilities.
            </p>
          </div>

          {hasActiveSimulation && (
            <button
              onClick={resetSimulation}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline self-start sm:self-auto"
            >
              Reset Simulation ↺
            </button>
          )}
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Weight Reduction Slider */}
          <div className="space-y-2 p-4 rounded-2xl bg-surface border border-line">
            <div className="flex items-center justify-between text-xs font-bold text-ink">
              <span className="flex items-center gap-1.5">
                <span>⚖️</span> Weight Reduction
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                -{weightLossKg} kg
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={weightLossKg}
              onChange={(e) => setWeightLossKg(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-surface-subtle rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-ink-muted font-medium">
              <span>0 kg</span>
              <span>7 kg (Recommended)</span>
              <span>15 kg</span>
            </div>
            <p className="text-[11px] text-ink-muted pt-1">
              Simulated weight: <strong className="text-ink">{Math.max(35, inputs.weightKg - weightLossKg)} kg</strong> (BMI: {currentReport.bmi})
            </p>
          </div>

          {/* Daily Step Volume Increase */}
          <div className="space-y-2 p-4 rounded-2xl bg-surface border border-line">
            <div className="flex items-center justify-between text-xs font-bold text-ink">
              <span className="flex items-center gap-1.5">
                <span>👟</span> Daily Step Increase
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                +{extraSteps.toLocaleString()} steps
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6000"
              step="500"
              value={extraSteps}
              onChange={(e) => setExtraSteps(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-surface-subtle rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-ink-muted font-medium">
              <span>0</span>
              <span>+3,000</span>
              <span>+6,000</span>
            </div>
            <p className="text-[11px] text-ink-muted pt-1">
              Simulated activity: <strong className="text-ink">{(inputs.dailySteps + extraSteps).toLocaleString()} steps/day</strong>
            </p>
          </div>

          {/* Systolic BP Reduction */}
          <div className="space-y-2 p-4 rounded-2xl bg-surface border border-line">
            <div className="flex items-center justify-between text-xs font-bold text-ink">
              <span className="flex items-center gap-1.5">
                <span>🫀</span> Systolic BP Drop
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                -{bpReductionMmHg} mmHg
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="2"
              value={bpReductionMmHg}
              onChange={(e) => setBpReductionMmHg(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-surface-subtle rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-ink-muted font-medium">
              <span>0 mmHg</span>
              <span>-12 mmHg</span>
              <span>-25 mmHg</span>
            </div>
            <p className="text-[11px] text-ink-muted pt-1">
              Simulated BP: <strong className="text-ink">{Math.max(90, inputs.systolicBp - bpReductionMmHg)}/{inputs.diastolicBp} mmHg</strong>
            </p>
          </div>
        </div>

        {/* Secondary Modifiers & Real-Time Impact Metric */}
        <div className="mt-5 pt-4 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
              <input
                type="checkbox"
                checked={quitSmoking}
                onChange={(e) => setQuitSmoking(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span>🚭 Complete Smoking Cessation</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
              <input
                type="checkbox"
                checked={optimizedDiet}
                onChange={(e) => setOptimizedDiet(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span>🥗 Whole-Foods Anti-Inflammatory Diet</span>
            </label>
          </div>

          {/* Real-time simulation impact summary */}
          {hasActiveSimulation ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
              <span>🎉 Simulated Impact:</span>
              <span className="font-mono font-extrabold text-sm">
                -{currentReport.simulationInsights.potentialRiskPointsReversible} Points
              </span>
              <span>({currentReport.simulationInsights.maxReversiblePercentage}% Reversible)</span>
            </div>
          ) : (
            <span className="text-xs text-ink-muted italic">
              Tip: Move the sliders above to see your customized risk reduction curve.
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: BIOMETRIC & CLINICAL PARAMETER TUNER (ACCORDION)              */}
      {/* ========================================================================= */}
      {showTuner && (
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 className="text-base font-bold text-ink">Tune Clinical Baseline Inputs</h3>
              <p className="text-xs text-ink-muted">
                Adjust your vitals, lab biomarkers, and family medical pedigree for maximum prognostic accuracy.
              </p>
            </div>
            <button
              onClick={() => setShowTuner(false)}
              className="text-xs font-bold text-ink-muted hover:text-ink"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Age */}
            <div>
              <label className="font-bold text-ink block mb-1">Age (Years)</label>
              <input
                type="number"
                value={inputs.age}
                onChange={(e) => setInputs({ ...inputs, age: Number(e.target.value) })}
                className="lif-input text-xs"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="font-bold text-ink block mb-1">Biological Sex</label>
              <select
                value={inputs.gender}
                onChange={(e) => setInputs({ ...inputs, gender: e.target.value as any })}
                className="lif-input text-xs"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="font-bold text-ink block mb-1">Height (cm)</label>
              <input
                type="number"
                value={inputs.heightCm}
                onChange={(e) => setInputs({ ...inputs, heightCm: Number(e.target.value) })}
                className="lif-input text-xs"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="font-bold text-ink block mb-1">Baseline Weight (kg)</label>
              <input
                type="number"
                value={inputs.weightKg}
                onChange={(e) => setInputs({ ...inputs, weightKg: Number(e.target.value) })}
                className="lif-input text-xs"
              />
            </div>

            {/* Waist */}
            <div>
              <label className="font-bold text-ink block mb-1">Waist Circumference (cm)</label>
              <input
                type="number"
                value={inputs.waistCircumferenceCm}
                onChange={(e) =>
                  setInputs({ ...inputs, waistCircumferenceCm: Number(e.target.value) })
                }
                className="lif-input text-xs"
              />
            </div>

            {/* Systolic BP */}
            <div>
              <label className="font-bold text-ink block mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={inputs.systolicBp}
                onChange={(e) => setInputs({ ...inputs, systolicBp: Number(e.target.value) })}
                className="lif-input text-xs"
              />
            </div>

            {/* Fasting Glucose */}
            <div>
              <label className="font-bold text-ink block mb-1">Fasting Glucose (mg/dL)</label>
              <input
                type="number"
                value={inputs.fastingGlucoseMgDl || ""}
                placeholder="e.g. 98"
                onChange={(e) =>
                  setInputs({ ...inputs, fastingGlucoseMgDl: Number(e.target.value) || undefined })
                }
                className="lif-input text-xs"
              />
            </div>

            {/* Total Cholesterol */}
            <div>
              <label className="font-bold text-ink block mb-1">Total Cholesterol (mg/dL)</label>
              <input
                type="number"
                value={inputs.totalCholesterolMgDl || ""}
                placeholder="e.g. 195"
                onChange={(e) =>
                  setInputs({ ...inputs, totalCholesterolMgDl: Number(e.target.value) || undefined })
                }
                className="lif-input text-xs"
              />
            </div>

            {/* Family Diabetes */}
            <div>
              <label className="font-bold text-ink block mb-1">Family Diabetes History</label>
              <select
                value={inputs.familyDiabetes}
                onChange={(e) => setInputs({ ...inputs, familyDiabetes: e.target.value as any })}
                className="lif-input text-xs"
              >
                <option value="NONE">None</option>
                <option value="ONE_PARENT">One Parent</option>
                <option value="BOTH_PARENTS">Both Parents</option>
              </select>
            </div>

            {/* Family CAD */}
            <div>
              <label className="font-bold text-ink block mb-1">Early Family CAD/Heart Attack</label>
              <select
                value={inputs.familyPrematureCad ? "YES" : "NO"}
                onChange={(e) => setInputs({ ...inputs, familyPrematureCad: e.target.value === "YES" })}
                className="lif-input text-xs"
              >
                <option value="NO">No</option>
                <option value="YES">Yes (&lt;55 father / &lt;65 mother)</option>
              </select>
            </div>

            {/* Daily Steps */}
            <div>
              <label className="font-bold text-ink block mb-1">Baseline Steps / Day</label>
              <input
                type="number"
                value={inputs.dailySteps}
                onChange={(e) => setInputs({ ...inputs, dailySteps: Number(e.target.value) })}
                className="lif-input text-xs"
              />
            </div>

            {/* Smoking */}
            <div>
              <label className="font-bold text-ink block mb-1">Smoking Status</label>
              <select
                value={inputs.smokingStatus}
                onChange={(e) => setInputs({ ...inputs, smokingStatus: e.target.value as any })}
                className="lif-input text-xs"
              >
                <option value="NEVER">Never Smoked</option>
                <option value="FORMER">Former Smoker</option>
                <option value="CURRENT">Current Smoker</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: CONDITION PREDICTIONS GRID                                     */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-ink">
              Multi-System Prognostic Forecasts ({filteredConditions.length})
            </h3>
            <p className="text-xs text-ink-muted">
              5-Year and 10-Year cumulative onset probabilities with personalized root causes and protocols.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-ink text-surface dark:bg-white dark:text-black shadow-xs"
                    : "bg-surface border border-line text-ink-muted hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredConditions.map((cond) => {
            const isExpanded = !!expandedCards[cond.id];
            const tierStyle = getTierColor(cond.riskTier);
            const isReduced = cond.simulatedTenYearRiskPercent < cond.tenYearRiskPercent;

            return (
              <div
                key={cond.id}
                className="rounded-3xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Accent Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: cond.accentColor }}
                />

                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-subtle text-2xl shadow-xs border border-line">
                        {cond.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                            {cond.category}
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold tracking-tight text-ink">
                          {cond.name}
                        </h4>
                        <span className="text-[11px] text-ink-muted font-medium block">
                          {cond.medicalName}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${tierStyle.badge}`}
                    >
                      {cond.riskTier}
                    </span>
                  </div>

                  {/* Headline */}
                  <p className="text-xs text-ink-soft bg-surface-subtle/50 p-2.5 rounded-xl border border-line/60">
                    {cond.headline}
                  </p>

                  {/* Dual 5-Yr & 10-Yr Probability Bars */}
                  <div className="space-y-3 pt-1">
                    {/* 5-Year Risk */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-ink-soft">5-Year Horizon</span>
                        <span className="font-mono font-bold text-ink">
                          {cond.fiveYearRiskPercent}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-400 dark:bg-slate-600 transition-all duration-500"
                          style={{ width: `${Math.min(100, cond.fiveYearRiskPercent * 2)}%` }}
                        />
                      </div>
                    </div>

                    {/* 10-Year Risk & Simulation Reduction */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-ink-soft">10-Year Horizon</span>
                        <div className="flex items-center gap-2">
                          {isReduced && (
                            <span className="font-mono text-xs line-through text-ink-muted">
                              {cond.tenYearRiskPercent}%
                            </span>
                          )}
                          <span
                            className={`font-mono font-extrabold text-sm ${
                              isReduced
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-ink"
                            }`}
                          >
                            {cond.simulatedTenYearRiskPercent}%
                          </span>
                          {isReduced && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              ↓ {cond.relativeRiskReductionPercent}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="h-2.5 w-full rounded-full bg-surface-subtle overflow-hidden flex">
                        {/* Simulated/current bar */}
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isReduced ? "bg-emerald-500" : tierStyle.bar
                          }`}
                          style={{
                            width: `${Math.min(100, cond.simulatedTenYearRiskPercent * 1.5)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details: Root Causes, Protocols & Lab Schedules */}
                  {isExpanded && (
                    <div className="space-y-4 pt-3 border-t border-line animate-fadeIn">
                      {/* Root Causes */}
                      {cond.rootCauses.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted mb-2">
                            Identified Etiological Drivers
                          </h5>
                          <div className="space-y-1.5">
                            {cond.rootCauses.map((rc, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-xl bg-surface-subtle text-xs flex flex-col gap-0.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-ink">{rc.factor}</span>
                                  <span
                                    className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                      rc.impact === "HIGH"
                                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                    }`}
                                  >
                                    {rc.impact} Impact
                                  </span>
                                </div>
                                <span className="text-[11px] text-ink-soft">{rc.explanation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence-Based Prevention Protocol */}
                      <div>
                        <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted mb-2">
                          Evidence-Based Prevention Protocol
                        </h5>
                        <div className="space-y-1.5">
                          {cond.preventionProtocol.map((proto, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl border border-line bg-surface flex items-start gap-2 text-xs"
                            >
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                ✓
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <strong className="text-ink">{proto.action}</strong>
                                  <span className="text-[9px] font-bold uppercase text-ink-muted px-1.5 py-0.5 rounded bg-surface-subtle">
                                    {proto.category}
                                  </span>
                                </div>
                                <span className="text-[11px] text-ink-soft block mt-0.5">
                                  {proto.expectedBenefit}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Diagnostic Schedule */}
                      <div>
                        <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted mb-2">
                          Recommended Clinical Diagnostics
                        </h5>
                        <div className="space-y-1.5">
                          {cond.recommendedDiagnostics.map((diag, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/50 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-ink">{diag.testName}</span>
                                <span className="font-semibold text-primary text-[10px]">
                                  ⏰ {diag.targetInterval}
                                </span>
                              </div>
                              <span className="text-[11px] text-ink-muted block mt-0.5">
                                {diag.clinicalPurpose}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Toggle Button */}
                <div className="mt-5 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                  <span className="text-ink-muted text-[11px]">
                    {cond.estimatedOnsetHorizon}
                  </span>
                  <button
                    onClick={() => toggleCard(cond.id)}
                    className="font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>{isExpanded ? "Show Less" : "Details & Protocol"}</span>
                    <span>{isExpanded ? "▲" : "▼"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: CLINICAL EVIDENCE & NEXT STEPS ACTIONS                         */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-line bg-surface-subtle/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-ink">
            Need Clinical Review with your Primary Care Physician?
          </h4>
          <p className="text-xs text-ink-muted max-w-xl">
            Download your unified 10-year prognostic report to present at your next annual health checkup, or review with our connected remote patient monitoring team.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/doctor/rpm"
            className="lif-btn-secondary py-2 px-4 text-xs font-semibold whitespace-nowrap"
          >
            👨‍⚕️ Doctor RPM
          </Link>
          <Link
            href="/app/doctor-summary"
            className="lif-btn-primary py-2 px-4 text-xs font-bold whitespace-nowrap shadow-xs"
          >
            📄 Export Prognosis PDF
          </Link>
        </div>
      </div>
    </div>
  );
}
