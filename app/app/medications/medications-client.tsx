"use client";

import { useState } from "react";
import { addMedication, markDoseAction, refillStock, deactivateMedication } from "@/lib/actions/medications";
import { logSymptomAction, createADRReportAction } from "@/lib/actions/symptoms";
import { submitMedCheckinAction } from "@/lib/actions/medcheckin";

interface MedicationItem {
  id: string;
  name: string;
  dose: string | null;
  frequency: string;
  active: boolean;
  startDate: Date | string;
  stock: { remainingQty: number; unit: string; refillThreshold: number } | null;
}

interface DoseItem {
  id: string;
  medicationName: string;
  scheduledAt: Date | string;
  status: string;
}

interface SymptomItem {
  id: string;
  name: string;
  severity: string;
  frequency: string | null;
  redFlag: boolean;
  createdAt: Date | string;
  medication?: { name: string } | null;
}

interface GamificationData {
  profile: { points: number; level: number; streak: number };
  badges: { code: string; name: string; description: string; tier: string; isEarned: boolean }[];
}

export function MedicationsClient({
  medications,
  todayDoses,
  symptoms,
  gamification,
}: {
  medications: MedicationItem[];
  todayDoses: DoseItem[];
  symptoms: SymptomItem[];
  gamification: GamificationData;
}) {
  const [activeTab, setActiveTab] = useState<"regimen" | "progress" | "symptoms" | "gamification" | "interactions">("regimen");

  // Effectiveness modal state
  const [selectedEffectivenessMed, setSelectedEffectivenessMed] = useState<any | null>(null);
  const [effectivenessLoading, setEffectivenessLoading] = useState(false);

  // DDI scan state
  const [ddiReport, setDdiReport] = useState<any | null>(null);
  const [ddiLoading, setDdiLoading] = useState(false);
  const [candidateDrugInput, setCandidateDrugInput] = useState("");

  const handleOpenEffectiveness = async (medId: string) => {
    setEffectivenessLoading(true);
    setSelectedEffectivenessMed(null);
    try {
      const res = await fetch(`/api/medications/${medId}/effectiveness`);
      const data = await res.json();
      if (data.ok) {
        setSelectedEffectivenessMed(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEffectivenessLoading(false);
    }
  };

  const handleScanInteractions = async (candidate?: string) => {
    setDdiLoading(true);
    try {
      const res = await fetch("/api/medications/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateDrugs: candidate ? [candidate] : [],
          includeActiveMedications: true,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDdiReport(data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDdiLoading(false);
    }
  };

  // Add Med Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFreq, setMedFreq] = useState<"OD" | "BD" | "TDS" | "QID" | "PRN">("OD");
  const [medStock, setMedStock] = useState("30");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Symptom Modal
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [symptomName, setSymptomName] = useState("");
  const [symptomSeverity, setSymptomSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [symptomMedId, setSymptomMedId] = useState("");
  const [symptomWarning, setSymptomWarning] = useState<string | null>(null);

  // Checkin Modal
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinMedId, setCheckinMedId] = useState(medications[0]?.id ?? "");
  const [feelingScore, setFeelingScore] = useState(4);
  const [comparison, setComparison] = useState<"much_better" | "better" | "same" | "worse" | "much_worse">("better");

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await addMedication({
        name: medName,
        dose: medDose,
        frequency: medFreq,
        initialStockQty: Number(medStock),
      });
      if (res.ok) {
        setShowAddModal(false);
        setMedName("");
        setMessage("Medication added successfully!");
      } else {
        setMessage(res.error ?? "Failed to add medication");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSymptomWarning(null);
    try {
      const res = await logSymptomAction({
        name: symptomName,
        severity: symptomSeverity,
        medicationId: symptomMedId || undefined,
      });
      if (res.ok) {
        if (res.isRedFlag) {
          setSymptomWarning("⚠️ RED FLAG SYMPTOM DETECTED: This symptom may indicate a medical emergency. Please contact emergency services (112 / 108) or consult a physician immediately.");
        } else {
          setShowSymptomModal(false);
          setSymptomName("");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitMedCheckinAction({
        medicationId: checkinMedId || undefined,
        weekNumber: 1,
        feelingScore,
        comparison,
      });
      if (res.ok) {
        setShowCheckinModal(false);
        setMessage("Weekly check-in submitted!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDoseAction = async (doseId: string, status: "TAKEN" | "SKIPPED" | "SNOOZED") => {
    await markDoseAction(doseId, status);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg border border-primary/30 bg-primary-soft/50 p-4 text-xs font-semibold text-primary-dark">
          {message}
        </div>
      )}

      {/* Gamification Bar */}
      <div className="lif-card flex items-center justify-between bg-surface-subtle p-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-ink">
            <span className="text-base">⭐</span> Level {gamification.profile.level}
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-amber-700">
            <span className="text-base">🪙</span> {gamification.profile.points} Health Points
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <span className="text-base">🔥</span> {gamification.profile.streak} Day Streak
          </div>
        </div>
        <button
          onClick={() => setActiveTab("gamification")}
          className="text-primary hover:underline font-medium"
        >
          View Badges ({gamification.badges.filter((b) => b.isEarned).length}/{gamification.badges.length})
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line text-sm font-medium">
        <button
          onClick={() => setActiveTab("regimen")}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === "regimen"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          💊 Active Regimen
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === "progress"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          📈 Treatment Progress
        </button>
        <button
          onClick={() => setActiveTab("symptoms")}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === "symptoms"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          🩺 Symptoms & ADR
        </button>
        <button
          onClick={() => setActiveTab("gamification")}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === "gamification"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          🏆 Badges & Streaks
        </button>
        <button
          onClick={() => {
            setActiveTab("interactions");
            if (!ddiReport) handleScanInteractions();
          }}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === "interactions"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          ⚡ Drug & Food Interactions
        </button>
      </div>

      {/* TAB 1: REGIMEN */}
      {activeTab === "regimen" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink">Today&apos;s Scheduled Doses</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCheckinModal(true)}
                className="lif-btn-secondary px-3 py-1.5 text-xs font-semibold"
              >
                📝 Weekly Check-in
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="lif-btn-primary px-3 py-1.5 text-xs font-semibold"
              >
                + Add Medicine
              </button>
            </div>
          </div>

          {/* Doses */}
          {todayDoses.length === 0 ? (
            <div className="lif-card text-center py-6 text-xs text-ink-muted">
              No doses scheduled for today, or all doses already completed.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {todayDoses.map((dose) => (
                <div key={dose.id} className="lif-card flex items-center justify-between p-3">
                  <div>
                    <p className="font-bold text-ink text-xs">{dose.medicationName}</p>
                    <p className="text-[11px] text-ink-muted">
                      Scheduled: {new Date(dose.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleDoseAction(dose.id, "TAKEN")}
                      className="bg-emerald-600 text-white rounded px-2.5 py-1 text-xs font-semibold hover:bg-emerald-700"
                    >
                      ✓ Take
                    </button>
                    <button
                      onClick={() => handleDoseAction(dose.id, "SNOOZED")}
                      className="bg-amber-100 text-amber-800 rounded px-2 py-1 text-xs font-medium hover:bg-amber-200"
                    >
                      30m
                    </button>
                    <button
                      onClick={() => handleDoseAction(dose.id, "SKIPPED")}
                      className="bg-ink-muted/10 text-ink-soft rounded px-2 py-1 text-xs font-medium hover:bg-ink-muted/20"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active List */}
          <div className="lif-card space-y-3">
            <h3 className="font-bold text-sm text-ink">Active Prescriptions & Stock</h3>
            {medications.length === 0 ? (
              <p className="text-xs text-ink-muted">No medications active in your regimen.</p>
            ) : (
              <div className="divide-y divide-line/60">
                {medications.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-ink">{m.name} {m.dose && `(${m.dose})`}</p>
                      <p className="text-[11px] text-ink-muted">Frequency: {m.frequency} • Started: {new Date(m.startDate).toLocaleDateString()}</p>
                      {m.stock && (
                        <p className={`text-[11px] font-medium mt-0.5 ${m.stock.remainingQty <= m.stock.refillThreshold ? "text-crisis font-bold" : "text-ink-soft"}`}>
                          Stock: {m.stock.remainingQty} {m.stock.unit} remaining
                          {m.stock.remainingQty <= m.stock.refillThreshold && " (Refill needed!)"}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEffectiveness(m.id)}
                        className="rounded border border-primary/40 bg-primary-soft/50 px-2.5 py-1 text-xs font-bold text-primary-dark hover:bg-primary-soft transition-colors"
                      >
                        ⚡ Curve
                      </button>
                      <button
                        onClick={() => {
                          const qty = prompt("Quantity to add to stock:", "30");
                          if (qty) refillStock(m.id, Number(qty));
                        }}
                        className="lif-btn-secondary px-2.5 py-1 text-xs"
                      >
                        Refill
                      </button>
                      <button
                        onClick={() => deactivateMedication(m.id)}
                        className="text-crisis hover:underline text-xs"
                      >
                        Stop
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROGRESS */}
      {activeTab === "progress" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-primary/20 bg-primary-soft/30 p-4 text-xs text-ink-soft leading-relaxed">
            <span className="font-bold text-ink">Clinical Invariant:</span> LIFEIFY displays your recorded trends (vitals, feelings, adherence) during this treatment window. <strong>Always discuss these observations with your healthcare professional before altering medication doses.</strong> LIFEIFY does not determine whether a drug is clinically effective.
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="lif-card space-y-2">
              <span className="text-xs font-semibold text-ink-muted">Adherence Rate</span>
              <p className="text-2xl font-bold text-primary-dark">94%</p>
              <p className="text-[11px] text-ink-muted">32 of 34 prescribed doses recorded on schedule.</p>
            </div>
            <div className="lif-card space-y-2">
              <span className="text-xs font-semibold text-ink-muted">Weekly Feeling Trend</span>
              <p className="text-2xl font-bold text-emerald-700">4.2 / 5.0</p>
              <p className="text-[11px] text-ink-muted">Reported feeling &quot;better&quot; compared to baseline.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYMPTOMS */}
      {activeTab === "symptoms" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-ink">Symptom & Adverse Reaction Journal</h3>
              <p className="text-xs text-ink-muted">Track unexpected symptoms, side effects, and triggers.</p>
            </div>
            <button
              onClick={() => { setShowSymptomModal(true); setSymptomWarning(null); }}
              className="lif-btn-primary px-3 py-1.5 text-xs font-semibold"
            >
              + Log Symptom
            </button>
          </div>

          {symptoms.length === 0 ? (
            <div className="lif-card text-center py-8 text-xs text-ink-muted">
              No symptoms or side effects recorded.
            </div>
          ) : (
            <div className="divide-y divide-line/60 lif-card">
              {symptoms.map((s) => (
                <div key={s.id} className="py-3 flex items-start justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{s.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          s.severity === "severe"
                            ? "bg-crisis text-white"
                            : s.severity === "moderate"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-ink-muted/10 text-ink-soft"
                        }`}
                      >
                        {s.severity}
                      </span>
                      {s.redFlag && (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          RED FLAG
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted mt-1">
                      {s.medication ? `Associated with: ${s.medication.name}` : "General symptom"} • Recorded: {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => createADRReportAction(s.id)}
                    className="lif-btn-secondary px-2.5 py-1 text-xs"
                  >
                    Generate ADR Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GAMIFICATION */}
      {activeTab === "gamification" && (
        <div className="space-y-6">
          <div className="lif-card space-y-4">
            <h3 className="font-bold text-ink">Earned Badges & Milestones</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gamification.badges.map((b) => (
                <div
                  key={b.code}
                  className={`rounded-xl border p-4 space-y-2 text-xs ${
                    b.isEarned
                      ? "border-amber-400/50 bg-amber-50/30"
                      : "border-line bg-surface opacity-50 grayscale"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">
                      {b.tier === "diamond" ? "💎" : b.tier === "gold" ? "🥇" : b.tier === "silver" ? "🥈" : "🥉"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      {b.tier}
                    </span>
                  </div>
                  <h4 className="font-bold text-ink">{b.name}</h4>
                  <p className="text-ink-soft text-[11px]">{b.description}</p>
                  <span className="block text-[10px] font-semibold text-primary-dark">
                    {b.isEarned ? "✓ Earned" : "Locked"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INTERACTIONS */}
      {activeTab === "interactions" && (
        <div className="space-y-6">
          {/* Header & Scanner */}
          <div className="lif-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
              <div>
                <h3 className="font-bold text-ink text-sm">Drug-Drug & Food Interaction Matrix</h3>
                <p className="text-xs text-ink-muted">
                  Deterministic clinical cross-checking of your active regimen and prospective medications.
                </p>
              </div>
              <button
                onClick={() => handleScanInteractions(candidateDrugInput || undefined)}
                disabled={ddiLoading}
                className="lif-btn-primary px-3 py-1.5 text-xs font-bold"
              >
                {ddiLoading ? "Scanning Database..." : "Re-Scan Regimen ⚡"}
              </button>
            </div>

            {/* Candidate Checker Input */}
            <div className="rounded-xl border border-line bg-background p-3.5 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Pre-Screen a New or OTC Medicine
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Ibuprofen, Combiflam, Clarithromycin, Sildenafil, Cipro"
                  value={candidateDrugInput}
                  onChange={(e) => setCandidateDrugInput(e.target.value)}
                  className="lif-input flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleScanInteractions(candidateDrugInput)}
                  className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-surface"
                >
                  Check Safety
                </button>
              </div>
            </div>

            {/* Interaction Summary Banner */}
            {ddiReport && (
              <div className="space-y-4">
                <div
                  className={`rounded-xl border p-4 text-xs font-semibold ${
                    ddiReport.riskLevel === "CRITICAL"
                      ? "border-red-600 bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200"
                      : ddiReport.riskLevel === "HIGH"
                      ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
                      : ddiReport.riskLevel === "MODERATE"
                      ? "border-blue-400 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-200"
                      : "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>REGIMEN SAFETY STATUS: {ddiReport.riskLevel}</span>
                    <span>{ddiReport.analyzedDrugs?.length || 0} active agents analyzed</span>
                  </div>
                  {ddiReport.blockingNotice && (
                    <p className="mt-2 font-bold text-xs">{ddiReport.blockingNotice}</p>
                  )}
                </div>

                {/* Drug-Drug Interactions */}
                {ddiReport.drugDrugInteractions?.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                      Identified Drug-Drug Interactions ({ddiReport.drugDrugInteractions.length})
                    </h4>
                    {ddiReport.drugDrugInteractions.map((item: any) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-line bg-surface p-4 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink text-sm capitalize">
                            {item.drugA} + {item.drugB}
                          </span>
                          <span
                            className={`rounded px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              item.severity === "CONTRAINDICATED"
                                ? "bg-red-600 text-white"
                                : item.severity === "MAJOR"
                                ? "bg-amber-500 text-white"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-ink text-xs"><span className="font-bold">Mechanism:</span> {item.mechanism}</p>
                        <p className="text-crisis text-xs font-semibold"><span className="font-bold">Clinical Risk:</span> {item.clinicalRisk}</p>
                        <div className="rounded-lg bg-background p-2.5 text-xs text-ink-muted">
                          <span className="font-bold text-ink">Physician Advice:</span> {item.actionRecommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-background p-4 text-xs text-emerald-700 font-semibold text-center">
                    ✓ No known severe pairwise drug-drug interactions detected between active medications.
                  </div>
                )}

                {/* Drug-Food Interactions */}
                {ddiReport.foodInteractions?.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                      Food &amp; Nutrient Advisories ({ddiReport.foodInteractions.length})
                    </h4>
                    {ddiReport.foodInteractions.map((f: any) => (
                      <div
                        key={f.id}
                        className="rounded-xl border border-line bg-surface p-3.5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-ink capitalize">{f.drug} with {f.foodOrSubstance}</span>
                          <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px]">
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-ink-muted text-xs">{f.mechanism}</p>
                        <div className="rounded bg-background p-2 text-xs font-medium text-ink">
                          <span className="text-primary font-bold">Dietary Tip: </span>
                          {f.dietaryAdvice}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="lif-card w-full max-w-sm space-y-4">
            <h3 className="font-bold text-ink">Add Medication</h3>
            <form onSubmit={handleAddMed} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-ink-soft">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Metformin"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="lif-input w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Dose & Unit</label>
                <input
                  type="text"
                  placeholder="e.g., 500mg"
                  value={medDose}
                  onChange={(e) => setMedDose(e.target.value)}
                  className="lif-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Frequency</label>
                  <select
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value as typeof medFreq)}
                    className="lif-input w-full"
                  >
                    <option value="OD">Once daily (OD)</option>
                    <option value="BD">Twice daily (BD)</option>
                    <option value="TDS">Thrice daily (TDS)</option>
                    <option value="QID">Four times (QID)</option>
                    <option value="PRN">As needed (PRN)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-ink-soft">Initial Stock</label>
                  <input
                    type="number"
                    value={medStock}
                    onChange={(e) => setMedStock(e.target.value)}
                    className="lif-input w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="lif-btn-primary flex-1 py-2">
                  {loading ? "Adding..." : "Save Medicine"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="lif-btn-secondary py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Symptom Modal */}
      {showSymptomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="lif-card w-full max-w-sm space-y-4">
            <h3 className="font-bold text-ink">Log Symptom or Side Effect</h3>
            {symptomWarning && (
              <div className="rounded-lg bg-crisis/10 border border-crisis p-3 text-xs font-bold text-crisis">
                {symptomWarning}
              </div>
            )}
            <form onSubmit={handleLogSymptom} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-ink-soft">Symptom Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mild nausea, Dizziness, Headache"
                  value={symptomName}
                  onChange={(e) => setSymptomName(e.target.value)}
                  className="lif-input w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Severity</label>
                <select
                  value={symptomSeverity}
                  onChange={(e) => setSymptomSeverity(e.target.value as typeof symptomSeverity)}
                  className="lif-input w-full"
                >
                  <option value="mild">Mild (Noticeable but does not disrupt day)</option>
                  <option value="moderate">Moderate (Interferes with activities)</option>
                  <option value="severe">Severe (Incapacitating / Emergency)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Associated Medication (Optional)</label>
                <select
                  value={symptomMedId}
                  onChange={(e) => setSymptomMedId(e.target.value)}
                  className="lif-input w-full"
                >
                  <option value="">None / General</option>
                  {medications.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="lif-btn-primary flex-1 py-2">
                  {loading ? "Saving..." : "Log Symptom"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSymptomModal(false)}
                  className="lif-btn-secondary py-2"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Check-in Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="lif-card w-full max-w-sm space-y-4">
            <h3 className="font-bold text-ink">Weekly Medication Check-in</h3>
            <form onSubmit={handleCheckinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-ink-soft">Select Medication</label>
                <select
                  value={checkinMedId}
                  onChange={(e) => setCheckinMedId(e.target.value)}
                  className="lif-input w-full"
                >
                  {medications.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Overall Feeling Score (1 to 5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={feelingScore}
                  onChange={(e) => setFeelingScore(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[11px] text-ink-muted">
                  <span>1 (Poor)</span>
                  <span className="font-bold text-primary-dark">{feelingScore} / 5</span>
                  <span>5 (Excellent)</span>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Compared to Last Week</label>
                <select
                  value={comparison}
                  onChange={(e) => setComparison(e.target.value as typeof comparison)}
                  className="lif-input w-full"
                >
                  <option value="much_better">Much Better</option>
                  <option value="better">Better</option>
                  <option value="same">About the Same</option>
                  <option value="worse">Worse</option>
                  <option value="much_worse">Much Worse</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="lif-btn-primary flex-1 py-2">
                  {loading ? "Submitting..." : "Submit Check-in"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckinModal(false)}
                  className="lif-btn-secondary py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Effectiveness & Pharmacokinetics Modal */}
      {(selectedEffectivenessMed || effectivenessLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="lif-card w-full max-w-lg space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-bold text-ink text-sm">
                  Predictive Effectiveness &amp; Steady-State Curve
                </h3>
                <p className="text-xs text-ink-muted">
                  {selectedEffectivenessMed?.medication?.name || "Loading pharmacokinetics..."}
                </p>
              </div>
              <button
                onClick={() => setSelectedEffectivenessMed(null)}
                className="text-ink-muted hover:text-ink font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {effectivenessLoading ? (
              <div className="p-8 text-center text-xs text-ink-muted">
                Simulating 1-compartment oral absorption model...
              </div>
            ) : selectedEffectivenessMed ? (
              <div className="space-y-4 text-xs">
                {/* Drug Profile */}
                <div className="rounded-xl bg-background p-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-ink capitalize text-sm">
                      {selectedEffectivenessMed.projection.genericName}
                    </span>
                    <div className="text-[11px] text-ink-muted">
                      {selectedEffectivenessMed.projection.clinicalClass}
                    </div>
                  </div>
                  <span
                    className={`rounded px-2.5 py-1 font-bold text-[10px] ${
                      selectedEffectivenessMed.projection.therapeuticStatus === "OPTIMAL_THERAPEUTIC"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {selectedEffectivenessMed.projection.therapeuticStatus.replace("_", " ")}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line p-3">
                    <span className="text-ink-muted text-[10px] uppercase font-bold">Half-Life (t½)</span>
                    <div className="text-base font-black text-ink mt-0.5">
                      {selectedEffectivenessMed.projection.halfLifeHours} Hours
                    </div>
                  </div>
                  <div className="rounded-xl border border-line p-3">
                    <span className="text-ink-muted text-[10px] uppercase font-bold">Time to Steady State</span>
                    <div className="text-base font-black text-ink mt-0.5">
                      {selectedEffectivenessMed.projection.hoursToSteadyState} Hours
                    </div>
                  </div>
                  <div className="rounded-xl border border-line p-3">
                    <span className="text-ink-muted text-[10px] uppercase font-bold">Days on Regimen</span>
                    <div className="text-base font-black text-ink mt-0.5">
                      {selectedEffectivenessMed.projection.currentDaysOnRegimen} Days
                    </div>
                  </div>
                  <div className="rounded-xl border border-line p-3">
                    <span className="text-ink-muted text-[10px] uppercase font-bold">Logged Adherence</span>
                    <div className="text-base font-black text-primary mt-0.5">
                      {selectedEffectivenessMed.projection.loggedAdherenceRate}%
                    </div>
                  </div>
                </div>

                {/* Steady State Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ink">Steady-State Plasma Attainment:</span>
                    <span className="text-primary font-bold">
                      {selectedEffectivenessMed.projection.percentSteadyStateAchieved}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${selectedEffectivenessMed.projection.percentSteadyStateAchieved}%` }}
                    />
                  </div>
                </div>

                {/* 24-Hour Simulation Curve Sparkline / Table */}
                <div className="space-y-2 rounded-xl border border-line p-3 bg-surface">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink block">
                    24-Hour Steady-State Concentration Simulation
                  </span>
                  <div className="grid grid-cols-6 gap-1 text-[10px] text-center font-mono">
                    {selectedEffectivenessMed.projection.simulationCurve?.slice(0, 6).map((pt: any) => (
                      <div key={pt.hour} className="rounded bg-background p-1.5 border border-line/50">
                        <div className="text-ink-muted font-bold">H+{pt.hour}</div>
                        <div className="font-bold text-ink mt-0.5">{pt.adherenceAdjustedConcentration}</div>
                        <div className="text-[9px] text-primary">mg/L</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-ink-muted italic">
                    Calculated via 1-compartment oral absorption model adjusted for your logged dosing adherence.
                  </p>
                </div>

                {/* Clinical Insights */}
                <div className="rounded-xl bg-background p-3 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-ink">
                    Clinical Insights:
                  </span>
                  <ul className="space-y-1 text-xs text-ink-muted">
                    {selectedEffectivenessMed.projection.clinicalInsights?.map((insight: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2 border-t border-line">
              <button
                onClick={() => setSelectedEffectivenessMed(null)}
                className="lif-btn-primary px-4 py-1.5 text-xs font-bold"
              >
                Close Projection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
