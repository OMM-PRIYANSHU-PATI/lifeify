"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SleepQuiz } from "@/components/health/quizzes/sleep-quiz";
import { RecoveryQuiz } from "@/components/health/quizzes/recovery-quiz";
import { MoodQuiz } from "@/components/health/quizzes/mood-quiz";
import { evaluateLightningQuiz, LightningQuizAnswers } from "@/lib/rules/tri-factor-quiz";
import { logTriFactorQuiz } from "@/lib/actions/logs";

type ActiveQuiz = "hub" | "sleep" | "recovery" | "mood" | "lightning";

interface TriFactorQuizProps {
  onDone?: () => void;
  variant?: "modal" | "inline";
  initialQuiz?: ActiveQuiz;
}

export function TriFactorQuiz({
  onDone,
  variant = "inline",
  initialQuiz = "hub",
}: TriFactorQuizProps) {
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz>(initialQuiz);

  if (activeQuiz === "sleep") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setActiveQuiz("hub")}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1 mb-1"
        >
          ← Back to Quiz Selection Hub
        </button>
        <SleepQuiz onDone={onDone} variant={variant} />
      </div>
    );
  }

  if (activeQuiz === "recovery") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setActiveQuiz("hub")}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1 mb-1"
        >
          ← Back to Quiz Selection Hub
        </button>
        <RecoveryQuiz onDone={onDone} variant={variant} />
      </div>
    );
  }

  if (activeQuiz === "mood") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setActiveQuiz("hub")}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1 mb-1"
        >
          ← Back to Quiz Selection Hub
        </button>
        <MoodQuiz onDone={onDone} variant={variant} />
      </div>
    );
  }

  if (activeQuiz === "lightning") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setActiveQuiz("hub")}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1 mb-1"
        >
          ← Back to Quiz Selection Hub
        </button>
        <LightningQuizStandalone onDone={onDone} variant={variant} />
      </div>
    );
  }

  // QUIZ SELECTION HUB
  return (
    <div
      className={`w-full rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-sm space-y-5 animate-fadeIn ${
        variant === "inline" ? "max-w-2xl mx-auto" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-line/60 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
            <span>🎮</span> Health Quiz & Predictor Hub
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Choose a dedicated assessment for Sleep, Recovery, Mood, or a quick 60-second pulse.
          </p>
        </div>
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-extrabold text-primary-dark shrink-0">
          Earn +25 XP
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* 1. SLEEP QUIZ */}
        <button
          type="button"
          onClick={() => setActiveQuiz("sleep")}
          className="group flex flex-col justify-between rounded-2xl border border-indigo-500/30 bg-linear-to-b from-indigo-950/20 to-surface p-4 text-left transition-all hover:border-indigo-500 hover:scale-101 shadow-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-2xl">
                🌙
              </span>
              <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-extrabold text-indigo-400">
                +25 XP · Dedicated
              </span>
            </div>
            <h3 className="text-sm font-black text-ink group-hover:text-indigo-400 transition">
              Sleep Chrono-Quiz
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Infers sleep hours, efficiency %, slow-wave deep sleep, and sleep debt without guessing hours.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-400">
            Start Sleep Quiz →
          </span>
        </button>

        {/* 2. RECOVERY QUIZ */}
        <button
          type="button"
          onClick={() => setActiveQuiz("recovery")}
          className="group flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-linear-to-b from-emerald-950/20 to-surface p-4 text-left transition-all hover:border-emerald-500 hover:scale-101 shadow-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl">
                💚
              </span>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">
                +25 XP · Dedicated
              </span>
            </div>
            <h3 className="text-sm font-black text-ink group-hover:text-emerald-400 transition">
              Autonomic Recovery Quiz
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Evaluates muscle soreness zones (traps, lower back, legs), vagal tone, and optimal day strain.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
            Start Recovery Quiz →
          </span>
        </button>

        {/* 3. MOOD QUIZ */}
        <button
          type="button"
          onClick={() => setActiveQuiz("mood")}
          className="group flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-linear-to-b from-amber-950/20 to-surface p-4 text-left transition-all hover:border-amber-500 hover:scale-101 shadow-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-2xl">
                🙂
              </span>
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-400">
                +25 XP · Dedicated
              </span>
            </div>
            <h3 className="text-sm font-black text-ink group-hover:text-amber-400 transition">
              Mindset & Mood Radar
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Analyzes emotional valence, cognitive clarity, stress index (0–100), and social battery.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-400">
            Start Mood Quiz →
          </span>
        </button>

        {/* 4. LIGHTNING PULSE */}
        <button
          type="button"
          onClick={() => setActiveQuiz("lightning")}
          className="group flex flex-col justify-between rounded-2xl border border-primary/30 bg-linear-to-b from-primary-soft/20 to-surface p-4 text-left transition-all hover:border-primary hover:scale-101 shadow-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-2xl">
                ⚡
              </span>
              <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-extrabold text-primary-dark">
                +15 XP · Fast 60s
              </span>
            </div>
            <h3 className="text-sm font-black text-ink group-hover:text-primary-dark transition">
              Lightning Tri-Factor
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Fast 3-card pulse to predict Sleep, Recovery, and Mood all together in under 60 seconds.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-dark">
            Launch Lightning Pulse →
          </span>
        </button>
      </div>
    </div>
  );
}

// Standalone Lightning Pulse
function LightningQuizStandalone({
  onDone,
  variant,
}: {
  onDone?: () => void;
  variant?: "modal" | "inline";
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState<LightningQuizAnswers>({
    nightFeeling: "normal_rest",
    morningEnergy: "steady_baseline",
    mindsetAura: "calm_grounded",
  });

  const result = evaluateLightningQuiz(answers);

  const handleSave = () => {
    startTransition(async () => {
      const res = await logTriFactorQuiz({
        sleepHours: result.sleepHours,
        sleepQuality: result.sleepQuality,
        moodScore: result.moodScore,
        moodValence: result.moodValence,
        recoveryScore: result.recoveryScore,
        recoveryStatus: result.recoveryStatus,
      });

      if (res.ok) {
        setCompleted(true);
        router.refresh();
        if (onDone) setTimeout(onDone, 1600);
      }
    });
  };

  if (completed) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center space-y-4 animate-fadeIn">
        <span className="text-3xl">🎉</span>
        <h3 className="text-lg font-black text-ink">Lightning Pulse Saved!</h3>
        <p className="text-xs text-ink-muted">All 3 metrics updated in your dashboard (+15 XP).</p>
        <button onClick={() => onDone?.()} className="lif-btn-primary py-2 px-6 text-xs font-bold">
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-line/60 pb-2">
        <span className="text-xs font-bold text-ink flex items-center gap-1.5">
          <span>⚡</span> Lightning Pulse · Step {step} of 3
        </span>
        <span className="text-[10px] text-primary-dark font-extrabold bg-primary-soft px-2 py-0.5 rounded-full">
          +15 XP
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-ink">How did you sleep last night?</h3>
          <div className="grid gap-2">
            {[
              { id: "slept_like_rock", emoji: "🪨", label: "Slept like a rock", desc: "Deep and uninterrupted" },
              { id: "normal_rest", emoji: "🌙", label: "Normal steady rest", desc: "Standard restful night" },
              { id: "tossed_turned", emoji: "🌀", label: "Tossed & turned", desc: "Restless, wakeful night" },
              { id: "barely_slept", emoji: "⚡", label: "Barely slept / rough", desc: "Short or broken rest" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setAnswers((p) => ({ ...p, nightFeeling: o.id as any }));
                  setStep(2);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                  answers.nightFeeling === o.id ? "border-primary bg-primary-soft/30" : "border-line hover:bg-surface-subtle"
                }`}
              >
                <span className="text-2xl">{o.emoji}</span>
                <div>
                  <span className="text-xs font-bold text-ink block">{o.label}</span>
                  <span className="text-[11px] text-ink-muted">{o.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-ink">How is your physical energy battery?</h3>
          <div className="grid gap-2">
            {[
              { id: "rocket_ready", emoji: "🚀", label: "Rocket ready (100%)", desc: "Prime vitality" },
              { id: "steady_baseline", emoji: "⚡", label: "Steady baseline", desc: "Good energy to move" },
              { id: "sluggish_coffee", emoji: "☕", label: "Need coffee first", desc: "Slow-moving startup" },
              { id: "exhausted_zombie", emoji: "🧟", label: "Running on 1%", desc: "Exhausted upon waking" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setAnswers((p) => ({ ...p, morningEnergy: o.id as any }));
                  setStep(3);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                  answers.morningEnergy === o.id ? "border-primary bg-primary-soft/30" : "border-line hover:bg-surface-subtle"
                }`}
              >
                <span className="text-2xl">{o.emoji}</span>
                <div>
                  <span className="text-xs font-bold text-ink block">{o.label}</span>
                  <span className="text-[11px] text-ink-muted">{o.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-ink">What is your emotional weather right now?</h3>
          <div className="grid gap-2">
            {[
              { id: "sunny_optimistic", emoji: "☀️", label: "Sunny & optimistic", desc: "Joyful and motivated" },
              { id: "calm_grounded", emoji: "🌤️", label: "Calm & centered", desc: "Peaceful and balanced" },
              { id: "anxious_stressed", emoji: "🌧️", label: "Anxious / busy mind", desc: "Tense with to-dos" },
              { id: "heavy_overwhelmed", emoji: "⛈️", label: "Heavy & exhausted", desc: "Low spirits" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setAnswers((p) => ({ ...p, mindsetAura: o.id as any }));
                  handleSave();
                }}
                disabled={pending}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                  answers.mindsetAura === o.id ? "border-primary bg-primary-soft/30" : "border-line hover:bg-surface-subtle"
                }`}
              >
                <span className="text-2xl">{o.emoji}</span>
                <div>
                  <span className="text-xs font-bold text-ink block">{o.label}</span>
                  <span className="text-[11px] text-ink-muted">{o.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
