import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ComparisonMetric {
  name: string;
  emoji: string;
  currentValue: string | number;
  previousValue: string | number;
  change: string; // e.g. "+14%", "-35m", "+2 bpm"
  sentiment: "positive" | "negative" | "neutral";
  interpretation: string;
}

export interface ComparisonCardProps {
  currentPeriodLabel?: string;
  previousPeriodLabel?: string;
  metrics: ComparisonMetric[];
  className?: string;
}

export function ComparisonCard({
  currentPeriodLabel = "This Week",
  previousPeriodLabel = "Last Week",
  metrics,
  className,
}: ComparisonCardProps) {
  return (
    <Card className={cn("space-y-4 p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Comparative Differential
          </span>
          <h3 className="text-base font-bold text-ink tracking-tight">What Changed?</h3>
        </div>
        <span className="text-xs text-ink-soft">
          {currentPeriodLabel} vs {previousPeriodLabel}
        </span>
      </div>

      <div className="divide-y divide-line/60">
        {metrics.map((m) => {
          const tone =
            m.sentiment === "positive"
              ? "success"
              : m.sentiment === "negative"
              ? "crisis"
              : "neutral";

          return (
            <div key={m.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">
                  {m.emoji}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{m.name}</span>
                    <Badge tone={tone}>
                      {m.change}
                    </Badge>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">{m.interpretation}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-right">
                <div>
                  <span className="text-ink-muted block text-[10px]">{previousPeriodLabel}</span>
                  <span className="font-medium text-ink-soft font-mono">{m.previousValue}</span>
                </div>
                <span className="text-ink-muted">→</span>
                <div>
                  <span className="text-ink-muted block text-[10px]">{currentPeriodLabel}</span>
                  <span className="font-bold text-ink font-mono">{m.currentValue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
