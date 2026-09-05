"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SideEffectOption {
  key: string;
  emoji: string;
  label: string;
  isNormal?: boolean;
}

const SIDE_EFFECT_OPTIONS: SideEffectOption[] = [
  { key: "normal", emoji: "😊", label: "Feeling Good", isNormal: true },
  { key: "nausea", emoji: "🤢", label: "Nausea" },
  { key: "dizziness", emoji: "😵", label: "Dizziness / Vertigo" },
  { key: "headache", emoji: "🤕", label: "Headache" },
  { key: "fatigue", emoji: "😴", label: "Drowsiness" },
  { key: "rash", emoji: "🔴", label: "Skin Rash / Itch" },
  { key: "palpitations", emoji: "⚡", label: "Rapid Heartbeat" },
  { key: "stomach", emoji: "🥣", label: "Gastric Upset" },
];

export interface SideEffectFormProps {
  medicationName: string;
  doseId?: string;
  onSubmit: (data: {
    symptomKey: string;
    severity: number;
    notes?: string;
    onsetMinutes?: number;
  }) => Promise<void> | void;
  onCancel?: () => void;
  className?: string;
}

export function SideEffectForm({
  medicationName,
  onSubmit,
  onCancel,
  className,
}: SideEffectFormProps) {
  const [selected, setSelected] = useState<SideEffectOption | null>(null);
  const [severity, setSeverity] = useState<number>(1);
  const [onset, setOnset] = useState<string>("30");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    setSubmitting(true);
    try {
      await onSubmit({
        symptomKey: selected.key,
        severity: selected.isNormal ? 0 : severity,
        notes: notes.trim() || undefined,
        onsetMinutes: selected.isNormal ? 0 : parseInt(onset, 10) || 30,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className={cn("p-6 text-center space-y-3", className)}>
        <span className="text-4xl" aria-hidden="true">
          ✅
        </span>
        <h4 className="font-bold text-ink text-base">Check-In Recorded</h4>
        <p className="text-xs text-ink-soft max-w-sm mx-auto">
          Thank you. Your post-dose observation for <strong>{medicationName}</strong> has been logged to your timeline and clinical record.
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("space-y-5 p-6", className)}>
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Post-Dose Journal
          </span>
          <Badge tone="neutral">Adverse Reaction Log</Badge>
        </div>
        <h3 className="text-base font-bold text-ink tracking-tight mt-1">
          How do you feel after {medicationName}?
        </h3>
        <p className="text-xs text-ink-soft mt-0.5">
          Step 1: Select your physical response to detect any emerging drug interactions or sensitivities.
        </p>
      </div>

      {/* Step 1: Emoji Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SIDE_EFFECT_OPTIONS.map((opt) => {
          const isSelected = selected?.key === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelected(opt)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all select-none",
                isSelected
                  ? "border-primary bg-primary-soft text-primary-dark font-bold shadow-xs scale-102"
                  : "border-line bg-surface hover:bg-surface-subtle text-ink"
              )}
            >
              <span className="text-2xl mb-1" aria-hidden="true">
                {opt.emoji}
              </span>
              <span className="text-xs font-semibold">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step 2: Progressive Disclosure if an adverse symptom is selected */}
      {selected && !selected.isNormal && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-line/60 animate-fadeIn">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink-soft block">
              Severity Level ({severity}/5):{" "}
              <span className="text-ink font-bold">
                {severity === 1
                  ? "Mild (Noticeable but does not affect routine)"
                  : severity === 2
                  ? "Moderate (Uncomfortable, slowing down activity)"
                  : severity === 3
                  ? "Significant (Cannot perform usual tasks)"
                  : severity === 4
                  ? "Severe (Need immediate rest)"
                  : "Extreme / Acute"}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-soft block mb-1">
                Onset (Time after dose)
              </label>
              <select
                value={onset}
                onChange={(e) => setOnset(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink focus-visible:outline-none focus-visible:border-primary"
              >
                <option value="15">Within 15 minutes</option>
                <option value="30">Within 30 minutes</option>
                <option value="60">About 1 hour later</option>
                <option value="120">2+ hours later</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-soft block mb-1">
                Additional Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. taken with empty stomach"
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink focus-visible:outline-none focus-visible:border-primary"
              >
              </input>
            </div>
          </div>

          {/* Clinical safety note */}
          <div className="rounded-xl bg-crisis-soft/50 border border-crisis/20 p-3 text-xs text-crisis flex items-start gap-2">
            <span className="text-base" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <p className="font-bold">Clinical Guidance</p>
              <p className="mt-0.5 text-[11px] opacity-90 leading-relaxed">
                If you experience shortness of breath, sudden facial swelling, or chest constriction, please call emergency services (112 / 911) or your doctor immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="lif-btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="lif-btn-primary py-1.5 px-4 text-xs font-bold"
            >
              {submitting ? "Logging…" : "Record Adverse Event"}
            </button>
          </div>
        </form>
      )}

      {/* If feeling good, single tap to submit */}
      {selected && selected.isNormal && (
        <div className="flex items-center justify-end gap-2 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="lif-btn-secondary py-1.5 px-3 text-xs"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="lif-btn-primary py-1.5 px-4 text-xs font-bold"
          >
            {submitting ? "Saving…" : "Save Well-Being Check-in"}
          </button>
        </div>
      )}
    </Card>
  );
}
