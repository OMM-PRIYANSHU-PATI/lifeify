import React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "crisis"
  | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export function Badge({
  className,
  tone = "neutral",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const toneStyles: Record<BadgeTone, { bg: string; dot: string }> = {
    neutral: {
      bg: "bg-surface-subtle text-ink-soft border border-line",
      dot: "bg-ink-muted",
    },
    primary: {
      bg: "bg-primary-soft text-primary-dark border border-primary/20",
      dot: "bg-primary",
    },
    accent: {
      bg: "bg-accent-soft text-accent border border-accent/20",
      dot: "bg-accent",
    },
    success: {
      bg: "bg-success/10 text-success border border-success/20",
      dot: "bg-success",
    },
    warning: {
      bg: "bg-warning/10 text-warning border border-warning/20",
      dot: "bg-warning",
    },
    crisis: {
      bg: "bg-crisis-soft text-crisis border border-crisis/20",
      dot: "bg-crisis",
    },
    outline: {
      bg: "bg-transparent text-ink-soft border border-line",
      dot: "bg-ink-muted",
    },
  };

  const selectedTone = toneStyles[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        selectedTone.bg,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", selectedTone.dot)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
