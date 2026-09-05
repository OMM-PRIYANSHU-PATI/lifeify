"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  predictTriFactor,
  TriFactorQuizAnswers,
  WakeupVibe,
  SleepArchitecture,
  MoodWeather,
  PhysicalBattery,
  TriFactorPrediction,
} from "@/lib/rules/tri-factor-quiz";
import { logTriFactorQuiz } from "@/lib/actions/logs";

interface TriFactorQuizProps {
  onDone?: () => void;
  variant?: "modal" | "inline";
  initialStep?: number;
}

export function TriFactorQuiz({ onDone, variant = "inline" }: TriFactorQuizProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<TriFactorQuizAnswers>({
    wakeupVibe: "fresh",
    sleepArch: "solid",
    moodWeather: "breeze",
    physicalBattery: "battery_80",
  });

  const [prediction, setPrediction] = useState<TriFactorPrediction | null>(null);
  const [customHours, setCustomHours] = useState<number | null>(null);
  const [customMood, setCustomMood] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelect = <K extends keyof TriFactorQuizAnswers>(key: K, value: TriFactorQuizAnswers[K]) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    // Auto-advance with micro-delay for smooth feel
    setTimeout(() => {
      if (step < 4) {
        setStep(step + 1);
      } else {
        const pred = predictTriFactor(updated);
        setPrediction(pred);
        setCustomHours(pred.sleepHours);
        setCustomMood(pred.moodScore);
        setStep(5);
      }
    }, 220);
  };

  const computeAndShowPrediction = () => {
    const pred = predictTriFactor(answers);
    setPrediction(pred);
    setCustomHours(pred.sleepHours);
    setCustomMood(pred.moodScore);
    setStep(5);
  };

  const handleLockIn = () => {
    if (!prediction) return;
    setErrorMsg("");
    startTransition(async () => {
      const finalHours = customHours ?? prediction.sleepHours;
      const finalMood = customMood ?? prediction.moodScore;

      const res = await logTriFactorQuiz({
        sleepHours: finalHours,
        sleepQuality: prediction.sleepQuality,
        moodScore: finalMood,
        moodValence: prediction.moodValence,
        recoveryScore: prediction.recoveryScore,
        recoveryStatus: prediction.recoveryStatus,
        answers: {
          wakeupVibe: answers.wakeupVibe,
          sleepArch: answers.sleepArch,
          moodWeather: answers.moodWeather,
          physicalBattery: answers.physicalBattery,
        },
      });

      if (res.ok) {
        setCompleted(true);
        setSuccessMsg(res.message);
        router.refresh();
        if (onDone) {
          setTimeout(onDone, 1600);
        }
      } else {
        setErrorMsg(res.error ?? "Failed to log metrics");
      }
    });
  };

  return (
    <div
      className={`relative w-full rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-sm transition-all ${
        variant === "inline" ? "max-w-2xl mx-auto" : ""
      }`}
    >
      {/* Top Gamification Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-line/60">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-base" aria-hidden="true">
            🔥
          </span>
          <div>
            <span className="text-xs font-bold text-ink">Tri-Factor Health Oracle</span>
            <span className="ml-1.5 inline-block rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-extrabold text-primary-dark">
              +20 XP
            </span>
          </div>
        </div>

        {step <= 4 && !completed && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-ink-muted">
              Step {step} of 4
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="mt-3 rounded-xl bg-crisis-soft px-3 py-2 text-xs font-medium text-crisis">
          {errorMsg}
        </p>
      )}

      {/* COMPLETED CELEBRATION STATE */}
      {completed ? (
        <div className="py-8 text-center space-y-4 animate-fadeIn">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
            ✨
          </div>
          <h3 className="text-xl font-extrabold text-ink">Tri-Factor Locked In!</h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            {successMsg || "Your Recovery, Mood, and Sleep metrics have been predicted and synchronized with your health profile."}
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-2 text-xs font-bold text-primary-dark">
            <span>🎯</span> +20 XP Awarded & Streak Extended
          </div>

          <div className="pt-2">
            <button
              onClick={() => onDone?.()}
              className="lif-btn-primary py-2 px-6 text-xs font-bold"
            >
              Continue to Dashboard →
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-4">
          {/* STEP 1: WAKEUP VIBE */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-dark">
                  Question 1 · Morning Vibe
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  How did your eyes open today? 🌅
                </h2>
                <p className="text-xs text-ink-muted">
                  Your waking sensation calibrates your autonomic recovery and sleep restfulness.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-1">
                {[
                  {
                    id: "rocket" as WakeupVibe,
                    emoji: "🚀",
                    title: "Supercharged & Recharged",
                    desc: "Woke up energized before the alarm, ready to roll!",
                    badge: "Peak Boost",
                  },
                  {
                    id: "fresh" as WakeupVibe,
                    emoji: "⚡",
                    title: "Fresh & Steady",
                    desc: "Smooth wake-up after natural sleep cycles.",
                    badge: "Optimal",
                  },
                  {
                    id: "coffee" as WakeupVibe,
                    emoji: "☕",
                    title: "Caffeine Seeker",
                    desc: "A bit slow-moving, need chai or coffee to boot up.",
                    badge: "Neutral",
                  },
                  {
                    id: "snooze" as WakeupVibe,
                    emoji: "🥱",
                    title: "Snooze Striker",
                    desc: "Hit snooze multiple times, heavy eyes, slow start.",
                    badge: "Tired",
                  },
                  {
                    id: "zombie" as WakeupVibe,
                    emoji: "🧟",
                    title: "Running on 1% Battery",
                    desc: "Exhausted upon waking, felt like only 2 hours.",
                    badge: "Drained",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("wakeupVibe", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.wakeupVibe === opt.id
                        ? "border-primary bg-primary-soft/40 shadow-xs"
                        : "border-line bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {opt.emoji}
                      </span>
                      <div>
                        <span className="block text-xs font-bold text-ink">{opt.title}</span>
                        <span className="block text-[11px] text-ink-muted">{opt.desc}</span>
                      </div>
                    </div>
                    <span className="rounded-md bg-surface-subtle px-2 py-0.5 text-[10px] font-semibold text-ink-soft shrink-0">
                      {opt.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SLEEP ARCHITECTURE */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-dark">
                  Question 2 · Sleep Architecture
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  What was your sleep journey like last night? 🌙
                </h2>
                <p className="text-xs text-ink-muted">
                  Estimates deep slow-wave sleep cycles and restorative REM phases.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-1">
                {[
                  {
                    id: "hyperspace" as SleepArchitecture,
                    emoji: "🌌",
                    title: "Deep Hyperspace (8.0 – 9.0 hrs)",
                    desc: "Seamless, deep, uninterrupted slumber with rich dreams.",
                    tag: "~8.5 hrs",
                  },
                  {
                    id: "solid" as SleepArchitecture,
                    emoji: "🌙",
                    title: "Solid Slumber (7.0 – 8.0 hrs)",
                    desc: "Good consistent rest, woke up maybe once or twice briefly.",
                    tag: "~7.5 hrs",
                  },
                  {
                    id: "screen_toss" as SleepArchitecture,
                    emoji: "📱",
                    title: "Screen & Toss (5.5 – 6.5 hrs)",
                    desc: "Late smartphone scrolling in bed, took time to drift off.",
                    tag: "~6.0 hrs",
                  },
                  {
                    id: "night_owl" as SleepArchitecture,
                    emoji: "🦉",
                    title: "Night Owl Strain (4.5 – 5.5 hrs)",
                    desc: "Late bedtime or disturbed night, felt short.",
                    tag: "~5.0 hrs",
                  },
                  {
                    id: "insomnia" as SleepArchitecture,
                    emoji: "⚡",
                    title: "Rough Insomnia (< 4.5 hrs)",
                    desc: "Interrupted, restless, or barely slept last night.",
                    tag: "< 4.5 hrs",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("sleepArch", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.sleepArch === opt.id
                        ? "border-primary bg-primary-soft/40 shadow-xs"
                        : "border-line bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {opt.emoji}
                      </span>
                      <div>
                        <span className="block text-xs font-bold text-ink">{opt.title}</span>
                        <span className="block text-[11px] text-ink-muted">{opt.desc}</span>
                      </div>
                    </div>
                    <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-dark shrink-0">
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MOOD WEATHER */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-dark">
                  Question 3 · Mental & Emotional Weather
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  What is your mental weather right now? 🌈
                </h2>
                <p className="text-xs text-ink-muted">
                  Emotional valence directly impacts autonomic nervous recovery and heart rate variability.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-1">
                {[
                  {
                    id: "radiant" as MoodWeather,
                    emoji: "☀️",
                    title: "Clear & Radiant (Score 5)",
                    desc: "Upbeat, confident, excited for what is ahead.",
                    aura: "High Optimism",
                  },
                  {
                    id: "breeze" as MoodWeather,
                    emoji: "🌤️",
                    title: "Gentle Breeze (Score 4)",
                    desc: "Calm, grounded, peaceful, and emotionally steady.",
                    aura: "Steady Calm",
                  },
                  {
                    id: "clouds" as MoodWeather,
                    emoji: "⛅",
                    title: "Scattered Clouds (Score 3)",
                    desc: "Okay, slightly stretched with a busy to-do list.",
                    aura: "Mild Load",
                  },
                  {
                    id: "rain" as MoodWeather,
                    emoji: "🌧️",
                    title: "Rainy Pressure (Score 2)",
                    desc: "Anxious, overwhelmed, irritated, or emotionally tense.",
                    aura: "Stress Alert",
                  },
                  {
                    id: "storm" as MoodWeather,
                    emoji: "⛈️",
                    title: "Thunder & Storm (Score 1)",
                    desc: "Deep emotional fatigue, feeling low, rough day.",
                    aura: "Low Bandwidth",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("moodWeather", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.moodWeather === opt.id
                        ? "border-primary bg-primary-soft/40 shadow-xs"
                        : "border-line bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {opt.emoji}
                      </span>
                      <div>
                        <span className="block text-xs font-bold text-ink">{opt.title}</span>
                        <span className="block text-[11px] text-ink-muted">{opt.desc}</span>
                      </div>
                    </div>
                    <span className="rounded-md bg-surface-subtle px-2 py-0.5 text-[10px] font-semibold text-ink-soft shrink-0">
                      {opt.aura}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PHYSICAL BATTERY */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-dark">
                  Question 4 · Physical Body Readiness
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  How does your physical body feel right now? 🔋
                </h2>
                <p className="text-xs text-ink-muted">
                  Measures muscular tone, tension, and readiness for physical strain.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-1">
                {[
                  {
                    id: "battery_100" as PhysicalBattery,
                    emoji: "⚡",
                    title: "100% Prime Battery",
                    desc: "Muscles feel springy, zero soreness, peak vitality.",
                    badge: "Prime",
                  },
                  {
                    id: "battery_80" as PhysicalBattery,
                    emoji: "🟢",
                    title: "80% High Capacity",
                    desc: "Normal bounce, ready for workout and full day activity.",
                    badge: "Solid",
                  },
                  {
                    id: "battery_55" as PhysicalBattery,
                    emoji: "🟡",
                    title: "55% Moderate Fatigue",
                    desc: "Slight heaviness in legs/shoulders, feeling previous days.",
                    badge: "Moderate",
                  },
                  {
                    id: "battery_35" as PhysicalBattery,
                    emoji: "🟠",
                    title: "35% Low Tank",
                    desc: "Achy, tight joints, heavy limbs, need stretching.",
                    badge: "Sore",
                  },
                  {
                    id: "battery_15" as PhysicalBattery,
                    emoji: "🔴",
                    title: "15% Critically Drained",
                    desc: "Total exhaustion, physical rest urgently needed.",
                    badge: "Depleted",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("physicalBattery", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.physicalBattery === opt.id
                        ? "border-primary bg-primary-soft/40 shadow-xs"
                        : "border-line bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {opt.emoji}
                      </span>
                      <div>
                        <span className="block text-xs font-bold text-ink">{opt.title}</span>
                        <span className="block text-[11px] text-ink-muted">{opt.desc}</span>
                      </div>
                    </div>
                    <span className="rounded-md bg-surface-subtle px-2 py-0.5 text-[10px] font-semibold text-ink-soft shrink-0">
                      {opt.badge}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={computeAndShowPrediction}
                  className="lif-btn-primary py-1.5 px-4 text-xs font-bold"
                >
                  Generate Predictions →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PREDICTION REVEAL & FINE-TUNING */}
          {step === 5 && prediction && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-[11px] font-extrabold text-primary-dark">
                  🔮 AI Oracle Prediction Unlocked
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-ink">
                  Your Tri-Factor Health Forecast
                </h2>
                <p className="text-xs text-ink-muted max-w-md mx-auto">
                  Computed from your waking pulse, sleep architecture, mental aura, and physical battery.
                </p>
              </div>

              {/* 3 PREDICTED CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. SLEEP */}
                <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-2 relative overflow-hidden shadow-xs">
                  <div className="text-2xl">🌙</div>
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                    Predicted Sleep
                  </span>
                  <div className="text-2xl font-black text-ink">
                    {customHours ?? prediction.sleepHours}{" "}
                    <span className="text-xs font-semibold text-ink-muted">hrs</span>
                  </div>
                  <span className="inline-block rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-dark">
                    {prediction.sleepQuality}% Quality
                  </span>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCustomHours((prev) =>
                          Math.max(3, Math.round(((prev ?? prediction.sleepHours) - 0.25) * 100) / 100)
                        )
                      }
                      className="h-6 w-6 rounded-md border border-line bg-surface text-xs font-bold text-ink hover:bg-surface-subtle"
                      title="Subtract 15 mins"
                    >
                      -
                    </button>
                    <span className="text-[10px] text-ink-muted">Tweak</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomHours((prev) =>
                          Math.min(12, Math.round(((prev ?? prediction.sleepHours) + 0.25) * 100) / 100)
                        )
                      }
                      className="h-6 w-6 rounded-md border border-line bg-surface text-xs font-bold text-ink hover:bg-surface-subtle"
                      title="Add 15 mins"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 2. MOOD */}
                <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-2 relative overflow-hidden shadow-xs">
                  <div className="text-2xl">
                    {customMood === 5
                      ? "☀️"
                      : customMood === 4
                      ? "🌤️"
                      : customMood === 3
                      ? "⛅"
                      : customMood === 2
                      ? "🌧️"
                      : "⛈️"}
                  </div>
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                    Predicted Mood
                  </span>
                  <div className="text-2xl font-black text-ink">
                    {customMood ?? prediction.moodScore}{" "}
                    <span className="text-xs font-semibold text-ink-muted">/ 5</span>
                  </div>
                  <span className="inline-block rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    {prediction.moodValence}
                  </span>
                  <div className="flex items-center justify-center gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCustomMood(m)}
                        className={`h-6 w-6 rounded-md text-[11px] font-bold transition ${
                          (customMood ?? prediction.moodScore) === m
                            ? "bg-primary text-white"
                            : "border border-line bg-surface text-ink-soft hover:bg-surface-subtle"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. RECOVERY */}
                <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-2 relative overflow-hidden shadow-xs">
                  <div className="text-2xl">💚</div>
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                    Recovery Index
                  </span>
                  <div className="text-2xl font-black text-ink">
                    {prediction.recoveryScore}%
                  </div>
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      prediction.recoveryScore >= 75
                        ? "bg-primary-soft text-primary-dark"
                        : prediction.recoveryScore >= 50
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "bg-crisis-soft text-crisis"
                    }`}
                  >
                    {prediction.recoveryStatusLabel}
                  </span>
                  <p className="text-[10px] text-ink-muted pt-1">Whoop / Oura calibrated</p>
                </div>
              </div>

              {/* ACTIONABLE CLINICAL ADVICE */}
              <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base" aria-hidden="true">
                    🎯
                  </span>
                  <span className="text-xs font-bold text-ink">
                    Today&apos;s Training & Energy Recommendation
                  </span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  {prediction.actionableAdvice}
                </p>
                <div className="pt-1 text-[11px] font-semibold text-primary-dark">
                  💡 Strategy: {prediction.suggestedFocus}
                </div>
              </div>

              {/* LOCK IN BUTTON */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Modify Answers
                </button>

                <button
                  type="button"
                  disabled={pending}
                  onClick={handleLockIn}
                  className="lif-btn-primary w-full sm:w-auto py-3 px-6 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>🎮</span>
                  <span>{pending ? "Locking In..." : "Lock In Tri-Factor (+20 XP)"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
