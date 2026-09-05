"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { TriFactorQuiz } from "@/components/health/tri-factor-quiz";
import { RecoveryQuiz } from "@/components/health/quizzes/recovery-quiz";

export function RecoveryClient() {
  const [activeQuiz, setActiveQuiz] = useState<"recovery" | "hub" | null>(null);
  const [activeProtocol, setActiveProtocol] = useState<"dengue" | "post_viral" | "post_op">("dengue");
  const [currentDay, setCurrentDay] = useState(4);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    fluidIntake: true,
    tempChecked: true,
    medsTaken: true,
    rested: false,
    noWarningSigns: true,
  });

  const protocols = {
    dengue: {
      name: "Dengue Recovery Protocol",
      duration: "14 Days",
      criticalPeriod: "Days 3 to 7 (Afebril / Critical Phase)",
      guidelines: [
        "Maintain 2.5–3.5L fluid intake (ORS, coconut water, lime juice).",
        "Monitor platelets and hematocrit as advised by doctor.",
        "Strictly avoid Aspirin / Ibuprofen / NSAIDs (use Paracetamol only if prescribed).",
        "Watch for warning signs: severe abdominal pain, persistent vomiting, mucosal bleeding.",
      ],
      milestones: [
        { day: "Days 1–3", title: "Febrile Phase", desc: "High fever, body ache, hydration focus" },
        { day: "Days 4–6", title: "Critical Phase", desc: "Temperature drops; monitor for plasma leakage & warning signs" },
        { day: "Days 7–14", title: "Convalescent Phase", desc: "Gradual recovery of appetite & platelet count normalization" },
      ],
    },
    post_viral: {
      name: "Post-Viral Fatigue & Recovery",
      duration: "21 Days",
      criticalPeriod: "Week 1 (Aggressive Rest)",
      guidelines: [
        "Pacing strategy: avoid the 'boom-and-bust' cycle.",
        "Gentle mobility exercises only after resting heart rate normalizes.",
        "Prioritize 8–9 hours of sleep with regular sleep routine.",
        "Anti-inflammatory nutrition rich in antioxidants and lean protein.",
      ],
      milestones: [
        { day: "Week 1", title: "Rest & Rehydrate", desc: "Minimize physical and cognitive exertion" },
        { day: "Week 2", title: "Gradual Re-entry", desc: "Light 10-min walks, monitor fatigue levels" },
        { day: "Week 3", title: "Reconditioning", desc: "Return to standard baseline activities" },
      ],
    },
    post_op: {
      name: "General Post-Op / Surgical Recovery",
      duration: "30 Days",
      criticalPeriod: "Days 1 to 5 (Wound Healing & Infection Guard)",
      guidelines: [
        "Keep surgical incision clean, dry, and dressed as advised.",
        "Follow pain management regimen on strict deterministic schedule.",
        "Early ambulation (short gentle walks) to prevent deep vein thrombosis.",
        "Report redness, discharge, sudden swelling, or calf pain immediately.",
      ],
      milestones: [
        { day: "Days 1–5", title: "Immediate Recovery", desc: "Incision care, pain control, light mobility" },
        { day: "Days 6–14", title: "Early Healing", desc: "Suture removal milestone, increased walking" },
        { day: "Days 15–30", title: "Functional Restoration", desc: "Strengthening without heavy lifting" },
      ],
    },
  };

  const selected = protocols[activeProtocol];

  const toggleCheck = (k: string) => {
    setChecklist((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink flex items-center gap-2">
          <span>💚</span>
          Recovery Protocols & Milestone Tracker
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Deterministic step-by-step recovery plans for acute post-illness or post-operative rehabilitation.
        </p>
      </div>

      {/* Daily Recovery & Tri-Factor Quiz Banner */}
      <div className="rounded-2xl border border-primary/30 bg-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">💚</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink">Autonomic Recovery & Readiness Quest</h3>
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-extrabold text-primary-dark">
                +25 XP
              </span>
            </div>
            <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">
              Estimate autonomic tone, muscle soreness zones, and physical strain capacity without guessing metrics.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveQuiz(activeQuiz === "recovery" ? null : "recovery")}
            className="lif-btn-primary py-2 px-4 text-xs font-bold whitespace-nowrap"
          >
            {activeQuiz === "recovery" ? "Hide Quiz ✕" : "Play Recovery Quest 💚"}
          </button>
          <button
            type="button"
            onClick={() => setActiveQuiz(activeQuiz === "hub" ? null : "hub")}
            className="lif-btn-secondary py-2 px-3 text-xs font-bold whitespace-nowrap"
            title="Open all health predictors"
          >
            {activeQuiz === "hub" ? "Close Hub" : "All Quizzes 🎯"}
          </button>
        </div>
      </div>

      {activeQuiz === "recovery" && (
        <div className="animate-slideUp">
          <RecoveryQuiz onDone={() => setActiveQuiz(null)} variant="inline" />
        </div>
      )}

      {activeQuiz === "hub" && (
        <div className="animate-slideUp">
          <TriFactorQuiz onDone={() => setActiveQuiz(null)} variant="inline" />
        </div>
      )}

      {/* Protocol Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {(Object.keys(protocols) as Array<keyof typeof protocols>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveProtocol(key)}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition ${
              activeProtocol === key
                ? "bg-primary text-white shadow-sm"
                : "bg-surface border border-line text-ink-soft hover:bg-background"
            }`}
          >
            {protocols[key].name}
          </button>
        ))}
      </div>

      {/* Protocol Overview Card */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-6 animate-slideUp">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="text-lg font-bold text-ink">{selected.name}</h2>
            <p className="text-xs text-crisis font-medium mt-0.5">
              High-vigilance window: {selected.criticalPeriod}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted font-semibold">Active Day:</span>
            <input
              type="number"
              min={1}
              max={30}
              value={currentDay}
              onChange={(e) => setCurrentDay(Number(e.target.value))}
              className="lif-input w-16 px-2 py-1 text-sm text-center font-bold"
            />
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-3">
            Deterministic Milestones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selected.milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-line bg-background space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary font-mono">
                    {m.day}
                  </span>
                  <span>📅</span>
                </div>
                <div className="font-semibold text-sm text-ink">{m.title}</div>
                <div className="text-xs text-ink-muted">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Guidelines */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2">
            Safety & Care Guidelines
          </h3>
          <ul className="space-y-2">
            {selected.guidelines.map((g, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-ink">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Daily Recovery Checklist */}
        <div className="p-4 bg-primary-soft border border-primary/20 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-primary-dark uppercase tracking-wider">
            Day {currentDay} Recovery Checklist
          </h3>
          <div className="space-y-2">
            {[
              { id: "fluidIntake", label: "Adequate hydration reached (at least 2.5L fluids)" },
              { id: "tempChecked", label: "Recorded temperature & vital signs" },
              { id: "medsTaken", label: "Completed scheduled recovery medications" },
              { id: "rested", label: "Achieved full physical bed rest without heavy exertion" },
              { id: "noWarningSigns", label: "Verified absence of red-flag symptoms" },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2.5 text-xs text-ink cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checklist[item.id] || false}
                  onChange={() => toggleCheck(item.id)}
                  className="rounded border-line text-primary focus:ring-primary w-4 h-4"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
