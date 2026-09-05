"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MOOD_EMOJIS } from "@/lib/types";
import {
  logWater,
  logMood,
  logWeight,
  logSteps,
  logSleep,
  logFood,
  searchFoods,
  logVital,
} from "@/lib/actions/logs";
import { TriFactorQuiz } from "@/components/health/tri-factor-quiz";

type Tab = "quiz" | "water" | "mood" | "sleep" | "steps" | "food" | "vitals" | "weight";

const TABS: Array<{ key: Tab; emoji: string; label: string }> = [
  { key: "quiz", emoji: "🎮", label: "Tri-Factor Quiz" },
  { key: "water", emoji: "💧", label: "Water" },
  { key: "mood", emoji: "🙂", label: "Mood" },
  { key: "sleep", emoji: "😴", label: "Sleep" },
  { key: "steps", emoji: "👣", label: "Steps" },
  { key: "food", emoji: "🍛", label: "Food" },
  { key: "vitals", emoji: "🩺", label: "Vitals" },
  { key: "weight", emoji: "⚖️", label: "Weight" },
];

type FoodResult = { id: string; name: string; servingLabel: string; calories: number };

export function QuickLogButton() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 hover:bg-primary-dark sm:bottom-6 sm:right-6 select-none"
        aria-label="Quick log biometrics"
      >
        +
      </button>

      {isDesktop ? (
        <Modal open={open} onClose={close} title="Quick Log Biometrics" size="md">
          <QuickLogTabs onDone={close} />
        </Modal>
      ) : (
        <BottomSheet open={open} onClose={close} title="Quick Log Biometrics">
          <QuickLogTabs onDone={close} />
        </BottomSheet>
      )}
    </>
  );
}

function QuickLogTabs({ onDone }: { onDone: () => void }) {
  const [tab, setTab] = useState<Tab>("water");
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) => {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      setMsg({ ok: res.ok, text: res.ok ? res.message ?? "Logged successfully" : res.error ?? "Failed" });
      if (res.ok) {
        router.refresh();
        setTimeout(onDone, 650);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Log category">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`lif-pill text-xs px-3 py-1.5 ${
              tab === t.key ? "border-primary bg-primary-soft text-primary-dark font-bold" : ""
            }`}
          >
            <span aria-hidden="true">{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <p
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${
            msg.ok ? "bg-primary-soft text-primary-dark" : "bg-crisis-soft text-crisis"
          }`}
        >
          {msg.text}
        </p>
      )}

      {/* Water Tab */}
      {tab === "water" && (
        <div className="space-y-3">
          <p className="text-xs text-ink-soft">1-tap hydration intake logging:</p>
          <div className="grid grid-cols-3 gap-2.5">
            {[250, 500, 750].map((ml) => (
              <button
                key={ml}
                disabled={pending}
                onClick={() => run(() => logWater(ml))}
                className="lif-btn-secondary flex-col py-3.5"
              >
                <span className="text-2xl mb-1" aria-hidden="true">
                  💧
                </span>
                <span className="font-bold">{ml} ml</span>
                <span className="text-[10px] text-ink-muted">
                  {ml === 250 ? "1 Glass" : ml === 500 ? "Bottle" : "Large flask"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tri-Factor Quiz Tab */}
      {tab === "quiz" && (
        <div className="space-y-2 -mt-1">
          <TriFactorQuiz onDone={onDone} variant="modal" />
        </div>
      )}

      {/* Mood Tab */}
      {tab === "mood" && (
        <div className="space-y-3.5">
          <div className="rounded-xl border border-primary/30 bg-primary-soft/40 p-3 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎮</span>
              <div>
                <span className="block text-xs font-bold text-ink">Predict Mood, Recovery & Sleep</span>
                <span className="block text-[10px] text-ink-muted">Play our 30-sec gamified quiz (+20 XP)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTab("quiz")}
              className="lif-btn-primary py-1 px-3 text-[11px] font-bold shrink-0"
            >
              Play Quiz →
            </button>
          </div>

          <p className="text-xs text-ink-soft">Or quick tap your current mental state:</p>
          <div className="flex justify-between gap-1.5">
            {MOOD_EMOJIS.map((m) => (
              <button
                key={m.score}
                disabled={pending}
                onClick={() => run(() => logMood(m.score))}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-line py-3 hover:bg-surface-subtle transition-all select-none"
                aria-label={`Mood: ${m.label}`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {m.emoji}
                </span>
                <span className="text-[11px] font-semibold text-ink-soft">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Indian Food Tab */}
      {tab === "food" && (
        <FoodSearch
          pending={pending}
          onPick={(id, servings, meal) => run(() => logFood(id, servings, meal))}
        />
      )}

      {/* Steps Tab */}
      {tab === "steps" && (
        <NumberForm
          label="Steps walked today"
          placeholder="8,000"
          pending={pending}
          onSubmit={(v) => run(() => logSteps(v))}
        />
      )}

      {/* Sleep Tab */}
      {tab === "sleep" && (
        <div className="space-y-3.5">
          <div className="rounded-xl border border-primary/30 bg-primary-soft/40 p-3 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎮</span>
              <div>
                <span className="block text-xs font-bold text-ink">Predict Sleep, Recovery & Mood</span>
                <span className="block text-[10px] text-ink-muted">Predict exact hours & quality from night vibe</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTab("quiz")}
              className="lif-btn-primary py-1 px-3 text-[11px] font-bold shrink-0"
            >
              Play Quiz →
            </button>
          </div>

          <NumberForm
            label="Or enter sleep duration manually (hours)"
            placeholder="7.5"
            step="0.5"
            pending={pending}
            onSubmit={(v) => run(() => logSleep(v))}
          />
        </div>
      )}

      {/* Vitals Tab */}
      {tab === "vitals" && (
        <VitalsForm pending={pending} onSubmit={(data) => run(() => logVital(data))} />
      )}

      {/* Weight Tab */}
      {tab === "weight" && (
        <NumberForm
          label="Body weight (kg)"
          placeholder="68.5"
          step="0.1"
          pending={pending}
          onSubmit={(v) => run(() => logWeight(v))}
        />
      )}
    </div>
  );
}

function NumberForm({
  label,
  placeholder,
  pending,
  onSubmit,
  step,
}: {
  label: string;
  placeholder: string;
  pending: boolean;
  onSubmit: (v: number) => void;
  step?: string;
}) {
  const [v, setV] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseFloat(v);
        if (!isNaN(n)) onSubmit(n);
      }}
      className="space-y-3"
    >
      <label className="block text-xs font-semibold text-ink-soft" htmlFor={`ql-${label}`}>
        {label}
      </label>
      <input
        id={`ql-${label}`}
        type="number"
        step={step ?? "1"}
        className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:border-primary"
        placeholder={placeholder}
        value={v}
        onChange={(e) => setV(e.target.value)}
        required
      />
      <button type="submit" disabled={pending} className="lif-btn-primary w-full py-2.5 text-xs font-bold">
        {pending ? "Logging…" : "Log Entry"}
      </button>
    </form>
  );
}

function VitalsForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (input: {
    type: "BP" | "GLUCOSE" | "HEART_RATE" | "SPO2";
    systolic?: number;
    diastolic?: number;
    value?: number;
  }) => void;
}) {
  const [vitalType, setVitalType] = useState<"BP" | "GLUCOSE" | "HEART_RATE" | "SPO2">("BP");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [val, setVal] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (vitalType === "BP") {
      onSubmit({
        type: "BP",
        systolic: parseInt(systolic, 10),
        diastolic: parseInt(diastolic, 10),
      });
    } else {
      onSubmit({
        type: vitalType,
        value: parseFloat(val),
      });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div className="flex gap-2">
        <select
          value={vitalType}
          onChange={(e) => setVitalType(e.target.value as any)}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink"
        >
          <option value="BP">Blood Pressure (mmHg)</option>
          <option value="GLUCOSE">Blood Glucose (mg/dL)</option>
          <option value="HEART_RATE">Resting Heart Rate (bpm)</option>
          <option value="SPO2">Blood Oxygen (SpO2 %)</option>
        </select>
      </div>

      {vitalType === "BP" ? (
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] font-semibold text-ink-soft block mb-1">Systolic</label>
            <input
              type="number"
              placeholder="120"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-ink-soft block mb-1">Diastolic</label>
            <input
              type="number"
              placeholder="80"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink"
              required
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="text-[11px] font-semibold text-ink-soft block mb-1">
            {vitalType === "GLUCOSE"
              ? "Blood Sugar (mg/dL)"
              : vitalType === "HEART_RATE"
              ? "Heart Rate (bpm)"
              : "SpO2 (%)"}
          </label>
          <input
            type="number"
            placeholder={vitalType === "GLUCOSE" ? "105" : vitalType === "HEART_RATE" ? "72" : "98"}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink"
            required
          />
        </div>
      )}

      <button type="submit" disabled={pending} className="lif-btn-primary w-full py-2.5 text-xs font-bold">
        {pending ? "Saving…" : "Save Vital Reading"}
      </button>
    </form>
  );
}

