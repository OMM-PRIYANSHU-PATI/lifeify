"use client";

import React, { useState, useEffect } from "react";
import { Plus, Heart, Droplets, Activity } from "lucide-react";

interface Vital {
  id: string;
  type: string;
  value?: number | null;
  unit: string;
  systolic?: number | null;
  diastolic?: number | null;
  context?: string | null;
  takenAt: string;
}

export function ConditionsClient() {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [vitalType, setVitalType] = useState<"BP" | "GLUCOSE" | "HEART_RATE" | "SPO2" | "WEIGHT">("BP");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [value, setValue] = useState("");
  const [context, setContext] = useState("resting");

  const loadVitals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vitals");
      const data = await res.json();
      if (data.ok) {
        setVitals(data.vitals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVitals();
  }, []);

  const handleLogVital = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = { type: vitalType, context };
      if (vitalType === "BP") {
        payload.systolic = Number(systolic);
        payload.diastolic = Number(diastolic);
      } else {
        payload.value = Number(value);
      }

      const res = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.ok) {
        setShowLogModal(false);
        setSystolic("");
        setDiastolic("");
        setValue("");
        loadVitals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink flex items-center gap-2">
            <span>🩺</span>
            Chronic Conditions & Vitals
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Log and monitor vital signs: Blood Pressure, Glucose, SpO2, and Heart Rate trends.
          </p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="lif-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Vital Reading
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-accent-soft border border-accent/30 rounded-xl text-xs text-accent flex items-center gap-2">
        <span className="shrink-0">⚠️</span>
        <span>
          <strong>Clinical Disclaimer:</strong> Vital readings are stored for trend tracking and physician review. If you experience severe hypertension (&gt;180/120), symptomatic hypoglycemia (&lt;70 mg/dL), or shortness of breath, consult emergency medical services immediately.
        </span>
      </div>

      {/* Recent Readings List */}
      <div className="rounded-2xl border border-line bg-surface shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-ink flex items-center gap-2">
          <span>📈</span>
          Recent Vital Logs
        </h2>

        {loading ? (
          <div className="py-8 text-center text-ink-muted text-sm">Loading vitals...</div>
        ) : vitals.length === 0 ? (
          <div className="py-12 text-center text-ink-muted text-sm border border-dashed border-line rounded-xl">
            No vitals logged yet. Click &quot;Log Vital Reading&quot; to begin your trend tracker.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {vitals.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center">
                    {v.type === "BP" && <Heart className="w-5 h-5 text-crisis" />}
                    {v.type === "GLUCOSE" && <Droplets className="w-5 h-5 text-accent" />}
                    {v.type !== "BP" && v.type !== "GLUCOSE" && <Activity className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-ink font-mono">
                      {v.type === "BP" ? `${v.systolic}/${v.diastolic} mmHg` : `${v.value} ${v.unit}`}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {v.type} {v.context ? `• ${v.context}` : ""}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-ink-muted">
                  {new Date(v.takenAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Vital Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-2xl p-6 border border-line shadow-xl space-y-4 animate-slideUp">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Record Vital Sign</h2>
              <button onClick={() => setShowLogModal(false)} className="text-ink-muted hover:text-ink text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleLogVital} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Vital Metric
                </label>
                <select
                  value={vitalType}
                  onChange={(e) => setVitalType(e.target.value as any)}
                  className="lif-input w-full"
                >
                  <option value="BP">Blood Pressure (mmHg)</option>
                  <option value="GLUCOSE">Blood Glucose (mg/dL)</option>
                  <option value="HEART_RATE">Heart Rate (bpm)</option>
                  <option value="SPO2">Blood Oxygen / SpO2 (%)</option>
                  <option value="WEIGHT">Weight (kg)</option>
                </select>
              </div>

              {vitalType === "BP" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-ink-muted mb-1">Systolic (Top)</label>
                    <input
                      type="number"
                      placeholder="120"
                      required
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      className="lif-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ink-muted mb-1">Diastolic (Bottom)</label>
                    <input
                      type="number"
                      placeholder="80"
                      required
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      className="lif-input w-full"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Value</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Enter reading"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="lif-input w-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-ink-muted mb-1">Context</label>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="lif-input w-full"
                >
                  <option value="resting">Resting / Baseline</option>
                  <option value="fasting">Fasting</option>
                  <option value="post_meal">Post-Meal (2 hrs)</option>
                  <option value="post_workout">Post-Workout</option>
                  <option value="bedtime">Bedtime</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="lif-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="lif-btn-primary"
                >
                  {submitting ? "Saving..." : "Save Vital"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
