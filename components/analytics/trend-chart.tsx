"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface DataPoint {
  label: string; // e.g. "Mon", "Jan 12", "Wk 4"
  value: number;
  secondaryValue?: number;
}

export interface TrendChartProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  unit?: string;
  timeframes?: string[];
  activeTimeframe?: string;
  onTimeframeChange?: (tf: string) => void;
  baseline?: {
    value: number;
    label: string;
  };
  summaryStats?: {
    average: string | number;
    peak: string | number;
    lowest: string | number;
  };
  className?: string;
}

export function TrendChart({
  title,
  subtitle,
  data,
  unit = "",
  timeframes = ["7D", "30D", "90D", "12M"],
  activeTimeframe = "7D",
  onTimeframeChange,
  baseline,
  summaryStats,
  className,
}: TrendChartProps) {
  const [selectedTf, setSelectedTf] = useState(activeTimeframe);

  const handleTfClick = (tf: string) => {
    setSelectedTf(tf);
    onTimeframeChange?.(tf);
  };

  if (!data || data.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <h3 className="font-bold text-ink">{title}</h3>
        <p className="text-xs text-ink-muted mt-1">No recorded data points in this period.</p>
      </Card>
    );
  }

  // Calculate SVG dimensions and coordinate scales
  const values = data.map((d) => d.value);
  if (baseline) values.push(baseline.value);

  const minVal = Math.floor(Math.min(...values) * 0.85);
  const maxVal = Math.ceil(Math.max(...values) * 1.15) || 10;
  const range = maxVal - minVal || 1;

  const width = 600;
  const height = 180;
  const paddingX = 35;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingX + chartWidth / 2;
    return paddingX + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const norm = (val - minVal) / range;
    return height - paddingY - norm * chartHeight;
  };

  // Generate SVG polyline / path
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" ");
  const baselineY = baseline ? getY(baseline.value) : null;

  // Closed area polygon for smooth gradient fill
  const areaPoints = `${getX(0)},${height - paddingY} ${points} ${getX(data.length - 1)},${height - paddingY}`;

  return (
    <Card className={cn("space-y-4 p-6", className)}>
      {/* Header: Title + Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-ink tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-ink-soft">{subtitle}</p>}
        </div>

        {/* Calm Timeframe Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-surface-subtle p-1 border border-line w-fit">
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => handleTfClick(tf)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-150",
                selectedTf === tf
                  ? "bg-surface text-ink shadow-xs font-bold"
                  : "text-ink-soft hover:text-ink hover:bg-surface/50"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Calm Line Visualizer */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Calm Horizontal Gridlines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="var(--color-line)"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="var(--color-line)"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="opacity-50"
          />

          {/* Baseline Indicator (if specified) */}
          {baselineY !== null && baseline && (
            <g>
              <line
                x1={paddingX}
                y1={baselineY}
                x2={width - paddingX}
                y2={baselineY}
                stroke="var(--color-accent)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={width - paddingX + 6}
                y={baselineY + 3}
                fill="var(--color-ink-muted)"
                fontSize="10"
                fontWeight="500"
              >
                {baseline.label}
              </text>
            </g>
          )}

          {/* Area Fill */}
          <polygon points={areaPoints} fill="url(#trendGradient)" />

          {/* Primary Trend Line */}
          <polyline
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Data Points and X Labels */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.value);
            return (
              <g key={i} className="group">
                <circle
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="var(--color-surface)"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  className="transition-all hover:r-6 cursor-pointer"
                />
                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  fill="var(--color-ink-muted)"
                  fontSize="11"
                  fontWeight="500"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Summary Stats Row */}
      {summaryStats && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-line/60 text-xs">
          <div>
            <span className="text-ink-muted block text-[11px]">Period Average</span>
            <span className="font-bold text-ink font-mono text-sm">
              {summaryStats.average} {unit}
            </span>
          </div>
          <div>
            <span className="text-ink-muted block text-[11px]">Highest</span>
            <span className="font-bold text-ink font-mono text-sm">
              {summaryStats.peak} {unit}
            </span>
          </div>
          <div>
            <span className="text-ink-muted block text-[11px]">Lowest</span>
            <span className="font-bold text-ink font-mono text-sm">
              {summaryStats.lowest} {unit}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