function FoodSearch({
  pending,
  onPick,
}: {
  pending: boolean;
  onPick: (id: string, servings: number, meal: "breakfast" | "lunch" | "dinner" | "snack") => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [picked, setPicked] = useState<FoodResult | null>(null);
  const [servings, setServings] = useState(1);
  const [meal, setMeal] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");

  const search = async () => {
    setResults(await searchFoods(q));
  };

  if (picked) {
    return (
      <div className="space-y-3">
        <p className="font-semibold text-sm text-ink">{picked.name}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-ink-soft block mb-1">Servings</label>
            <input
              type="number"
              step="0.5"
              min="0.25"
              className="w-full rounded-xl border border-line bg-surface p-2 text-xs text-ink"
              value={servings}
              onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-ink-soft block mb-1">Meal</label>
            <select
              className="w-full rounded-xl border border-line bg-surface p-2 text-xs text-ink"
              value={meal}
              onChange={(e) => setMeal(e.target.value as typeof meal)}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-ink-soft">≈ {Math.round(picked.calories * servings)} kcal</p>
        <button
          disabled={pending}
          onClick={() => onPick(picked.id, servings, meal)}
          className="lif-btn-primary w-full py-2 text-xs font-bold"
        >
          {pending ? "Logging…" : "Log Food Entry"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
        className="flex gap-2"
      >
        <input
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:border-primary"
          placeholder="Search Indian foods… (e.g. roti, dal, paneer)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Food search"
        />
        <button type="submit" className="lif-btn-secondary py-1.5 px-3 text-xs font-semibold">
          Search
        </button>
      </form>
      <ul className="divide-y divide-line/60 max-h-48 overflow-y-auto">
        {results.map((f) => (
          <li key={f.id}>
            <button
              className="flex w-full items-center justify-between py-2 text-left hover:bg-surface-subtle px-1.5 rounded-lg transition-colors"
              onClick={() => setPicked(f)}
            >
              <span className="text-xs font-semibold text-ink">{f.name}</span>
              <span className="text-[11px] text-ink-soft">
                {f.calories} kcal · {f.servingLabel}
              </span>
            </button>
          </li>
        ))}
        {q.length >= 2 && results.length === 0 && (
          <li className="py-3 text-xs text-ink-soft text-center">No matches — try another name.</li>
        )}
      </ul>
    </div>
  );
}
