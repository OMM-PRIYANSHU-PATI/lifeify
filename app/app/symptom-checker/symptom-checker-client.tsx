"use client";

import { useState } from "react";
import { TriageResult, SymptomAssessmentInput } from "@/lib/rules/symptom-triage";

export function SymptomCheckerClient() {
  const [formData, setFormData] = useState<SymptomAssessmentInput>({
    primaryComplaint: "FEVER",
    durationHours: 24,
    severityScale: 5,
    hasChestPressureRadiating: false,
    hasShortnessOfBreathAtRest: false,
    hasSuddenNeurologicalDeficit: false,
    hasConfusionOrDrowsiness: false,
    hasStiffNeckWithFever: false,
    hasSevereAbdominalRigidity: false,
    hasBloodyVomitOrStool: false,
    hasHighFeverUnresponsive: false,
    hasPersistentVomitingDehydration: false,
    age: 35,
    hasKnownCardiacHistory: false,
    hasDiabetes: false,
    hasImmunocompromise: false,
  });

  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const handleCheckboxChange = (field: keyof SymptomAssessmentInput) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/symptoms/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.ok) {
        setTriageResult(data.triage);
      }
    } catch (err) {
      console.error("Triage evaluation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "EMERGENCY":
        return {
          bg: "bg-red-600 text-white",
          border: "border-red-600",
          cardBg: "bg-red-50 dark:bg-red-950/30",
          badge: "🚨 CRITICAL EMERGENCY",
        };
      case "URGENT_CARE":
        return {
          bg: "bg-amber-500 text-white",
          border: "border-amber-500",
          cardBg: "bg-amber-50 dark:bg-amber-950/30",
          badge: "⚠️ URGENT CLINICAL CARE (Today)",
        };
      case "PRIMARY_CARE":
        return {
          bg: "bg-blue-600 text-white",
          border: "border-blue-600",
          cardBg: "bg-blue-50 dark:bg-blue-950/30",
          badge: "🩺 PRIMARY CARE (24-72h)",
        };
      case "SELF_CARE":
      default:
        return {
          bg: "bg-emerald-600 text-white",
          border: "border-emerald-600",
          cardBg: "bg-emerald-50 dark:bg-emerald-950/30",
          badge: "🌿 SELF CARE & MONITORING",
        };
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
            <span>🩺</span> Clinical Symptom Triage Wizard
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Deterministic decision-tree analysis according to ICMR & international clinical safety pathways.
          </p>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
          Deterministic Rule Engine
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleEvaluate} className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-5">
            {/* Primary complaint */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                1. What is the Primary Symptom / Complaint?
              </label>
              <select
                value={formData.primaryComplaint}
                onChange={(e) =>
                  setFormData({ ...formData, primaryComplaint: e.target.value as any })
                }
                className="w-full rounded-xl border border-line bg-background px-3 py-2.5 text-sm font-medium text-ink focus:border-primary focus:outline-none"
              >
                <option value="FEVER">Fever / Chills / Rigors</option>
                <option value="CHEST_PAIN">Chest Discomfort or Pressure</option>
                <option value="BREATHLESSNESS">Shortness of Breath / Wheezing</option>
                <option value="HEADACHE">Severe Headache or Migraine</option>
                <option value="ABDOMINAL_PAIN">Abdominal / Stomach Pain</option>
                <option value="COUGH">Persistent Cough or Congestion</option>
                <option value="OTHER">Other Generalized Symptoms</option>
              </select>
            </div>

            {/* Duration & Severity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={formData.durationHours}
                  onChange={(e) =>
                    setFormData({ ...formData, durationHours: Number(e.target.value) || 1 })
                  }
                  className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                  Severity: {formData.severityScale} / 10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.severityScale}
                  onChange={(e) =>
                    setFormData({ ...formData, severityScale: Number(e.target.value) })
                  }
                  className="w-full accent-primary mt-2"
                />
                <div className="flex justify-between text-[10px] text-ink-muted">
                  <span>1 (Mild)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe)</span>
                </div>
              </div>
            </div>

            {/* Red Flag Checklist */}
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 dark:border-red-900/50 dark:bg-red-950/20">
              <span className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-2.5">
                🚨 Critical Red Flag Screening
              </span>
              <div className="space-y-2">
                {[
                  {
                    key: "hasChestPressureRadiating",
                    label: "Crushing chest pain radiating to left arm, neck, or jaw",
                  },
                  {
                    key: "hasSuddenNeurologicalDeficit",
                    label: "Sudden facial droop, arm weakness, or slurred speech (FAST)",
                  },
                  {
                    key: "hasShortnessOfBreathAtRest",
                    label: "Severe breathlessness or gasp for air while resting",
                  },
                  {
                    key: "hasStiffNeckWithFever",
                    label: "High fever accompanied by severe neck stiffness or light sensitivity",
                  },
                  {
                    key: "hasSevereAbdominalRigidity",
                    label: "Severe rigid, board-like abdomen or intense rebound tenderness",
                  },
                  {
                    key: "hasBloodyVomitOrStool",
                    label: "Vomiting blood (coffee-ground) or dark black tarry stools",
                  },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-2.5 text-xs text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData[item.key as keyof SymptomAssessmentInput])}
                      onChange={() => handleCheckboxChange(item.key as keyof SymptomAssessmentInput)}
                      className="mt-0.5 h-4 w-4 rounded border-line text-red-600 focus:ring-red-500"
                    />
                    <span className="font-medium leading-relaxed">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Patient Context */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Patient Health Context
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasKnownCardiacHistory}
                    onChange={() => handleCheckboxChange("hasKnownCardiacHistory")}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  />
                  <span>Cardiac / Heart History</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasDiabetes}
                    onChange={() => handleCheckboxChange("hasDiabetes")}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  />
                  <span>Diabetes (Type 1 or 2)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasHighFeverUnresponsive}
                    onChange={() => handleCheckboxChange("hasHighFeverUnresponsive")}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  />
                  <span>Fever &gt; 103°F Unresponsive</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPersistentVomitingDehydration}
                    onChange={() => handleCheckboxChange("hasPersistentVomitingDehydration")}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  />
                  <span>Intractable Vomiting / Dehydration</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md hover:bg-primary-dark active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? "Analyzing Clinical Pathways..." : "Analyze Symptoms & Urgency Tier"}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5">
          {triageResult ? (
            <div
              className={`rounded-2xl border ${getUrgencyBadge(triageResult.urgency).border} ${
                getUrgencyBadge(triageResult.urgency).cardBg
              } p-5 shadow-sm space-y-4 animate-in fade-in duration-300`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black tracking-wide ${
                    getUrgencyBadge(triageResult.urgency).bg
                  }`}
                >
                  {getUrgencyBadge(triageResult.urgency).badge}
                </span>
                <span className="text-xs font-bold text-ink">
                  {triageResult.recommendedActionTimeframe}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-ink">
                  {triageResult.urgencyHeadline}
                </h3>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                  {triageResult.clinicalRationale}
                </p>
              </div>

              {/* Red flags identified */}
              {triageResult.identifiedRedFlags.length > 0 && (
                <div className="rounded-xl bg-white/70 p-3.5 dark:bg-black/40 border border-red-200 dark:border-red-900">
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block mb-1">
                    Red Flag Findings:
                  </span>
                  <ul className="list-disc list-inside text-xs text-red-800 dark:text-red-200 space-y-0.5">
                    {triageResult.identifiedRedFlags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Immediate SOS Buttons if Emergency */}
              {triageResult.urgency === "EMERGENCY" && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:112"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-xs font-black text-white shadow-md hover:bg-red-700 text-center"
                  >
                    <span>🚨</span> Call 112 (National)
                  </a>
                  <a
                    href="tel:108"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 py-2.5 text-xs font-black text-white shadow-md hover:bg-orange-700 text-center"
                  >
                    <span>🚑</span> Call 108 (Ambulance)
                  </a>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  Recommended Immediate Steps:
                </span>
                <ul className="space-y-1 text-xs text-ink">
                  {triageResult.immediateInstructions.map((ins, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Home Care Advice if applicable */}
              {triageResult.homeCareAdvice.length > 0 && (
                <div className="space-y-1.5 border-t border-line/60 pt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink">
                    Home Supportive Care:
                  </span>
                  <ul className="space-y-1 text-xs text-ink-muted">
                    {triageResult.homeCareAdvice.map((adv, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="rounded-lg bg-surface/80 p-2.5 text-[11px] text-ink-muted border border-line">
                {triageResult.disclaimer}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-muted flex flex-col items-center justify-center h-full">
              <span className="text-4xl mb-3">🩺</span>
              <p className="text-sm font-semibold text-ink">Triage Assessment Ready</p>
              <p className="text-xs max-w-xs mt-1">
                Fill out the symptom profile on the left to obtain algorithmic clinical urgency and triage instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
