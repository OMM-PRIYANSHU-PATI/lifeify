/**
 * Deterministic statistical computation engine for LIFEIFY V2.
 * Pure mathematics — zero AI/ML inference.
 */

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  standardDeviation: number;
  movingAverage7d: number | null;
  movingAverage30d: number | null;
}

export interface CorrelationResult {
  metricA: string;
  metricB: string;
  sampleSize: number;
  coefficient: number; // Pearson r
  direction: "positive" | "negative";
  strength: "weak" | "moderate" | "strong";
  isSignificant: boolean; // true only if |r| >= 0.3 AND n >= 14
  description: string;
}

export interface BaselineResult {
  metric: string;
  baselineValue: number;
  recentAverage: number;
  deltaPercent: number;
  trend: "stable" | "elevated" | "decreased";
  disclaimer: string;
}

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Number((sum / values.length).toFixed(2));
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }
  return sorted[mid];
}

export function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((acc, v) => acc + v, 0) / (values.length - 1);
  return Number(Math.sqrt(variance).toFixed(2));
}

export function calculateDescriptiveStats(points: TimeSeriesPoint[]): DescriptiveStats {
  const vals = points.map((p) => p.value);
  if (vals.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      standardDeviation: 0,
      movingAverage7d: null,
      movingAverage30d: null,
    };
  }

  const sortedPoints = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const last7 = sortedPoints.slice(-7).map((p) => p.value);
  const last30 = sortedPoints.slice(-30).map((p) => p.value);

  return {
    count: vals.length,
    mean: calculateMean(vals),
    median: calculateMedian(vals),
    min: Math.min(...vals),
    max: Math.max(...vals),
    standardDeviation: calculateStandardDeviation(vals),
    movingAverage7d: last7.length >= 3 ? calculateMean(last7) : null,
    movingAverage30d: last30.length >= 7 ? calculateMean(last30) : null,
  };
}

/**
 * Calculates Pearson correlation r between two paired series.
 * Invariant: Only returns significance if |r| >= 0.3 AND sample size n >= 14.
 */
export function calculatePearsonCorrelation(
  seriesA: TimeSeriesPoint[],
  seriesB: TimeSeriesPoint[],
  metricAName: string,
  metricBName: string
): CorrelationResult | null {
  // Join points by date
  const mapB = new Map(seriesB.map((p) => [p.date, p.value]));
  const paired: { x: number; y: number }[] = [];

  for (const pA of seriesA) {
    const valB = mapB.get(pA.date);
    if (valB !== undefined) {
      paired.push({ x: pA.value, y: valB });
    }
  }

  const n = paired.length;
  if (n < 5) return null; // Insufficient paired observations

  const xs = paired.map((p) => p.x);
  const ys = paired.map((p) => p.y);

  const meanX = calculateMean(xs);
  const meanY = calculateMean(ys);

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return null;

  const r = Number((num / den).toFixed(3));
  const absR = Math.abs(r);

  const isSignificant = absR >= 0.3 && n >= 14;
  const direction = r >= 0 ? "positive" : "negative";

  let strength: CorrelationResult["strength"] = "weak";
  if (absR >= 0.6) strength = "strong";
  else if (absR >= 0.3) strength = "moderate";

  const description = isSignificant
    ? `Across ${n} paired days, higher ${metricAName} shows a ${strength} ${direction} correlation with ${metricBName} (r = ${r}). Note: correlation does not imply causation.`
    : `Preliminary data across ${n} days does not show a statistically confident correlation (${Math.abs(r) < 0.3 ? "|r| < 0.3" : "needs ≥14 paired days"}).`;

  return {
    metricA: metricAName,
    metricB: metricBName,
    sampleSize: n,
    coefficient: r,
    direction,
    strength,
    isSignificant,
    description,
  };
}

/**
 * Calculates a 14-day rolling baseline and compares with recent 3-day window.
 */
export function calculateBaseline(
  points: TimeSeriesPoint[],
  metricName: string,
  unit: string
): BaselineResult {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const baselineWindow = sorted.slice(-17, -3); // previous 14 days before recent 3
  const recentWindow = sorted.slice(-3); // recent 3 days

  const baselineVals = baselineWindow.map((p) => p.value);
  const recentVals = recentWindow.map((p) => p.value);

  const baselineMean = baselineVals.length > 0 ? calculateMean(baselineVals) : calculateMean(sorted.map((p) => p.value));
  const recentMean = recentVals.length > 0 ? calculateMean(recentVals) : baselineMean;

  let deltaPercent = 0;
  if (baselineMean > 0) {
    deltaPercent = Number((((recentMean - baselineMean) / baselineMean) * 100).toFixed(1));
  }

  let trend: BaselineResult["trend"] = "stable";
  if (deltaPercent > 5) trend = "elevated";
  else if (deltaPercent < -5) trend = "decreased";

  return {
    metric: metricName,
    baselineValue: baselineMean,
    recentAverage: recentMean,
    deltaPercent,
    trend,
    disclaimer: `Your recent 3-day average (${recentMean} ${unit}) is ${Math.abs(deltaPercent)}% ${trend === "elevated" ? "above" : trend === "decreased" ? "below" : "within"} your 14-day baseline (${baselineMean} ${unit}). Recorded for trend observation; discuss significant deviations with your healthcare provider.`,
  };
}
