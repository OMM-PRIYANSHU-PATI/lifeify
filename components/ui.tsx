import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("lif-card p-5", className)}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="lif-section-title">{children}</h2>
      {action}
    </div>
  );
}

export function ProgressBar({ value, max, className, colorClass }: { value: number; max: number; className?: string; colorClass?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-line", className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full bg-primary transition-all", colorClass ?? "")} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "crisis" | "primary" | "accent"; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    neutral: "bg-line/60 text-ink",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    crisis: "bg-crisis-soft text-crisis",
    primary: "bg-primary-soft text-primary-dark",
    accent: "bg-accent-soft text-accent",
  };
  return <span className={cn("lif-badge", tones[tone])}>{children}</span>;
}

export function EmptyState({ emoji, title, body, action }: { emoji: string; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <span className="lif-emoji mb-3 text-4xl" aria-hidden>{emoji}</span>
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-crisis-soft px-6 py-10 text-center" role="alert">
      <span className="lif-emoji mb-2 text-3xl" aria-hidden>⚠️</span>
      <h3 className="font-bold text-crisis">Something went wrong</h3>
      <p className="mt-1 max-w-sm text-sm text-crisis/80">{message}</p>
      {retry && <div className="mt-4">{retry}</div>}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn("lif-card animate-pulse p-5", className)} aria-hidden />;
}

export function MetricCard({ label, emoji, value, unit, sub, footer }: { label: string; emoji: string; value: string | number; unit?: string; sub?: string; footer?: React.ReactNode }) {
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-soft">
        <span className="lif-emoji text-base" aria-hidden>{emoji}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-ink">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-ink-soft">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-ink-soft">{sub}</div>}
      {footer}
    </Card>
  );
}

export function HealthScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);
  const color = clamped >= 70 ? "var(--color-success)" : clamped >= 40 ? "var(--color-warning)" : "var(--color-crisis)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold text-ink" style={{ color }}>{clamped}</span>
        <span className="text-xs font-medium text-ink-soft">Health Score</span>
      </div>
    </div>
  );
}
