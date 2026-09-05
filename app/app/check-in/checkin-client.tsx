"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, HeartPulse, Smile, Meh, Frown, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { TriFactorQuiz } from "@/components/health/tri-factor-quiz";

interface Question {
  id: string;
  code: string;
  question: string;
  text?: string;
  type: string;
  options?: string | null;
}

export function CheckInClient() {
  const [checkinMode, setCheckinMode] = useState<"gamified" | "survey">("gamified");
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [moodScore, setMoodScore] = useState<number>(4);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadCheckIn = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkin/today");
      const data = await res.json();
      if (data.ok) {
        setCompleted(data.completed);
        setQuestions(data.questions || []);
        // Initialize default answers
        const initialAnswers: Record<string, string> = {};
        for (const q of data.questions || []) {
          initialAnswers[q.id] = q.type === "scale" ? "4" : q.type === "yesno" ? "no" : "";
        }
        setAnswers(initialAnswers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckIn();
  }, []);

  const handleAnswerChange = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodScore,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit check-in");
      }

      setCompleted(true);
      setSuccessMsg("Check-in complete! +10 Points added to your wellness streak.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">Loading your daily health check-in...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Check-In Completed!</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {successMsg || "You have completed today's health check-in. Your adherence and wellness trends have been updated."}
          </p>

          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold max-w-sm mx-auto">
            <Sparkles className="w-4 h-4" />
            +10 Wellness Points & Streak Active
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Link
              href="/app/dashboard"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium text-sm hover:opacity-90 transition"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/app/medications"
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Medications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-rose-500" />
          Daily Health Check-In
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Takes under 60 seconds. Helps tune your wellness plan and detect health signals early.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 rounded-xl bg-surface border border-line">
        <button
          type="button"
          onClick={() => setCheckinMode("gamified")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            checkinMode === "gamified"
              ? "bg-primary text-white shadow-xs"
              : "text-ink-soft hover:text-ink hover:bg-surface-subtle"
          }`}
        >
          <span>🌌</span> Morning Simulation (Sleep ➔ Mood ➔ Recovery)
        </button>
        <button
          type="button"
          onClick={() => setCheckinMode("survey")}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            checkinMode === "survey"
              ? "bg-primary text-white shadow-xs"
              : "text-ink-soft hover:text-ink hover:bg-surface-subtle"
          }`}
        >
          <span>📋</span> Clinical Checklist
        </button>
      </div>

      {checkinMode === "gamified" ? (
        <TriFactorQuiz
          onDone={() => {
            setCompleted(true);
            setSuccessMsg("Morning Health Simulation locked in! +50 XP awarded.");
            loadCheckIn();
          }}
          variant="inline"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood / Overall Feeling */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            1. How are you feeling overall today?
          </h2>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { score: 1, label: "Rough", icon: Frown },
              { score: 2, label: "Not Great", icon: Frown },
              { score: 3, label: "Okay", icon: Meh },
              { score: 4, label: "Good", icon: Smile },
              { score: 5, label: "Great", icon: Smile },
            ].map((item) => {
              const Icon = item.icon;
              const selected = moodScore === item.score;
              return (
                <button
                  key={item.score}
                  type="button"
                  onClick={() => setMoodScore(item.score)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    selected
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${selected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Questions */}
        {questions.map((q, idx) => {
          const qTitle = q.question || q.text || `Question #${idx + 1}`;
          const currentVal = answers[q.id] || "";

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {idx + 2}. {qTitle}
              </h2>

              {q.type === "scale" && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Low (1)</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={currentVal || 3}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400">High (5)</span>
                  <span className="w-7 text-center font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {currentVal || 3}
                  </span>
                </div>
              )}

              {q.type === "yesno" && (
                <div className="flex gap-3">
                  {["no", "yes"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAnswerChange(q.id, val)}
                      className={`flex-1 py-2 px-4 rounded-xl border text-xs font-semibold capitalize transition ${
                        currentVal.toLowerCase() === val
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}

              {q.type !== "scale" && q.type !== "yesno" && (
                <input
                  type="text"
                  placeholder="Your answer..."
                  value={currentVal}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>
          );
        })}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
          >
            {submitting ? "Submitting..." : "Complete Check-In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
