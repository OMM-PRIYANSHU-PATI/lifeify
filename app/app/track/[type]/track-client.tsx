"use client";

import { useState } from "react";
import { TriFactorQuiz } from "@/components/health/tri-factor-quiz";
import { SleepQuiz } from "@/components/health/quizzes/sleep-quiz";
import { RecoveryQuiz } from "@/components/health/quizzes/recovery-quiz";
import { MoodQuiz } from "@/components/health/quizzes/mood-quiz";

interface TrackClientProps {
  type: string;
  unit: string;
  initialValue: number;
  recentLogs: { id: string; value: number; startTime: Date | string }[];
}

export function TrackClient({ type, unit, initialValue, recentLogs }: TrackClientProps) {
  const [activeQuiz, setActiveQuiz] = useState<"specialized" | "hub" | null>(null);
  const [value, setValue] = useState(String(initialValue));
  const [logs, setLogs] = useState(recentLogs);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isSleep = type === "sleep";
  const isRecovery = type === "recovery";
  const isMood = type === "mood";
  const isTriFactor = isSleep || isRecovery || isMood;

  const quizMetadata = isSleep
    ? {
        title: "🌙 Gamified Sleep Chrono-Quiz",
        badge: "+25 XP",
        desc: "Never guess hours! Inactive or variable schedule? We infer actual sleep stages, circadian efficiency, and sleep debt through 7 intuitive signals.",
        buttonText: "Play Sleep Quest 🌙",
      }
    : isRecovery
    ? {
        title: "💚 Autonomic Recovery & Readiness Quest",
        badge: "+25 XP",
        desc: "Estimate autonomic parasympathetic recharge, body soreness zones, and strain capacity without needing an expensive wearable.",
        buttonText: "Play Recovery Quest 💚",
      }
    : isMood
    ? {
        title: "☀️ Mind & Mood Radar",
        badge: "+25 XP",
        desc: "Explore your cognitive clarity, social battery, and allostatic stress index through quick scenario cards.",
        buttonText: "Play Mood Radar ☀️",
      }
    : null;

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: Number(value), unit }),
      });
      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [data.log, ...prev]);
        setMessage(`Logged ${value} ${unit} successfully!`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg border border-primary/30 bg-primary-soft/50 p-4 text-xs font-semibold text-primary-dark">
          {message}
        </div>
      )}

      {isTriFactor && quizMetadata && (
        <div className="rounded-2xl border border-primary/30 bg-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🎮</span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-ink">{quizMetadata.title}</h4>
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-extrabold text-primary-dark">
                  {quizMetadata.badge}
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">
                {quizMetadata.desc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveQuiz(activeQuiz === "specialized" ? null : "specialized")}
              className="lif-btn-primary py-2 px-4 text-xs font-bold whitespace-nowrap"
            >
              {activeQuiz === "specialized" ? "Hide Quiz ✕" : quizMetadata.buttonText}
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
      )}

      {activeQuiz === "specialized" && isSleep && (
        <div className="animate-slideUp">
          <SleepQuiz onDone={() => setActiveQuiz(null)} variant="inline" />
        </div>
      )}

      {activeQuiz === "specialized" && isRecovery && (
        <div className="animate-slideUp">
          <RecoveryQuiz onDone={() => setActiveQuiz(null)} variant="inline" />
        </div>
      )}

      {activeQuiz === "specialized" && isMood && (
        <div className="animate-slideUp">
          <MoodQuiz onDone={() => setActiveQuiz(null)} variant="inline" />
        </div>
      )}

      {activeQuiz === "hub" && (
        <div className="animate-slideUp">
          <TriFactorQuiz onDone={() => setActiveQuiz(null)} variant="inline" />
        </div>
      )}

      <div className="lif-card space-y-4">
        <h3 className="font-bold text-ink capitalize">
          {isTriFactor ? `Or Log ${type.replace(/_/g, " ")} Manually` : `Log ${type.replace(/_/g, " ")}`}
        </h3>
        <form onSubmit={handleLog} className="flex gap-3 text-xs items-end">
          <div className="flex-1">
            <label className="block mb-1 font-medium text-ink-soft">Enter Reading ({unit})</label>
            <input
              type="number"
              step="any"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="lif-input w-full font-bold text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="lif-btn-primary py-2.5 px-6 font-semibold"
          >
            {loading ? "Saving..." : "Save Log"}
          </button>
        </form>
      </div>

      <div className="lif-card space-y-3">
        <h3 className="font-bold text-sm text-ink">Recent Logs</h3>
        {logs.length === 0 ? (
          <p className="text-xs text-ink-muted py-4 text-center">No logs recorded yet.</p>
        ) : (
          <div className="divide-y divide-line/60 text-xs">
            {logs.map((l) => (
              <div key={l.id} className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-primary-dark">{l.value} {unit}</span>
                <span className="text-ink-muted text-[11px]">{new Date(l.startTime).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
