"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, HeartPulse, Smile, Meh, Frown, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
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
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-ink-muted text-xs font-semibold">Synchronizing your daily health check-in...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fadeIn">
        <div className="lif-card p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-primary-soft rounded-2xl flex items-center justify-center mx-auto text-primary">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-ink">Daily Check-In Completed!</h1>
          <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
            {successMsg || "You have completed today's health check-in. Your adherence and wellness trends have been updated."}
          </p>

          <div className="flex items-center justify-center gap-2 p-2.5 bg-primary-soft/60 rounded-xl text-primary-dark text-xs font-bold max-w-sm mx-auto">
            <Sparkles className="w-4 h-4" />
            +10 Wellness Points &amp; Streak Active
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app/dashboard"
              className="lif-btn-primary py-2 px-5 text-xs font-bold shadow-xs"
            >
              Back to Dashboard →
            </Link>
            <Link
              href="/app/medications"
              className="lif-btn-secondary py-2 px-5 text-xs font-bold"
            >
              Review Medications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="lif-card p-6">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ink flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-crisis" />
          Daily Health Check-In
        </h1>
        <p className="text-xs text-ink-soft mt-1 leading-relaxed">
          Takes under 60 seconds. Tunes your recovery baseline and detects health signals early.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-crisis-soft border border-crisis/30 rounded-xl text-xs font-medium text-crisis flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 rounded-2xl bg-surface border border-line shadow-xs">
        <button
          type="button"
          onClick={() => setCheckinMode("gamified")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mood / Overall Feeling */}
          <div className="lif-card p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
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
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selected
                        ? "border-primary bg-primary-soft text-primary-dark font-bold ring-2 ring-primary/20 shadow-xs"
                        : "border-line bg-surface hover:bg-surface-subtle text-ink-soft"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${selected ? "text-primary-dark" : "text-ink-muted"}`} />
                    <span className="text-xs">{item.label}</span>
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
                className="lif-card p-6 space-y-3"
              >
                <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {idx + 2}. {qTitle}
                </h2>

                {q.type === "scale" && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-ink-muted">Low (1)</span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={currentVal || 3}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="lif-scale-slider flex-1"
                    />
                    <span className="text-xs text-ink-muted">High (5)</span>
                    <span className="w-8 text-center font-extrabold text-sm text-primary">
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
                        className={`flex-1 py-2 px-4 rounded-xl border text-xs font-bold capitalize transition-all ${
                          currentVal.toLowerCase() === val
                            ? "border-primary bg-primary-soft text-primary-dark shadow-xs"
                            : "border-line bg-surface text-ink-soft hover:bg-surface-subtle hover:text-ink"
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
                    className="lif-input"
                  />
                )}
              </div>
            );
          })}

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="lif-btn-primary py-2.5 px-6 text-xs font-bold shadow-xs flex items-center gap-2"
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
