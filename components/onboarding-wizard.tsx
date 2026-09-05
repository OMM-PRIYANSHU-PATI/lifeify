"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { saveOnboarding, type OnboardingInput, type OnboardingResult } from "@/lib/actions/onboarding";
import { CONDITIONS, FAMILY_CONDITIONS, FAMILY_RELATIONS, ACTIVITY_LEVELS, DIET_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";

// Gamified Quest Stage Definitions
const STAGES = [
  { id: 1, title: "Persona & Vitals", subtitle: "Physical baseline", icon: "👤", xp: 30 },
  { id: 2, title: "Health Quests", subtitle: "Fitness missions", icon: "🎯", xp: 50 },
  { id: 3, title: "Movement Rhythm", subtitle: "Activity archetype", icon: "🏃", xp: 40 },
  { id: 4, title: "Fuel & Nutrition", subtitle: "Dietary style", icon: "🥗", xp: 40 },
  { id: 5, title: "Health Radar", subtitle: "Conditions & allergies", icon: "🛡️", xp: 40 },
  { id: 6, title: "Medicine & Routine", subtitle: "Active regimen", icon: "💊", xp: 20 },
  { id: 7, title: "Calibration Ceremony", subtitle: "Baseline unlocked", icon: "🏆", xp: 30 },
];

const QUEST_OPTIONS = [
  { id: "lose_weight", label: "Burn Fat & Lean Tone", emoji: "🎯", desc: "Body recomp, metabolic calorie burn, active deficit" },
  { id: "stay_active", label: "Energy & Daily Stamina", emoji: "⚡", desc: "Crush afternoon slumps, elevate sustained vitality" },
  { id: "gain_muscle", label: "Build Muscle & Strength", emoji: "💪", desc: "Functional power, hypertrophy & longevity training" },
  { id: "manage_bp", label: "Heart Health & BP Balance", emoji: "💓", desc: "Keep resting arterial metrics in the optimal green" },
  { id: "manage_sugar", label: "Glucose & Insulin Control", emoji: "🩸", desc: "Smooth blood sugar curves, avoid lethargy spikes" },
  { id: "sleep_better", label: "Deep Restorative Sleep", emoji: "🌙", desc: "Optimize sleep architecture & morning readiness" },
  { id: "reduce_stress", label: "Stress Resilience & Calm", emoji: "🧘", desc: "Lower cortisol, practice nervous system recovery" },
  { id: "eat_healthy", label: "Clean Nutrition Fueling", emoji: "🥗", desc: "Whole-food micronutrients, high-protein adherence" },
];

const ACTIVITY_ARCHETYPES = [
  { id: "SEDENTARY", label: "Desk Warrior", emoji: "🛋️", badge: "< 3,000 steps", desc: "Mostly seated work; ready to build regular movement habits." },
  { id: "LIGHT", label: "Everyday Stroller", emoji: "🚶", badge: "4,000–6,000 steps", desc: "Regular daily walking, errands, light physical activity." },
  { id: "MODERATE", label: "Active Achiever", emoji: "🏃", badge: "7,000–10,000 steps", desc: "3–4 structured workout sessions per week with great energy." },
  { id: "ACTIVE", label: "Fitness Athlete", emoji: "⚡", badge: "10,000–14,000 steps", desc: "5+ dedicated training sessions weekly; high athletic output." },
  { id: "ATHLETE", label: "Pro Competitor", emoji: "🏆", badge: "15,000+ steps", desc: "High-volume competitive sports, marathon or gym athlete." },
];

const DIET_ARCHETYPES = [
  { id: "VEG", label: "Pure Vegetarian", emoji: "🥗", desc: "Lentils, legumes, whole grains, vegetables, paneer & dairy." },
  { id: "NON_VEG", label: "Balanced Non-Veg", emoji: "🍗", desc: "Poultry, seafood, eggs, lean meats, vegetables & grains." },
  { id: "EGGETARIAN", label: "Eggetarian", emoji: "🥚", desc: "Vegetarian lifestyle enriched with wholesome eggs." },
  { id: "VEGAN", label: "100% Plant-Based", emoji: "🌱", desc: "Plant-powered nutrition free from all animal and dairy products." },
];

const COMMON_ALLERGIES = [
  "Penicillin",
  "Sulfa Drugs",
  "Aspirin / NSAIDs",
  "Peanuts & Tree Nuts",
  "Lactose / Dairy",
  "Gluten / Wheat",
  "Shellfish",
  "Dust & Pollen",
  "No Known Allergies",
];

const CONDITION_INFO: Record<string, { label: string; emoji: string; desc: string }> = {
  diabetes: { label: "Diabetes (T1/T2)", emoji: "🩸", desc: "Blood glucose monitoring" },
  hypertension: { label: "Hypertension", emoji: "💓", desc: "High blood pressure tracking" },
  cardiovascular: { label: "Cardiovascular", emoji: "🫀", desc: "Heart & lipid focus" },
  respiratory: { label: "Asthma / Respiratory", emoji: "🫁", desc: "Breathing & SpO2 focus" },
  thyroid: { label: "Thyroid Condition", emoji: "🦋", desc: "Metabolic rate balance" },
  kidney: { label: "Kidney Condition", emoji: "🧬", desc: "Renal & hydration care" },
  other: { label: "Other Condition", emoji: "🩺", desc: "Custom medical care" },
};

export function OnboardingWizard({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customAllergyInput, setCustomAllergyInput] = useState("");
  const [hasMedications, setHasMedications] = useState<boolean | null>(null);

  const [form, setForm] = useState<OnboardingInput>({
    name: defaultName || "",
    age: 28,
    sex: "MALE",
    heightCm: 172,
    weightKg: 68,
    bloodGroup: "",
    activityLevel: "MODERATE",
    dietType: "VEG",
    sleepTargetH: 8,
    waterTargetMl: 2500,
    stepTarget: 8000,
    goals: ["stay_active", "eat_healthy"],
    conditions: [],
    allergies: [],
    familyHistory: [],
    currentMedications: [],
    consentHealthData: true,
  });

  const set = <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Live BMI calculation
  const bmiInfo = useMemo(() => {
    if (!form.heightCm || !form.weightKg) return null;
    const hM = form.heightCm / 100;
    const val = Number((form.weightKg / (hM * hM)).toFixed(1));
    if (val < 18.5) return { val, label: "Underweight Range", color: "text-accent", tone: "bg-accent-soft" };
    if (val < 25) return { val, label: "Healthy Optimal Baseline", color: "text-success", tone: "bg-success/10" };
    if (val < 30) return { val, label: "Overweight / Recomp Focus", color: "text-warning", tone: "bg-warning/10" };
    return { val, label: "Elevated / Metabolic Quest", color: "text-crisis", tone: "bg-crisis-soft" };
  }, [form.heightCm, form.weightKg]);

  // Gamified XP accumulation
  const totalXp = useMemo(() => {
    let xp = 50; // Welcome XP
    if (form.name) xp += 20;
    if (form.heightCm && form.weightKg) xp += 30;
    xp += (form.goals?.length || 0) * 15;
    if (form.activityLevel) xp += 25;
    if (form.dietType) xp += 25;
    if (form.allergies.length > 0) xp += 20;
    if (form.familyHistory && form.familyHistory.length > 0) xp += 20;
    if (form.currentMedications && form.currentMedications.length > 0) xp += 25;
    if (step >= 7) xp += 35;
    return xp;
  }, [form, step]);

  const currentStage = STAGES[step - 1];

  const finish = async () => {
    setSaving(true);
    setErrors({});
    const sanitizedForm: OnboardingInput = {
      ...form,
      name: form.name?.trim() || defaultName || "Health Explorer",
      currentMedications: (form.currentMedications || []).filter((m) => m.name && m.name.trim().length > 0),
      allergies: (form.allergies || []).filter((a) => a && a.trim().length > 0),
    };
    try {
      const res: OnboardingResult = await saveOnboarding(sanitizedForm);
      if (res.ok) {
        window.location.href = "/app/dashboard";
      } else {
        setSaving(false);
        setErrors(res.errors);
      }
    } catch (err: any) {
      setSaving(false);
      setErrors({ _general: err?.message || "Failed to save profile. Please try again." });
    }
  };

  const toggleGoal = (id: string) => {
    const current = form.goals || [];
    if (current.includes(id)) {
      set("goals", current.filter((g) => g !== id));
    } else {
      if (current.length < 5) {
        set("goals", [...current, id]);
      }
    }
  };

  const toggleCondition = (c: any) => {
    const current = form.conditions || [];
    if (current.includes(c)) {
      set("conditions", current.filter((x) => x !== c));
    } else {
      set("conditions", [...current, c]);
    }
  };

  const toggleAllergy = (a: string) => {
    if (a === "No Known Allergies") {
      set("allergies", ["No Known Allergies"]);
      return;
    }
    const filtered = form.allergies.filter((x) => x !== "No Known Allergies");
    if (filtered.includes(a)) {
      set("allergies", filtered.filter((x) => x !== a));
    } else {
      set("allergies", [...filtered, a]);
    }
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergyInput.trim();
    if (trimmed && !form.allergies.includes(trimmed)) {
      set("allergies", [...form.allergies.filter((x) => x !== "No Known Allergies"), trimmed]);
      setCustomAllergyInput("");
    }
  };

  return (
    <div className="lif-card border border-line bg-surface p-6 sm:p-8 shadow-md rounded-3xl animate-fadeIn space-y-6">
      {/* Gamified Level & XP Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
              ★
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Stage {step} of 7 — {currentStage.title}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">{currentStage.subtitle}</p>
        </div>

        {/* Live Health XP Counter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-full bg-accent-soft border border-accent/20 px-3 py-1 text-xs font-bold text-accent">
            <span>🪙</span>
            <span>+{totalXp} Health XP</span>
          </div>
          <span className="rounded-full bg-primary-soft text-primary-dark font-bold text-[11px] px-2.5 py-1">
            Level 1 Explorer
          </span>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="grid grid-cols-7 gap-1.5">
        {STAGES.map((s) => (
          <div
            key={s.id}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              s.id < step
                ? "bg-primary"
                : s.id === step
                ? "bg-primary shadow-xs ring-2 ring-primary/20"
                : "bg-line/70"
            )}
            title={s.title}
          />
        ))}
      </div>

      {/* =========================================================================
          STAGE 1: PERSONA & PHYSICAL CALIBRATION
      ========================================================================= */}
      {step === 1 && (
        <section className="space-y-6 animate-slideUp">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-ink flex items-center gap-2">
              <span>👤</span> What should we call you?
            </h2>
            <p className="text-xs text-ink-soft">
              Calibrating your basic biometrics to compute accurate metabolic and cardiovascular ranges.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="lif-label">Full Name or Preferred Nickname</label>
              <input
                type="text"
                className="lif-input font-semibold"
                placeholder="e.g. Arjun Sharma"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
              {errors.name && <p className="text-xs text-crisis font-semibold mt-1">{errors.name}</p>}
            </div>

            {/* Biological Sex Selection Cards */}
            <div>
              <label className="lif-label">Biological Sex (Used for ICMR & Framingham clinical equations)</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "MALE", label: "Male", emoji: "👨" },
                  { id: "FEMALE", label: "Female", emoji: "👩" },
                  { id: "OTHER", label: "Other", emoji: "🌟" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set("sex", s.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all",
                      form.sex === s.id
                        ? "border-primary bg-primary-soft text-primary-dark font-bold shadow-xs scale-102"
                        : "border-line bg-surface hover:bg-surface-subtle text-ink"
                    )}
                  >
                    <span className="text-2xl mb-1">{s.emoji}</span>
                    <span className="text-xs font-semibold">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Age & Blood Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="lif-label">Age (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  className="lif-input font-mono"
                  value={form.age}
                  onChange={(e) => set("age", Number(e.target.value))}
                />
              </div>

              <div>
                <label className="lif-label">Blood Type (For Emergency Card)</label>
                <select
                  className="lif-input font-mono font-bold"
                  value={form.bloodGroup || ""}
                  onChange={(e) => set("bloodGroup", e.target.value)}
                >
                  <option value="">Select blood group...</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Height, Weight & Live BMI Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="lif-label">Height (Centimeters)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="60"
                    max="250"
                    className="lif-input pr-12 font-mono"
                    value={form.heightCm}
                    onChange={(e) => set("heightCm", Number(e.target.value))}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">cm</span>
                </div>
              </div>

              <div>
                <label className="lif-label">Weight (Kilograms)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="25"
                    max="280"
                    className="lif-input pr-12 font-mono"
                    value={form.weightKg}
                    onChange={(e) => set("weightKg", Number(e.target.value))}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">kg</span>
                </div>
              </div>
            </div>

            {/* Live BMI Preview Card */}
            {bmiInfo && (
              <div className={cn("p-3.5 rounded-2xl border flex items-center justify-between", bmiInfo.tone, "border-line/60")}>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span>⚖️</span>
                  <span>Calculated Body Mass Index:</span>
                  <span className="font-mono font-bold text-sm text-ink">{bmiInfo.val} kg/m²</span>
                </div>
                <span className={cn("text-xs font-bold", bmiInfo.color)}>{bmiInfo.label}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          STAGE 2: CHOOSE YOUR HEALTH QUESTS (FITNESS & WELLNESS GOALS)
      ========================================================================= */}
      {step === 2 && (
        <section className="space-y-6 animate-slideUp">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-ink flex items-center gap-2">
              <span>🎯</span> Select Your Core Health Quests
            </h2>
            <p className="text-xs text-ink-soft">
              Choose up to 5 priorities you want LIFEIFY to calibrate daily recommendations and reminders around.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUEST_OPTIONS.map((q) => {
              const selected = form.goals.includes(q.id);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => toggleGoal(q.id)}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-2xl border text-left transition-all",
                    selected
                      ? "border-primary bg-primary-soft text-primary-dark shadow-xs"
                      : "border-line bg-surface hover:bg-surface-subtle text-ink"
                  )}
                >
                  <span className="text-2xl mt-0.5">{q.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{q.label}</span>
                      {selected && <span className="text-xs font-extrabold text-primary">✓</span>}
                    </div>
                    <p className="text-[11px] text-ink-soft mt-0.5 leading-relaxed">{q.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-ink-muted text-right">
            Selected: <strong>{form.goals.length} of 5 max</strong>
          </p>
        </section>
      )}

      {/* =========================================================================
          STAGE 3: MOVEMENT ARCHETYPE & DAILY TARGETS
      ========================================================================= */}
      {step === 3 && (
        <section className="space-y-6 animate-slideUp">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-ink flex items-center gap-2">
              <span>🏃</span> What is your current movement archetype?
            </h2>
            <p className="text-xs text-ink-soft">
              Be honest — LIFEIFY adapts your habit curve gracefully without exhausting you.
            </p>
          </div>

          <div className="space-y-2.5">
            {ACTIVITY_ARCHETYPES.map((a) => {
              const selected = form.activityLevel === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => set("activityLevel", a.id as any)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all",
                    selected
                      ? "border-primary bg-primary-soft text-primary-dark shadow-xs"
                      : "border-line bg-surface hover:bg-surface-subtle text-ink"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{a.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{a.label}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface border border-line text-ink-muted">
                          {a.badge}
                        </span>
                      </div>
                      <p className="text-xs text-ink-soft mt-0.5">{a.desc}</p>
                    </div>
                  </div>
                  {selected && <span className="text-base font-bold text-primary">●</span>}
                </button>
              );
            })}
          </div>

          {/* Daily Goals Tuning - Visual Fitness Scale Sliders */}
          <div className="pt-4 border-t border-line/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Calibrate Your Daily Baseline Scales
              </h3>
              <span className="text-[11px] text-primary font-bold flex items-center gap-1">
                <span>🎚️</span> Drag scales to calibrate
              </span>
            </div>

            <div className="space-y-4">
              {/* Scale 1: Daily Steps Ruler Scale */}
              <div className="p-4 rounded-2xl border border-line bg-surface-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-lg">
                      👣
                    </div>
                    <div>
                      <span className="font-bold text-ink text-sm block">Daily Step Goal</span>
                      <span className="text-[11px] text-ink-muted font-medium">
                        {form.stepTarget < 6000 && "🌱 Gentle Movement Baseline"}
                        {form.stepTarget >= 6000 && form.stepTarget < 9000 && "🚶 Active Everyday Habit"}
                        {form.stepTarget >= 9000 && form.stepTarget < 13000 && "🔥 Optimal Calorie Burn Sweet Spot"}
                        {form.stepTarget >= 13000 && "⚡ High Athletic Output"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-primary block leading-none">
                      {form.stepTarget.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-ink-muted uppercase font-bold">steps / day</span>
                  </div>
                </div>

                {/* Slider Input with active gradient fill */}
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="3000"
                    max="20000"
                    step="500"
                    value={form.stepTarget}
                    onChange={(e) => set("stepTarget", Number(e.target.value))}
                    className="lif-scale-slider"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((form.stepTarget - 3000) / (20000 - 3000)) * 100}%, var(--color-line) ${((form.stepTarget - 3000) / (20000 - 3000)) * 100}%, var(--color-line) 100%)`,
                    }}
                  />
                  {/* Ruler Notch Markings */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-ink-muted pt-1.5 px-1 select-none">
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      3k
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      6k
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      10k
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      15k
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      20k
                    </span>
                  </div>
                </div>
              </div>

              {/* Scale 2: Daily Hydration Water Scale */}
              <div className="p-4 rounded-2xl border border-line bg-surface-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center text-lg">
                      💧
                    </div>
                    <div>
                      <span className="font-bold text-ink text-sm block">Daily Hydration Quota</span>
                      <span className="text-[11px] text-ink-muted font-medium">
                        ≈ {Math.round(form.waterTargetMl / 250)} glasses •{" "}
                        {form.waterTargetMl < 1800 && "Light Hydration"}
                        {form.waterTargetMl >= 1800 && form.waterTargetMl <= 2600 && "Optimal Daily Flow 🌊"}
                        {form.waterTargetMl > 2600 && form.waterTargetMl <= 3500 && "High Performance Flush ⚡"}
                        {form.waterTargetMl > 3500 && "Intense Training Hydration 🏋️"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-primary block leading-none">
                      {(form.waterTargetMl / 1000).toFixed(1)}L
                    </span>
                    <span className="text-[10px] text-ink-muted uppercase font-bold">{form.waterTargetMl} ml / day</span>
                  </div>
                </div>

                {/* Slider Input with active gradient fill */}
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="1000"
                    max="4500"
                    step="100"
                    value={form.waterTargetMl}
                    onChange={(e) => set("waterTargetMl", Number(e.target.value))}
                    className="lif-scale-slider"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((form.waterTargetMl - 1000) / (4500 - 1000)) * 100}%, var(--color-line) ${((form.waterTargetMl - 1000) / (4500 - 1000)) * 100}%, var(--color-line) 100%)`,
                    }}
                  />
                  {/* Ruler Notch Markings */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-ink-muted pt-1.5 px-1 select-none">
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      1.0L
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      2.0L
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      3.0L
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      4.0L
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      4.5L
                    </span>
                  </div>
                </div>
              </div>

              {/* Scale 3: Sleep Duration Scale */}
              <div className="p-4 rounded-2xl border border-line bg-surface-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-lg">
                      🌙
                    </div>
                    <div>
                      <span className="font-bold text-ink text-sm block">Sleep Duration Target</span>
                      <span className="text-[11px] text-ink-muted font-medium">
                        {form.sleepTargetH < 5.0 && "⚠️ Severe Sleep Debt Horizon"}
                        {form.sleepTargetH >= 5.0 && form.sleepTargetH < 6.5 && "⚠️ Sub-optimal Rest Horizon"}
                        {form.sleepTargetH >= 6.5 && form.sleepTargetH <= 7.0 && "🌙 Moderate Functional Sleep"}
                        {form.sleepTargetH > 7.0 && form.sleepTargetH <= 8.5 && "✨ Ideal Restorative Recovery Horizon"}
                        {form.sleepTargetH > 8.5 && "🛌 Deep Athletic Repair Window"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-primary block leading-none">
                      {form.sleepTargetH.toFixed(1)}h
                    </span>
                    <span className="text-[10px] text-ink-muted uppercase font-bold">hours / night</span>
                  </div>
                </div>

                {/* Slider Input with active gradient fill */}
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="3.0"
                    max="10.0"
                    step="0.5"
                    value={form.sleepTargetH}
                    onChange={(e) => set("sleepTargetH", Number(e.target.value))}
                    className="lif-scale-slider"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((form.sleepTargetH - 3.0) / (10.0 - 3.0)) * 100}%, var(--color-line) ${((form.sleepTargetH - 3.0) / (10.0 - 3.0)) * 100}%, var(--color-line) 100%)`,
                    }}
                  />
                  {/* Ruler Notch Markings */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-ink-muted pt-1.5 px-1 select-none">
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      3.0h
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      4.0h
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      5.0h
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      6.0h
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      7.0h
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      8.0h
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      9.0h
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="h-1.5 w-0.5 bg-line mb-0.5" />
                      10h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          STAGE 4: FUEL & NUTRITION ARCHETYPE
      ========================================================================= */}
      {step === 4 && (
        <section className="space-y-6 animate-slideUp">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-ink flex items-center gap-2">
              <span>🥗</span> How do you fuel your day?
            </h2>
            <p className="text-xs text-ink-soft">
              Tailors food lookup, macro calculations, and Indian regional dietary recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIET_ARCHETYPES.map((d) => {
              const selected = form.dietType === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => set("dietType", d.id as any)}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-2xl border text-left transition-all",
                    selected
                      ? "border-primary bg-primary-soft text-primary-dark font-bold shadow-xs"
                      : "border-line bg-surface hover:bg-surface-subtle text-ink"
                  )}
                >
                  <span className="text-2xl mt-0.5">{d.emoji}</span>
                  <div>
                    <span className="text-sm font-bold block">{d.label}</span>
                    <p className="text-xs text-ink-soft mt-0.5 leading-relaxed font-normal">{d.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hydration Habit Prompt */}
          <div className="p-4 rounded-2xl bg-surface-subtle border border-line space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Current Hydration Baseline Check
            </span>
            <p className="text-xs text-ink-soft">
              Target set to <strong>{form.waterTargetMl} ml</strong> (≈ {Math.round(form.waterTargetMl / 250)} glasses of water per day).
            </p>
          </div>
        </section>
      )}

      {/* =========================================================================
          STAGE 5: HEALTH RADAR, CONDITIONS & ALLERGIES
      ========================================================================= */}
      {step === 5 && (
        <section className="space-y-6 animate-slideUp">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-ink flex items-center gap-2">
              <span>🛡️</span> Health Blueprint & Allies
            </h2>
            <p className="text-xs text-ink-soft">
              Configure existing conditions and critical drug/food allergies to activate drug-drug interaction guardrails.
            </p>
          </div>

          {/* Existing Conditions Grid */}
          <div className="space-y-2">
            <label className="lif-label">Do you manage any of these existing conditions?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CONDITIONS.map((c) => {
                const info = CONDITION_INFO[c] || { label: c, emoji: "🩺", desc: "Monitored condition" };
                const selected = form.conditions.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCondition(c)}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all text-xs",
                      selected
                        ? "border-primary bg-primary-soft text-primary-dark font-bold shadow-xs"
                        : "border-line bg-surface hover:bg-surface-subtle text-ink"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{info.emoji}</span>
                      <div>
                        <p className="font-bold">{info.label}</p>
                        <p className="text-[10px] text-ink-muted font-normal">{info.desc}</p>
                      </div>
                    </div>
                    {selected && <span className="text-primary font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
            {form.conditions.length === 0 && (
              <p className="text-[11px] text-ink-muted italic pt-1">
                No conditions selected. (You will be calibrated on a clean wellness baseline).
              </p>
            )}
          </div>

          {/* Quick-Chip Allergies */}
          <div className="space-y-2.5 pt-4 border-t border-line/60">
            <label className="lif-label">Allergies & Sensitivities (Used for drug safety checks)</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGIES.map((a) => {
                const selected = form.allergies.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAllergy(a)}
                    className={cn(
                      "lif-pill text-xs px-3 py-1.5",
                      selected ? "border-crisis bg-crisis-soft text-crisis font-bold" : ""
                    )}
                  >
                    {selected ? "⚠️" : "+"} {a}
                  </button>
                );
              })}
            </div>

            {/* Custom Allergy Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                className="lif-input flex-1 text-xs"
                placeholder="Type other allergy (e.g. Ciprofloxacin, Eggs)..."
                value={customAllergyInput}
                onChange={(e) => setCustomAllergyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomAllergy())}
              />
              <button
                type="button"
                onClick={addCustomAllergy}
                className="lif-btn-secondary text-xs px-3.5"
              >
                Add Allergy
              </button>
            </div>
          </div>

          {/* Family Health History */}
          <div className="space-y-2.5 pt-4 border-t border-line/60">
            <FamilyHistoryEditor value={form.familyHistory || []} onChange={(v) => set("familyHistory", v)} />
          </div>
        </section>
      )}

      {/* =========================================================================
          STAGE 6: MEDICATIONS & REGIMEN
      ========================================================================= */}
      {step === 6 && (
        <section className="space-y-6 animate-slideUp">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-ink flex items-center gap-2">
              <span>💊</span> Do you take daily medications or supplements?
            </h2>
            <p className="text-xs text-ink-soft">
              LIFEIFY creates an active chronotherapeutic schedule with refill reminders and interaction detection.
            </p>
          </div>

          {hasMedications === null && (!form.currentMedications || form.currentMedications.length === 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <button
                type="button"
                onClick={() => setHasMedications(false)}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border border-line bg-surface hover:border-primary hover:bg-surface-subtle transition-all text-center space-y-2"
              >
                <span className="text-3xl">✨</span>
                <p className="text-sm font-bold text-ink">No, I don&apos;t take daily meds</p>
                <p className="text-xs text-ink-muted">I take only occasional vitamins or nothing right now.</p>
              </button>

              <button
                type="button"
                onClick={() => setHasMedications(true)}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border border-primary bg-primary-soft text-center space-y-2"
              >
                <span className="text-3xl">💊</span>
                <p className="text-sm font-bold text-primary-dark">Yes, I take medications or supplements</p>
                <p className="text-xs text-primary-dark/80">I want automated dosage reminders &amp; refill alerts.</p>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <CurrentMedsEditor
                value={form.currentMedications || []}
                onChange={(v) => {
                  set("currentMedications", v);
                  setHasMedications(true);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  set("currentMedications", []);
                  setHasMedications(false);
                }}
                className="text-xs text-ink-muted hover:underline"
              >
                Clear all medications (I am currently medicine-free)
              </button>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          STAGE 7: CALIBRATION CEREMONY & QUEST COMPLETION
      ========================================================================= */}
      {step === 7 && (
        <section className="space-y-6 animate-slideUp text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-primary-soft/80 to-surface border border-primary/30">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Calibration Ready
              </span>
              <h2 className="text-2xl font-black text-ink">Your Health Baseline Is Ready!</h2>
              <p className="text-xs text-ink-soft">
                All biometric streams, goals, and safety parameters have been harmonized.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-line shadow-xs">
              <span className="text-3xl">🏆</span>
              <span className="text-xs font-bold text-primary mt-1">+100 Bonus XP</span>
            </div>
          </div>

          {/* Calibrated Specs Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-surface-subtle rounded-xl border border-line">
              <span className="text-ink-muted block text-[10px]">Daily Step Mission</span>
              <span className="font-bold text-ink text-sm font-mono mt-0.5 block">{form.stepTarget.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl border border-line">
              <span className="text-ink-muted block text-[10px]">Hydration Quota</span>
              <span className="font-bold text-ink text-sm font-mono mt-0.5 block">{form.waterTargetMl} ml</span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl border border-line">
              <span className="text-ink-muted block text-[10px]">Sleep Schedule</span>
              <span className="font-bold text-ink text-sm font-mono mt-0.5 block">{form.sleepTargetH} Hours</span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl border border-line">
              <span className="text-ink-muted block text-[10px]">Active Quests</span>
              <span className="font-bold text-primary text-sm font-mono mt-0.5 block">{form.goals.length} Goals</span>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="rounded-2xl bg-surface-subtle border border-line p-4 space-y-2 text-left">
            <label className="flex items-start gap-3 text-xs text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-line text-primary focus:ring-primary h-4 w-4"
                checked={form.consentHealthData}
                onChange={(e) => set("consentHealthData", e.target.checked)}
              />
              <span className="leading-relaxed">
                <strong>I consent to LIFEIFY securely storing and processing my health telemetry</strong> to provide predictive trends, medication reminders, and physician summaries. LIFEIFY is a wellness platform operating under strict DPDP Act standards.
              </span>
            </label>
            {errors.consentHealthData && (
              <p className="text-xs text-crisis font-bold">{errors.consentHealthData}</p>
            )}
          </div>

          {/* Validation Error Banner */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-2xl bg-crisis-soft border border-crisis/30 p-4 text-xs text-crisis space-y-1 text-left animate-shake">
              <p className="font-bold flex items-center gap-1.5">
                <span>⚠️</span> Please resolve the following to launch:
              </p>
              <ul className="list-disc list-inside space-y-0.5 font-medium">
                {Object.entries(errors).map(([field, msg]) => (
                  <li key={field}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-line/70">
        {step > 1 ? (
          <button
            type="button"
            className="lif-btn-secondary text-xs px-4 py-2.5"
            onClick={() => setStep(step - 1)}
          >
            ← Previous Stage
          </button>
        ) : (
          <span />
        )}

        {step < 7 ? (
          <button
            type="button"
            className="lif-btn-primary text-xs font-bold px-6 py-2.5 shadow-sm"
            onClick={() => setStep(step + 1)}
          >
            Continue Quest →
          </button>
        ) : (
          <button
            type="button"
            className="lif-btn-primary text-sm font-extrabold px-8 py-3 shadow-md bg-primary hover:bg-primary-dark"
            disabled={saving}
            onClick={finish}
          >
            {saving ? "Calibrating Your Health OS…" : "🚀 Launch My Health OS"}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------- Helper Components ----------------

type FamilyEntry = NonNullable<OnboardingInput["familyHistory"]>[number];

function FamilyHistoryEditor({
  value,
  onChange,
}: {
  value: FamilyEntry[];
  onChange: (v: FamilyEntry[]) => void;
}) {
  const add = () => onChange([...value, { condition: "diabetes", relationship: "father" }]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="lif-label mb-0">Family Medical History (Optional)</label>
        <button
          type="button"
          className="text-xs text-primary font-bold hover:underline"
          onClick={add}
        >
          + Add Relative
        </button>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-ink-muted italic">No family history recorded. Click &apos;+ Add Relative&apos; if applicable.</p>
      ) : (
        <div className="space-y-2">
          {value.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                className="lif-input flex-1 text-xs"
                value={entry.relationship}
                onChange={(e) =>
                  onChange(
                    value.map((v, j) =>
                      j === i ? { ...v, relationship: e.target.value as any } : v
                    )
                  )
                }
              >
                {FAMILY_RELATIONS.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>

              <select
                className="lif-input flex-1 text-xs"
                value={entry.condition}
                onChange={(e) =>
                  onChange(
                    value.map((v, j) =>
                      j === i ? { ...v, condition: e.target.value as any } : v
                    )
                  )
                }
              >
                {FAMILY_CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c.replace("_", " ").toUpperCase()}</option>
                ))}
              </select>

              <button
                type="button"
                className="text-xs text-crisis hover:bg-crisis-soft p-2 rounded-lg"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type MedEntry = NonNullable<OnboardingInput["currentMedications"]>[number];

function CurrentMedsEditor({
  value,
  onChange,
}: {
  value: MedEntry[];
  onChange: (v: MedEntry[]) => void;
}) {
  const add = () => onChange([...value, { name: "", dose: "", frequency: "OD" }]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="lif-label mb-0">Active Medications List</label>
        <button
          type="button"
          className="text-xs text-primary font-bold hover:underline"
          onClick={add}
          disabled={value.length >= 15}
        >
          + Add Another Medicine
        </button>
      </div>

      <div className="space-y-2.5">
        {value.map((entry, i) => (
          <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 rounded-xl border border-line bg-surface-subtle">
            <input
              className="lif-input flex-1 text-xs font-semibold"
              placeholder="Medicine Name (e.g. Metformin, Telma 40)"
              value={entry.name}
              onChange={(e) =>
                onChange(value.map((v, j) => (j === i ? { ...v, name: e.target.value } : v)))
              }
              required
            />
            <input
              className="lif-input w-24 text-xs font-mono"
              placeholder="Dose (500mg)"
              value={entry.dose ?? ""}
              onChange={(e) =>
                onChange(value.map((v, j) => (j === i ? { ...v, dose: e.target.value } : v)))
              }
            />
            <select
              className="lif-input w-36 text-xs font-bold"
              value={entry.frequency}
              onChange={(e) =>
                onChange(value.map((v, j) => (j === i ? { ...v, frequency: e.target.value } : v)))
              }
            >
              <option value="OD">1x Daily (OD 🌅)</option>
              <option value="BD">2x Daily (BD 🌅🌇)</option>
              <option value="TDS">3x Daily (TDS 🌅☀️🌇)</option>
              <option value="HS">Bedtime (HS 🌙)</option>
              <option value="PRN">As Needed (PRN ⚡)</option>
            </select>
            <button
              type="button"
              className="text-xs text-crisis hover:bg-crisis-soft p-2 rounded-lg"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label="Remove medicine"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {value.length === 0 && (
        <button
          type="button"
          onClick={add}
          className="lif-btn-secondary text-xs w-full py-3"
        >
          + Add Your First Medicine
        </button>
      )}
    </div>
  );
}
