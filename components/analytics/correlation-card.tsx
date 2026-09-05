import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface CorrelationItem {
  id: string;
  metricA: string;
  metricB: string;
  emojiA: string;
  emojiB: string;
  correlationCoefficient: number; // e.g. 0.68, -0.54
  observationText: string;
  confidence: "High" | "Moderate" | "Emerging";
  dataPointsCount: number;
}

export interface CorrelationCardProps {
  correlations: CorrelationItem[];
  className?: string;
}

export function CorrelationCard({ correlations, className }: CorrelationCardProps) {
  return (
    <Card className={cn("space-y-4 p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Cross-Metric Analysis
          </span>
          <h3 className="text-base font-bold text-ink tracking-tight">Health Connections</h3>
        </div>
        <Badge tone="neutral">Co-Occurrence</Badge>
      </div>

      <p className="text-xs text-ink-soft">
        Observed patterns between distinct biometrics over time. LIFEIFY presents verified statistical co-occurrence to empower informed conversations with your physician.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {correlations.map((item) => {
          const isPositive = item.correlationCoefficient > 0;
          const strength =
            Math.abs(item.correlationCoefficient) >= 0.6
              ? "Strong"
              : Math.abs(item.correlationCoefficient) >= 0.35
              ? "Moderate"
              : "Mild";

          return (
            <div
              key={item.id}
              className="rounded-xl border border-line bg-surface-subtle p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <span>{item.emojiA}</span>
                  <span>{item.metricA}</span>
                  <span className="text-ink-muted">×</span>
                  <span>{item.emojiB}</span>
                  <span>{item.metricB}</span>
                </div>
                <Badge tone={item.confidence === "High" ? "primary" : "neutral"}>
                  {strength} (r = {item.correlationCoefficient.toFixed(2)})
                </Badge>
              </div>

              <p className="text-xs text-ink-soft leading-relaxed">
                {item.observationText}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-line/50 text-[10px] text-ink-muted">
                <span>Based on {item.dataPointsCount} data points</span>
                <span className="italic font-medium">Correlation, not causation</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
