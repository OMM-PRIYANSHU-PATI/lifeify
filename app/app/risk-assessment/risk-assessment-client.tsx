"use client";

import { useState, useEffect } from "react";

export const WAIST_SIZE_CHART = [
  { size: "32", rangeCm: "65-68", min: 65, max: 68, defaultCm: 67 },
  { size: "34", rangeCm: "69-72", min: 69, max: 72, defaultCm: 71 },
  { size: "36", rangeCm: "73-76", min: 73, max: 76, defaultCm: 75 },
  { size: "38", rangeCm: "77-80", min: 77, max: 80, defaultCm: 79 },
  { size: "40", rangeCm: "81-84", min: 81, max: 84, defaultCm: 83 },
  { size: "42", rangeCm: "85-89", min: 85, max: 89, defaultCm: 87 },
  { size: "44", rangeCm: "90-94", min: 90, max: 94, defaultCm: 92 },
  { size: "46", rangeCm: "95-101", min: 95, max: 101, defaultCm: 98 },
];

export function RiskAssessmentClient() {
  const [activeTab, setActiveTab] = useState<"IDRS" | "FRAMINGHAM">("IDRS");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // IDRS Form
  const [idrsAge, setIdrsAge] = useState<number>(42);
  const [idrsGender, setIdrsGender] = useState<"MALE" | "FEMALE">("MALE");
  const [idrsWaist, setIdrsWaist] = useState<number>(88);
  const [showWaistChart, setShowWaistChart] = useState<boolean>(false);
  const [idrsActivity, setIdrsActivity] = useState<"VIGOROUS" | "MODERATE" | "MILD_SEDENTARY" | "NO_EXERCISE">("MODERATE");
  const [idrsFamily, setIdrsFamily] = useState<"NONE" | "ONE_PARENT" | "BOTH_PARENTS">("ONE_PARENT");
  const [idrsResult, setIdrsResult] = useState<any | null>(null);

  // Framingham Form
  const [fAge, setFAge] = useState<number>(50);
  const [fGender, setFGender] = useState<"MALE" | "FEMALE">("MALE");
  const [fTc, setFTc] = useState<number>(210);
  const [fHdl, setFHdl] = useState<number>(45);
  const [fSbp, setFSbp] = useState<number>(135);
  const [fBpTreated, setFBpTreated] = useState<boolean>(true);
  const [fSmoker, setFSmoker] = useState<boolean>(false);
  const [fDiabetes, setFDiabetes] = useState<boolean>(false);
  const [framinghamResult, setFraminghamResult] = useState<any | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/risk-scores");
      const data = await res.json();
      if (data.ok) {
        setHistory(data.assessments || []);
      }
    } catch (err) {
      console.error("Failed to fetch risk history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCalculateIdrs = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/risk-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "IDRS",
          inputs: {
            age: idrsAge,
            gender: idrsGender,
            waistCircumferenceCm: idrsWaist,
            physicalActivity: idrsActivity,
            familyHistory: idrsFamily,
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setIdrsResult(data.result);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateFramingham = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/risk-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FRAMINGHAM_CVD",
          inputs: {
            age: fAge,
            gender: fGender,
            totalCholesterolMgDl: fTc,
            hdlCholesterolMgDl: fHdl,
            systolicBp: fSbp,
            isBpTreated: fBpTreated,
            isSmoker: fSmoker,
            hasDiabetes: fDiabetes,
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setFraminghamResult(data.result);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
            <span>🎯</span> Validated Disease-Risk Intelligence
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Standardized epidemiological calculators: Indian Diabetes Risk Score (IDRS) &amp; Framingham CVD.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("IDRS")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "IDRS"
                ? "bg-primary text-white shadow"
                : "bg-surface text-ink border border-line hover:bg-background"
            }`}
          >
            🇮🇳 Indian Diabetes (IDRS)
          </button>
          <button
            onClick={() => setActiveTab("FRAMINGHAM")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "FRAMINGHAM"
                ? "bg-primary text-white shadow"
                : "bg-surface text-ink border border-line hover:bg-background"
            }`}
          >
            ❤️ Framingham 10-Yr CVD
          </button>
        </div>
      </div>

      {activeTab === "IDRS" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* IDRS Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleCalculateIdrs}
              className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-4"
            >
              <div className="border-b border-line pb-3">
                <h2 className="text-base font-bold text-ink">Indian Diabetes Risk Score (IDRS)</h2>
                <p className="text-xs text-ink-muted">
                  Validated by Madras Diabetes Research Foundation (MDRF) &amp; ICMR for South Asians.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={idrsAge}
                    onChange={(e) => setIdrsAge(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-ink-muted mt-1 block">
                    &lt;35 (0 pts), 35-49 (20 pts), ≥50 (30 pts)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                    Biological Sex
                  </label>
                  <select
                    value={idrsGender}
                    onChange={(e) => setIdrsGender(e.target.value as any)}
                    className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              {/* Abdominal Circumference with Pant Size Chart */}
              {(() => {
                const matchedSize = WAIST_SIZE_CHART.find(
                  (item) => idrsWaist >= item.min && idrsWaist <= item.max
                );
                const isFemale = idrsGender === "FEMALE";
                const waistCutoffNormal = isFemale ? 80 : 85;
                const waistPoints = isFemale
                  ? idrsWaist < 80 ? 0 : idrsWaist <= 89 ? 10 : 20
                  : idrsWaist < 85 ? 0 : idrsWaist <= 89 ? 10 : 20;

                const waistBadgeColor =
                  waistPoints === 0
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                    : waistPoints === 10
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800";

                return (
                  <div className="space-y-3 rounded-2xl border border-line bg-background/60 p-4">
                    {/* Header with live telemetry and size equivalency */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                          Abdominal Circumference (Waist)
                        </label>
                        <span className="text-[11px] text-ink-muted">
                          ICMR / MDRF clinical diabetes risk predictor
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-surface border border-line text-ink">
                          {idrsWaist} cm <span className="text-[10px] text-ink-muted font-normal">({(idrsWaist / 2.54).toFixed(0)} in)</span>
                        </span>
                        {matchedSize ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-soft text-primary-dark border border-primary/20">
                            Size {matchedSize.size}
                          </span>
                        ) : idrsWaist < 65 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-line text-ink-muted">
                            &lt; Size 32
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-line text-ink-muted">
                            &gt; Size 46
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${waistBadgeColor}`}>
                          {waistPoints} pts ({waistPoints === 0 ? "Normal" : waistPoints === 10 ? "Moderate" : "High"})
                        </span>
                      </div>
                    </div>

                    {/* Quick Trouser Size Selector Buttons */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-ink flex items-center gap-1">
                          <span>👖</span> Select by Trouser / Pant Size:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowWaistChart(!showWaistChart)}
                          className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
                        >
                          {showWaistChart ? "Hide Size Table ▲" : "View Sizing Chart (32–46) ▼"}
                        </button>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                        {WAIST_SIZE_CHART.map((item) => {
                          const isSelected = matchedSize?.size === item.size;
                          return (
                            <button
                              key={item.size}
                              type="button"
                              onClick={() => setIdrsWaist(item.defaultCm)}
                              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border text-center transition-all ${
                                isSelected
                                  ? "border-primary bg-primary text-white shadow-xs font-black ring-2 ring-primary/20 scale-[1.02]"
                                  : "border-line bg-surface hover:bg-surface-subtle text-ink"
                              }`}
                            >
                              <span className="text-xs font-black font-mono">{item.size}</span>
                              <span className={`text-[9px] font-mono leading-none mt-0.5 ${isSelected ? "text-white/80" : "text-ink-muted"}`}>
                                {item.rangeCm}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Slider and Direct CM Input */}
                    <div className="pt-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="60"
                          max="140"
                          value={idrsWaist}
                          onChange={(e) => setIdrsWaist(Number(e.target.value))}
                          className="flex-1 accent-primary cursor-pointer h-2 bg-line rounded-lg"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min="50"
                            max="160"
                            value={idrsWaist}
                            onChange={(e) => setIdrsWaist(Number(e.target.value))}
                            className="w-16 rounded-xl border border-line bg-surface px-2 py-1 text-center font-mono font-black text-xs text-ink focus:border-primary focus:outline-none"
                          />
                          <span className="text-xs font-bold text-ink-muted">cm</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px] text-ink-muted mt-1.5 font-medium px-0.5">
                        <span className={idrsWaist < waistCutoffNormal ? "text-primary font-bold" : ""}>
                          Normal (&lt;{waistCutoffNormal}cm • 0 pts)
                        </span>
                        <span className={idrsWaist >= waistCutoffNormal && idrsWaist <= 89 ? "text-accent font-bold" : ""}>
                          Moderate ({waistCutoffNormal}-89cm • 10 pts)
                        </span>
                        <span className={idrsWaist >= 90 ? "text-crisis font-bold" : ""}>
                          High (≥90cm • 20 pts)
                        </span>
                      </div>
                    </div>

                    {/* Expandable Sizing Reference Table (Exact data from user image) */}
                    {showWaistChart && (
                      <div className="mt-2 rounded-2xl border border-line bg-surface p-3.5 space-y-2 animate-fadeIn shadow-xs">
                        <div className="flex items-center justify-between border-b border-line pb-2">
                          <div>
                            <span className="text-xs font-bold text-ink block">
                              Indian Trouser / Pant Size Conversion Chart
                            </span>
                            <span className="text-[10px] text-ink-muted">
                              Based on standard Indian garment waist circumference in centimeters
                            </span>
                          </div>
                          <span className="text-[10px] text-primary font-bold bg-primary-soft px-2 py-0.5 rounded-full">
                            Tap any row to select
                          </span>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-line">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-surface-subtle border-b border-line text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                                <th className="px-3 py-2">Size</th>
                                <th className="px-3 py-2">Waist (cm)</th>
                                <th className="px-3 py-2">IDRS Clinical Risk Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line font-mono">
                              {WAIST_SIZE_CHART.map((row) => {
                                const isSelected = matchedSize?.size === row.size;
                                const rowRisk = isFemale
                                  ? row.min < 80
                                    ? { label: "Normal (0 pts)", cls: "text-primary" }
                                    : row.max <= 89
                                    ? { label: "Moderate (10 pts)", cls: "text-accent" }
                                    : { label: "High Risk (20 pts)", cls: "text-crisis" }
                                  : row.min < 85
                                  ? { label: "Normal (0 pts)", cls: "text-primary" }
                                  : row.max <= 89
                                  ? { label: "Moderate (10 pts)", cls: "text-accent" }
                                  : { label: "High Risk (20 pts)", cls: "text-crisis" };

                                return (
                                  <tr
                                    key={row.size}
                                    onClick={() => setIdrsWaist(row.defaultCm)}
                                    className={`cursor-pointer transition-colors ${
                                      isSelected
                                        ? "bg-primary-soft font-bold text-primary-dark"
                                        : "hover:bg-surface-subtle text-ink"
                                    }`}
                                  >
                                    <td className="px-3 py-2 font-black text-xs">
                                      <span className="inline-flex items-center gap-1.5">
                                        {isSelected && <span className="text-primary text-xs">✓</span>}
                                        {row.size}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 font-semibold">
                                      {row.rangeCm} cm
                                    </td>
                                    <td className={`px-3 py-2 text-[11px] font-bold font-sans ${rowRisk.cls}`}>
                                      {rowRisk.label}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                  Physical Activity Level
                </label>
                <select
                  value={idrsActivity}
                  onChange={(e) => setIdrsActivity(e.target.value as any)}
                  className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                >
                  <option value="VIGOROUS">Vigorous Exercise or Strenuous Work (0 pts)</option>
                  <option value="MODERATE">Moderate Exercise / Regular Brisk Walk (10 pts)</option>
                  <option value="MILD_SEDENTARY">Mild Exercise / Sedentary Desk Job (20 pts)</option>
                  <option value="NO_EXERCISE">No Regular Exercise / Completely Sedentary (30 pts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                  Family History of Diabetes
                </label>
                <select
                  value={idrsFamily}
                  onChange={(e) => setIdrsFamily(e.target.value as any)}
                  className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                >
                  <option value="NONE">Neither Parent Diabetic (0 pts)</option>
                  <option value="ONE_PARENT">One Parent Diabetic (10 pts)</option>
                  <option value="BOTH_PARENTS">Both Parents Diabetic (20 pts)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {loading ? "Calculating IDRS..." : "Calculate Indian Diabetes Risk Score"}
              </button>
            </form>
          </div>

          {/* IDRS Output */}
          <div className="lg:col-span-5">
            {idrsResult ? (
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-bold text-ink-muted uppercase">IDRS Total Score</span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                      idrsResult.riskCategory === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : idrsResult.riskCategory === "MODERATE"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {idrsResult.riskCategory} RISK
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-ink">{idrsResult.score}</span>
                  <span className="text-sm font-semibold text-ink-muted">/ 100</span>
                </div>

                <p className="text-xs font-semibold text-ink">
                  {idrsResult.estimatedPrevalenceRiskPercent}
                </p>

                {/* Score Breakdown */}
                <div className="space-y-1.5 rounded-xl bg-background p-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Age points:</span>
                    <span className="font-bold text-ink">{idrsResult.componentBreakdown.agePoints} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Waist circumference:</span>
                    <span className="font-bold text-ink">{idrsResult.componentBreakdown.waistPoints} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Physical activity:</span>
                    <span className="font-bold text-ink">{idrsResult.componentBreakdown.activityPoints} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Family history:</span>
                    <span className="font-bold text-ink">{idrsResult.componentBreakdown.familyHistoryPoints} pts</span>
                  </div>
                </div>

                {/* Clinical Recommendations */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink block mb-1.5">
                    Preventive Targets:
                  </span>
                  <ul className="space-y-1 text-xs text-ink-muted">
                    {idrsResult.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-line p-8 text-center text-ink-muted">
                <span className="text-3xl mb-2 block">📋</span>
                <p className="text-xs">Adjust your parameters and tap Calculate to see IDRS risk score.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Framingham CVD Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <form
              onSubmit={handleCalculateFramingham}
              className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-4"
            >
              <div className="border-b border-line pb-3">
                <h2 className="text-base font-bold text-ink">Framingham 10-Year CVD Risk Calculator</h2>
                <p className="text-xs text-ink-muted">
                  Estimates 10-year probability of myocardial infarction, stroke, or fatal cardiovascular event.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={fAge}
                    onChange={(e) => setFAge(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                    Biological Sex
                  </label>
                  <select
                    value={fGender}
                    onChange={(e) => setFGender(e.target.value as any)}
                    className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                    Total Cholesterol (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={fTc}
                    onChange={(e) => setFTc(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                    HDL Cholesterol (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={fHdl}
                    onChange={(e) => setFHdl(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                    Systolic Blood Pressure (mmHg)
                  </label>
                  <input
                    type="number"
                    value={fSbp}
                    onChange={(e) => setFSbp(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fBpTreated}
                      onChange={(e) => setFBpTreated(e.target.checked)}
                      className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                    />
                    <span className="font-semibold">Taking BP Medication</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fSmoker}
                    onChange={(e) => setFSmoker(e.target.checked)}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  />
                  <span className="font-semibold">Current Cigarette Smoker</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fDiabetes}
                    onChange={(e) => setFDiabetes(e.target.checked)}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  />
                  <span className="font-semibold">Diagnosed Diabetes</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {loading ? "Calculating Framingham CVD..." : "Calculate 10-Year CVD Risk"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5">
            {framinghamResult ? (
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-bold text-ink-muted uppercase">10-Year CVD Probability</span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                      framinghamResult.riskCategory === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : framinghamResult.riskCategory === "INTERMEDIATE"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {framinghamResult.riskCategory} RISK
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-ink">
                    {framinghamResult.tenYearRiskPercent}%
                  </span>
                  <span className="text-xs font-bold text-ink-muted">10-year risk</span>
                </div>

                <div className="rounded-xl bg-background p-3 text-xs flex justify-between items-center">
                  <span className="text-ink-muted">Estimated Vascular / Heart Age:</span>
                  <span className="font-extrabold text-ink text-sm">
                    {framinghamResult.heartAgeYears} Years
                  </span>
                </div>

                {framinghamResult.modifiableRiskFactors.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
                      Modifiable Risk Targets:
                    </span>
                    <ul className="text-xs text-red-600 space-y-0.5">
                      {framinghamResult.modifiableRiskFactors.map((f: string, i: number) => (
                        <li key={i}>⚠ {f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink block mb-1.5">
                    Clinical Guidance:
                  </span>
                  <ul className="space-y-1 text-xs text-ink-muted">
                    {framinghamResult.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-line p-8 text-center text-ink-muted">
                <span className="text-3xl mb-2 block">❤️</span>
                <p className="text-xs">Fill in your cardiovascular biomarkers to project 10-year CVD risk.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Assessments */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
            Past Clinical Assessments Log
          </h3>
          <div className="divide-y divide-line">
            {history.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-ink mr-2">
                    {h.type === "IDRS" ? "Indian Diabetes (IDRS)" : "Framingham 10-Yr CVD"}
                  </span>
                  <span className="text-ink-muted">
                    {new Date(h.assessedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-ink">
                    {h.type === "IDRS" ? `Score: ${h.score}` : `${h.riskPercent}% Risk`}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      h.category === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : h.category === "MODERATE" || h.category === "INTERMEDIATE"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {h.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
