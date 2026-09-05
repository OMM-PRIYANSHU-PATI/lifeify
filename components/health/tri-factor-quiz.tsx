"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  evaluateLightningQuiz,
  evaluateDeepSleepQuest,
  evaluateDeepMoodQuest,
  evaluateDeepRecoveryQuest,
  LightningQuizAnswers,
  DeepSleepQuestAnswers,
  DeepMoodQuestAnswers,
  DeepRecoveryQuestAnswers,
  RecoveryStatus,
} from "@/lib/rules/tri-factor-quiz";
import { logTriFactorQuiz } from "@/lib/actions/logs";

type QuizMode = "lightning" | "sleep_quest" | "mood_quest" | "recovery_quest" | "full_odyssey";

interface TriFactorQuizProps {
  onDone?: () => void;
  variant?: "modal" | "inline";
  defaultMode?: QuizMode;
}

export function TriFactorQuiz({
  onDone,
  variant = "inline",
  defaultMode = "lightning",
}: TriFactorQuizProps) {
  const router = useRouter();
  const [mode, setMode] = useState<QuizMode>(defaultMode);
  const [stepIndex, setStepIndex] = useState<number>(1);
  const [pending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Lightning state
  const [lightningAnswers, setLightningAnswers] = useState<LightningQuizAnswers>({
    nightFeeling: "normal_rest",
    morningEnergy: "steady_baseline",
    mindsetAura: "calm_grounded",
  });

  // Deep Sleep state
  const [sleepAnswers, setSleepAnswers] = useState<DeepSleepQuestAnswers>({
    bedtimeWindow: "around_11",
    driftOffSpeed: "peaceful",
    nightWakeups: "one_brief",
    caffeineCutoff: "before_2pm",
    screenWindDown: "dim_book_60m",
    bedroomClimate: "cool_pitch_dark",
    dreamRecall: "vivid_calm",
  });

  // Deep Mood state
  const [moodAnswers, setMoodAnswers] = useState<DeepMoodQuestAnswers>({
    bootupMindset: "calm_grounded",
    cognitiveClarity: "steady_coffee",
    socialBattery: "selective_peace",
    stressTriggers: "minimal_smooth",
    innerSelfTalk: "neutral_pragmatic",
    energyStability: "steady_flowing",
  });

  // Deep Recovery state
  const [recoveryAnswers, setRecoveryAnswers] = useState<DeepRecoveryQuestAnswers>({
    wakeupTrigger: "gentle_alarm",
    bodyMobility: "steady_normal",
    autonomicBreath: "steady_even",
    sorenessZone: "none",
    hydrationAwakening: "quenched_fresh",
    previousDayStrain: "moderate_active",
  });

  // Evaluated results
  const lightningResult = evaluateLightningQuiz(lightningAnswers);
  const deepSleepResult = evaluateDeepSleepQuest(sleepAnswers);
  const deepMoodResult = evaluateDeepMoodQuest(moodAnswers);
  const deepRecoveryResult = evaluateDeepRecoveryQuest(recoveryAnswers);

  // Total steps based on mode
  const totalSteps =
    mode === "lightning" ? 3 : mode === "sleep_quest" ? 7 : mode === "mood_quest" ? 6 : mode === "recovery_quest" ? 6 : 9;

  const isReveal = stepIndex > totalSteps;

  const handleNextStep = () => {
    setStepIndex((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStepIndex((prev) => Math.max(1, prev - 1));
  };

  const switchMode = (newMode: QuizMode) => {
    setMode(newMode);
    setStepIndex(1);
    setCompleted(false);
  };

  const handleLockIn = (metrics: {
    sleepHours: number;
    sleepQuality: number;
    moodScore: number;
    moodValence: string;
    recoveryScore: number;
    recoveryStatus: RecoveryStatus;
  }) => {
    setErrorMsg("");
    startTransition(async () => {
      const res = await logTriFactorQuiz({
        sleepHours: metrics.sleepHours,
        sleepQuality: metrics.sleepQuality,
        moodScore: metrics.moodScore,
        moodValence: metrics.moodValence,
        recoveryScore: metrics.recoveryScore,
        recoveryStatus: metrics.recoveryStatus,
        answers: {
          mode,
          timestamp: new Date().toISOString(),
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
      {/* Mode Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-line/60">
        {[
          { id: "lightning" as QuizMode, label: "⚡ Short Pulse (60s)", badge: "+15 XP" },
          { id: "sleep_quest" as QuizMode, label: "🌙 Sleep Quest", badge: "+30 XP" },
          { id: "mood_quest" as QuizMode, label: "🙂 Mood Radar", badge: "+30 XP" },
          { id: "recovery_quest" as QuizMode, label: "💚 Recovery Quest", badge: "+30 XP" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchMode(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              mode === tab.id
                ? "bg-primary text-white shadow-xs"
                : "border border-line bg-surface text-ink-soft hover:bg-surface-subtle"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold ${
                mode === tab.id ? "bg-white/20 text-white" : "bg-primary-soft text-primary-dark"
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Progress & Title Header */}
      {!completed && !isReveal && (
        <div className="flex items-center justify-between pt-3 pb-1">
          <span className="text-xs font-bold text-ink-soft">
            {mode === "lightning"
              ? "⚡ Lightning Pulse"
              : mode === "sleep_quest"
              ? "🌙 Deep Sleep Chrono-Quest"
              : mode === "mood_quest"
              ? "🙂 Deep Mood & Mindset Radar"
              : "💚 Deep Recovery Readiness Quest"}{" "}
            · Step {stepIndex} of {totalSteps}
          </span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(stepIndex / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="mt-3 rounded-xl bg-crisis-soft px-3 py-2 text-xs font-medium text-crisis">
          {errorMsg}
        </p>
      )}

      {/* CELEBRATION COMPLETED */}
      {completed ? (
        <div className="py-8 text-center space-y-4 animate-fadeIn">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
            🎉
          </div>
          <h3 className="text-xl font-black text-ink">Matrix Calibrated & Synchronized!</h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            {successMsg || "Your biometric telemetry has been recorded and updated across your profile."}
          </p>
          <div className="inline-flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-2 text-xs font-bold text-primary-dark">
            <span>🎯</span> XP Awarded & Wellness Streak Active
          </div>
          <div className="pt-2">
            <button onClick={() => onDone?.()} className="lif-btn-primary py-2.5 px-6 text-xs font-bold">
              Continue to Dashboard →
            </button>
          </div>
        </div>
      ) : isReveal ? (
        /* GRAND REVEAL DASHBOARD */
        <div className="space-y-5 pt-3 animate-fadeIn">
          <div className="text-center space-y-1">
            <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-[11px] font-extrabold text-primary-dark">
              🔮 Biometric Forecast Calibrated
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-ink">
              {mode === "lightning"
                ? "Lightning Tri-Factor Prediction"
                : mode === "sleep_quest"
                ? "Deep Sleep Architecture Matrix"
                : mode === "mood_quest"
                ? "Deep Mood & Mindset Matrix"
                : "Deep Autonomic Recovery Matrix"}
            </h2>
            <p className="text-xs text-ink-muted">
              Derived deterministically from your reported sensations and physiological indicators.
            </p>
          </div>

          {/* Grid of Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* SLEEP CARD */}
            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl block">🌙</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                Sleep Matrix
              </span>
              <div className="text-3xl font-black text-ink">
                {mode === "sleep_quest" ? deepSleepResult.sleepHours : lightningResult.sleepHours}{" "}
                <span className="text-xs font-semibold text-ink-muted">hrs</span>
              </div>
              <span className="inline-block rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-dark">
                {mode === "sleep_quest" ? deepSleepResult.sleepEfficiency : lightningResult.sleepEfficiency}% Efficiency
              </span>
              {mode === "sleep_quest" && (
                <p className="text-[10px] text-ink-muted pt-1">
                  Hygiene Score: {deepSleepResult.sleepHygieneScore}/100
                </p>
              )}
            </div>

            {/* MOOD CARD */}
            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl block">
                {(mode === "mood_quest" ? deepMoodResult.moodScore : lightningResult.moodScore) >= 4 ? "☀️" : "⛅"}
              </span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                Mood Valence
              </span>
              <div className="text-3xl font-black text-ink">
                {mode === "mood_quest" ? deepMoodResult.moodScore : lightningResult.moodScore}{" "}
                <span className="text-xs font-semibold text-ink-muted">/ 5</span>
              </div>
              <span className="inline-block rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                {mode === "mood_quest" ? deepMoodResult.moodValence : lightningResult.moodValence}
              </span>
              {mode === "mood_quest" && (
                <p className="text-[10px] text-ink-muted pt-1">
                  Stress: {deepMoodResult.stressIndex}/100
                </p>
              )}
            </div>

            {/* RECOVERY CARD */}
            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl block">💚</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                Recovery Index
              </span>
              <div className="text-3xl font-black text-ink">
                {mode === "recovery_quest" ? deepRecoveryResult.recoveryScore : lightningResult.recoveryScore}%
              </div>
              <span className="inline-block rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-dark">
                {mode === "recovery_quest" ? deepRecoveryResult.recoveryStatusLabel : lightningResult.recoveryStatusLabel}
              </span>
              {mode === "recovery_quest" && (
                <p className="text-[10px] text-ink-muted pt-1">
                  {deepRecoveryResult.muscularTone}
                </p>
              )}
            </div>
          </div>

          {/* ADVICE CARD */}
          <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-4 space-y-1.5">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <span>🎯</span> Clinical Recommendation & Day Strategy
            </span>
            <p className="text-xs text-ink-soft leading-relaxed">
              {mode === "sleep_quest"
                ? deepSleepResult.personalizedSleepTips
                : mode === "mood_quest"
                ? deepMoodResult.mindsetNudge
                : mode === "recovery_quest"
                ? deepRecoveryResult.actionableAdvice
                : lightningResult.actionableAdvice}
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStepIndex(totalSteps)}
              className="text-xs font-semibold text-ink-muted hover:text-ink"
            >
              ← Edit Answers
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() =>
                handleLockIn({
                  sleepHours: mode === "sleep_quest" ? deepSleepResult.sleepHours : lightningResult.sleepHours,
                  sleepQuality: mode === "sleep_quest" ? deepSleepResult.sleepQuality : lightningResult.sleepQuality,
                  moodScore: mode === "mood_quest" ? deepMoodResult.moodScore : lightningResult.moodScore,
                  moodValence: mode === "mood_quest" ? deepMoodResult.moodValence : lightningResult.moodValence,
                  recoveryScore: mode === "recovery_quest" ? deepRecoveryResult.recoveryScore : lightningResult.recoveryScore,
                  recoveryStatus: mode === "recovery_quest" ? deepRecoveryResult.recoveryStatus : lightningResult.recoveryStatus,
                })
              }
              className="lif-btn-primary w-full sm:w-auto py-3 px-6 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:scale-102 transition-all"
            >
              <span>🎮</span>
              <span>{pending ? "Locking In..." : "Lock In Matrix & Claim XP"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* QUESTION STEPS */
        <div className="pt-3 space-y-4">
          {/* ========================================================= */}
          {/* 1. LIGHTNING MODE QUESTIONS (3 FAST CARDS)               */}
          {/* ========================================================= */}
          {mode === "lightning" && (
            <>
              {stepIndex === 1 && (
                <QuestionCard
                  title="How did your sleep feel overall?"
                  subtitle="Infers your night continuity and restfulness without guessing hours."
                  options={[
                    { id: "slept_like_rock", emoji: "🪨", label: "Slept like a rock", desc: "Deep, uninterrupted, seamless slumber." },
                    { id: "normal_rest", emoji: "🌙", label: "Normal steady rest", desc: "Woke up once maybe, standard night." },
                    { id: "tossed_turned", emoji: "🌀", label: "Tossed & turned", desc: "Restless or light, woke up multiple times." },
                    { id: "barely_slept", emoji: "⚡", label: "Barely slept / insomnia", desc: "Rough night, broken or delayed rest." },
                  ]}
                  current={lightningAnswers.nightFeeling}
                  onSelect={(v) => {
                    setLightningAnswers((p) => ({ ...p, nightFeeling: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                />
              )}

              {stepIndex === 2 && (
                <QuestionCard
                  title="How is your physical energy upon getting up?"
                  subtitle="Measures morning sleep inertia and cellular recharge."
                  options={[
                    { id: "rocket_ready", emoji: "🚀", label: "Rocket ready!", desc: "Energized before alarm, 100% charged." },
                    { id: "steady_baseline", emoji: "⚡", label: "Steady baseline", desc: "Good energy, ready for the day." },
                    { id: "sluggish_coffee", emoji: "☕", label: "Need coffee first", desc: "A bit slow-moving, warming up." },
                    { id: "exhausted_zombie", emoji: "🧟", label: "Zombie mode", desc: "Running on 1% battery, heavy limbs." },
                  ]}
                  current={lightningAnswers.morningEnergy}
                  onSelect={(v) => {
                    setLightningAnswers((p) => ({ ...p, morningEnergy: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 3 && (
                <QuestionCard
                  title="What is your emotional weather right now?"
                  subtitle="Calibrates psychological bandwidth and autonomic balance."
                  options={[
                    { id: "sunny_optimistic", emoji: "☀️", label: "Sunny & optimistic", desc: "Excited, confident, joyful." },
                    { id: "calm_grounded", emoji: "🌤️", label: "Calm & grounded", desc: "Peaceful, steady, balanced." },
                    { id: "anxious_stressed", emoji: "🌧️", label: "Anxious / busy mind", desc: "Tense or overwhelmed by to-dos." },
                    { id: "heavy_overwhelmed", emoji: "⛈️", label: "Heavy & exhausted", desc: "Low spirits, emotionally drained." },
                  ]}
                  current={lightningAnswers.mindsetAura}
                  onSelect={(v) => {
                    setLightningAnswers((p) => ({ ...p, mindsetAura: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 2. DEEP SLEEP CHRONO-QUEST (7 DETAILED QUESTIONS)         */}
          {/* ========================================================= */}
          {mode === "sleep_quest" && (
            <>
              {stepIndex === 1 && (
                <QuestionCard
                  title="When did your head hit the pillow?"
                  subtitle="Anchors your circadian sleep window."
                  options={[
                    { id: "pre_1030", emoji: "🦉", label: "Early Haven (9:30 – 10:30 PM)", desc: "Melatonin-aligned sleep sanctuary." },
                    { id: "around_11", emoji: "🌙", label: "Standard Rhythm (10:30 – 11:30 PM)", desc: "Natural balanced bedtime window." },
                    { id: "midnight", emoji: "📱", label: "Midnight Drift (11:30 PM – 12:45 AM)", desc: "Slight delay, wind-down scrolling." },
                    { id: "late_night", emoji: "⚡", label: "Late Night Owl (12:45 – 2:00 AM)", desc: "Night owl compressed sleep cycle." },
                    { id: "wee_hours", emoji: "🌌", label: "Wee Hours (After 2:00 AM)", desc: "Severe shift or late night out." },
                  ]}
                  current={sleepAnswers.bedtimeWindow}
                  onSelect={(v) => {
                    setSleepAnswers((p) => ({ ...p, bedtimeWindow: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                />
              )}

              {stepIndex === 2 && (
                <QuestionCard
                  title="How long did it take to drift off?"
                  subtitle="Measures parasympathetic onset and sleep latency."
                  options={[
                    { id: "instant", emoji: "⚡", label: "Out like a light (< 10 mins)", desc: "High sleep pressure, asleep right away." },
                    { id: "peaceful", emoji: "🍃", label: "Peaceful drift (15 – 25 mins)", desc: "Optimal, gentle transition into slumber." },
                    { id: "racing_mind", emoji: "🌀", label: "Mind racing / scrolling (30 – 60 mins)", desc: "Screen stimulation delayed sleep." },
                    { id: "insomnia_toss", emoji: "🌪️", label: "Tossed around (> 60 mins)", desc: "Severe latency strain or restlessness." },
                  ]}
                  current={sleepAnswers.driftOffSpeed}
                  onSelect={(v) => {
                    setSleepAnswers((p) => ({ ...p, driftOffSpeed: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 3 && (
                <QuestionCard
                  title="Did you have middle-of-the-night wakeups?"
                  subtitle="Quantifies slow-wave deep sleep continuity."
                  options={[
                    { id: "none", emoji: "🛡️", label: "Zero awakenings (Dead to the world)", desc: "Solid, continuous sleep all night." },
                    { id: "one_brief", emoji: "💧", label: "Woke up once (Bathroom / water)", desc: "Fell back asleep in under 2 minutes." },
                    { id: "tossed_2_3", emoji: "💤", label: "Choppy (2–3 wakeups)", desc: "Felt slightly fragmented." },
                    { id: "wide_awake_gap", emoji: "👀", label: "Wide awake gap (45+ mins)", desc: "Stuck staring at the ceiling." },
                    { id: "restless_storm", emoji: "⚡", label: "Restless storm all night", desc: "Frequent tossing, very light sleep." },
                  ]}
                  current={sleepAnswers.nightWakeups}
                  onSelect={(v) => {
                    setSleepAnswers((p) => ({ ...p, nightWakeups: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 4 && (
                <QuestionCard
                  title="When was your last caffeine or stimulant?"
                  subtitle="Caffeine has a 5–7 hour half-life that blocks deep sleep."
                  options={[
                    { id: "before_2pm", emoji: "☕", label: "Before 2:00 PM", desc: "Optimal: fully cleared before bed." },
                    { id: "late_afternoon", emoji: "🍵", label: "Late afternoon (3 – 5 PM)", desc: "Minor residual caffeine in system." },
                    { id: "with_dinner", emoji: "🥤", label: "With dinner (6 – 8 PM)", desc: "Delayed slow-wave sleep depth." },
                    { id: "late_night", emoji: "⚡", label: "Late evening (After 8 PM)", desc: "Substantial deep sleep disruption." },
                  ]}
                  current={sleepAnswers.caffeineCutoff}
                  onSelect={(v) => {
                    setSleepAnswers((p) => ({ ...p, caffeineCutoff: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 5 && (
                <QuestionCard
                  title="What was your pre-bed screen routine?"
                  subtitle="Blue light suppresses pineal gland melatonin production."
                  options={[
                    { id: "dim_book_60m", emoji: "📖", label: "Dim light / reading (60m+)", desc: "High melatonin priming." },
                    { id: "short_check_15m", emoji: "💡", label: "Short screen check (15m)", desc: "Night shift enabled, moderate." },
                    { id: "scrolled_in_bed", emoji: "📱", label: "Scrolled social media in bed", desc: "Direct blue photons suppressed melatonin." },
                    { id: "tv_sleep_timer", emoji: "📺", label: "TV on sleep timer", desc: "Flickering audio-visual stimulation." },
                  ]}
                  current={sleepAnswers.screenWindDown}
                  onSelect={(v) => {
                    setSleepAnswers((p) => ({ ...p, screenWindDown: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 6 && (
                <QuestionCard
                  title="How was your bedroom environment?"
                  subtitle="Thermoregulation and ambient noise dictate REM stability."
                  options={[
                    { id: "cool_pitch_dark", emoji: "❄️", label: "Cool & pitch black (< 20°C / 68°F)", desc: "Clinical optimal sleep cave." },
                    { id: "normal", emoji: "🏠", label: "Normal comfortable room", desc: "Standard residential baseline." },
                    { id: "warm_stuffy", emoji: "🌡️", label: "Warm, stuffy, or humid", desc: "Body struggled to drop core temperature." },
                    { id: "noisy_street", emoji: "🚗", label: "Street noise or light leaks", desc: "Micro-arousals during the night." },
                  ]}
                  current={sleepAnswers.bedroomClimate}
                  onSelect={(v) => {
                    setSleepAnswers((p) => ({ ...p, bedroomClimate: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 7 && (
                <QuestionCard
                  title="Do you recall your dreams from last night?"
                  subtitle="Direct window into REM stage duration and emotional processing."
                  options={[
                    { id: "vivid_calm", emoji: "🌌", label: "Vivid, pleasant, cinematic", desc: "High restorative REM cycle balance." },
                    { id: "faint_pleasant", emoji: "🍃", label: "Faint pleasant memories", desc: "Normal healthy REM completion." },
                    { id: "stress_nightmares", emoji: "⚡", label: "Stress dreams or nightmares", desc: "Elevated cortisol during REM." },
                    { id: "blank_blackout", emoji: "🕳️", label: "Total blank / deep blackout", desc: "Heavy slow-wave dominance." },
                  ]}
                  current={sleepAnswers.dreamRecall}
                  onSelect={(v) => {
                    setSleepAnswers((p) => ({ ...p, dreamRecall: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 3. DEEP MOOD & MINDSET QUEST (6 QUESTIONS)                */}
          {/* ========================================================= */}
          {mode === "mood_quest" && (
            <>
              {stepIndex === 1 && (
                <QuestionCard
                  title="What was your consciousness bootup thought?"
                  subtitle="Subconscious emotional valence upon waking."
                  options={[
                    { id: "excited_ready", emoji: "🚀", label: "Excited about today! High drive", desc: "High dopamine and optimistic outlook." },
                    { id: "calm_grounded", emoji: "🌿", label: "Grounded & peaceful, step by step", desc: "Balanced parasympathetic baseline." },
                    { id: "overwhelmed_todos", emoji: "🤯", label: "Anxious / to-do list suffocating", desc: "Immediate morning cortisol surge." },
                    { id: "stormy_drained", emoji: "🕳️", label: "Emotionally empty & discouraged", desc: "Low emotional resilience reserve." },
                  ]}
                  current={moodAnswers.bootupMindset}
                  onSelect={(v) => {
                    setMoodAnswers((p) => ({ ...p, bootupMindset: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                />
              )}

              {stepIndex === 2 && (
                <QuestionCard
                  title="How sharp is your mental focus right now?"
                  subtitle="Prefrontal cortex processing clarity."
                  options={[
                    { id: "laser_4k", emoji: "💎", label: "4K Laser Focus (Ultra clear)", desc: "Ideas and problem-solving flow easily." },
                    { id: "steady_coffee", emoji: "☕", label: "Steady & functional", desc: "Standard productive work capacity." },
                    { id: "foggy_scattered", emoji: "🌫️", label: "Hazy brain fog / scattered", desc: "Takes effort to sustain attention." },
                    { id: "spaced_out", emoji: "😵‍💫", label: "Zoned out in slow-motion", desc: "Significant cognitive inertia." },
                  ]}
                  current={moodAnswers.cognitiveClarity}
                  onSelect={(v) => {
                    setMoodAnswers((p) => ({ ...p, cognitiveClarity: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 3 && (
                <QuestionCard
                  title="How is your social battery and empathy today?"
                  subtitle="Social tolerance is a primary indicator of nervous burnout."
                  options={[
                    { id: "full_friendly", emoji: "😄", label: "High Social Battery", desc: "Happy to chat, lead, and connect." },
                    { id: "selective_peace", emoji: "🙂", label: "Selective & Polite", desc: "Agreeable, but prefer quiet focus." },
                    { id: "headphones_on", emoji: "🎧", label: "Headphones On (Do Not Disturb)", desc: "Low social buffer, need solitude." },
                    { id: "irritable_short", emoji: "⚡", label: "Short Fuse / Irritable", desc: "Easily triggered by minor hiccups." },
                  ]}
                  current={moodAnswers.socialBattery}
                  onSelect={(v) => {
                    setMoodAnswers((p) => ({ ...p, socialBattery: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 4 && (
                <QuestionCard
                  title="What is your biggest stress trigger right now?"
                  subtitle="Identifies allostatic load sources."
                  options={[
                    { id: "minimal_smooth", emoji: "✨", label: "Minimal / Smooth Sailing", desc: "Low pressure, feeling in control." },
                    { id: "deadline_pressure", emoji: "⏳", label: "Deadlines / Workload", desc: "Demanding calendar and tasks." },
                    { id: "interpersonal_friction", emoji: "👥", label: "Interpersonal / Relationship friction", desc: "Social or emotional strain." },
                    { id: "chronic_burnout", emoji: "🧱", label: "Chronic Burnout / Deep Fatigue", desc: "Prolonged high stress cycle." },
                  ]}
                  current={moodAnswers.stressTriggers}
                  onSelect={(v) => {
                    setMoodAnswers((p) => ({ ...p, stressTriggers: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 5 && (
                <QuestionCard
                  title="How is your inner self-talk today?"
                  subtitle="Internal cognitive framing directly influences HRV."
                  options={[
                    { id: "empowering_kind", emoji: "💚", label: "Empowering, compassionate & kind", desc: "Supportive internal narrative." },
                    { id: "neutral_pragmatic", emoji: "⚖️", label: "Neutral & pragmatic", desc: "Focusing on execution without drama." },
                    { id: "harsh_critical", emoji: "🔍", label: "Harsh & self-critical", desc: "Second-guessing yourself or perfectionism." },
                    { id: "anxious_catastrophic", emoji: "🌪️", label: "Anxious & catastrophic", desc: "Anticipating worst-case scenarios." },
                  ]}
                  current={moodAnswers.innerSelfTalk}
                  onSelect={(v) => {
                    setMoodAnswers((p) => ({ ...p, innerSelfTalk: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 6 && (
                <QuestionCard
                  title="How steady is your physical energy flow?"
                  subtitle="Blood sugar and nervous system stability."
                  options={[
                    { id: "steady_flowing", emoji: "🌊", label: "Steady, smooth energy flow", desc: "No major dips or sudden crashes." },
                    { id: "moderate_rollercoaster", emoji: "🎢", label: "Moderate peaks and dips", desc: "Energy comes in spurts." },
                    { id: "crash_and_burn", emoji: "📉", label: "Hard crash / severe exhaustion", desc: "Sudden drops in stamina." },
                  ]}
                  current={moodAnswers.energyStability}
                  onSelect={(v) => {
                    setMoodAnswers((p) => ({ ...p, energyStability: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 4. DEEP RECOVERY READINESS QUEST (6 QUESTIONS)            */}
          {/* ========================================================= */}
          {mode === "recovery_quest" && (
            <>
              {stepIndex === 1 && (
                <QuestionCard
                  title="How was your awakening trigger?"
                  subtitle="Determines whether you woke inside a deep cycle or naturally."
                  options={[
                    { id: "before_alarm", emoji: "🌅", label: "Naturally before the alarm", desc: "Sleep cycle completed naturally." },
                    { id: "gentle_alarm", emoji: "⏰", label: "Gentle first alarm", desc: "Smooth transition, got up easily." },
                    { id: "snooze_war", emoji: "🔕", label: "Violent snooze war (3+ alarms)", desc: "Heavy sleep inertia and drag." },
                    { id: "jolted_abrupt", emoji: "🚨", label: "Jolted awake abruptly", desc: "Adrenaline spike / racing heart." },
                  ]}
                  current={recoveryAnswers.wakeupTrigger}
                  onSelect={(v) => {
                    setRecoveryAnswers((p) => ({ ...p, wakeupTrigger: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                />
              )}

              {stepIndex === 2 && (
                <QuestionCard
                  title="How do your joints and muscles feel?"
                  subtitle="Cellular repair and musculoskeletal readiness."
                  options={[
                    { id: "limber_spring", emoji: "🤸", label: "Limber & Springy (Zero ache)", desc: "100% loose, primed for action." },
                    { id: "steady_normal", emoji: "🏃", label: "Normal Healthy Baseline", desc: "Normal light stretch, feels good." },
                    { id: "heavy_achy", emoji: "🧗", label: "Heavy legs / stiff back", desc: "Feeling recent workouts or posture." },
                    { id: "deep_exhaustion", emoji: "🐢", label: "Deep systemic soreness", desc: "Moving in slow-motion, heavy fatigue." },
                  ]}
                  current={recoveryAnswers.bodyMobility}
                  onSelect={(v) => {
                    setRecoveryAnswers((p) => ({ ...p, bodyMobility: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 3 && (
                <QuestionCard
                  title="Do you have soreness in a specific body zone?"
                  subtitle="Localizes DOMS and muscular inflammation."
                  options={[
                    { id: "none", emoji: "✨", label: "Zero soreness (Fresh body)", desc: "Completely recovered musculature." },
                    { id: "neck_shoulders", emoji: "🧣", label: "Neck & Upper Traps", desc: "Postural strain or screen tension." },
                    { id: "lower_back", emoji: "🧍", label: "Lower Back / Lumbar", desc: "Core or posterior chain fatigue." },
                    { id: "legs_glutes", emoji: "🦵", label: "Legs, Quads & Glutes", desc: "Walking, running, or squat strain." },
                    { id: "full_body_tender", emoji: "🩹", label: "Full Body Tenderness", desc: "Systemic post-workout soreness." },
                  ]}
                  current={recoveryAnswers.sorenessZone}
                  onSelect={(v) => {
                    setRecoveryAnswers((p) => ({ ...p, sorenessZone: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 4 && (
                <QuestionCard
                  title="How is your resting heart & breathing rhythm?"
                  subtitle="Autonomic vagal tone and HRV proxy."
                  options={[
                    { id: "deep_calm", emoji: "🫀", label: "Deep, slow, calm resting pulse", desc: "Parasympathetic dominance (Rest & Digest)." },
                    { id: "steady_even", emoji: "💓", label: "Normal steady rhythm", desc: "Balanced autonomic baseline." },
                    { id: "fluttery_tight", emoji: "⚡", label: "Elevated pulse / rushed tightness", desc: "Sympathetic surge (Fight or Flight)." },
                  ]}
                  current={recoveryAnswers.autonomicBreath}
                  onSelect={(v) => {
                    setRecoveryAnswers((p) => ({ ...p, autonomicBreath: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 5 && (
                <QuestionCard
                  title="How hydrated do you feel upon waking?"
                  subtitle="Nocturnal dehydration elevates blood viscosity."
                  options={[
                    { id: "quenched_fresh", emoji: "💧", label: "Quenched & Fresh", desc: "Hydrated overnight, mouth feels clean." },
                    { id: "mildly_dry", emoji: "🥛", label: "Mildly dry (Ready for water)", desc: "Normal morning thirst." },
                    { id: "parched_sticky", emoji: "🏜️", label: "Parched, dry mouth & sticky", desc: "Dehydrated from mouth breathing/climate." },
                  ]}
                  current={recoveryAnswers.hydrationAwakening}
                  onSelect={(v) => {
                    setRecoveryAnswers((p) => ({ ...p, hydrationAwakening: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}

              {stepIndex === 6 && (
                <QuestionCard
                  title="What was your physical strain yesterday?"
                  subtitle="Calibrates cumulative training fatigue."
                  options={[
                    { id: "rest_day", emoji: "🛋️", label: "Rest Day / Light movement", desc: "Body had ample recovery time." },
                    { id: "moderate_active", emoji: "🚶", label: "Moderate workout / 6k–10k steps", desc: "Healthy daily baseline exertion." },
                    { id: "brutal_intense", emoji: "🏋️", label: "Brutal intense workout / heavy lifting", desc: "Significant muscle tissue breakdown." },
                    { id: "poor_recovery_cycle", emoji: "📉", label: "Multi-day stacked fatigue", desc: "Accumulated training stress." },
                  ]}
                  current={recoveryAnswers.previousDayStrain}
                  onSelect={(v) => {
                    setRecoveryAnswers((p) => ({ ...p, previousDayStrain: v as any }));
                    setTimeout(handleNextStep, 200);
                  }}
                  onBack={handlePrevStep}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable animated question card
function QuestionCard({
  title,
  subtitle,
  options,
  current,
  onSelect,
  onBack,
}: {
  title: string;
  subtitle: string;
  options: Array<{ id: string; emoji: string; label: string; desc: string }>;
  current: string;
  onSelect: (id: string) => void;
  onBack?: () => void;
}) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-ink">{title}</h2>
        <p className="text-xs text-ink-muted">{subtitle}</p>
      </div>

      <div className="grid gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${
              current === opt.id
                ? "border-primary bg-primary-soft/40 shadow-xs"
                : "border-line bg-surface hover:bg-surface-subtle"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                {opt.emoji}
              </span>
              <div>
                <span className="block text-xs font-bold text-ink">{opt.label}</span>
                <span className="block text-[11px] text-ink-muted">{opt.desc}</span>
              </div>
            </div>
            {current === opt.id && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {onBack && (
        <div className="flex justify-start pt-1">
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-ink-muted hover:text-ink"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
