"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SymptomToDiseaseAnalysisResult,
  DifferentialCandidate,
} from "@/lib/medical/gemini-symptom-analyzer";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";

interface Props {
  initialResult?: SymptomToDiseaseAnalysisResult | null;
  availableSymptoms?: Array<{ id: string; name: string; organSystem: string }>;
}

const COMMON_PRESETS = [
  {
    name: "Respiratory / Flu-like",
    emoji: "🫁",
    symptoms: ["Fever", "Cough", "Fatigue", "Sore Throat"],
    severity: 6,
    duration: 3,
  },
  {
    name: "Chest Pain / Cardiac Alert",
    emoji: "❤️",
    symptoms: ["Chest Pain", "Shortness of Breath", "Sweating"],
    severity: 8,
    duration: 1,
  },
  {
    name: "Acute Gastrointestinal",
    emoji: "🤢",
    symptoms: ["Abdominal Pain", "Nausea", "Vomiting", "Diarrhea"],
    severity: 6,
    duration: 2,
  },
  {
    name: "Severe Neurological / Migraine",
    emoji: "🧠",
    symptoms: ["Headache", "Nausea", "Dizziness", "Fatigue"],
    severity: 7,
    duration: 2,
  },
  {
    name: "Dysglycemia & Metabolic",
    emoji: "🩸",
    symptoms: ["Polyuria", "Polydipsia", "Weight Loss", "Fatigue"],
    severity: 4,
    duration: 14,
  },
];

