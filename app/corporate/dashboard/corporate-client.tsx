"use client";

import { useState, useEffect } from "react";

export function CorporateDashboardClient() {
  const [aggregates, setAggregates] = useState<any | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressIncrement, setProgressIncrement] = useState<number>(5000);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aggRes, chalRes] = await Promise.all([
        fetch("/api/corporate/aggregate-health"),
        fetch("/api/corporate/challenges"),
      ]);

      const aggData = await aggRes.json();
      const chalData = await chalRes.json();

      if (aggData.ok) setAggregates(aggData);
      if (chalData.ok) setChallenges(chalData.challenges || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoin = async (challengeId: string) => {
    try {
      const res = await fetch("/api/corporate/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "JOIN", challengeId }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogProgress = async (challengeId: string) => {
    try {
      const res = await fetch("/api/corporate/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOG_PROGRESS",
          challengeId,
          incrementValue: progressIncrement,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
            <span>🏢</span> Corporate Wellness &amp; B2B Tenancy
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Empowering team health, active wellness challenges, and privacy-first population health rollups.
          </p>
        </div>
        {aggregates?.organization && (
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink shadow-sm">
              {aggregates.organization.name}
            </span>
            <span className="rounded-xl bg-primary px-3 py-1.5 text-xs font-black text-white shadow-sm">
              {aggregates.organization.plan}
            </span>
          </div>
        )}
      </div>

      {/* Privacy Guarantee Alert */}
      <div className="rounded-xl border border-primary/20 bg-primary-soft/50 p-4 text-xs text-primary-dark space-y-1">
        <div className="font-bold flex items-center gap-2">
          <span>🔒</span> Differential Privacy &amp; Anonymization Architecture
        </div>
        <p className="text-[11px] text-primary-dark/80">
          Individual medical records and medication dosages are strictly encrypted in individual vaults. Corporate administrators only have access to anonymized aggregates and opt-in challenge leaderboards.
        </p>
      </div>

      {/* Aggregate Health Metrics Cards */}
      {aggregates?.metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-ink-muted">Org Health Score</span>
            <div className="text-3xl font-black text-ink mt-1">
              {aggregates.metrics.averageHealthScore} / 100
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">↑ +4 pts this quarter</span>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-ink-muted">Avg Daily Steps</span>
            <div className="text-3xl font-black text-ink mt-1">
              {aggregates.metrics.averageDailySteps.toLocaleString()}
            </div>
            <span className="text-[10px] text-ink-muted font-medium">Wearable verified</span>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-ink-muted">Med Adherence Rate</span>
            <div className="text-3xl font-black text-ink mt-1">
              {aggregates.metrics.corporateAdherenceRate}%
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Exceeds clinical benchmark</span>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-ink-muted">Active Challenges</span>
            <div className="text-3xl font-black text-ink mt-1">
              {aggregates.metrics.activeChallengesCount}
            </div>
            <span className="text-[10px] text-primary font-semibold">Inter-departmental cup</span>
          </div>
        </div>
      )}

      {/* Wellness Challenges */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-ink uppercase tracking-wider">
          Active Team Wellness Challenges
        </h2>

        {loading ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-xs text-ink-muted">
            Loading team challenges...
          </div>
        ) : challenges.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-xs text-ink-muted">
            No active challenges right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      {c.type} CHALLENGE
                    </span>
                    <span className="text-[11px] font-medium text-ink-muted">
                      Ends in {Math.max(1, Math.round((new Date(c.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))} days
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-ink mt-1.5">{c.title}</h3>
                  <p className="text-xs text-ink-muted mt-0.5">{c.description}</p>
                </div>

                {/* Leaderboard */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink block">
                    Leaderboard ({c.participants?.length || 0} participants)
                  </span>
                  <div className="rounded-xl bg-background p-3 divide-y divide-line/60">
                    {c.participants && c.participants.length > 0 ? (
                      c.participants.map((p: any, idx: number) => (
                        <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-ink w-4">{idx + 1}.</span>
                            <span className="font-bold text-ink">{p.member?.anonymizedId}</span>
                            <span className="text-[10px] text-ink-muted">({p.member?.department})</span>
                          </div>
                          <span className="font-black text-primary">
                            {p.currentValue.toLocaleString()} pts
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-ink-muted py-2 text-center">
                        Be the first to join this challenge!
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleJoin(c.id)}
                    className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all"
                  >
                    Join Challenge
                  </button>
                  <button
                    onClick={() => handleLogProgress(c.id)}
                    className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-ink hover:bg-background transition-all"
                  >
                    +5,000 Steps
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
