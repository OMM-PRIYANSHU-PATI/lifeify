import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrackClient } from "./track-client";

const TRACK_CONFIG: Record<string, { unit: string; defaultValue: number; title: string }> = {
  steps: { unit: "steps", defaultValue: 5000, title: "Daily Steps" },
  water: { unit: "ml", defaultValue: 250, title: "Hydration Intake" },
  sleep: { unit: "hours", defaultValue: 8, title: "Sleep Duration" },
  mood: { unit: "/ 5", defaultValue: 4, title: "Mood Score" },
  recovery: { unit: "%", defaultValue: 80, title: "Recovery Readiness" },
  weight: { unit: "kg", defaultValue: 70, title: "Body Weight" },
  nutrition: { unit: "kcal", defaultValue: 400, title: "Caloric Intake" },
};

export default async function GenericTrackPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const user = await requireUser();
  const { type } = await params;

  const config = TRACK_CONFIG[type];
  if (!config) notFound();

  const recentLogs = await prisma.healthLog.findMany({
    where: { userId: user.id, type },
    orderBy: { startTime: "desc" },
    take: 15,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{config.title} Tracking</h1>
        <p className="text-xs text-ink-soft">
          Log daily readings manually. Manual logs take precedence over wearable syncs within a 24-hour window.
        </p>
      </div>

      <TrackClient
        type={type}
        unit={config.unit}
        initialValue={config.defaultValue}
        recentLogs={recentLogs}
      />
    </div>
  );
}
