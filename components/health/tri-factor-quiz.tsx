"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  predictFullHealthMatrix,
  MultiQuestionQuizAnswers,
  BedtimeWindow,
  DriftOffSpeed,
  NightWakeups,
  WakeupTrigger,
  BodyMobility,
  AutonomicBreath,
  BootupMindset,
  CognitiveClarity,
  SocialBattery,
  FullHealthMatrixPrediction,
} from "@/lib/rules/tri-factor-quiz";
import { logTriFactorQuiz } from "@/lib/actions/logs";

interface TriFactorQuizProps {
  onDone?: () => void;
  variant?: "modal" | "inline";
}

export function TriFactorQuiz({ onDone, variant = "inline" }: TriFactorQuizProps) {
  const router = useRouter();
  const [qIndex, setQIndex] = useState<number>(1); // 1 to 9 questions, 10 is reveal
  const [answers, setAnswers] = useState<MultiQuestionQuizAnswers>({
    bedtimeWindow: "around_11",
    driftOffSpeed: "peaceful",
    nightWakeups: "one_brief",
    wakeupTrigger: "gentle_alarm",
    bodyMobility: "steady_normal",
    autonomicBreath: "steady_even",
    bootupMindset: "calm_grounded",
    cognitiveClarity: "steady_coffee",
    socialBattery: "selective_peace",
  });

  const [prediction, setPrediction] = useState<FullHealthMatrixPrediction | null>(null);
  const [customHours, setCustomHours] = useState<number | null>(null);
  const [customMood, setCustomMood] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Live preview calculation
  const liveMatrix = predictFullHealthMatrix(answers);

  const currentRound = qIndex <= 3 ? 1 : qIndex <= 6 ? 2 : qIndex <= 9 ? 3 : 4;
  const roundTitles: Record<number, { name: string; emoji: string; subtitle: string }> = {
    1: { name: "The Night Passage", emoji: "🌙", subtitle: "Reconstructing your sleep architecture" },
    2: { name: "The Morning Boot", emoji: "🌅", subtitle: "Measuring awakening physiology & muscular tone" },
    3: { name: "Mind & Battery Radar", emoji: "🧠", subtitle: "Assessing mental bandwidth & emotional weather" },
    4: { name: "Health Matrix Reveal", emoji: "🔮", subtitle: "Multi-parameter biometric forecast" },
  };

  const handleSelect = <K extends keyof MultiQuestionQuizAnswers>(
    key: K,
    value: MultiQuestionQuizAnswers[K]
  ) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    // Auto advance with micro-delay for smooth gaming feel
    setTimeout(() => {
      if (qIndex < 9) {
        setQIndex(qIndex + 1);
      } else {
        const pred = predictFullHealthMatrix(updated);
        setPrediction(pred);
        setCustomHours(pred.sleepHours);
        setCustomMood(pred.moodScore);
        setQIndex(10);
      }
    }, 220);
  };

  const handleLockIn = () => {
    const finalPred = prediction ?? liveMatrix;
    setErrorMsg("");
    startTransition(async () => {
      const finalHours = customHours ?? finalPred.sleepHours;
      const finalMood = customMood ?? finalPred.moodScore;

      const res = await logTriFactorQuiz({
        sleepHours: finalHours,
        sleepQuality: finalPred.sleepQuality,
        moodScore: finalMood,
        moodValence: finalPred.moodValence,
        recoveryScore: finalPred.recoveryScore,
        recoveryStatus: finalPred.recoveryStatus,
        answers: {
          bedtimeWindow: answers.bedtimeWindow,
          driftOffSpeed: answers.driftOffSpeed,
          nightWakeups: answers.nightWakeups,
          wakeupTrigger: answers.wakeupTrigger,
          bodyMobility: answers.bodyMobility,
          autonomicBreath: answers.autonomicBreath,
          bootupMindset: answers.bootupMindset,
          cognitiveClarity: answers.cognitiveClarity,
          socialBattery: answers.socialBattery,
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
      {/* Top Arcade Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line/60">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-lg" aria-hidden="true">
            🔥
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-ink">Tri-Factor Health Matrix</span>
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-extrabold text-primary-dark">
                +35 XP
              </span>
            </div>
            <span className="text-[11px] text-ink-muted">
              Round {currentRound} of 3 · {roundTitles[currentRound]?.name}
            </span>
          </div>
        </div>

        {qIndex <= 9 && !completed && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-ink-soft">
              {qIndex}/9
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(qIndex / 9) * 100}%` }}
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

      {/* COMPLETED CELEBRATION */}
      {completed ? (
        <div className="py-8 text-center space-y-4 animate-fadeIn">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
            🎉
          </div>
          <h3 className="text-xl font-black text-ink">Matrix Calibrated & Synchronized!</h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            {successMsg || "Your complete biometric matrix has been recorded. Recovery, Mood, and Sleep streams are fully synced."}
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-2 text-xs font-bold text-primary-dark">
            <span>🎯</span> +35 XP Awarded · Wellness Streak Extended
          </div>

          <div className="pt-2">
            <button
              onClick={() => onDone?.()}
              className="lif-btn-primary py-2.5 px-6 text-xs font-bold"
            >
              Continue to Dashboard →
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-4">
          {/* ROUND 1: THE NIGHT PASSAGE */}
          {qIndex === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">
                  Question 1 · Bedtime Window
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  Roughly what time was your head on the pillow? 🛏️
                </h2>
                <p className="text-xs text-ink-muted">
                  No need for exact minutes—this establishes your circadian baseline.
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  {
                    id: "pre_1030" as BedtimeWindow,
                    emoji: "🦉",
                    title: "Early Haven (9:30 – 10:30 PM)",
                    desc: "Tucked in early, aligned with natural melatonin peak.",
                    tag: "Deep Circadian",
                  },
                  {
                    id: "around_11" as BedtimeWindow,
                    emoji: "🌙",
                    title: "Standard Rhythm (10:30 – 11:30 PM)",
                    desc: "Classic bedtime, balanced wind-down window.",
                    tag: "Balanced",
                  },
                  {
                    id: "midnight" as BedtimeWindow,
                    emoji: "📱",
                    title: "Midnight Drift (11:30 PM – 12:45 AM)",
                    desc: "Slightly delayed, late scrolling or finishing chores.",
                    tag: "Slight Delay",
                  },
                  {
                    id: "late_night" as BedtimeWindow,
                    emoji: "⚡",
                    title: "Late Night Owl (12:45 – 2:00 AM)",
                    desc: "Night owl mode, working late or evening recreation.",
                    tag: "Compressed",
                  },
                  {
                    id: "wee_hours" as BedtimeWindow,
                    emoji: "🌌",
                    title: "Wee Hours (After 2:00 AM)",
                    desc: "Very late night or night shift schedule.",
                    tag: "Significant Shift",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("bedtimeWindow", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.bedtimeWindow === opt.id
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
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {qIndex === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">
                  Question 2 · Drift-Off Latency
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  How long did it take to actually fall asleep? 💫
                </h2>
                <p className="text-xs text-ink-muted">
                  Measures your nervous system’s transition into parasympathetic sleep mode.
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  {
                    id: "instant" as DriftOffSpeed,
                    emoji: "⚡",
                    title: "Out like a light (< 10 mins)",
                    desc: "Head hit the pillow and lights were out immediately.",
                    tag: "High Sleep Drive",
                  },
                  {
                    id: "peaceful" as DriftOffSpeed,
                    emoji: "🍃",
                    title: "Peaceful Drift (15 – 25 mins)",
                    desc: "Normal, calm, gradual drift into slumber.",
                    tag: "Optimal Latency",
                  },
                  {
                    id: "racing_mind" as DriftOffSpeed,
                    emoji: "🌀",
                    title: "Racing Mind / Scrolling (30 – 60 mins)",
                    desc: "Overactive thoughts or smartphone screen delayed sleep.",
                    tag: "Elevated Beta Waves",
                  },
                  {
                    id: "insomnia_toss" as DriftOffSpeed,
                    emoji: "🌪️",
                    title: "Tossed for over an hour (> 60 mins)",
                    desc: "Restless tossing, couldn't find a comfortable position.",
                    tag: "Sleep Latency Strain",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("driftOffSpeed", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.driftOffSpeed === opt.id
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
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setQIndex(1)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {qIndex === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">
                  Question 3 · Sleep Continuity
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  Did anything wake you up in the middle of the night? 🌙
                </h2>
                <p className="text-xs text-ink-muted">
                  Quantifies sleep fragmentation and restorative deep slow-wave continuity.
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  {
                    id: "none" as NightWakeups,
                    emoji: "🛡️",
                    title: "Dead to the world (Zero awakenings)",
                    desc: "Unbroken, seamless sleep until the morning.",
                    tag: "100% Continuity",
                  },
                  {
                    id: "one_brief" as NightWakeups,
                    emoji: "💧",
                    title: "Woke up once (Quick water / restroom)",
                    desc: "Brief pause, fell right back asleep in seconds.",
                    tag: "Normal Cycle",
                  },
                  {
                    id: "tossed_2_3" as NightWakeups,
                    emoji: "💤",
                    title: "Choppy night (Woke up 2–3 times)",
                    desc: "Woke up multiple times, felt somewhat fragmented.",
                    tag: "Mild Disruption",
                  },
                  {
                    id: "wide_awake_gap" as NightWakeups,
                    emoji: "👀",
                    title: "Wide awake gap (Awake for 45+ mins)",
                    desc: "Stared at the ceiling, struggled to fall back asleep.",
                    tag: "Middle Insomnia",
                  },
                  {
                    id: "restless_storm" as NightWakeups,
                    emoji: "⚡",
                    title: "Restless storm (Tossing all night)",
                    desc: "Broken sleep, dreams felt hectic and unsatisfying.",
                    tag: "High Fragmentation",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("nightWakeups", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.nightWakeups === opt.id
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
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setQIndex(2)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* ROUND 2: THE MORNING BOOT */}
          {qIndex === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">
                  Question 4 · Awakening Mechanism
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  How did your awakening happen this morning? ⏰
                </h2>
                <p className="text-xs text-ink-muted">
                  Distinguishes natural sleep cycle completion from jarring sleep inertia.
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  {
                    id: "before_alarm" as WakeupTrigger,
                    emoji: "🌅",
                    title: "Naturally bright-eyed before alarm",
                    desc: "Body completed its final sleep cycle on its own.",
                    tag: "Natural Rhythm",
                  },
                  {
                    id: "gentle_alarm" as WakeupTrigger,
                    emoji: "⏰",
                    title: "Gentle alarm, rolled out smoothly",
                    desc: "Woke up with the first alarm and got moving without drama.",
                    tag: "Smooth Exit",
                  },
                  {
                    id: "snooze_war" as WakeupTrigger,
                    emoji: "🔕",
                    title: "Violent snooze war (3–4 alarms hit)",
                    desc: "Heavy sleep inertia, eyes felt glued shut.",
                    tag: "Inertia Trap",
                  },
                  {
                    id: "jolted_abrupt" as WakeupTrigger,
                    emoji: "🚨",
                    title: "Jolted awake abruptly / late panic",
                    desc: "Heart was racing, sudden noise or sudden adrenaline spike.",
                    tag: "Adrenaline Spike",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("wakeupTrigger", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.wakeupTrigger === opt.id
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
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setQIndex(3)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {qIndex === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">
                  Question 5 · Muscular & Joint Mobility
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  How do your muscles and joints feel right now? 🏃
                </h2>
                <p className="text-xs text-ink-muted">
                  Direct physical indicator of cellular repair and muscular readiness.
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  {
                    id: "limber_spring" as BodyMobility,
                    emoji: "🤸",
                    title: "Limber & Springy (Zero stiffness)",
                    desc: "Light on your feet, zero ache, muscles primed to move.",
                    tag: "100% Primed",
                  },
                  {
                    id: "steady_normal" as BodyMobility,
                    emoji: "🏃",
                    title: "Healthy Baseline (Quick stretch)",
                    desc: "Normal light morning tightness that faded immediately.",
                    tag: "Solid Baseline",
                  },
                  {
                    id: "heavy_achy" as BodyMobility,
                    emoji: "🧗",
                    title: "Heavy Legs / Tight Back or Neck",
                    desc: "Feeling the strain of recent workouts or poor posture.",
                    tag: "Muscle Strain",
                  },
                  {
                    id: "deep_exhaustion" as BodyMobility,
                    emoji: "🐢",
                    title: "Deep Systemic Soreness (Moving in slow-mo)",
                    desc: "Joints creaking, heavy limbs, systemic inflammation.",
                    tag: "High Fatigue",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("bodyMobility", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.bodyMobility === opt.id
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
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setQIndex(4)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {qIndex === 6 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">
                  Question 6 · Autonomic Rhythm & Breath
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  How does your resting heartbeat and breathing feel? 🫀
                </h2>
                <p className="text-xs text-ink-muted">
                  Estimates autonomic nervous system balance (HRV proxy).
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  {
                    id: "deep_calm" as AutonomicBreath,
                    emoji: "🫀",
                    title: "Deep, Slow, Calm Resting Rhythm",
                    desc: "Breathing feels effortless and deep; heartbeat feels slow and steady.",
                    tag: "High Parasympathetic",
                  },
                  {
                    id: "steady_even" as AutonomicBreath,
                    emoji: "💓",
                    title: "Normal Rhythmic Baseline",
                    desc: "Standard resting pulse, no rushing sensation.",
                    tag: "Autonomic Balance",
                  },
                  {
                    id: "fluttery_tight" as AutonomicBreath,
                    emoji: "⚡",
                    title: "Elevated Pulse / Tight Chest",
                    desc: "Heart feels fluttery, breathing slightly shallow or caffeinated/stressed.",
                    tag: "Sympathetic Surge",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("autonomicBreath", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.autonomicBreath === opt.id
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
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setQIndex(5)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* ROUND 3: MIND & BATTERY RADAR */}
          {qIndex === 7 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">
                  Question 7 · Consciousness Bootup
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  What was your very first thought when your brain booted up? 🧠
                </h2>
                <p className="text-xs text-ink-muted">
                  Captures subconscious emotional valence and mental readiness.
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  {
                    id: "excited_ready" as BootupMindset,
                    emoji: "🚀",
                    title: "Excited about today! High drive",
                    desc: "Eager to tackle projects, workout, and make things happen.",
                    tag: "High Optimism",
                  },
                  {
                    id: "calm_grounded" as BootupMindset,
                    emoji: "🌿",
                    title: "Grounded & peaceful, taking it step by step",
                    desc: "Calm emotional baseline, comfortable in your own skin.",
                    tag: "Steady State",
                  },
                  {
                    id: "overwhelmed_todos" as BootupMindset,
                    emoji: "🤯",
                    title: "Anxious / to-do list already suffocating",
                    desc: "Immediate spike of cortisol thinking about today's tasks.",
                    tag: "Cognitive Load",
                  },
                  {
                    id: "stormy_drained" as BootupMindset,
                    emoji: "🕳️",
                    title: "Emotionally empty / wanted to stay in bed forever",
                    desc: "Zero motivation, emotionally flat or discouraged.",
                    tag: "Low Reserve",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("bootupMindset", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.bootupMindset === opt.id
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
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setQIndex(6)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {qIndex === 8 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">
                  Question 8 · Mental Clarity & Focus
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  How sharp is your mental focus right now? ☕
                </h2>
                <p className="text-xs text-ink-muted">
                  Screens for sleep inertia and prefrontal cognitive processing speed.
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  {
                    id: "laser_4k" as CognitiveClarity,
                    emoji: "💎",
                    title: "4K Laser Focus (Ultra sharp)",
                    desc: "Thoughts are lucid, ideas connecting effortlessly.",
                    tag: "Peak Focus",
                  },
                  {
                    id: "steady_coffee" as CognitiveClarity,
                    emoji: "☕",
                    title: "Steady & Functional",
                    desc: "Clear enough to execute regular work, warming up nicely.",
                    tag: "Solid Flow",
                  },
                  {
                    id: "foggy_scattered" as CognitiveClarity,
                    emoji: "🌫️",
                    title: "Hazy Brain Fog (Scattered thoughts)",
                    desc: "Need extra time to read or remember simple items.",
                    tag: "Brain Fog",
                  },
                  {
                    id: "spaced_out" as CognitiveClarity,
                    emoji: "😵‍💫",
                    title: "Completely Spaced Out / Slow-mo",
                    desc: "Processing in slow motion, feeling in a trance.",
                    tag: "Deep Inertia",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("cognitiveClarity", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.cognitiveClarity === opt.id
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
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setQIndex(7)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {qIndex === 9 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">
                  Question 9 · Social & Patience Bandwidth
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-ink">
                  How much patience and social battery do you have today? 💬
                </h2>
                <p className="text-xs text-ink-muted">
                  Emotional resilience and empathy thresholds correlate tightly with recovery.
                </p>
              </div>

              <div className="grid gap-2">
                {[
                  {
                    id: "full_friendly" as SocialBattery,
                    emoji: "😄",
                    title: "High Social Battery (Warm & Collaborative)",
                    desc: "Happy to chat, make phone calls, lead meetings, and connect.",
                    tag: "Extroverted Flow",
                  },
                  {
                    id: "selective_peace" as SocialBattery,
                    emoji: "🙂",
                    title: "Selective & Peaceful (Polite but quiet)",
                    desc: "Agreeable and calm, but prefer peaceful, focused work.",
                    tag: "Quiet Focus",
                  },
                  {
                    id: "headphones_on" as SocialBattery,
                    emoji: "🎧",
                    title: "Headphones On (Please don't disturb)",
                    desc: "Low social buffer, small talk feels exhausting right now.",
                    tag: "Solo Mode",
                  },
                  {
                    id: "irritable_short" as SocialBattery,
                    emoji: "⚡",
                    title: "Short Fuse (Irritable & Tense)",
                    desc: "Easily triggered by minor inconveniences or interruptions.",
                    tag: "Tension Alert",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect("socialBattery", opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
                      answers.socialBattery === opt.id
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
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setQIndex(8)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const pred = predictFullHealthMatrix(answers);
                    setPrediction(pred);
                    setCustomHours(pred.sleepHours);
                    setCustomMood(pred.moodScore);
                    setQIndex(10);
                  }}
                  className="lif-btn-primary py-1.5 px-4 text-xs font-bold"
                >
                  Synthesize Health Matrix →
                </button>
              </div>
            </div>
          )}

          {/* STEP 10: FULL HEALTH MATRIX REVEAL & CALIBRATION */}
          {qIndex === 10 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-[11px] font-extrabold text-primary-dark">
                  🔮 AI Health Matrix Calibrated
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-ink">
                  Your Full Daily Biometric Matrix
                </h2>
                <p className="text-xs text-ink-muted max-w-md mx-auto">
                  Derived from bedtime latency, nocturnal interruptions, waking mobility, breath rhythm, and cognitive bandwidth.
                </p>
              </div>

              {/* 3 EXPANDED MATRIX CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. SLEEP MATRIX */}
                <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-2 relative overflow-hidden shadow-xs">
                  <div className="text-2xl">🌙</div>
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                    Sleep Matrix
                  </span>
                  <div className="text-3xl font-black text-ink">
                    {customHours ?? (prediction?.sleepHours ?? liveMatrix.sleepHours)}{" "}
                    <span className="text-xs font-semibold text-ink-muted">hrs</span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-dark">
                      {(prediction?.sleepEfficiency ?? liveMatrix.sleepEfficiency)}% Efficiency
                    </span>
                    <span className="rounded-md bg-surface-subtle px-2 py-0.5 text-[10px] font-bold text-ink-soft">
                      {(prediction?.deepSleepScore ?? liveMatrix.deepSleepScore)}% Deep/REM
                    </span>
                  </div>

                  <p className="text-[10px] text-ink-muted pt-0.5">
                    Debt: {(prediction?.sleepDebtStatus ?? liveMatrix.sleepDebtStatus)}
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-1 border-t border-line/60">
                    <button
                      type="button"
                      onClick={() =>
                        setCustomHours((prev) =>
                          Math.max(3, Math.round(((prev ?? (prediction?.sleepHours ?? liveMatrix.sleepHours)) - 0.25) * 100) / 100)
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
                          Math.min(12, Math.round(((prev ?? (prediction?.sleepHours ?? liveMatrix.sleepHours)) + 0.25) * 100) / 100)
                        )
                      }
                      className="h-6 w-6 rounded-md border border-line bg-surface text-xs font-bold text-ink hover:bg-surface-subtle"
                      title="Add 15 mins"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 2. MOOD & COGNITION MATRIX */}
                <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-2 relative overflow-hidden shadow-xs">
                  <div className="text-2xl">
                    {(customMood ?? (prediction?.moodScore ?? liveMatrix.moodScore)) >= 4
                      ? "☀️"
                      : (customMood ?? (prediction?.moodScore ?? liveMatrix.moodScore)) === 3
                      ? "⛅"
                      : "🌧️"}
                  </div>
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                    Mood & Mindset
                  </span>
                  <div className="text-3xl font-black text-ink">
                    {customMood ?? (prediction?.moodScore ?? liveMatrix.moodScore)}{" "}
                    <span className="text-xs font-semibold text-ink-muted">/ 5</span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      {prediction?.moodValence ?? liveMatrix.moodValence}
                    </span>
                    <span className="rounded-md bg-surface-subtle px-2 py-0.5 text-[10px] font-bold text-ink-soft">
                      Stress: {prediction?.stressIndex ?? liveMatrix.stressIndex}/100
                    </span>
                  </div>

                  <p className="text-[10px] text-ink-muted pt-0.5">
                    Focus: {prediction?.cognitiveClarityLabel ?? liveMatrix.cognitiveClarityLabel}
                  </p>

                  <div className="flex items-center justify-center gap-1 pt-1 border-t border-line/60">
                    {[1, 2, 3, 4, 5].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCustomMood(m)}
                        className={`h-6 w-6 rounded-md text-[11px] font-bold transition ${
                          (customMood ?? (prediction?.moodScore ?? liveMatrix.moodScore)) === m
                            ? "bg-primary text-white"
                            : "border border-line bg-surface text-ink-soft hover:bg-surface-subtle"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. AUTONOMIC RECOVERY MATRIX */}
                <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-2 relative overflow-hidden shadow-xs">
                  <div className="text-2xl">💚</div>
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                    Recovery Readiness
                  </span>
                  <div className="text-3xl font-black text-ink">
                    {prediction?.recoveryScore ?? liveMatrix.recoveryScore}%
                  </div>

                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      (prediction?.recoveryScore ?? liveMatrix.recoveryScore) >= 75
                        ? "bg-primary-soft text-primary-dark"
                        : (prediction?.recoveryScore ?? liveMatrix.recoveryScore) >= 50
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "bg-crisis-soft text-crisis"
                    }`}
                  >
                    {prediction?.recoveryStatusLabel ?? liveMatrix.recoveryStatusLabel}
                  </span>

                  <p className="text-[10px] text-ink-muted pt-0.5">
                    Muscles: {prediction?.muscularTone ?? liveMatrix.muscularTone}
                  </p>
                  <p className="text-[9px] text-ink-muted font-medium pt-1 border-t border-line/60">
                    {prediction?.autonomicTone ?? liveMatrix.autonomicTone}
                  </p>
                </div>
              </div>

              {/* TARGET DAY STRAIN & RECOMMENDATION */}
              <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">
                      🎯
                    </span>
                    <span className="text-xs font-bold text-ink">
                      Optimal Target Strain for Today
                    </span>
                  </div>
                  <span className="rounded-md bg-primary text-white px-2 py-0.5 text-[10px] font-extrabold">
                    {prediction?.recommendedStrain ?? liveMatrix.recommendedStrain}
                  </span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  {prediction?.actionableAdvice ?? liveMatrix.actionableAdvice}
                </p>
                <div className="pt-0.5 text-[11px] font-semibold text-primary-dark">
                  💡 Strategy: {prediction?.suggestedFocus ?? liveMatrix.suggestedFocus}
                </div>
              </div>

              {/* LOCK IN BUTTON */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQIndex(9)}
                  className="text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  ← Edit Responses
                </button>

                <button
                  type="button"
                  disabled={pending}
                  onClick={handleLockIn}
                  className="lif-btn-primary w-full sm:w-auto py-3 px-6 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>🎮</span>
                  <span>{pending ? "Locking In..." : "Lock In Full Matrix (+35 XP)"}</span>
                </button>
              </div>
            </div>
          )}

          {/* DYNAMIC LIVE MATRIX RADAR DOCK (VISIBLE DURING QUESTIONS 1-9) */}
          {qIndex <= 9 && (
            <div className="mt-5 rounded-xl border border-dashed border-line bg-surface-subtle/80 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Predictive Matrix Radar
                </span>
                <span className="text-[10px] text-ink-muted">Synthesizing live</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-surface p-1.5 border border-line/60">
                  <span className="text-[10px] text-ink-muted block">Sleep Est.</span>
                  <span className="text-xs font-bold text-ink">{liveMatrix.sleepHours}h</span>
                  <span className="text-[9px] text-ink-muted block">{liveMatrix.sleepEfficiency}% eff</span>
                </div>
                <div className="rounded-lg bg-surface p-1.5 border border-line/60">
                  <span className="text-[10px] text-ink-muted block">Mood Score</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    {liveMatrix.moodScore}/5
                  </span>
                  <span className="text-[9px] text-ink-muted block">Stress {liveMatrix.stressIndex}</span>
                </div>
                <div className="rounded-lg bg-surface p-1.5 border border-line/60">
                  <span className="text-[10px] text-ink-muted block">Recovery</span>
                  <span className="text-xs font-bold text-primary-dark">
                    {liveMatrix.recoveryScore}%
                  </span>
                  <span className="text-[9px] text-ink-muted block">{liveMatrix.recoveryStatus.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
