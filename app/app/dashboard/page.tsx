import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateHealthScore } from "@/services/health-score";
import { getTodaySummary } from "@/services/logs";
import { HealthScoreGauge } from "@/components/health/health-score";
import { MetricCard } from "@/components/health/metric-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const user = await requireUser();

  const [healthScoreData, todaySummary] = await Promise.all([
    calculateHealthScore(user.id),
    getTodaySummary(user.id),
  ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [pendingDoses, connectedDevicesCount, latestBp] = await Promise.all([
    prisma.medicationDose.findMany({
      where: {
        userId: user.id,
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: "scheduled",
      },
      include: { medication: true },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.healthDataSource.count({
      where: { userId: user.id, status: "CONNECTED" },
    }),
    prisma.vitalReading.findFirst({
      where: { userId: user.id, type: "BP" },
      orderBy: { takenAt: "desc" },
    }),
  ]);

  const firstName = user.name ? user.name.split(" ")[0] : "there";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Personal Health OS
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Good day, {firstName}.
          </h1>
          <p className="text-xs text-ink-soft mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · All health streams synchronized.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/voice"
            className="lif-btn-primary flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold shadow-xs"
          >
            <span>🎙️</span> Voice Log
          </Link>
          <Link
            href="/app/emergency-card"
            className="lif-btn-secondary flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold"
          >
            <span>🚨</span> Emergency QR
          </Link>
        </div>
      </div>

      {/* What Matters Today Banner */}
      <div className="rounded-2xl border border-primary/30 bg-primary-soft/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5" aria-hidden="true">
            🧭
          </span>
          <div>
            <h3 className="text-sm font-bold text-ink">What Matters Today</h3>
            <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">
              {pendingDoses.length > 0
                ? `You have ${pendingDoses.length} scheduled medication dose${
                    pendingDoses.length > 1 ? "s" : ""
                  } to complete on time.`
                : "All medication doses completed! Prioritize 2.5L hydration and reach 6,000 steps today."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/app/medications"
            className="lif-btn-primary py-1.5 px-3 text-xs font-bold whitespace-nowrap"
          >
            {pendingDoses.length > 0 ? "Review Doses →" : "View Schedule →"}
          </Link>
        </div>
      </div>

      {/* Gamified Tri-Factor Banner */}
      <div className="rounded-2xl border border-primary/40 bg-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5" aria-hidden="true">
            🎮
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink">Tri-Factor Daily Pulse</h3>
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-extrabold text-primary-dark">
                +20 XP
              </span>
            </div>
            <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">
              {todaySummary.recoveryScore != null && todaySummary.sleepHours != null
                ? `Today's Tri-Factor synchronized: ${todaySummary.recoveryScore}% Recovery Readiness · ${todaySummary.sleepHours}h Sleep · Mood ${todaySummary.mood ?? 4}/5.`
                : "Predict your Recovery, Mood, and Sleep in a 30-second gamified quiz. No manual number typing needed!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/app/check-in"
            className="lif-btn-primary py-1.5 px-3.5 text-xs font-bold whitespace-nowrap shadow-xs hover:scale-102 transition-all"
          >
            {todaySummary.recoveryScore != null ? "Review / Retake ↺" : "Play Quiz →"}
          </Link>
        </div>
      </div>

      {/* Health Score Centerpiece */}
      <HealthScoreGauge
        score={healthScoreData.score}
        components={healthScoreData.components}
      />

      {/* 5 Core Metric Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Daily Steps"
          emoji="🚶"
          value={todaySummary.steps.toLocaleString()}
          unit="steps"
          goal={{
            current: todaySummary.steps,
            target: 6000,
            targetLabel: "Target: 6,000",
          }}
          delta={{
            value: "+8%",
            isPositive: true,
            isGood: true,
          }}
        />

        <MetricCard
          label="Hydration"
          emoji="💧"
          value={todaySummary.waterMl}
          unit="ml"
          goal={{
            current: todaySummary.waterMl,
            target: 2000,
            targetLabel: "Target: 2,000 ml",
          }}
          delta={{
            value: "+250 ml",
            isPositive: true,
            isGood: true,
          }}
        />

        <MetricCard
          label="Sleep"
          emoji="🌙"
          value={todaySummary.sleepHours ?? "—"}
          unit={todaySummary.sleepHours ? "hrs" : undefined}
          goal={{
            current: todaySummary.sleepHours ?? 0,
            target: 8.0,
            targetLabel: "Target: 8.0 hrs",
          }}
          status={
            todaySummary.sleepHours && todaySummary.sleepHours >= 7
              ? "optimal"
              : "normal"
          }
        />

        <MetricCard
          label="Recovery Readiness"
          emoji="💚"
          value={todaySummary.recoveryScore != null ? `${todaySummary.recoveryScore}%` : "Play Quiz"}
          unit={todaySummary.recoveryScore != null ? "readiness" : undefined}
          goal={
            todaySummary.recoveryScore != null
              ? {
                  current: todaySummary.recoveryScore,
                  target: 85,
                  targetLabel: "Target: 85%+",
                }
              : undefined
          }
          status={
            todaySummary.recoveryScore != null && todaySummary.recoveryScore >= 75
              ? "optimal"
              : todaySummary.recoveryScore != null && todaySummary.recoveryScore >= 50
              ? "normal"
              : "warning"
          }
        />

        <MetricCard
          label="Blood Pressure"
          emoji="❤️"
          value={
            latestBp && latestBp.systolic && latestBp.diastolic
              ? `${latestBp.systolic}/${latestBp.diastolic}`
              : "118/78"
          }
          unit="mmHg"
          sub={latestBp ? "Recent reading" : "Resting baseline"}
          status="optimal"
        />
      </div>

      {/* Two Column Section: Pending Doses & Clinical Ecosystem */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Doses Timeline Card */}
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                💊
              </span>
              <div>
                <h3 className="text-base font-bold text-ink tracking-tight">
                  Today&apos;s Medication Regimen
                </h3>
                <p className="text-xs text-ink-muted">
                  {pendingDoses.length} dose{pendingDoses.length === 1 ? "" : "s"} remaining
                </p>
              </div>
            </div>
            <Link
              href="/app/medications"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Full Protocol →
            </Link>
          </div>

          {pendingDoses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface-subtle p-6 text-center">
              <span className="text-2xl block mb-1">🎉</span>
              <p className="text-xs font-bold text-ink">All doses up to date</p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                No outstanding doses scheduled for the remainder of today.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line/60">
              {pendingDoses.map((d) => (
                <div
                  key={d.id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-ink text-sm">{d.medication.name}</p>
                    <p className="text-[11px] text-ink-soft">
                      Scheduled:{" "}
                      {new Date(d.scheduledAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {d.medication.instructions ?? d.medication.frequency ?? "Standard dose"}
                    </p>
                  </div>
                  <Link
                    href="/app/medications"
                    className="lif-btn-primary py-1 px-3 text-xs font-semibold shadow-xs"
                  >
                    Take Dose
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Clinical Ecosystem Portals */}
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink tracking-tight">
              Clinical & Care Hub
            </h3>
            <span className="text-xs text-ink-muted">
              {connectedDevicesCount} wearable{connectedDevicesCount === 1 ? "" : "s"} synced
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              href="/app/scan"
              className="rounded-xl border border-line bg-surface-subtle p-3.5 hover:border-primary/40 hover:bg-surface transition-all flex items-start gap-2.5"
            >
              <span className="text-2xl">📷</span>
              <div>
                <p className="font-bold text-ink">Prescription OCR</p>
                <span className="text-[10px] text-ink-muted block mt-0.5">
                  Instant scan & schedule
                </span>
              </div>
            </Link>

            <Link
              href="/app/labs"
              className="rounded-xl border border-line bg-surface-subtle p-3.5 hover:border-primary/40 hover:bg-surface transition-all flex items-start gap-2.5"
            >
              <span className="text-2xl">🧪</span>
              <div>
                <p className="font-bold text-ink">Diagnostic Labs</p>
                <span className="text-[10px] text-ink-muted block mt-0.5">
                  Thyrocare / Lal PathLabs
                </span>
              </div>
            </Link>

            <Link
              href="/app/pharmacy"
              className="rounded-xl border border-line bg-surface-subtle p-3.5 hover:border-primary/40 hover:bg-surface transition-all flex items-start gap-2.5"
            >
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-bold text-ink">Pharmacy Refills</p>
                <span className="text-[10px] text-ink-muted block mt-0.5">
                  Tata 1mg / Apollo direct
                </span>
              </div>
            </Link>

            <Link
              href="/doctor/rpm"
              className="rounded-xl border border-line bg-surface-subtle p-3.5 hover:border-primary/40 hover:bg-surface transition-all flex items-start gap-2.5"
            >
              <span className="text-2xl">👨‍⚕️</span>
              <div>
                <p className="font-bold text-ink">Doctor RPM</p>
                <span className="text-[10px] text-ink-muted block mt-0.5">
                  Continuous physician review
                </span>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
