"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  evaluateMorningSimulation,
  type MorningSimulationAnswers,
  type BedtimeWindow,
  type DriftOffSpeed,
  type NightWakeups,
  type ScreenWindDown,
  type BootupMindset,
  type CognitiveClarity,
  type SocialBattery,
  type StressTriggers,
  type BodyMobility,
  type SorenessZone,
  type AutonomicBreath,
  type PreviousDayStrain,
} from "@/lib/rules/tri-factor-quiz";
import { logTriFactorQuiz } from "@/lib/actions/logs";

interface MorningSimulationProps {
  onDone?: () => void;
  variant?: "modal" | "inline";
}

export function MorningSimulation({ onDone, variant = "inline" }: MorningSimulationProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [transitionBanner, setTransitionBanner] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [answers, setAnswers] = useState<MorningSimulationAnswers>({
    // Act 1: Sleep
    bedtimeWindow: "around_11",
    driftOffSpeed: "peaceful",
    nightWakeups: "one_brief",
    screenWindDown: "dim_book_60m",
    // Act 2: Mood
    bootupMindset: "calm_grounded",
    cognitiveClarity: "steady_coffee",
    socialBattery: "selective_peace",
    stressTriggers: "minimal_smooth",
    // Act 3: Recovery
    bodyMobility: "steady_normal",
    sorenessZone: "none",
    autonomicBreath: "steady_even",
    previousDayStrain: "moderate_active",
  });

  const result = evaluateMorningSimulation(answers);
  const totalQuestions = 12;
  const isReveal = step > totalQuestions;

  // Determine which act we are in
  const currentAct =
    step <= 4
      ? { num: 1, title: "Act 1: 🌙 Sleep Chrono-Simulation", color: "from-indigo-600 to-purple-600", badge: "🌙 Sleep Phase" }
      : step <= 8
      ? { num: 2, title: "Act 2: ☀️ Morning Mindset & Mood", color: "from-amber-500 to-orange-500", badge: "☀️ Mood Phase" }
      : { num: 3, title: "Act 3: 💚 Body Recovery & Nervous System", color: "from-emerald-600 to-teal-600", badge: "💚 Recovery Phase" };

  const handleSelect = <K extends keyof MorningSimulationAnswers>(
    key: K,
    value: MorningSimulationAnswers[K],
    isActTransition?: string
  ) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));

    if (isActTransition) {
      setTransitionBanner(isActTransition);
      setTimeout(() => {
        setTransitionBanner(null);
        setStep((s) => s + 1);
      }, 700);
    } else {
      setTimeout(() => {
        setStep((s) => s + 1);
      }, 150);
    }
  };

  const handleSave = () => {
    setErrorMsg("");
    startTransition(async () => {
      const res = await logTriFactorQuiz({
        sleepHours: result.sleepHours,
        sleepQuality: result.sleepQuality,
        moodScore: result.moodScore,
        moodValence: result.moodValence,
        recoveryScore: result.recoveryScore,
        recoveryStatus: result.recoveryStatus,
        answers: {
          bedtimeWindow: answers.bedtimeWindow,
          driftOffSpeed: answers.driftOffSpeed,
          nightWakeups: answers.nightWakeups,
          screenWindDown: answers.screenWindDown,
          bootupMindset: answers.bootupMindset,
          cognitiveClarity: answers.cognitiveClarity,
          socialBattery: answers.socialBattery,
          stressTriggers: answers.stressTriggers,
          bodyMobility: answers.bodyMobility,
          sorenessZone: answers.sorenessZone,
          autonomicBreath: answers.autonomicBreath,
          previousDayStrain: answers.previousDayStrain,
        },
      });

      if (res.ok) {
        setCompleted(true);
        setSuccessMsg(res.message);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to log simulation");
      }
    });
  };

  return (
    <div
      className={`w-full rounded-2xl border border-line bg-surface p-5 sm:p-7 shadow-sm space-y-6 ${
        variant === "inline" ? "max-w-2xl mx-auto" : ""
      }`}
    >
      {/* Simulation Master Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌌</span>
            <h2 className="text-base font-extrabold tracking-tight text-ink">
              Daily Morning Health Simulation
            </h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary-dark">
              Sleep ➔ Mood ➔ Recovery
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            A guided 3-act biological journey predicting your full daily health matrix without guessing numbers.
          </p>
        </div>
        <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-black px-2.5 py-1 shrink-0 self-start sm:self-auto">
          +50 XP Combo
        </span>
      </div>

      {/* 3-Act Sequential Roadmap */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
        <div
          className={`p-2 rounded-xl border transition ${
            step <= 4
              ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20"
              : step > 4
              ? "bg-surface border-line text-emerald-600 line-through opacity-70"
              : "bg-surface border-line text-ink-muted"
          }`}
        >
          <span>🌙 Act 1: Sleep</span>
          <span className="block text-[10px] font-normal text-ink-muted">Q1–Q4</span>
        </div>

        <div
          className={`p-2 rounded-xl border transition ${
            step >= 5 && step <= 8
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20"
              : step > 8
              ? "bg-surface border-line text-emerald-600 line-through opacity-70"
              : "bg-surface border-line text-ink-muted"
          }`}
        >
          <span>☀️ Act 2: Mood</span>
          <span className="block text-[10px] font-normal text-ink-muted">Q5–Q8</span>
        </div>

        <div
          className={`p-2 rounded-xl border transition ${
            step >= 9 && step <= 12
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
              : step > 12
              ? "bg-surface border-line text-emerald-600 font-black"
              : "bg-surface border-line text-ink-muted"
          }`}
        >
          <span>💚 Act 3: Recovery</span>
          <span className="block text-[10px] font-normal text-ink-muted">Q9–Q12</span>
        </div>
      </div>

      {/* Act Transition Banner */}
      {transitionBanner && (
        <div className="p-4 rounded-xl bg-primary-soft text-primary-dark border border-primary/20 text-center animate-pulse text-xs font-bold">
          {transitionBanner}
        </div>
      )}

      {/* Progress Bar */}
      {!isReveal && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-ink-muted">
            <span className="font-semibold text-ink">{currentAct.badge}</span>
            <span>Question {step} of {totalQuestions}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${currentAct.color} transition-all duration-300`}
              style={{ width: `${(step / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACT 1: SLEEP CHRONO-SIMULATION (Steps 1 to 4) */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              🌙 Sleep Chrono · Step 1/4
            </span>
            <h3 className="text-base font-extrabold text-ink">
              What window did you climb into bed and initiate rest last night?
            </h3>
            <p className="text-xs text-ink-soft">
              Circadian alignment governs melatonin production and deep sleep architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              { id: "pre_1030" as BedtimeWindow, icon: "✨", title: "Early Haven (Before 10:30 PM)", desc: "Synchronized with maximal biological melatonin surge" },
              { id: "around_11" as BedtimeWindow, icon: "🌙", title: "Standard Rhythm (10:30 PM – 11:30 PM)", desc: "Optimal balanced sleep-wake circadian baseline" },
              { id: "midnight" as BedtimeWindow, icon: "🦉", title: "Midnight Drift (11:30 PM – 1:00 AM)", desc: "Slight melatonin phase-delay, moderate slow-wave sleep" },
              { id: "late_night" as BedtimeWindow, icon: "⚡", title: "Late Night Owl (1:00 AM – 2:30 AM)", desc: "Reduced deep slow-wave stage, REM compression" },
              { id: "wee_hours" as BedtimeWindow, icon: "🚨", title: "Wee Hours Shift (After 2:30 AM)", desc: "Severe circadian desynchrony & critical sleep debt" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect("bedtimeWindow", opt.id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.bedtimeWindow === opt.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-ink ring-2 ring-indigo-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              🌙 Sleep Chrono · Step 2/4
            </span>
            <h3 className="text-base font-extrabold text-ink">
              Once your head hit the pillow, how swiftly did you drift off?
            </h3>
            <p className="text-xs text-ink-soft">
              Sleep latency directly measures parasympathetic activation speed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: "instant" as DriftOffSpeed, icon: "⚡", title: "Out Like a Light (< 10 mins)", desc: "High adenosine pressure; asleep almost instantly" },
              { id: "peaceful" as DriftOffSpeed, icon: "🌊", title: "Peaceful Drift (15–25 mins)", desc: "Clinically ideal sleep latency spectrum" },
              { id: "racing_mind" as DriftOffSpeed, icon: "🧠", title: "Racing Thoughts (30–60 mins)", desc: "High cognitive arousal delaying sleep onset" },
              { id: "insomnia_toss" as DriftOffSpeed, icon: "🔄", title: "Insomnia Tossing (> 60 mins)", desc: "Prolonged autonomic hyperarousal" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect("driftOffSpeed", opt.id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.driftOffSpeed === opt.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-ink ring-2 ring-indigo-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              🌙 Sleep Chrono · Step 3/4
            </span>
            <h3 className="text-base font-extrabold text-ink">
              Did you experience nocturnal awakenings or tossing during the night?
            </h3>
            <p className="text-xs text-ink-soft">
              Determines sleep continuity index and slow-wave fragmentation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              { id: "none" as NightWakeups, icon: "🛡️", title: "Zero Wakeups (Unbroken Sleep)", desc: "Continuous deep restorative cycles" },
              { id: "one_brief" as NightWakeups, icon: "💧", title: "1 Brief Wakeup (Quick Roll Over)", desc: "Normal micro-arousal with swift return to sleep" },
              { id: "tossed_2_3" as NightWakeups, icon: "🌀", title: "2–3 Choppy Interruptions", desc: "Mild stage fragmentation" },
              { id: "wide_awake_gap" as NightWakeups, icon: "⏳", title: "Wide Awake Gap (45+ mins in middle)", desc: "Significant loss of restorative sleep volume" },
              { id: "restless_storm" as NightWakeups, icon: "🌪️", title: "Restless Storm All Night", desc: "Severe fragmentation, near-zero deep sleep" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect("nightWakeups", opt.id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.nightWakeups === opt.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-ink ring-2 ring-indigo-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              🌙 Sleep Chrono · Step 4/4 (Finishing Sleep Act)
            </span>
            <h3 className="text-base font-extrabold text-ink">
              What was your screen & wind-down routine in the hour before sleep?
            </h3>
            <p className="text-xs text-ink-soft">
              Blue photons suppress pineal melatonin release by up to 80%.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: "dim_book_60m" as ScreenWindDown, icon: "📖", title: "Dim Book / Music (60m+)", desc: "Maximal melatonin surge" },
              { id: "short_check_15m" as ScreenWindDown, icon: "📱", title: "Brief Screen Check (15m)", desc: "Mild light impact" },
              { id: "scrolled_in_bed" as ScreenWindDown, icon: "🤳", title: "Scrolled in Bed Till Sleepy", desc: "Significant melatonin suppression" },
              { id: "tv_sleep_timer" as ScreenWindDown, icon: "📺", title: "TV Running on Sleep Timer", desc: "Sensory stimuli fragmenting early sleep" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  handleSelect(
                    "screenWindDown",
                    opt.id,
                    "🌙 Sleep Phase Complete! Transitioning to Morning Mindset & Mood... ➔"
                  )
                }
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.screenWindDown === opt.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-ink ring-2 ring-indigo-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACT 2: MORNING MINDSET & MOOD (Steps 5 to 8) */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              ☀️ Morning Mood · Step 1/4
            </span>
            <h3 className="text-base font-extrabold text-ink">
              When your eyes opened this morning, what was your initial mental state?
            </h3>
            <p className="text-xs text-ink-soft">
              Cortisol Awakening Response (CAR) indicator reflecting initial neurological drive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: "excited_ready" as BootupMindset, icon: "🚀", title: "Excited & Driven", desc: "High dopaminergic anticipation for today" },
              { id: "calm_grounded" as BootupMindset, icon: "🧘", title: "Calm & Centered", desc: "Serene, peaceful emotional equilibrium" },
              { id: "overwhelmed_todos" as BootupMindset, icon: "📋", title: "Suffocated by To-Dos", desc: "Elevated cortisol spike & immediate stress" },
              { id: "stormy_drained" as BootupMindset, icon: "🌧️", title: "Heavy & Emotionally Drained", desc: "Low emotional resilience / depleted neurotransmitters" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect("bootupMindset", opt.id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.bootupMindset === opt.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-ink ring-2 ring-amber-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              ☀️ Morning Mood · Step 2/4
            </span>
            <h3 className="text-base font-extrabold text-ink">
              How sharp is your prefrontal cognitive clarity and focus right now?
            </h3>
            <p className="text-xs text-ink-soft">
              Tests executive cognitive speed and mental clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: "laser_4k" as CognitiveClarity, icon: "🎯", title: "4K Laser Focus", desc: "Crystal clear executive thinking & memory" },
              { id: "steady_coffee" as CognitiveClarity, icon: "☕", title: "Steady Baseline", desc: "Fully functional & ready for standard tasks" },
              { id: "foggy_scattered" as CognitiveClarity, icon: "🌫️", title: "Hazy Brain Fog", desc: "Scattered attention, feeling sluggish" },
              { id: "spaced_out" as CognitiveClarity, icon: "🌀", title: "Zoned Out / Glitchy", desc: "Severe cognitive fatigue" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect("cognitiveClarity", opt.id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.cognitiveClarity === opt.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-ink ring-2 ring-amber-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              ☀️ Morning Mood · Step 3/4
            </span>
            <h3 className="text-base font-extrabold text-ink">
              What does your social battery and patience buffer feel like today?
            </h3>
            <p className="text-xs text-ink-soft">
              Social bandwidth reflects autonomic parasympathetic balance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: "full_friendly" as SocialBattery, icon: "🌟", title: "Full & Magnetic", desc: "High empathy, eager to communicate" },
              { id: "selective_peace" as SocialBattery, icon: "☕", title: "Polite & Selective", desc: "Fine for small doses, prefer quiet" },
              { id: "headphones_on" as SocialBattery, icon: "🎧", title: "Solo Mode (Do Not Disturb)", desc: "Low empathy bandwidth; need personal space" },
              { id: "irritable_short" as SocialBattery, icon: "⚡", title: "Short Fuse / Sensitive", desc: "Autonomic strain manifesting as irritability" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect("socialBattery", opt.id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.socialBattery === opt.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-ink ring-2 ring-amber-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 8 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              ☀️ Morning Mood · Step 4/4 (Finishing Mood Act)
            </span>
            <h3 className="text-base font-extrabold text-ink">
              What allostatic stress triggers are demanding your attention today?
            </h3>
            <p className="text-xs text-ink-soft">
              Evaluates neuroendocrine stress load and burnout vulnerability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              { id: "minimal_smooth" as StressTriggers, icon: "🍃", title: "Minimal Pressure (Smooth Sailing)", desc: "Calm calendar and supportive environment" },
              { id: "deadline_pressure" as StressTriggers, icon: "⏰", title: "Deadlines / Workload Rush", desc: "Moderate situational deadline pressure" },
              { id: "interpersonal_friction" as StressTriggers, icon: "👥", title: "Interpersonal / Relationship Friction", desc: "Emotional drain from conversations or conflicts" },
              { id: "chronic_burnout" as StressTriggers, icon: "🔥", title: "Chronic Multitasking & Burnout", desc: "Exhausted adrenals and prolonged fatigue" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  handleSelect(
                    "stressTriggers",
                    opt.id,
                    "☀️ Mood Calibrated! Transitioning to Physical Recovery & Nervous System... ➔"
                  )
                }
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.stressTriggers === opt.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-ink ring-2 ring-amber-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACT 3: BODY RECOVERY & READINESS (Steps 9 to 12) */}
      {/* ========================================================================= */}
      {step === 9 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              💚 Body Recovery · Step 1/4
            </span>
            <h3 className="text-base font-extrabold text-ink">
              When you first stepped out of bed, how did your joints & muscles move?
            </h3>
            <p className="text-xs text-ink-soft">
              Biomechanical spring test measuring neuromuscular recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: "limber_spring" as BodyMobility, icon: "⚡", title: "Limber & Springy", desc: "Muscles light, zero joint resistance" },
              { id: "steady_normal" as BodyMobility, icon: "🚶", title: "Healthy Normal Baseline", desc: "Warmed up quickly with routine steps" },
              { id: "heavy_achy" as BodyMobility, icon: "🧱", title: "Heavy, Stiff & Sluggish", desc: "Slow to get going; delayed motor fluid" },
              { id: "deep_exhaustion" as BodyMobility, icon: "🛑", title: "Deep Systemic Soreness", desc: "Body feels weighed down by lead" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect("bodyMobility", opt.id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.bodyMobility === opt.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-ink ring-2 ring-emerald-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 10 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              💚 Body Recovery · Step 2/4
            </span>
            <h3 className="text-base font-extrabold text-ink">
              Do you feel localized soreness or tension anywhere in your body?
            </h3>
            <p className="text-xs text-ink-soft">
              Maps DOMS (Delayed Onset Muscle Soreness) and postural strain points.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              { id: "none" as SorenessZone, icon: "✨", title: "Zero Muscle Soreness", desc: "Muscles feel completely refreshed & pain-free" },
              { id: "neck_shoulders" as SorenessZone, icon: "💆", title: "Neck & Upper Trapezius", desc: "Postural desk tension or sleep pillow strain" },
              { id: "lower_back" as SorenessZone, icon: "🧘", title: "Lower Back / Lumbar", desc: "Spinal compression or core muscular fatigue" },
              { id: "legs_glutes" as SorenessZone, icon: "🦵", title: "Legs, Hamstrings & Glutes", desc: "Lower body muscular load from walking/training" },
              { id: "full_body_tender" as SorenessZone, icon: "🩹", title: "Full Body Tender / Aching", desc: "Systemic micro-tears requiring full passive recovery" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect("sorenessZone", opt.id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.sorenessZone === opt.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-ink ring-2 ring-emerald-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 11 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              💚 Body Recovery · Step 3/4
            </span>
            <h3 className="text-base font-extrabold text-ink">
              Take one slow, deep breath in: how does your pulse and chest feel?
            </h3>
            <p className="text-xs text-ink-soft">
              Clinical subjective proxy for vagal nerve tone and Heart Rate Variability (HRV).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              { id: "deep_calm" as AutonomicBreath, icon: "🌊", title: "Deep, Slow & Effortless", desc: "Strong parasympathetic vagal braking; high resilience" },
              { id: "steady_even" as AutonomicBreath, icon: "🫁", title: "Steady Baseline Rhythm", desc: "Normal balanced autonomic tone" },
              { id: "fluttery_tight" as AutonomicBreath, icon: "💓", title: "Slightly Elevated / Chest Tightness", desc: "Sympathetic dominance; nervous system running hot" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect("autonomicBreath", opt.id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.autonomicBreath === opt.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-ink ring-2 ring-emerald-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 12 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              💚 Body Recovery · Step 4/4 (Finishing Simulation)
            </span>
            <h3 className="text-base font-extrabold text-ink">
              What was your physical exertion & strain level yesterday?
            </h3>
            <p className="text-xs text-ink-soft">
              Accounting for acute residual fatigue and muscle protein synthesis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: "rest_day" as PreviousDayStrain, icon: "🛋️", title: "Rest & Sedentary", desc: "Minimal muscular load; reserves fully primed" },
              { id: "moderate_active" as PreviousDayStrain, icon: "🏃", title: "Active Day (7k–10k steps / Workout)", desc: "Standard healthy training strain" },
              { id: "brutal_intense" as PreviousDayStrain, icon: "🏋️", title: "Heavy Workout / Long Run", desc: "High central nervous system fatigue" },
              { id: "poor_recovery_cycle" as PreviousDayStrain, icon: "⚠️", title: "Multi-Day Stacked Fatigue", desc: "Accumulated unrecovered strain load" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  handleSelect(
                    "previousDayStrain",
                    opt.id,
                    "💚 Simulation Complete! Synthesizing Your Daily Biometric Matrix... ➔"
                  )
                }
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  answers.previousDayStrain === opt.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-ink ring-2 ring-emerald-500/20"
                    : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                }`}
              >
                <span className="text-2xl mt-0.5">{opt.icon}</span>
                <div>
                  <div className="text-xs font-bold text-ink">{opt.title}</div>
                  <div className="text-[11px] text-ink-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FINAL STEP 13: GRAND SIMULATION REVEAL & LOCK-IN */}
      {/* ========================================================================= */}
      {isReveal && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-primary to-emerald-600 text-white shadow-xs">
              🎉 Daily Simulation Synthesis Complete!
            </span>
            <h3 className="text-xl font-extrabold text-ink">
              Your Calibrated Daily Health Matrix
            </h3>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              Simulated through your circadian sleep timing, morning mental clarity, and autonomic nervous system tone.
            </p>
          </div>

          {/* 3 Calibrated Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Act 1: Sleep */}
            <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                  🌙 Calibrated Sleep
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                  {result.sleepQuality}% Quality
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-indigo-900 dark:text-indigo-100">
                  {result.sleepHours}
                </span>
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">hours</span>
              </div>
              <p className="text-[11px] text-ink-soft">
                <strong>Efficiency:</strong> {result.sleepEfficiency}%
              </p>
              <p className="text-[11px] text-ink-muted">
                {result.sleepDebtStatus}
              </p>
            </div>

            {/* Act 2: Mood */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                  ☀️ Morning Mood
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  {result.moodScore} / 5 Score
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-900 dark:text-amber-100">
                  {result.moodValence}
                </span>
              </div>
              <p className="text-[11px] text-ink-soft">
                <strong>Stress Index:</strong> {result.stressIndex}/100
              </p>
              <p className="text-[11px] text-ink-muted">
                Burnout Risk: {result.burnoutRisk}
              </p>
            </div>

            {/* Act 3: Recovery */}
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                  💚 Autonomic Recovery
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  {result.recoveryStatusLabel}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
                  {result.recoveryScore}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">% Readiness</span>
              </div>
              <p className="text-[11px] text-ink-soft">
                <strong>Target Strain:</strong> {result.recommendedStrain}
              </p>
              <p className="text-[11px] text-ink-muted">
                {result.autonomicTone}
              </p>
            </div>
          </div>

          {/* Actionable Advice */}
          <div className="p-3.5 rounded-xl border border-line bg-surface-subtle text-xs text-ink-soft space-y-1">
            <span className="font-bold text-ink">💡 Simulation Action Plan:</span>
            <p>{result.actionableAdvice}</p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-50 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50 text-emerald-800 text-center text-xs font-bold">
              🎉 {successMsg}
            </div>
          )}

          {/* Lock-In Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!completed ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={pending}
                className="lif-btn-primary flex-1 py-3 text-sm font-black shadow-md flex items-center justify-center gap-2"
              >
                {pending ? (
                  "Locking in All 3 Biometrics..."
                ) : (
                  <>
                    <span>🚀 Lock In Morning Simulation</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">+50 XP</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onDone) onDone();
                  else router.push("/app/dashboard");
                }}
                className="lif-btn-primary flex-1 py-3 text-sm font-black"
              >
                View Updated Dashboard ➔
              </button>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={pending}
              className="lif-btn-secondary py-3 px-5 text-xs font-bold shrink-0"
            >
              Restart Simulation ↺
            </button>
          </div>
        </div>
      )}

      {/* Footer Back/Skip Buttons */}
      {!isReveal && step > 1 && (
        <div className="flex justify-between items-center pt-2 border-t border-line text-xs">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="text-ink-muted hover:text-ink font-semibold flex items-center gap-1"
          >
            ← Previous Question
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="text-primary hover:text-primary-dark font-bold flex items-center gap-1"
          >
            Skip to Next →
          </button>
        </div>
      )}
    </div>
  );
}
