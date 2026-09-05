"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  evaluateDeepMoodQuest,
  type DeepMoodQuestAnswers,
} from "@/lib/rules/tri-factor-quiz";
import { logMoodFromQuiz } from "@/lib/actions/logs";

interface MoodQuizProps {
  onDone?: () => void;
  variant?: "modal" | "inline";
}

export function MoodQuiz({ onDone, variant = "inline" }: MoodQuizProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [pending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [answers, setAnswers] = useState<DeepMoodQuestAnswers>({
    bootupMindset: "calm_grounded",
    cognitiveClarity: "steady_coffee",
    socialBattery: "selective_peace",
    stressTriggers: "minimal_smooth",
    innerSelfTalk: "neutral_pragmatic",
    energyStability: "steady_flowing",
  });

  const [showReviewList, setShowReviewList] = useState(true);

  const moodLabels = {
    bootupMindset: {
      excited_ready: "Excited about today! High drive",
      calm_grounded: "Grounded & peaceful, step by step",
      overwhelmed_todos: "Anxious / to-do list suffocating",
      stormy_drained: "Emotionally empty & discouraged",
    },
    cognitiveClarity: {
      laser_4k: "4K Laser Focus (Ultra clear)",
      steady_coffee: "Steady & functional",
      foggy_scattered: "Hazy brain fog / scattered",
      spaced_out: "Zoned out in slow-motion",
    },
    socialBattery: {
      full_friendly: "Full & Magnetic (High empathy)",
      selective_peace: "Polite & Selective (Quiet)",
      headphones_on: "Solo Mode (Do Not Disturb)",
      irritable_short: "Short Fuse / Sensitive",
    },
    stressTriggers: {
      minimal_smooth: "Minimal pressure (Smooth sailing)",
      deadline_pressure: "Deadline crunch / heavy workload",
      interpersonal_friction: "Interpersonal or relational friction",
      health_body_anxiety: "Health & Somatic Body Tension",
      chronic_burnout: "Chronic stress / overwhelmed",
    },
    innerSelfTalk: {
      empowering_kind: "Compassionate & encouraging",
      neutral_pragmatic: "Pragmatic & task-focused",
      harsh_critical: "Harsh & self-critical",
      anxious_catastrophic: "Anxious & worst-case looping",
    },
    energyStability: {
      steady_flowing: "Smooth & sustained endurance",
      moderate_rollercoaster: "Rollercoaster with afternoon slump",
      crash_and_burn: "Immediate crash & severe fatigue",
    },
  };

  const result = evaluateDeepMoodQuest(answers);
  const totalSteps = 6;
  const isReveal = step > totalSteps;

  const handleSelect = <K extends keyof DeepMoodQuestAnswers>(key: K, value: DeepMoodQuestAnswers[K]) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 200);
  };

  const handleSave = () => {
    setErrorMsg("");
    startTransition(async () => {
      const res = await logMoodFromQuiz({
        score: result.moodScore,
        valence: result.moodValence,
        stressIndex: result.stressIndex,
        focus: result.mindsetNudge,
      });

      if (res.ok) {
        setCompleted(true);
        setSuccessMsg(res.message);
        router.refresh();
        if (onDone) setTimeout(onDone, 1600);
      } else {
        setErrorMsg(res.error ?? "Failed to save mood metrics");
      }
    });
  };

  return (
    <div
      className={`relative w-full rounded-2xl border border-amber-500/20 bg-linear-to-b from-slate-900/90 to-surface p-4 sm:p-6 shadow-md transition-all ${
        variant === "inline" ? "max-w-2xl mx-auto" : ""
      }`}
    >
      {/* Quiz Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line/60">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-lg">
            🙂
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-ink">Mindset & Mood Radar</span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-400">
                +25 XP
              </span>
            </div>
            <span className="text-[11px] text-ink-muted">Cognitive Bandwidth & Stress Index</span>
          </div>
        </div>

        {!completed && !isReveal && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-ink-soft">
              {step}/{totalSteps}
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
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
                    ? "bg-amber-600 text-white shadow-xs"
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
                ? "bg-amber-600 text-white shadow-xs"
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
            className="font-bold text-amber-500 hover:underline cursor-pointer"
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-3xl">
            ☀️
          </div>
          <h3 className="text-xl font-black text-ink">Mood Matrix Recorded!</h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            {successMsg || "Your mood score, emotional valence, and stress index have been synchronized."}
          </p>
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-400">
            <span>🎯</span> +25 XP Earned · Daily Check-In Complete
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
            <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-extrabold text-amber-400">
              ☀️ Mood & Mindset Calibrated
            </span>
            <h2 className="text-xl font-black text-ink">Your Psychological Matrix</h2>
            <p className="text-xs text-ink-muted">
              Inferred from prefrontal clarity, allostatic stress triggers, self-talk, and social bandwidth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl">{result.moodScore >= 4 ? "☀️" : "⛅"}</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Mood Score</span>
              <div className="text-4xl font-black text-amber-500">
                {result.moodScore} <span className="text-xs font-semibold text-ink-muted">/ 5</span>
              </div>
              <span className="text-[10px] text-ink-muted block">{result.moodValence}</span>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl">🧠</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Cognitive Clarity</span>
              <div className="text-3xl font-black text-ink">{result.cognitiveClarityScore}%</div>
              <span className="text-[10px] text-ink-muted block">{result.socialBandwidth}</span>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl">⚡</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Stress Index</span>
              <div className="text-3xl font-black text-crisis">{result.stressIndex}/100</div>
              <span className="text-[10px] text-ink-muted block">Risk: {result.burnoutRisk}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <span>💡</span> Daily Mindset Nudge
            </span>
            <p className="text-xs text-ink-soft leading-relaxed">{result.mindsetNudge}</p>
          </div>

          {/* Review & Edit Answers */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h4 className="text-xs font-black text-ink flex items-center gap-1.5">
                <span>📋</span> Review & Change Mood Responses (6 Total)
              </h4>
              <button
                type="button"
                onClick={() => setShowReviewList(!showReviewList)}
                className="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer"
              >
                {showReviewList ? "Hide ▲" : "Show ▼"}
              </button>
            </div>

            {showReviewList && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q1: Bootup Mindset</span>
                    <span className="font-bold text-ink truncate block">{moodLabels.bootupMindset[answers.bootupMindset]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="text-[11px] font-extrabold text-amber-500 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q2: Cognitive Clarity</span>
                    <span className="font-bold text-ink truncate block">{moodLabels.cognitiveClarity[answers.cognitiveClarity]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="text-[11px] font-extrabold text-amber-500 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q3: Social Battery</span>
                    <span className="font-bold text-ink truncate block">{moodLabels.socialBattery[answers.socialBattery]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(3)} className="text-[11px] font-extrabold text-amber-500 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q4: Stress Triggers</span>
                    <span className="font-bold text-ink truncate block">{moodLabels.stressTriggers[answers.stressTriggers]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(4)} className="text-[11px] font-extrabold text-amber-500 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q5: Inner Self-Talk</span>
                    <span className="font-bold text-ink truncate block">{moodLabels.innerSelfTalk[answers.innerSelfTalk]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(5)} className="text-[11px] font-extrabold text-amber-500 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer">Change ✏️</button>
                </div>

                <div className="p-2 rounded-xl border border-line bg-surface-subtle flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-ink-muted block">Q6: Energy Stability</span>
                    <span className="font-bold text-ink truncate block">{moodLabels.energyStability[answers.energyStability]}</span>
                  </div>
                  <button type="button" onClick={() => setStep(6)} className="text-[11px] font-extrabold text-amber-500 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer">Change ✏️</button>
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
              <span>☀️</span>
              <span>{pending ? "Saving..." : "Lock In Mood Log (+25 XP)"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* QUESTIONS 1-6 */
        <div className="pt-3 space-y-4">
          {step === 1 && (
            <MoodBlock
              title="What was your consciousness bootup thought?"
              subtitle="Subconscious emotional valence upon waking."
              options={[
                { id: "excited_ready", emoji: "🚀", label: "Excited about today! High drive", desc: "High dopamine and optimistic outlook." },
                { id: "calm_grounded", emoji: "🌿", label: "Grounded & peaceful, step by step", desc: "Balanced emotional baseline." },
                { id: "overwhelmed_todos", emoji: "🤯", label: "Anxious / to-do list suffocating", desc: "Immediate morning cortisol spike." },
                { id: "stormy_drained", emoji: "🕳️", label: "Emotionally empty & discouraged", desc: "Low emotional resilience reserve." },
              ]}
              current={answers.bootupMindset}
              onSelect={(v) => handleSelect("bootupMindset", v as any)}
            />
          )}

          {step === 2 && (
            <MoodBlock
              title="How sharp is your mental focus right now?"
              subtitle="Prefrontal cortex cognitive speed."
              options={[
                { id: "laser_4k", emoji: "💎", label: "4K Laser Focus (Ultra clear)", desc: "Ideas and problem-solving flow easily." },
                { id: "steady_coffee", emoji: "☕", label: "Steady & functional", desc: "Standard productive work capacity." },
                { id: "foggy_scattered", emoji: "🌫️", label: "Hazy brain fog / scattered", desc: "Takes effort to sustain attention." },
                { id: "spaced_out", emoji: "😵‍💫", label: "Zoned out in slow-motion", desc: "Significant cognitive inertia." },
              ]}
              current={answers.cognitiveClarity}
              onSelect={(v) => handleSelect("cognitiveClarity", v as any)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <MoodBlock
              title="How is your social battery and patience today?"
              subtitle="Social tolerance is a primary indicator of nervous burnout."
              options={[
                { id: "full_friendly", emoji: "😄", label: "High Social Battery", desc: "Happy to chat, lead, and connect." },
                { id: "selective_peace", emoji: "🙂", label: "Selective & Polite", desc: "Agreeable, but prefer quiet focus." },
                { id: "headphones_on", emoji: "🎧", label: "Headphones On (Do Not Disturb)", desc: "Low social buffer, need solitude." },
                { id: "irritable_short", emoji: "⚡", label: "Short Fuse / Irritable", desc: "Easily triggered by minor hiccups." },
              ]}
              current={answers.socialBattery}
              onSelect={(v) => handleSelect("socialBattery", v as any)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <MoodBlock
              title="What is your biggest stress trigger right now?"
              subtitle="Identifies allostatic load sources."
              options={[
                { id: "minimal_smooth", emoji: "✨", label: "Minimal / Smooth Sailing", desc: "Low pressure, feeling in control." },
                { id: "deadline_pressure", emoji: "⏳", label: "Deadlines / Workload", desc: "Demanding calendar and tasks." },
                { id: "interpersonal_friction", emoji: "👥", label: "Interpersonal friction", desc: "Social or relationship strain." },
                { id: "chronic_burnout", emoji: "🧱", label: "Chronic Burnout", desc: "Prolonged high stress cycle." },
              ]}
              current={answers.stressTriggers}
              onSelect={(v) => handleSelect("stressTriggers", v as any)}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <MoodBlock
              title="How is your inner self-talk today?"
              subtitle="Internal cognitive framing directly influences emotional state."
              options={[
                { id: "empowering_kind", emoji: "💚", label: "Empowering, kind & patient", desc: "Supportive internal narrative." },
                { id: "neutral_pragmatic", emoji: "⚖️", label: "Neutral & pragmatic", desc: "Focusing on execution without drama." },
                { id: "harsh_critical", emoji: "🔍", label: "Harsh & self-critical", desc: "Second-guessing yourself or perfectionism." },
                { id: "anxious_catastrophic", emoji: "🌪️", label: "Anxious & catastrophic", desc: "Anticipating worst-case scenarios." },
              ]}
              current={answers.innerSelfTalk}
              onSelect={(v) => handleSelect("innerSelfTalk", v as any)}
              onBack={() => setStep(4)}
            />
          )}

          {step === 6 && (
            <MoodBlock
              title="How steady is your physical energy flow?"
              subtitle="Blood sugar and nervous system stability."
              options={[
                { id: "steady_flowing", emoji: "🌊", label: "Steady, smooth energy flow", desc: "No major dips or sudden crashes." },
                { id: "moderate_rollercoaster", emoji: "🎢", label: "Moderate peaks and dips", desc: "Energy comes in spurts." },
                { id: "crash_and_burn", emoji: "📉", label: "Hard crash / severe exhaustion", desc: "Sudden drops in stamina." },
              ]}
              current={answers.energyStability}
              onSelect={(v) => handleSelect("energyStability", v as any)}
              onBack={() => setStep(5)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function MoodBlock({
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
                ? "border-amber-500 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/30"
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
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
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
