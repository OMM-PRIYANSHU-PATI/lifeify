"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";

interface ParsedMed {
  id?: string;
  name: string;
  dose?: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  confidence: number;
}

export function ScanClient() {
  const [step, setStep] = useState<"input" | "review" | "done">("input");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [prescriptionId, setPrescriptionId] = useState("");
  const [medicines, setMedicines] = useState<ParsedMed[]>([]);
  const [allergyWarnings, setAllergyWarnings] = useState<string[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  const samplePrescription = `Dr. A. K. Sharma, MD
Rx:
1. Tab Metformin 500mg - 1 tablet OD after dinner for 30 days
2. Tab Telmisartan 40mg - 1 tablet once daily morning for 60 days
3. Cap Omeprazole 20mg - 1 capsule BD before meals for 14 days`;

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ocr/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to parse prescription");
      }

      setPrescriptionId(data.prescriptionId);
      setMedicines(data.medicines);
      setStep("review");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMed = (index: number, field: keyof ParsedMed, value: any) => {
    setMedicines((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setError("");

    try {
      const res = await fetch("/api/prescriptions/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescriptionId,
          medicines,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to confirm prescription");
      }

      if (data.allergyWarnings?.length) {
        setAllergyWarnings(data.allergyWarnings);
      }
      if (data.duplicateWarnings?.length) {
        setDuplicateWarnings(data.duplicateWarnings);
      }
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Title */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink flex items-center gap-2">
          <span>📷</span>
          Prescription OCR Scanner
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Deterministic regex extraction with confidence scores. High-safety design: prescriptions remain drafts until you explicitly verify and confirm.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-crisis-soft border border-crisis/30 rounded-xl text-sm text-crisis flex items-center gap-2">
          <span className="shrink-0">🚨</span>
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Input */}
      {step === "input" && (
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-4 animate-slideUp">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-ink">
              Paste Prescription Text or Doctor Notes
            </label>
            <button
              type="button"
              onClick={() => setRawText(samplePrescription)}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              <span>✨</span>
              Load Sample Prescription
            </button>
          </div>

          <textarea
            rows={7}
            placeholder="e.g. Tab Metformin 500mg OD for 30 days..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="lif-input w-full p-4 font-mono text-xs focus:ring-2 focus:ring-primary"
          />

          <div className="p-3 bg-accent-soft border border-accent/30 rounded-xl text-xs text-accent">
            <strong>Deterministic Safety Rule:</strong> Our engine parses medication frequency, dosage, and duration patterns using strict rules. Nothing is added to your active medications until you review line-by-line.
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleParse}
              disabled={loading || !rawText.trim()}
              className="lif-btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Parsing Prescription...
                </>
              ) : (
                <>
                  Extract Medications
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review Draft */}
      {step === "review" && (
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-6 animate-slideUp">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Review Extracted Medications</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Check confidence scores and correct any typos or dosages before adding to your regimen.
              </p>
            </div>
            <button
              onClick={() => setStep("input")}
              className="text-xs text-ink-muted hover:text-ink"
            >
              ← Edit Raw Text
            </button>
          </div>

          <div className="space-y-4">
            {medicines.map((med, idx) => {
              const confPct = Math.round(med.confidence * 100);
              const isHigh = confPct >= 80;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-line bg-background space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                      Medicine #{idx + 1}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        isHigh
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                      }`}
                    >
                      {confPct}% Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-ink-muted mb-1">Medication Name</label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleUpdateMed(idx, "name", e.target.value)}
                        className="lif-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-muted mb-1">Dose / Strength</label>
                      <input
                        type="text"
                        value={med.dose || ""}
                        placeholder="e.g. 500mg"
                        onChange={(e) => handleUpdateMed(idx, "dose", e.target.value)}
                        className="lif-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-muted mb-1">Frequency</label>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleUpdateMed(idx, "frequency", e.target.value)}
                        className="lif-input w-full"
                      >
                        <option value="OD">OD (Once daily)</option>
                        <option value="BD">BD (Twice daily)</option>
                        <option value="TID">TID (Three times daily)</option>
                        <option value="QID">QID (Four times daily)</option>
                        <option value="SOS">SOS (As needed)</option>
                        <option value="WEEKLY">Weekly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-ink-muted mb-1">Duration (days)</label>
                      <input
                        type="text"
                        value={med.duration || ""}
                        placeholder="30"
                        onChange={(e) => handleUpdateMed(idx, "duration", e.target.value)}
                        className="lif-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-muted mb-1">Instructions</label>
                      <input
                        type="text"
                        value={med.instructions || ""}
                        placeholder="e.g. After meals"
                        onChange={(e) => handleUpdateMed(idx, "instructions", e.target.value)}
                        className="lif-input w-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button
              onClick={() => setStep("input")}
              className="lif-btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming || medicines.length === 0}
              className="lif-btn-primary flex items-center gap-2"
            >
              {confirming ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Add to Regimen
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation Complete */}
      {step === "done" && (
        <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm text-center space-y-4 animate-slideUp">
          <span className="text-6xl block">✅</span>
          <h2 className="text-xl font-bold text-ink">Prescription Confirmed!</h2>
          <p className="text-sm text-ink-muted max-w-md mx-auto">
            Your medications have been added to your daily schedule and inventory tracking.
          </p>

          {allergyWarnings.length > 0 && (
            <div className="p-3 bg-accent-soft border border-accent/30 rounded-xl text-xs text-accent text-left">
              <strong>Allergy Warnings:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {allergyWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {duplicateWarnings.length > 0 && (
            <div className="p-3 bg-primary-soft border border-primary/30 rounded-xl text-xs text-primary-dark text-left">
              <strong>Duplicate Ingredient Alerts:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {duplicateWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/app/medications"
              className="lif-btn-primary"
            >
              View Active Medications
            </Link>
            <button
              onClick={() => {
                setStep("input");
                setRawText("");
                setMedicines([]);
              }}
              className="lif-btn-secondary"
            >
              Scan Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
