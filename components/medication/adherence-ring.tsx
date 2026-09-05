import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface AdherenceRingProps {
  percentage: number; // 0 to 100
  takenCount: number;
  totalCount: number;
  streakDays?: number;
  timeframe?: string; // e.g. "Past 7 Days", "This Month"
  className?: string;
}

export function AdherenceRing({
  percentage,
  takenCount,
  totalCount,
  streakDays = 12,
  timeframe = "Past 7 Days",
  className,
}: AdherenceRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * clamped) / 100;

  const toneColor =
    clamped >= 85
      ? "var(--color-primary)"
      : clamped >= 70
      ? "var(--color-accent)"
      : "var(--color-crisis)";

  return (
    <Card className={cn("flex flex-col justify-between p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Adherence Fidelity
        </span>
        <Badge tone={clamped >= 85 ? "success" : clamped >= 70 ? "primary" : "warning"}>
          {timeframe}
        </Badge>
      </div>

      <div className="my-4 flex items-center justify-center gap-6">
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth={stroke}
              className="opacity-40"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={toneColor}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-extrabold font-mono text-ink">
              {clamped}%
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div>
            <span className="text-ink-muted block text-[11px]">Doses Logged</span>
            <span className="font-bold text-ink font-mono text-sm">
              {takenCount} / {totalCount}
            </span>
          </div>
          {streakDays > 0 && (
            <div>
              <span className="text-ink-muted block text-[11px]">Current Streak</span>
              <span className="font-bold text-accent">
                🔥 {streakDays} days
              </span>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-ink-muted border-t border-line/60 pt-3">
        High adherence maintains steady-state therapeutic plasma concentration and prevents rebound spikes.
      </p>
    </Card>
  );
}
