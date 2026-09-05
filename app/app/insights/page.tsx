import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateDescriptiveStats,
  calculateBaseline,
  calculatePearsonCorrelation,
  TimeSeriesPoint,
} from "@/lib/analytics/stats";
import { getUserGoalsWithProgress } from "@/lib/actions/goals";
import { AnalyticsView } from "./analytics-view";

export default async function InsightsPage() {
  const user = await requireUser();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Fetch metrics & logs for steps
  const stepMetrics = await prisma.healthMetric.findMany({
    where: { userId: user.id, type: "steps", startTime: { gte: oneYearAgo } },
    orderBy: { startTime: "asc" },
  });
  const stepLogs = await prisma.healthLog.findMany({
    where: { userId: user.id, type: "steps", startTime: { gte: oneYearAgo } },
    orderBy: { startTime: "asc" },
  });

  // Fetch sleep data
  const sleepMetrics = await prisma.healthMetric.findMany({
    where: { userId: user.id, type: "sleep_duration", startTime: { gte: oneYearAgo } },
    orderBy: { startTime: "asc" },
  });
  const sleepLogs = await prisma.healthLog.findMany({
    where: { userId: user.id, type: "sleep_duration", startTime: { gte: oneYearAgo } },
    orderBy: { startTime: "asc" },
  });

  // Reconcile and group by date
  const stepMap = new Map<string, number>();
  for (const m of stepMetrics) stepMap.set(m.startTime.toISOString().slice(0, 10), m.value);
  for (const l of stepLogs) stepMap.set(l.startTime.toISOString().slice(0, 10), l.value); // manual wins

  const sleepMap = new Map<string, number>();
  for (const m of sleepMetrics) sleepMap.set(m.startTime.toISOString().slice(0, 10), m.value);
  for (const l of sleepLogs) sleepMap.set(l.startTime.toISOString().slice(0, 10), l.value);

  const stepHistory: TimeSeriesPoint[] = Array.from(stepMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const sleepHistory: TimeSeriesPoint[] = Array.from(sleepMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const stepStats = calculateDescriptiveStats(stepHistory);
  const sleepStats = calculateDescriptiveStats(sleepHistory);

  const baselineStep = calculateBaseline(stepHistory, "Steps", "steps");
  const correlation = calculatePearsonCorrelation(stepHistory, sleepHistory, "Steps", "Sleep Duration");

  const goals = await getUserGoalsWithProgress();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Advanced Health & Insights</h1>
        <p className="text-sm text-ink-soft">
          12-month trend analysis, rolling baseline evaluations, bivariate correlation modeling, and daily goal progress.
        </p>
      </div>

      <AnalyticsView
        stepHistory={stepHistory}
        sleepHistory={sleepHistory}
        stepStats={stepStats}
        sleepStats={sleepStats}
        baselineStep={baselineStep}
        correlation={correlation}
        goals={goals}
      />
    </div>
  );
}
