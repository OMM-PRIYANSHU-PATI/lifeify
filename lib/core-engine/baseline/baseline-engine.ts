import {
  MetricBaselineSummary,
  PersonalBaselineProfile,
  BaselineWindowDays,
  DataQualityState,
} from "../types";

export class BaselineEngine {
  /**
   * Computes mean, standard deviation, delta, and z-score for a metric time-series
   */
  static calculateMetricBaseline(
    metric: string,
    historyValues: number[],
    currentValue: number,
    windowDays: BaselineWindowDays = 30
  ): MetricBaselineSummary {
    if (!historyValues || historyValues.length === 0) {
      return {
        metric,
        windowDays,
        mean: currentValue,
        stdDev: 0,
        currentValue,
        absoluteDelta: 0,
        percentageDelta: 0,
        zScore: 0,
        trend: "STABLE",
        isSignificantDeviation: false,
        dataQuality: "MISSING",
        sampleCount: 0,
      };
    }

    const n = historyValues.length;
    const mean = historyValues.reduce((acc, val) => acc + val, 0) / n;

    const variance =
      historyValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const stdDev = Math.sqrt(variance);

    const absoluteDelta = currentValue - mean;
    const percentageDelta = mean !== 0 ? (absoluteDelta / mean) * 100 : 0;
    const zScore = stdDev > 0 ? absoluteDelta / stdDev : 0;

    const isSignificantDeviation = Math.abs(zScore) >= 1.75 && n >= 5;

    let trend: MetricBaselineSummary["trend"] = "STABLE";
    if (percentageDelta >= 10) trend = "INCREASING";
    else if (percentageDelta <= -10) trend = "DECREASING";

    const dataQuality: DataQualityState = n >= windowDays * 0.7 ? "VERIFIED" : n >= 3 ? "PARTIAL" : "STALE";

    return {
      metric,
      windowDays,
      mean: Number(mean.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      absoluteDelta: Number(absoluteDelta.toFixed(2)),
      percentageDelta: Number(percentageDelta.toFixed(1)),
      zScore: Number(zScore.toFixed(2)),
      trend,
      isSignificantDeviation,
      dataQuality,
      sampleCount: n,
    };
  }

  /**
   * Builds a multi-window Personal Baseline Profile (7d, 30d, 90d)
   */
  static buildProfile(
    userId: string,
    metricStreams: Record<string, { current: number; history: number[] }>
  ): PersonalBaselineProfile {
    const sevenDay: Record<string, MetricBaselineSummary> = {};
    const thirtyDay: Record<string, MetricBaselineSummary> = {};
    const ninetyDay: Record<string, MetricBaselineSummary> = {};
    const deviations: MetricBaselineSummary[] = [];

    for (const [metric, data] of Object.entries(metricStreams)) {
      // Slices for each window
      const h7 = data.history.slice(-7);
      const h30 = data.history.slice(-30);
      const h90 = data.history.slice(-90);

      const b7 = this.calculateMetricBaseline(metric, h7, data.current, 7);
      const b30 = this.calculateMetricBaseline(metric, h30, data.current, 30);
      const b90 = this.calculateMetricBaseline(metric, h90, data.current, 90);

      sevenDay[metric] = b7;
      thirtyDay[metric] = b30;
      ninetyDay[metric] = b90;

      if (b30.isSignificantDeviation) {
        deviations.push(b30);
      }
    }

    return {
      userId,
      calculatedAt: new Date(),
      windows: {
        sevenDay,
        thirtyDay,
        ninetyDay,
      },
      significantDeviations: deviations,
    };
  }

  static calculateBaseline(
    points: Array<{ metricType?: string; value: number | string; capturedAt: Date }>,
    windowDays: BaselineWindowDays = 30
  ): MetricBaselineSummary | null {
    if (!points || points.length === 0) return null;

    const metric = points[0].metricType || "metric";
    const sorted = [...points].sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
    const current = Number(sorted[sorted.length - 1].value);
    const history = sorted.slice(0, -1).map((p) => Number(p.value));

    return this.calculateMetricBaseline(metric, history, current, windowDays);
  }

  static generateBaselineProfile(
    userId: string,
    streams: Record<string, Array<{ metricType?: string; value: number | string; capturedAt: Date }>>
  ): PersonalBaselineProfile {
    const streamMap: Record<string, { current: number; history: number[] }> = {};

    for (const [metric, points] of Object.entries(streams)) {
      if (points.length > 0) {
        const sorted = [...points].sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
        const current = Number(sorted[sorted.length - 1].value);
        const history = sorted.slice(0, -1).map((p) => Number(p.value));
        streamMap[metric] = { current, history };
      }
    }

    return this.buildProfile(userId, streamMap);
  }

  // Instance wrappers
  calculateMetricBaseline(metric: string, historyValues: number[], currentValue: number, windowDays: BaselineWindowDays = 30) {
    return BaselineEngine.calculateMetricBaseline(metric, historyValues, currentValue, windowDays);
  }

  calculateBaseline(points: any[], windowDays: BaselineWindowDays = 30) {
    return BaselineEngine.calculateBaseline(points, windowDays);
  }

  buildProfile(userId: string, metricStreams: Record<string, { current: number; history: number[] }>) {
    return BaselineEngine.buildProfile(userId, metricStreams);
  }

  generateBaselineProfile(userId: string, streams: any) {
    return BaselineEngine.generateBaselineProfile(userId, streams);
  }
}

export const baselineEngine = new BaselineEngine();
