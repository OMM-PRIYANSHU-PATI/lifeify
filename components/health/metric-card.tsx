import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface MetricCardProps {
  label: string;
  emoji: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string;
    isPositive?: boolean;
    isGood?: boolean; // Sometimes down is good (e.g. resting heart rate, blood pressure, LDL)
  };
  goal?: {
    current: number;
    target: number;
    targetLabel?: string;
  };
  sub?: string;
  status?: "normal" | "optimal" | "warning" | "alert";
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  label,
  emoji,
  value,
  unit,
  delta,
  goal,
  sub,
  status,
  onClick,
  className,
}: MetricCardProps) {
  const isInteractive = Boolean(onClick);

  const statusTone =
    status === "optimal"
      ? "success"
      : status === "warning"
      ? "warning"
      : status === "alert"
      ? "crisis"
      : "neutral";

  const goalPct = goal ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : null;

  return (
    <Card
      variant={isInteractive ? "interactive" : "default"}
      onClick={onClick}
      className={cn("flex flex-col justify-between space-y-3 p-5", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
          <span className="text-base" aria-hidden="true">
            {emoji}
          </span>
          <span>{label}</span>
        </div>
        {status && (
          <Badge tone={statusTone} dot>
            {status.toUpperCase()}
          </Badge>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-ink font-mono">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-ink-muted">{unit}</span>
          )}
        </div>

        {delta && (
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium">
            <span
              className={cn(
                "inline-flex items-center gap-0.5",
                delta.isGood
                  ? "text-success"
                  : delta.isGood === false
                  ? "text-crisis"
                  : "text-ink-soft"
              )}
            >
              {delta.isPositive ? "↑" : "↓"} {delta.value}
            </span>
            <span className="text-ink-muted">vs last period</span>
          </div>
        )}
      </div>

      {goal && (
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] text-ink-muted">
            <span>{goal.targetLabel ?? "Goal"}</span>
            <span className="font-semibold text-ink">{goalPct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                goalPct && goalPct >= 100 ? "bg-success" : "bg-primary"
              )}
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>
      )}

      {sub && !goal && (
        <p className="text-[11px] text-ink-muted">{sub}</p>
      )}
    </Card>
  );
}
