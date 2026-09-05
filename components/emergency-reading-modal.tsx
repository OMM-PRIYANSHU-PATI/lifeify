"use client";

import { useEffect, useRef, useState } from "react";
import { EmergencyEvaluationResult } from "@/lib/rules/emergency-triage";

interface EmergencyReadingModalProps {
  evaluation: EmergencyEvaluationResult | null;
  isOpen: boolean;
  onAcknowledge: () => void;
}

export function EmergencyReadingModal({
  evaluation,
  isOpen,
  onAcknowledge,
}: EmergencyReadingModalProps) {
  const [acknowledgedConfirmed, setAcknowledgedConfirmed] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isOpen && evaluation?.hasEmergency) {
      setAcknowledgedConfirmed(false);
      // Play pulsating warning tone via Web Audio API
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
          osc.frequency.setValueAtTime(440, ctx.currentTime + 0.3); // A4
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
        }
      } catch (err) {
        // Audio auto-play might be restricted until user interacts
      }
    }
  }, [isOpen, evaluation]);

  if (!isOpen || !evaluation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-4 border-red-600 bg-surface shadow-2xl">
        {/* Urgent Header */}
        <div className="bg-red-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl text-red-600 font-extrabold animate-bounce">
              ⚠️
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase">
                {evaluation.hasEmergency ? "CRITICAL EMERGENCY VITAL ALERT" : "URGENT CLINICAL WARNING"}
              </h2>
              <p className="text-xs text-red-100 font-medium">
                {evaluation.hasEmergency
                  ? "Life-threatening vital signs detected. Immediate action required."
                  : "Significantly abnormal reading requiring medical review."}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Alerts List */}
          <div className="space-y-3">
            {evaluation.alerts.map((alert, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-left dark:bg-red-950/40 dark:border-red-900"
              >
                <div className="flex items-center justify-between font-bold text-red-700 dark:text-red-300">
                  <span className="text-sm tracking-wide">{alert.vitalType.replace("_", " ")}</span>
                  <span className="rounded-md bg-red-600 px-2.5 py-0.5 text-xs text-white">
                    {alert.measuredValue}
                  </span>
                </div>
                <p className="mt-1 text-xs text-red-900 dark:text-red-200 font-medium">
                  {alert.clinicalMessage}
                </p>
                <div className="mt-2 rounded-lg bg-white/80 p-2 text-xs font-semibold text-ink dark:bg-black/40">
                  <span className="text-red-600 font-bold">Action: </span>
                  {alert.immediateAction}
                </div>
              </div>
            ))}
          </div>

          {/* 1-Tap SOS Emergency Dialers */}
          <div className="rounded-xl border border-line bg-background p-4 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">
              1-Tap Emergency Response Helplines (India)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:112"
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-md hover:bg-red-700 active:scale-95 transition-all"
              >
                <span>🚨</span> Call 112 (National)
              </a>
              <a
                href="tel:108"
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white shadow-md hover:bg-orange-700 active:scale-95 transition-all"
              >
                <span>🚑</span> Call 108 (Ambulance)
              </a>
            </div>
            <div className="mt-2">
              <a
                href="tel:102"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink underline"
              >
                <span>📞</span> Or call 102 (Maternity / Child Ambulance)
              </a>
            </div>
          </div>

          {/* Safety Checkbox */}
          <div className="rounded-lg border border-line p-3 bg-surface">
            <label className="flex items-start gap-3 text-xs text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acknowledgedConfirmed}
                onChange={(e) => setAcknowledgedConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line text-red-600 focus:ring-red-500"
              />
              <span className="font-medium">
                I understand this reading is critically abnormal and I am actively taking steps to contact medical professionals or emergency services.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line bg-surface px-6 py-3 flex justify-end">
          <button
            type="button"
            disabled={!acknowledgedConfirmed}
            onClick={onAcknowledge}
            className="rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-surface disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            Acknowledge & Close Alert
          </button>
        </div>
      </div>
    </div>
  );
}