export function SymptomToDiseaseClient({ initialResult, availableSymptoms = [] }: Props) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    "Fever",
    "Cough",
    "Fatigue",
  ]);
  const [freeText, setFreeText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [severity, setSeverity] = useState<number>(6);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");

  // Vitals
  const [showVitals, setShowVitals] = useState(false);
  const [tempF, setTempF] = useState<string>("");
  const [heartRate, setHeartRate] = useState<string>("");
  const [systolicBp, setSystolicBp] = useState<string>("");
  const [diastolicBp, setDiastolicBp] = useState<string>("");
  const [spO2, setSpO2] = useState<string>("");

  // Analysis state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomToDiseaseAnalysisResult | null>(initialResult || null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});

  // Filter available symptoms
  const searchResults = searchQuery.trim()
    ? availableSymptoms
        .filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !selectedSymptoms.includes(s.name)
        )
        .slice(0, 8)
    : [];

  const handleAddSymptom = (symptomName: string) => {
    if (!selectedSymptoms.includes(symptomName)) {
      setSelectedSymptoms([...selectedSymptoms, symptomName]);
    }
    setSearchQuery("");
  };

  const handleRemoveSymptom = (symptomName: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptomName));
  };

  const handleLoadPreset = (preset: typeof COMMON_PRESETS[0]) => {
    setSelectedSymptoms(preset.symptoms);
    setSeverity(preset.severity);
    setDurationDays(preset.duration);
    setAnsweredQuestions({});
  };

  const handleAnalyze = async (answersOverride?: Record<string, boolean>) => {
    if (selectedSymptoms.length === 0 && !freeText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/symptoms/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          freeText: freeText.trim() || undefined,
          age,
          gender,
          severity,
          durationDays,
          vitals: {
            tempF: tempF ? Number(tempF) : undefined,
            heartRate: heartRate ? Number(heartRate) : undefined,
            systolicBp: systolicBp ? Number(systolicBp) : undefined,
            diastolicBp: diastolicBp ? Number(diastolicBp) : undefined,
            spO2: spO2 ? Number(spO2) : undefined,
          },
          answeredQuestions: answersOverride || answeredQuestions,
        }),
      });

      const data = await res.json();
      if (data.ok && data.data) {
        setResult(data.data);
      }
    } catch (e) {
      console.error("Diagnostic analysis error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestion = (qId: string, answer: boolean) => {
    const updated = { ...answeredQuestions, [qId]: answer };
    setAnsweredQuestions(updated);
    // Re-run analysis with the new answer
    handleAnalyze(updated);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "EMERGENCY":
        return {
          banner: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
          pill: "bg-rose-600 text-white",
          label: "CRITICAL EMERGENCY",
          icon: ShieldAlert,
        };
      case "URGENT_CARE":
        return {
          banner: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
          pill: "bg-amber-500 text-white",
          label: "URGENT MEDICAL CARE (Today)",
          icon: AlertTriangle,
        };
      case "PRIMARY_CARE":
        return {
          banner: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
          pill: "bg-blue-600 text-white",
          label: "PRIMARY CARE (24–72h)",
          icon: Stethoscope,
        };
      default:
        return {
          banner: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
          pill: "bg-emerald-600 text-white",
          label: "SELF CARE & MONITORING",
          icon: CheckCircle2,
        };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Clinical Diagnostic Reasoning
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-soft text-primary-dark border border-primary/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>Google Gemini Flash + 8,724 Diseases</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink mt-1">
            Symptom to Disease Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl">
            Input presenting symptoms to compute ranked differential diagnoses, detect red-flag clinical urgency, and receive interactive doctor follow-up questions powered by Google Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <button
              onClick={() => window.print()}
              className="lif-btn-secondary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4 text-ink-muted" />
              <span>Print Brief</span>
            </button>
          )}
          <Link
            href="/app/emergency-card"
            className="lif-btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-xs bg-rose-600 hover:bg-rose-700 border-rose-700 text-white"
          >
            <span>🚨 Medical ID SOS</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INPUT CONTROLS CARD                                                       */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-sm space-y-6">
        {/* Quick-Launch Preset Clusters */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
            Quick-Launch Clinical Presentation Presets
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {COMMON_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleLoadPreset(preset)}
                className="px-3 py-1.5 rounded-xl border border-line bg-surface-subtle/70 hover:bg-surface hover:border-primary/50 text-xs font-semibold text-ink flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <span>{preset.emoji}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Symptom Token Chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-ink">
              Selected Symptoms ({selectedSymptoms.length})
            </label>
            {selectedSymptoms.length > 0 && (
              <button
                onClick={() => setSelectedSymptoms([])}
                className="text-[11px] font-semibold text-rose-500 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 p-3 min-h-[48px] rounded-2xl bg-surface-subtle border border-line">
            {selectedSymptoms.length === 0 ? (
              <span className="text-xs text-ink-muted italic">
                No symptoms selected. Use the search bar below or click a quick-launch preset.
              </span>
            ) : (
              selectedSymptoms.map((sym) => (
                <span
                  key={sym}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-xs"
                >
                  <span>{sym}</span>
                  <button
                    onClick={() => handleRemoveSymptom(sym)}
                    className="rounded-full hover:bg-black/20 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Symptom Search Bar */}
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search & add symptoms (e.g. Chest Tightness, Dyspnea, Chills, Vertigo)..."
              className="lif-input pl-10 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl bg-surface border border-line shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-line">
              {searchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleAddSymptom(s.name)}
                  className="w-full text-left p-2.5 hover:bg-surface-subtle text-xs flex items-center justify-between group transition-colors"
                >
                  <span className="font-semibold text-ink group-hover:text-primary">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-ink-muted px-2 py-0.5 rounded bg-surface-subtle">
                    {s.organSystem}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Natural Language Free Text Description */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
            Natural Language Description (Optional)
          </label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={2}
            placeholder="Describe your situation in your own words (e.g. 'I woke up with severe pounding headache behind the left eye and nausea')..."
            className="lif-input text-xs resize-none"
          />
        </div>

        {/* Sliders Grid: Severity, Duration, Demographics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Severity 1-10 */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-line space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-ink">
              <span>Severity Scale</span>
              <span className={`font-mono text-sm font-black ${severity >= 7 ? "text-rose-500" : severity >= 4 ? "text-amber-500" : "text-emerald-500"}`}>
                {severity}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-1.5 bg-line rounded-lg"
            />
            <span className="text-[10px] text-ink-muted block">
              {severity >= 8 ? "Severe / Disabling" : severity >= 5 ? "Moderate" : "Mild"}
            </span>
          </div>

          {/* Duration Days */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-line space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-ink">
              <span>Duration</span>
              <span className="font-mono text-sm font-black text-ink">
                {durationDays} Day{durationDays === 1 ? "" : "s"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-1.5 bg-line rounded-lg"
            />
            <span className="text-[10px] text-ink-muted block">
              {durationDays > 14 ? "Chronic / Persistent" : durationDays > 3 ? "Subacute" : "Acute"}
            </span>
          </div>

          {/* Age */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-line space-y-1.5">
            <label className="text-xs font-bold text-ink block">Patient Age</label>
            <input
              type="number"
              min="1"
              max="110"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="lif-input text-xs py-1"
            />
          </div>

          {/* Gender */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-line space-y-1.5">
            <label className="text-xs font-bold text-ink block">Biological Sex</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="lif-input text-xs py-1"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>

        {/* Optional Vitals Drawer */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setShowVitals(!showVitals)}
            className="text-xs font-bold text-ink-muted hover:text-ink flex items-center gap-1.5"
          >
            <span>{showVitals ? "▲ Hide Vitals" : "▼ Optional Clinical Vitals (Temp, BP, Pulse, SpO2)"}</span>
          </button>

          {showVitals && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-surface-subtle border border-line animate-fadeIn">
              <div>
                <label className="text-[10px] font-bold uppercase text-ink-muted block mb-1">
                  Temp (°F)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 101.4"
                  value={tempF}
                  onChange={(e) => setTempF(e.target.value)}
                  className="lif-input text-xs py-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-ink-muted block mb-1">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 88"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="lif-input text-xs py-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-ink-muted block mb-1">
                  Systolic BP
                </label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(e.target.value)}
                  className="lif-input text-xs py-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-ink-muted block mb-1">
                  Diastolic BP
                </label>
                <input
                  type="number"
                  placeholder="e.g. 80"
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(e.target.value)}
                  className="lif-input text-xs py-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-ink-muted block mb-1">
                  SpO2 (%)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 98"
                  value={spO2}
                  onChange={(e) => setSpO2(e.target.value)}
                  className="lif-input text-xs py-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI Reasoning + Evidence Graph will evaluate differential probabilities</span>
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={loading || (selectedSymptoms.length === 0 && !freeText.trim())}
            className="lif-btn-primary py-3 px-6 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Consulting Gemini Diagnostic Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Run Symptom-to-Disease Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RESULTS DISPLAY                                                           */}
      {/* ========================================================================= */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* 1. Triage Urgency Hero Banner */}
          {(() => {
            const urgency = getUrgencyBadge(result.overallTriageUrgency);
            const Icon = urgency.icon;

            return (
              <div className={`p-6 rounded-3xl border ${urgency.banner} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm`}>
                <div className="flex items-start gap-3.5">
                  <span className={`p-3 rounded-2xl ${urgency.pill} text-white shadow-xs shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </span>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${urgency.pill}`}>
                      {urgency.label}
                    </span>
                    <h2 className="text-xl font-black tracking-tight text-ink mt-1.5">
                      {result.triageHeadline}
                    </h2>
                    <p className="text-xs text-ink-soft mt-1">
                      Evaluated across {result.symptomsAnalyzed.length} symptoms · Model: {result.aiModelUsed}
                    </p>
                  </div>
                </div>

                {result.overallTriageUrgency === "EMERGENCY" && (
                  <Link
                    href="/app/emergency-card"
                    className="lif-btn-primary py-2.5 px-5 text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white shadow-md whitespace-nowrap self-stretch sm:self-auto text-center"
                  >
                    🚨 Activate Emergency SOS
                  </Link>
                )}
              </div>
            );
          })()}

          {/* 2. Red Flag Warnings (If present) */}
          {result.redFlagWarnings.length > 0 && (
            <div className="p-5 rounded-3xl border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>CRITICAL RED-FLAG WARNINGS (Seek Immediate Emergency Care if Experienced):</span>
              </div>
              <ul className="space-y-1 pl-6 list-disc text-xs text-rose-800 dark:text-rose-300 font-medium">
                {result.redFlagWarnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. Differential Diagnosis Ranked Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight text-ink">
                  Ranked Differential Diagnoses ({result.differentialDiagnosis.length})
                </h3>
                <p className="text-xs text-ink-muted">
                  Probabilistic likelihood based on clinical presentation, symptom co-occurrence, and pathophysiology.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary px-2.5 py-1 rounded-full bg-primary-soft">
                Gemini AI Assessed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.differentialDiagnosis.map((cand, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl border border-line bg-surface flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-ink-muted">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                            {cand.category}
                          </span>
                          {cand.diseaseCode && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-subtle border border-line text-ink-muted">
                              {cand.diseaseCode}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-extrabold tracking-tight text-ink mt-0.5">
                          {cand.diseaseName}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black font-mono text-primary">
                          {cand.probabilityPercent}%
                        </span>
                        <span className="block text-[9px] font-bold uppercase text-ink-muted">
                          Likelihood
                        </span>
                      </div>
                    </div>

                    {/* Probability Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min(100, cand.probabilityPercent)}%` }}
                      />
                    </div>

                    {/* Clinical Rationale & Pathophysiology */}
                    <p className="text-xs text-ink-soft bg-surface-subtle/50 p-2.5 rounded-xl border border-line/60">
                      {cand.clinicalRationale}
                    </p>
                    <p className="text-[11px] text-ink-muted italic pl-1">
                      <strong>Pathophysiology:</strong> {cand.pathophysiology}
                    </p>
                  </div>

                  {/* Matched Symptoms Tags */}
                  <div className="pt-2 border-t border-line/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-ink-muted">Matched:</span>
                    {cand.matchedSymptoms.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-ink-soft"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Interactive "Narrow Down Your Diagnosis" Clarification Questions */}
          {result.targetedQuestions && result.targetedQuestions.length > 0 && (
            <div className="rounded-3xl border-2 border-primary/30 bg-primary-soft/10 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <h3 className="text-base font-extrabold text-ink tracking-tight">
                      Narrow Down Your Diagnosis
                    </h3>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Answer these targeted questions generated by Gemini AI to refine your differential probability in real-time.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary-soft text-primary-dark">
                  Interactive Triage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.targetedQuestions.map((q) => {
                  const currentAnswer = answeredQuestions[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl border border-line bg-surface flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-ink leading-snug">{q.question}</p>
                        <span className="text-[11px] text-ink-muted block mt-1">
                          {q.clinicalRelevance}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleAnswerQuestion(q.id, true)}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                            currentAnswer === true
                              ? "bg-primary text-white shadow-xs"
                              : "bg-surface-subtle border border-line text-ink hover:bg-primary-soft"
                          }`}
                        >
                          Yes ✓
                        </button>
                        <button
                          onClick={() => handleAnswerQuestion(q.id, false)}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                            currentAnswer === false
                              ? "bg-slate-700 text-white shadow-xs"
                              : "bg-surface-subtle border border-line text-ink hover:bg-surface"
                          }`}
                        >
                          No ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Recommended Diagnostics & Home Care */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommended Diagnostics */}
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm space-y-3">
              <h4 className="text-sm font-extrabold tracking-tight text-ink flex items-center gap-2">
                <span>🧪</span>
                <span>Recommended Diagnostic Tests to Discuss</span>
              </h4>
              <div className="space-y-2">
                {result.recommendedDiagnostics.map((test, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-surface-subtle border border-line flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-ink">{test.testName}</strong>
                      <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary-soft">
                        {test.urgency}
                      </span>
                    </div>
                    <span className="text-[11px] text-ink-muted">{test.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence-Based Home Protocols */}
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm space-y-3">
              <h4 className="text-sm font-extrabold tracking-tight text-ink flex items-center gap-2">
                <span>🌿</span>
                <span>Safe Non-Pharmacological Protocols</span>
              </h4>
              <div className="space-y-2">
                {result.evidenceBasedRelief.map((relief, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-surface-subtle border border-line flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-ink">{relief.action}</strong>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950">
                        {relief.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-ink-muted">{relief.details}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Physician Brief / Doctor Discussion Summary */}
          <div className="rounded-3xl border border-line bg-surface-subtle/70 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold tracking-tight text-ink flex items-center gap-2">
                <span>📋</span>
                <span>Clinical Consultation Summary (Show to Your Doctor)</span>
              </h4>
              <button
                onClick={() => window.print()}
                className="text-xs font-bold text-primary hover:underline"
              >
                Print / Export PDF 🖨️
              </button>
            </div>
            <ul className="space-y-1.5 list-disc pl-5 text-xs text-ink-soft">
              {result.doctorDiscussionSummary.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
