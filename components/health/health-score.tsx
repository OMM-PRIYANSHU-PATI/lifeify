"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface HealthScoreBreakdown {
  activity: number; // max 20
  sleep: number; // max 25
  nutrition: number; // max 20
  hydration: number; // max 15
  medication: number; // max 20
}

export interface HealthScoreProps {
  score: number;
  components?: Partial<HealthScoreBreakdown>;
  className?: string;
  showBreakdown?: boolean;
}

export function HealthScoreGauge({
  score,
  components = { activity: 16, sleep: 21, nutrition: 15, hydration: 12, medication: 18 },
  className,
  showBreakdown = true,
}: HealthScoreProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine tone and label
  const tone =
    clampedScore >= 80
      ? { label: "Optimal", badge: "success" as const, color: "var(--color-primary)", text: "Optimal biometric & lifestyle alignment." }
      : clampedScore >= 60
      ? { label: "Balanced", badge: "primary" as const, color: "var(--color-accent)", text: "Good balance with opportunity for steady improvement." }
      : { label: "Needs Attention", badge: "warning" as const, color: "var(--color-crisis)", text: "Prioritize hydration, restful sleep, and medication schedules today." };

  // Circular gauge math (180 degree semi-circle or full circular ring)
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * clampedScore) / 100;

  const componentMetrics = [
    { label: "Activity", val: components.activity ?? 0, max: 20, emoji: "🚶" },
    { label: "Sleep", val: components.sleep ?? 0, max: 25, emoji: "🌙" },
    { label: "Nutrition", val: components.nutrition ?? 0, max: 20, emoji: "🥗" },
    { label: "Hydration", val: components.hydration ?? 0, max: 15, emoji: "💧" },
    { label: "Medication", val: components.medication ?? 0, max: 20, emoji: "💊" },
  ];

  return (
    <Card className={cn("flex flex-col justify-between overflow-hidden relative", className)}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Daily Health Index
          </span>
          <h2 className="text-lg font-bold text-ink">Overall Health Score</h2>
        </div>
        <Badge tone={tone.badge} dot>
          {tone.label}
        </Badge>
      </div>

      {/* Main Score Centerpiece */}
      <div className="my-6 flex flex-col sm:flex-row items-center gap-6 justify-center">
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth={strokeWidth}
              className="opacity-40"
            />
            {/* Value ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={tone.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold tracking-tight text-ink font-mono">
              {clampedScore}
            </span>
            <span className="text-[11px] font-medium text-ink-muted">out of 100</span>
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-1.5 text-center sm:text-left max-w-xs">
          <p className="text-sm font-semibold text-ink">
            {clampedScore >= 80 ? "Biometrics in Flow" : "Daily Health Balance"}
          </p>
          <p className="text-xs text-ink-soft leading-relaxed">{tone.text}</p>
          <p className="text-[10px] text-ink-muted pt-1">
            Calculated deterministically from logged biometrics, wearable telemetry, and adherence protocols.
          </p>
        </div>
      </div>

      {/* Breakdown progress indicators */}
      {showBreakdown && (
        <div className="border-t border-line/60 pt-4 mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {componentMetrics.map((item) => {
              const pct = Math.min(100, Math.round((item.val / item.max) * 100));
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-soft flex items-center gap-1 font-medium">
                      <span>{item.emoji}</span>
                      {item.label}
                    </span>
                    <span className="font-semibold text-ink">
                      {item.val}/{item.max}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
