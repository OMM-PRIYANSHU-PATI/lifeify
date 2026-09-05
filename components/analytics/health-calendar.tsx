"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface DayStatus {
  date: string; // "YYYY-MM-DD"
  dayNumber: number;
  status: "complete" | "partial" | "missed" | "empty";
  score?: number;
  tooltipText?: string;
}

export interface HealthCalendarProps {
  monthName: string;
  year: number;
  days: DayStatus[];
  currentStreak?: number;
  bestStreak?: number;
  className?: string;
}

export function HealthCalendar({
  monthName,
  year,
  days,
  currentStreak = 8,
  bestStreak = 24,
  className,
}: HealthCalendarProps) {
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

  const getStatusColor = (status: DayStatus["status"]) => {
    switch (status) {
      case "complete":
        return "bg-primary text-white";
      case "partial":
        return "bg-primary-soft text-primary-dark border border-primary/30";
      case "missed":
        return "bg-crisis-soft text-crisis border border-crisis/30";
      default:
        return "bg-surface-subtle text-ink-muted border border-line/40";
    }
  };

  return (
    <Card className={cn("space-y-4 p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Consistency Matrix
          </span>
          <h3 className="text-base font-bold text-ink tracking-tight">
            {monthName} {year}
          </h3>
        </div>

        {currentStreak > 0 && (
          <Badge tone="accent">
            🔥 {currentStreak}-Day Streak
          </Badge>
        )}
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-ink-muted">
        {weekdays.map((w, idx) => (
          <div key={idx} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <div
            key={day.date}
            title={day.tooltipText || `${day.date}: ${day.status}`}
            className={cn(
              "aspect-square flex items-center justify-center rounded-xl text-xs font-semibold cursor-pointer transition-transform hover:scale-105 select-none",
              getStatusColor(day.status)
            )}
          >
            {day.dayNumber}
          </div>
        ))}
      </div>

      {/* Legend & Stats footer */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-line/60 text-xs text-ink-soft">
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>Target Achieved</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary-soft border border-primary/40" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-surface-subtle border border-line" />
            <span>Rest / Log</span>
          </div>
        </div>

        <span className="text-[11px] text-ink-muted">
          All-time best streak: <strong>{bestStreak} days</strong>
        </span>
      </div>
    </Card>
  );
}
