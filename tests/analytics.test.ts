import { describe, it, expect } from "vitest";
import {
  calculateMean,
  calculateMedian,
  calculateStandardDeviation,
  calculatePearsonCorrelation,
  calculateBaseline,
  TimeSeriesPoint,
} from "../lib/analytics/stats";

describe("Deterministic Analytics & Statistics", () => {
  it("computes descriptive statistics accurately", () => {
    const vals = [10, 20, 30, 40, 50];
    expect(calculateMean(vals)).toBe(30);
    expect(calculateMedian(vals)).toBe(30);
    expect(calculateStandardDeviation(vals)).toBe(15.81);

    const evenVals = [10, 20, 30, 40];
    expect(calculateMedian(evenVals)).toBe(25);
  });

  it("enforces n >= 14 and |r| >= 0.3 invariant for Pearson correlation significance", () => {
    // 10 paired days (less than 14) with strong positive correlation
    const seriesA: TimeSeriesPoint[] = [];
    const seriesB: TimeSeriesPoint[] = [];

    for (let i = 1; i <= 10; i++) {
      const date = `2026-09-${String(i).padStart(2, "0")}`;
      seriesA.push({ date, value: i * 1000 });
      seriesB.push({ date, value: i * 0.5 });
    }

    const resSmall = calculatePearsonCorrelation(seriesA, seriesB, "Steps", "Sleep");
    expect(resSmall).not.toBeNull();
    // Strong correlation (r ≈ 1.0) but sample size n = 10 (< 14) => isSignificant must be FALSE!
    expect(resSmall?.sampleSize).toBe(10);
    expect(resSmall?.coefficient).toBeGreaterThan(0.9);
    expect(resSmall?.isSignificant).toBe(false);

    // Expand to 15 paired days => should now be significant
    for (let i = 11; i <= 15; i++) {
      const date = `2026-09-${String(i).padStart(2, "0")}`;
      seriesA.push({ date, value: i * 1000 });
      seriesB.push({ date, value: i * 0.5 });
    }

    const res15 = calculatePearsonCorrelation(seriesA, seriesB, "Steps", "Sleep");
    expect(res15?.sampleSize).toBe(15);
    expect(res15?.isSignificant).toBe(true);
    expect(res15?.strength).toBe("strong");
    expect(res15?.direction).toBe("positive");
  });

  it("calculates 14-day rolling baseline and assigns correct trend tags", () => {
    const points: TimeSeriesPoint[] = [];
    // 14 days of 5000 steps
    for (let i = 1; i <= 14; i++) {
      points.push({ date: `2026-08-${String(i).padStart(2, "0")}`, value: 5000 });
    }
    // 3 recent days with elevated 7500 steps (+50%)
    points.push({ date: "2026-08-15", value: 7500 });
    points.push({ date: "2026-08-16", value: 7500 });
    points.push({ date: "2026-08-17", value: 7500 });

    const baseline = calculateBaseline(points, "Steps", "steps");
    expect(baseline.baselineValue).toBe(5000);
    expect(baseline.recentAverage).toBe(7500);
    expect(baseline.deltaPercent).toBe(50);
    expect(baseline.trend).toBe("elevated");
    expect(baseline.disclaimer).toContain("Recorded for trend observation");
  });
});
