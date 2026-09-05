"use client";

import { useState } from "react";
import { createSleepPlanAction } from "@/lib/actions/sleep";
import { SleepHygieneChecklistItem } from "@/lib/rules/domains/sleep";

interface SleepPlanProps {
  plan: {
    targetDurationH: number;
    bedtime: string;
    wakeTime: string;
    caffeineCutoff: string;
    windDownMinutes: number;
    windDownStart: string;
    checklist: SleepHygieneChecklistItem[];
  } | null;
}

export function SleepClient({ plan }: SleepPlanProps) {
  const [showModal, setShowModal] = useState(!plan);
  const [wakeTime, setWakeTime] = useState("06:30");
  const [cycles, setCycles] = useState<4 | 5 | 6>(5);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createSleepPlanAction({
        wakeTime,
        cycles,
      });
      if (res.ok) setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Sleep & Circadian Rhythm</h1>
          <p className="text-sm text-ink-soft">
            90-minute sleep cycles, caffeine cutoffs, and evidence-based evening wind-down checklists.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="lif-btn-secondary px-3 py-1.5 text-xs font-semibold"
        >
          ⚙️ Adjust Sleep Schedule
        </button>
      </div>

      {plan ? (
        <div className="space-y-6">
          {/* Circadian Timeline Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="lif-card">
              <span className="text-xs font-semibold text-ink-muted">Caffeine Cut-off</span>
              <p className="mt-1 text-2xl font-bold text-amber-600">{plan.caffeineCutoff}</p>
              <span className="text-[11px] text-ink-muted">9h prior to sleep</span>
            </div>
            <div className="lif-card">
              <span className="text-xs font-semibold text-ink-muted">Wind-down Begins</span>
              <p className="mt-1 text-2xl font-bold text-indigo-600">{plan.windDownStart}</p>
              <span className="text-[11px] text-ink-muted">Screens off, dim lighting</span>
            </div>
            <div className="lif-card">
              <span className="text-xs font-semibold text-ink-muted">Target Bedtime</span>
              <p className="mt-1 text-2xl font-bold text-primary-dark">{plan.bedtime}</p>
              <span className="text-[11px] text-ink-muted">Includes 15m latency</span>
            </div>
            <div className="lif-card">
              <span className="text-xs font-semibold text-ink-muted">Wake Time</span>
              <p className="mt-1 text-2xl font-bold text-ink">{plan.wakeTime}</p>
              <span className="text-[11px] text-ink-muted">{plan.targetDurationH} hours ({plan.targetDurationH / 1.5} cycles)</span>
            </div>
          </div>

          {/* Sleep Hygiene Checklist */}
          <div className="lif-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-ink">Tonight&apos;s Sleep Hygiene Checklist</h3>
                <p className="text-xs text-ink-muted">Complete these environmental and behavioral habits for restorative slow-wave sleep.</p>
              </div>
              <span className="text-xs font-bold text-primary-dark">
                {Object.values(checkedItems).filter(Boolean).length} / {plan.checklist.length} Completed
              </span>
            </div>

            <div className="divide-y divide-line/60">
              {plan.checklist.map((item) => (
                <label
                  key={item.id}
                  className="py-3 flex items-start gap-3 cursor-pointer select-none text-xs"
                >
                  <input
                    type="checkbox"
                    checked={!!checkedItems[item.id]}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-0.5 h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${checkedItems[item.id] ? "line-through text-ink-muted" : "text-ink"}`}>
                      {item.label}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider text-ink-muted">
                      {item.category} • {item.importance}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="lif-card text-center py-12 text-sm text-ink-muted">
          No sleep schedule active. Click &quot;Adjust Sleep Schedule&quot; to compute optimal circadian timing.
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="lif-card w-full max-w-sm space-y-4">
            <h3 className="font-bold text-ink">Configure Sleep & Wake Target</h3>
            <form onSubmit={handleGenerate} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-ink-soft">Target Wake-Up Time</label>
                <input
                  type="time"
                  required
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="lif-input w-full text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-ink-soft">Sleep Cycles</label>
                <select
                  value={cycles}
                  onChange={(e) => setCycles(Number(e.target.value) as 4 | 5 | 6)}
                  className="lif-input w-full"
                >
                  <option value={4}>4 Cycles (6.0 Hours) — Minimum</option>
                  <option value={5}>5 Cycles (7.5 Hours) — Recommended</option>
                  <option value={6}>6 Cycles (9.0 Hours) — Recovery / High Strain</option>
                </select>
                <p className="text-[11px] text-ink-muted mt-1">
                  Each sleep cycle lasts approximately 90 minutes. Waking at the end of a cycle avoids sleep inertia.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="lif-btn-primary flex-1 py-2">
                  {loading ? "Calculating..." : "Save Schedule"}
                </button>
                {plan && (
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="lif-btn-secondary py-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
