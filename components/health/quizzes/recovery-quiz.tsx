"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  evaluateDeepRecoveryQuest,
  DeepRecoveryQuestAnswers,
  WakeupTrigger,
  BodyMobility,
  AutonomicBreath,
  SorenessZone,
  HydrationAwakening,
  PreviousDayStrain,
} from "@/lib/rules/tri-factor-quiz";
import { logRecoveryFromQuiz } from "@/lib/actions/logs";

interface RecoveryQuizProps {
  onDone?: () => void;
  variant?: "modal" | "inline";
}

export function RecoveryQuiz({ onDone, variant = "inline" }: RecoveryQuizProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [pending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [answers, setAnswers] = useState<DeepRecoveryQuestAnswers>({
    wakeupTrigger: "gentle_alarm",
    bodyMobility: "steady_normal",
    autonomicBreath: "steady_even",
    sorenessZone: "none",
    hydrationAwakening: "quenched_fresh",
    previousDayStrain: "moderate_active",
  });

  const result = evaluateDeepRecoveryQuest(answers);
  const totalSteps = 6;
  const isReveal = step > totalSteps;

  const handleSelect = <K extends keyof DeepRecoveryQuestAnswers>(key: K, value: DeepRecoveryQuestAnswers[K]) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 200);
  };

  const handleSave = () => {
    setErrorMsg("");
    startTransition(async () => {
      const res = await logRecoveryFromQuiz({
        score: result.recoveryScore,
        status: result.recoveryStatus,
        muscularTone: result.muscularTone,
        autonomicTone: result.autonomicTone,
        strain: result.recommendedStrain,
      });

      if (res.ok) {
        setCompleted(true);
        setSuccessMsg(res.message);
        router.refresh();
        if (onDone) setTimeout(onDone, 1600);
      } else {
        setErrorMsg(res.error ?? "Failed to save recovery metrics");
      }
    });
  };

  return (
    <div
      className={`relative w-full rounded-2xl border border-emerald-500/20 bg-linear-to-b from-slate-900/90 to-surface p-4 sm:p-6 shadow-md transition-all ${
        variant === "inline" ? "max-w-2xl mx-auto" : ""
      }`}
    >
      {/* Quiz Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line/60">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-lg">
            💚
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-ink">Autonomic Recovery & Readiness</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">
                +25 XP
              </span>
            </div>
            <span className="text-[11px] text-ink-muted">Musculoskeletal Tone & Vagal Balance</span>
          </div>
        </div>

        {!completed && !isReveal && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-ink-soft">
              {step}/{totalSteps}
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
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

      {/* Completed State */}
      {completed ? (
        <div className="py-8 text-center space-y-4 animate-fadeIn">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-3xl">
            ⚡
          </div>
          <h3 className="text-xl font-black text-ink">Recovery Calibrated!</h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            {successMsg || "Your recovery readiness score and target training strain have been updated."}
          </p>
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-400">
            <span>🎯</span> +25 XP Earned · Recovery Synchronized
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
            <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-extrabold text-emerald-400">
              💚 Recovery Readiness Calibrated
            </span>
            <h2 className="text-xl font-black text-ink">Your Autonomic Readiness Score</h2>
            <p className="text-xs text-ink-muted">
              Whoop/Oura proxy calculated from muscular soreness mapping, vagal breathing, and training fatigue.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl">🔋</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Readiness</span>
              <div className="text-4xl font-black text-emerald-500">{result.recoveryScore}%</div>
              <span className="text-[10px] text-ink-muted block">{result.recoveryStatusLabel}</span>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl">🏃</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Muscular Tone</span>
              <div className="text-sm font-black text-ink pt-1">{result.muscularTone}</div>
              <span className="text-[10px] text-ink-muted block">Cellular Repair Status</span>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4 text-center space-y-1.5 shadow-xs">
              <span className="text-2xl">🫀</span>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Autonomic Tone</span>
              <div className="text-xs font-black text-ink pt-1">{result.autonomicTone}</div>
              <span className="text-[10px] text-ink-muted block">Vagal HRV Proxy</span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <span>🎯</span> Recommended Strain for Today
              </span>
              <span className="rounded-md bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                {result.recommendedStrain}
              </span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">{result.actionableAdvice}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(totalSteps)}
              className="text-xs font-semibold text-ink-muted hover:text-ink"
            >
              ← Edit Responses
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleSave}
              className="lif-btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 shadow-md hover:scale-102 transition"
            >
              <span>💚</span>
              <span>{pending ? "Saving..." : "Lock In Recovery Log (+25 XP)"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* QUESTIONS 1-6 */
        <div className="pt-3 space-y-4">
          {step === 1 && (
            <RecoveryBlock
              title="How did your awakening feel?"
              subtitle="Natural sleep cycle completion vs sleep inertia."
              options={[
                { id: "before_alarm", emoji: "🌅", label: "Naturally before alarm", desc: "Awake, alert, completed sleep cycle." },
                { id: "gentle_alarm", emoji: "⏰", label: "Gentle first alarm", desc: "Smooth transition, got up easily." },
                { id: "snooze_war", emoji: "🔕", label: "Violent snooze war (3+ alarms)", desc: "Heavy sleep inertia and drag." },
                { id: "jolted_abrupt", emoji: "🚨", label: "Jolted awake abruptly", desc: "Adrenaline spike / racing heart." },
              ]}
              current={answers.wakeupTrigger}
              onSelect={(v) => handleSelect("wakeupTrigger", v as any)}
            />
          )}

          {step === 2 && (
            <RecoveryBlock
              title="How do your joints and muscles feel?"
              subtitle="Musculoskeletal cellular readiness."
              options={[
                { id: "limber_spring", emoji: "🤸", label: "Limber & Springy (Zero ache)", desc: "100% primed for movement." },
                { id: "steady_normal", emoji: "🏃", label: "Normal Healthy Baseline", desc: "Light stretch, feels ready to go." },
                { id: "heavy_achy", emoji: "🧗", label: "Heavy legs / stiff back", desc: "Muscular fatigue from recent exertion." },
                { id: "deep_exhaustion", emoji: "🐢", label: "Deep systemic soreness", desc: "Moving in slow motion, heavy aches." },
              ]}
              current={answers.bodyMobility}
              onSelect={(v) => handleSelect("bodyMobility", v as any)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <RecoveryBlock
              title="Do you have soreness in a specific body zone?"
              subtitle="Targeted DOMS and local inflammation."
              options={[
                { id: "none", emoji: "✨", label: "Zero soreness (Fresh body)", desc: "Completely recovered musculature." },
                { id: "neck_shoulders", emoji: "🧣", label: "Neck & Upper Traps", desc: "Postural screen strain." },
                { id: "lower_back", emoji: "🧍", label: "Lower Back / Lumbar", desc: "Core or posterior chain fatigue." },
                { id: "legs_glutes", emoji: "🦵", label: "Legs, Quads & Glutes", desc: "Running, walking or leg fatigue." },
                { id: "full_body_tender", emoji: "🩹", label: "Full Body Tenderness", desc: "Systemic post-workout soreness." },
              ]}
              current={answers.sorenessZone}
              onSelect={(v) => handleSelect("sorenessZone", v as any)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <RecoveryBlock
              title="How is your resting heart & breathing rhythm?"
              subtitle="Vagal nerve tone and HRV proxy."
              options={[
                { id: "deep_calm", emoji: "🫀", label: "Deep, slow, calm resting pulse", desc: "High parasympathetic recovery (Rest & Digest)." },
                { id: "steady_even", emoji: "💓", label: "Normal steady rhythm", desc: "Balanced autonomic baseline." },
                { id: "fluttery_tight", emoji: "⚡", label: "Elevated pulse / rushed tightness", desc: "Sympathetic surge (Fight or Flight)." },
              ]}
              current={answers.autonomicBreath}
              onSelect={(v) => handleSelect("autonomicBreath", v as any)}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <RecoveryBlock
              title="How hydrated do you feel upon waking?"
              subtitle="Overnight dehydration impacts blood viscosity and cardiac strain."
              options={[
                { id: "quenched_fresh", emoji: "💧", label: "Quenched & Fresh", desc: "Hydrated overnight, clean mouthfeel." },
                { id: "mildly_dry", emoji: "🥛", label: "Mildly dry (Ready for water)", desc: "Normal morning hydration need." },
                { id: "parched_sticky", emoji: "🏜️", label: "Parched & sticky mouth", desc: "Dry mouth from mouth breathing/heat." },
              ]}
              current={answers.hydrationAwakening}
              onSelect={(v) => handleSelect("hydrationAwakening", v as any)}
              onBack={() => setStep(4)}
            />
          )}

          {step === 6 && (
            <RecoveryBlock
              title="What was your physical strain yesterday?"
              subtitle="Calculates cumulative fatigue carryover."
              options={[
                { id: "rest_day", emoji: "🛋️", label: "Rest Day / Light movement", desc: "Muscles had full repair window." },
                { id: "moderate_active", emoji: "🚶", label: "Moderate workout / 6k–10k steps", desc: "Healthy daily baseline exertion." },
                { id: "brutal_intense", emoji: "🏋️", label: "Brutal intense workout / heavy lifting", desc: "Significant muscular breakdown." },
                { id: "poor_recovery_cycle", emoji: "📉", label: "Multi-day stacked fatigue", desc: "Accumulated chronic strain." },
              ]}
              current={answers.previousDayStrain}
              onSelect={(v) => handleSelect("previousDayStrain", v as any)}
              onBack={() => setStep(5)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function RecoveryBlock({
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
                ? "border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30"
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
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
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
