"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  evaluateDeepSleepQuest,
  type DeepSleepQuestAnswers,
} from "@/lib/rules/tri-factor-quiz";
import { logSleepFromQuiz } from "@/lib/actions/logs";
import { submitQuizSafely } from "./save-quiz-helper";

interface SleepQuizProps {
  onDone?: () => void;
  variant?: "modal" | "inline";
}

export function SleepQuiz({ onDone, variant = "inline" }: SleepQuizProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [pending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [answers, setAnswers] = useState<DeepSleepQuestAnswers>({
    bedtimeWindow: "around_11",
    driftOffSpeed: "peaceful",
    nightWakeups: "one_brief",
    caffeineCutoff: "before_2pm",
    screenWindDown: "dim_book_60m",
    bedroomClimate: "cool_pitch_dark",
    dreamRecall: "vivid_calm",
  });

  const [customHours, setCustomHours] = useState<number | null>(null);
  const [showReviewList, setShowReviewList] = useState(true);

  const sleepLabels = {
    bedtimeWindow: {
      pre_1030: "Early Haven (9:30 – 10:30 PM)",
      around_11: "Standard Rhythm (10:30 – 11:30 PM)",
      midnight: "Midnight Drift (11:30 PM – 12:45 AM)",
      late_night: "Late Night Owl (12:45 – 2:00 AM)",
      wee_hours: "Wee Hours (After 2:00 AM)",
    },
    driftOffSpeed: {
      instant: "Out Like a Light (< 10 mins)",
      peaceful: "Peaceful Drift (15–25 mins)",
      racing_mind: "Racing Thoughts (30–60 mins)",
      insomnia_toss: "Insomnia Tossing (> 60 mins)",
    },
    nightWakeups: {
      none: "Zero Awakenings (Unbroken)",
      one_brief: "Woke Up Once",
      tossed_2_3: "Choppy (2–3 wakeups)",
      wide_awake_gap: "Wide Awake Gap (45+ mins)",
      restless_storm: "Restless Storm All Night",
    },
    caffeineCutoff: {
      before_2pm: "Before 2:00 PM",
      late_afternoon: "Late Afternoon (3–5 PM)",
      with_dinner: "With Dinner (6–8 PM)",
      late_night: "Late Evening (After 8 PM)",
    },
    screenWindDown: {
      dim_book_60m: "Dim Light / Reading (60m+)",
      short_check_15m: "Short Screen Check (15m)",
      scrolled_in_bed: "Scrolled in Bed Till Sleepy",
      tv_sleep_timer: "TV on Sleep Timer",
    },
    bedroomClimate: {
      cool_pitch_dark: "Cool & Pitch Black (< 20°C / 68°F)",
      normal: "Normal Comfortable Room",
      warm_stuffy: "Warm, Stuffy, or Humid",
      noisy_street: "Street Noise or Light Leaks",
    },
    dreamRecall: {
      vivid_calm: "Vivid, Pleasant, Cinematic",
      faint_pleasant: "Faint Pleasant Memories",
      stress_nightmares: "Stress Dreams or Nightmares",
      blank_blackout: "Total Blank / Deep Blackout",
    },
  };

  const result = evaluateDeepSleepQuest(answers);
  const totalSteps = 7;
  const isReveal = step > totalSteps;

  const handleSelect = <K extends keyof DeepSleepQuestAnswers>(key: K, value: DeepSleepQuestAnswers[K]) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 200);
  };

  const handleSave = () => {
    setErrorMsg("");
    startTransition(async () => {
      const finalHours = customHours ?? result.sleepHours;
      const payload = {
        hours: finalHours,
        quality: result.sleepQuality,
        efficiency: result.sleepEfficiency,
        deepScore: result.deepSleepScore,
        debtStatus: result.sleepDebtStatus,
        tips: result.personalizedSleepTips,
      };

      const res = await submitQuizSafely(
        "sleep",
        payload,
        () => logSleepFromQuiz(payload)
      );

      if (res.ok) {
        setCompleted(true);
        setSuccessMsg(res.message);
        router.refresh();
        if (onDone) setTimeout(onDone, 1600);
      } else {
        setErrorMsg(res.error ?? "Failed to save sleep metrics. Please try again.");
      }
    });
  };

  return (
    <div
      className={`relative w-full transition-all ${
        variant === "modal"
          ? "p-1 sm:p-2 border-0 bg-transparent shadow-none"
          : "max-w-2xl mx-auto rounded-2xl border border-indigo-500/25 bg-surface p-4 sm:p-6 shadow-sm"
      }`}
    >
      {/* Quiz Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line/60">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-lg">
            🌙
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-ink">Sleep Chrono-Predictor</span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-extrabold text-indigo-400">
                +25 XP
              </span>
            </div>
            <span className="text-[11px] text-ink-muted">Circadian Architecture & Hygiene Check</span>
          </div>
        </div>

        {!completed && !isReveal && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-ink-soft">
              {step}/{totalSteps}
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Question Pill Navigator */}
      {!completed && (
        <div className="flex items-center justify-between gap-1.5 pt-2 pb-1 border-b border-line/40 overflow-x-auto text-xs">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((qNum) => (
              <button
                key={qNum}
                type="button"
                onClick={() => setStep(qNum)}
                className={`h-5 min-w-5 px-1.5 rounded text-[10px] font-black cursor-pointer ${
                  step === qNum
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-surface border border-line text-ink-soft hover:bg-surface-subtle"
                }`}
                title={`Jump to Question ${qNum}`}
              >
                Q{qNum}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(totalSteps + 1)}
            className={`h-5 px-2 rounded text-[10px] font-black cursor-pointer whitespace-nowrap ${
              isReveal
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-surface border border-line text-ink hover:bg-surface-subtle"
            }`}
            title="Jump to Results & Review"
          >
            Review 📋
          </button>
        </div>
      )}

      {/* Editing Shortcut Banner */}
      {!completed && !isReveal && (
        <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-surface-subtle border border-line text-[11px] mt-2">
          <span className="text-ink-soft">Answering Question {step}/{totalSteps}</span>
          <button
            type="button"
            onClick={() => setStep(totalSteps + 1)}
            className="font-bold text-indigo-400 hover:underline cursor-pointer"
          >
            Jump to Review ➔
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="mt-3 rounded-xl bg-crisis-soft px-3 py-2 text-xs font-medium text-crisis">
          {errorMsg}
        </p>
      )}

      {/* Completed State */}
      {completed ? (
        <div className="py-8 text-center space-y-4 animate-fadeIn">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-3xl">
            ✨
          </div>
          <h3 className="text-xl font-black text-ink">Sleep Matrix Synchronized!</h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            {successMsg || "Your nocturnal rest duration, sleep efficiency, and deep sleep score have been recorded."}
          </p>
          <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/20 px-4 py-2 text-xs font-bold text-indigo-400">
            <span>🎯</span> +25 XP Earned · Sleep Log Synchronized
          </div>
          <div className="pt-2">
            <button onClick={() => onDone?.()} className="lif-btn-primary py-2.5 px-6 text-xs font-bold">
              View Health Dashboard →
            </button>
          </div>
        </div>
      ) : isReveal ? (
        /* REVEAL SCREEN */
        <div className="space-y-5 pt-3 animate-fadeIn">
          <div className="text-center space-y-1">
            <span className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-extrabold text-indigo-400">
              🌙 Sleep Chrono-Matrix Calibrated
            </span>
            <h2 className="text-xl font-black text-ink">Your Inferred Sleep Profile</h2>
            <p className="text-xs text-ink-muted">
              Calculated deterministically from your circadian bedtime, sleep latency, room climate, and awakenings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl">⏳</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Duration</span>
              <div className="text-3xl font-black text-ink">
                {customHours ?? result.sleepHours}{" "}
                <span className="text-xs font-semibold text-ink-muted">hrs</span>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1 border-t border-line/60">
                <button
                  type="button"
                  onClick={() => setCustomHours((prev) => Math.max(3, Math.round(((prev ?? result.sleepHours) - 0.25) * 100) / 100))}
                  className="h-6 w-6 rounded-md border border-line bg-surface text-xs font-bold text-ink hover:bg-surface-subtle"
                >
                  -
                </button>
                <span className="text-[10px] text-ink-muted">Tweak</span>
                <button
                  type="button"
                  onClick={() => setCustomHours((prev) => Math.min(12, Math.round(((prev ?? result.sleepHours) + 0.25) * 100) / 100))}
                  className="h-6 w-6 rounded-md border border-line bg-surface text-xs font-bold text-ink hover:bg-surface-subtle"
                >
                  +
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl">💤</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Efficiency</span>
              <div className="text-3xl font-black text-indigo-400">{result.sleepEfficiency}%</div>
              <span className="text-[10px] text-ink-muted block">{result.deepSleepScore}% Deep Sleep</span>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl">🌿</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Hygiene Score</span>
              <div className="text-3xl font-black text-primary-dark">{result.sleepHygieneScore}/100</div>
              <span className="text-[10px] text-ink-muted block">{result.sleepDebtStatus}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-1">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <span>💡</span> Sleep Optimization Tip
            </span>
            <p className="text-xs text-ink-soft leading-relaxed">{result.personalizedSleepTips}</p>
          </div>

          {/* Review & Edit Answers */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h4 className="text-xs font-black text-ink flex items-center gap-1.5">
                <span>📋</span> Review & Change Sleep Responses (7 Total)
              </h4>
              <button
                type="button"
                onClick={() => setShowReviewList(!showReviewList)}
                className="text-[11px] font-bold text-indigo-400 hover:underline cursor-pointer"
              >
                {showReviewList ? "Hide ▲" : "Show ▼"}
              </button>
            </div>

            {showReviewList && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q1: Bedtime Window</span>
                    <span className="font-bold text-ink truncate block">{sleepLabels.bedtimeWindow[answers.bedtimeWindow]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="text-[11px] font-extrabold text-indigo-400 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q2: Drift-off Speed</span>
                    <span className="font-bold text-ink truncate block">{sleepLabels.driftOffSpeed[answers.driftOffSpeed]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="text-[11px] font-extrabold text-indigo-400 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q3: Night Wakeups</span>
                    <span className="font-bold text-ink truncate block">{sleepLabels.nightWakeups[answers.nightWakeups]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(3)} className="text-[11px] font-extrabold text-indigo-400 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q4: Caffeine Cutoff</span>
                    <span className="font-bold text-ink truncate block">{sleepLabels.caffeineCutoff[answers.caffeineCutoff]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(4)} className="text-[11px] font-extrabold text-indigo-400 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q5: Screen Wind-down</span>
                    <span className="font-bold text-ink truncate block">{sleepLabels.screenWindDown[answers.screenWindDown]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(5)} className="text-[11px] font-extrabold text-indigo-400 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q6: Bedroom Climate</span>
                    <span className="font-bold text-ink truncate block">{sleepLabels.bedroomClimate[answers.bedroomClimate]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(6)} className="text-[11px] font-extrabold text-indigo-400 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2 sm:col-span-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q7: Dream Recall</span>
                    <span className="font-bold text-ink truncate block">{sleepLabels.dreamRecall[answers.dreamRecall]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(7)} className="text-[11px] font-extrabold text-indigo-400 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer">Change ✏️</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-ink-muted hover:text-ink cursor-pointer"
            >
              ← Restart from Q1
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleSave}
              className="lif-btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 shadow-md hover:scale-102 transition cursor-pointer"
            >
              <span>🌙</span>
              <span>{pending ? "Saving..." : "Lock In Sleep Log (+25 XP)"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* QUESTIONS 1-7 */
        <div className="pt-3 space-y-4">
          {step === 1 && (
            <QuestionBlock
              title="When did your head hit the pillow?"
              subtitle="Circadian sleep window alignment."
              options={[
                { id: "pre_1030", emoji: "🦉", label: "Early Haven (9:30 – 10:30 PM)", desc: "Aligned with natural melatonin onset." },
                { id: "around_11", emoji: "🌙", label: "Standard Rhythm (10:30 – 11:30 PM)", desc: "Balanced standard bedtime." },
                { id: "midnight", emoji: "📱", label: "Midnight Drift (11:30 PM – 12:45 AM)", desc: "Slight evening delay." },
                { id: "late_night", emoji: "⚡", label: "Late Night Owl (12:45 – 2:00 AM)", desc: "Compressed nocturnal window." },
                { id: "wee_hours", emoji: "🌌", label: "Wee Hours (After 2:00 AM)", desc: "Shift schedule or severe delay." },
              ]}
              current={answers.bedtimeWindow}
              onSelect={(v) => handleSelect("bedtimeWindow", v as any)}
            />
          )}

          {step === 2 && (
            <QuestionBlock
              title="How long did it take to drift off?"
              subtitle="Parasympathetic onset and sleep latency."
              options={[
                { id: "instant", emoji: "⚡", label: "Out like a light (< 10 mins)", desc: "High sleep pressure, fast onset." },
                { id: "peaceful", emoji: "🍃", label: "Peaceful drift (15 – 25 mins)", desc: "Gentle natural transition into slumber." },
                { id: "racing_mind", emoji: "🌀", label: "Mind racing / scrolling (30 – 60 mins)", desc: "Cognitive or screen stimulation." },
                { id: "insomnia_toss", emoji: "🌪️", label: "Tossed around (> 60 mins)", desc: "Elevated sleep latency strain." },
              ]}
              current={answers.driftOffSpeed}
              onSelect={(v) => handleSelect("driftOffSpeed", v as any)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <QuestionBlock
              title="Did you wake up in the middle of the night?"
              subtitle="Slow-wave deep sleep continuity."
              options={[
                { id: "none", emoji: "🛡️", label: "Zero awakenings (Dead to the world)", desc: "Unbroken, uninterrupted sleep." },
                { id: "one_brief", emoji: "💧", label: "Woke up once (Quick water/restroom)", desc: "Fell back asleep right away." },
                { id: "tossed_2_3", emoji: "💤", label: "Choppy (2–3 wakeups)", desc: "Felt slightly fragmented." },
                { id: "wide_awake_gap", emoji: "👀", label: "Wide awake gap (45+ mins)", desc: "Stuck staring at the ceiling." },
                { id: "restless_storm", emoji: "⚡", label: "Restless storm all night", desc: "Frequent tossing, very light rest." },
              ]}
              current={answers.nightWakeups}
              onSelect={(v) => handleSelect("nightWakeups", v as any)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <QuestionBlock
              title="When was your last caffeine or stimulant?"
              subtitle="Caffeine has a 6-hour half-life that blocks deep sleep."
              options={[
                { id: "before_2pm", emoji: "☕", label: "Before 2:00 PM", desc: "Optimal: fully cleared before bed." },
                { id: "late_afternoon", emoji: "🍵", label: "Late afternoon (3 – 5 PM)", desc: "Minor residual caffeine." },
                { id: "with_dinner", emoji: "🥤", label: "With dinner (6 – 8 PM)", desc: "Disrupts deep restorative stages." },
                { id: "late_night", emoji: "⚡", label: "Late evening (After 8 PM)", desc: "Heavy deep sleep disruption." },
              ]}
              current={answers.caffeineCutoff}
              onSelect={(v) => handleSelect("caffeineCutoff", v as any)}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <QuestionBlock
              title="What was your pre-bed screen routine?"
              subtitle="Blue light suppresses natural pineal melatonin."
              options={[
                { id: "dim_book_60m", emoji: "📖", label: "Dim light / reading (60m+)", desc: "Melatonin-friendly wind-down." },
                { id: "short_check_15m", emoji: "💡", label: "Short screen check (15m)", desc: "Night mode enabled, mild." },
                { id: "scrolled_in_bed", emoji: "📱", label: "Scrolled in bed until sleeping", desc: "Blue light delayed melatonin onset." },
                { id: "tv_sleep_timer", emoji: "📺", label: "TV on sleep timer", desc: "Audio-visual flickering." },
              ]}
              current={answers.screenWindDown}
              onSelect={(v) => handleSelect("screenWindDown", v as any)}
              onBack={() => setStep(4)}
            />
          )}

          {step === 6 && (
            <QuestionBlock
              title="How was your bedroom environment?"
              subtitle="Thermoregulation and darkness dictate REM stability."
              options={[
                { id: "cool_pitch_dark", emoji: "❄️", label: "Cool & pitch black (< 20°C / 68°F)", desc: "Clinical sleep cave." },
                { id: "normal", emoji: "🏠", label: "Normal comfortable room", desc: "Standard baseline." },
                { id: "warm_stuffy", emoji: "🌡️", label: "Warm, stuffy, or humid", desc: "Inhibited core temperature drop." },
                { id: "noisy_street", emoji: "🚗", label: "Street noise or light leaks", desc: "Subconscious micro-arousals." },
              ]}
              current={answers.bedroomClimate}
              onSelect={(v) => handleSelect("bedroomClimate", v as any)}
              onBack={() => setStep(5)}
            />
          )}

          {step === 7 && (
            <QuestionBlock
              title="Do you recall your dreams from last night?"
              subtitle="Direct window into REM cycle completion."
              options={[
                { id: "vivid_calm", emoji: "🌌", label: "Vivid, pleasant, cinematic", desc: "High restorative REM balance." },
                { id: "faint_pleasant", emoji: "🍃", label: "Faint pleasant memories", desc: "Healthy REM cycle completion." },
                { id: "stress_nightmares", emoji: "⚡", label: "Stress dreams or nightmares", desc: "Elevated nocturnal cortisol." },
                { id: "blank_blackout", emoji: "🕳️", label: "Total blank / deep blackout", desc: "Slow-wave deep dominance." },
              ]}
              current={answers.dreamRecall}
              onSelect={(v) => handleSelect("dreamRecall", v as any)}
              onBack={() => setStep(6)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function QuestionBlock({
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
            className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-101 ${
              current === opt.id
                ? "border-indigo-500 bg-indigo-500/10 shadow-xs ring-1 ring-indigo-500/30"
                : "border-line bg-surface hover:bg-surface-subtle"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <span className="block text-xs font-bold text-ink">{opt.label}</span>
                <span className="block text-[11px] text-ink-muted">{opt.desc}</span>
              </div>
            </div>
            {current === opt.id && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {onBack && (
        <div className="flex justify-start pt-1">
          <button type="button" onClick={onBack} className="text-xs font-semibold text-ink-muted hover:text-ink">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
