import { describe, it, expect } from "vitest";
import { googleHealthConnect } from "../lib/providers/health-connect";
import { appleHealth } from "../lib/providers/apple-health";
import { RawProviderMetric } from "../lib/providers/types";

describe("Wearable Adapters & Normalization", () => {
  it("normalizes Google Health Connect raw records into canonical types", () => {
    const rawGhc: RawProviderMetric[] = [
      {
        externalId: "ghc-step-101",
        type: "StepsRecord",
        value: 10500,
        unit: "count",
        startTime: "2026-09-04T06:00:00.000Z",
      },
      {
        externalId: "ghc-dist-102",
        type: "DistanceRecord",
        value: 5200,
        unit: "m",
        startTime: "2026-09-04T07:00:00.000Z",
      },
      {
        externalId: "ghc-sleep-103",
        type: "SleepSessionRecord",
        value: 28800, // 8 hrs
        unit: "s",
        startTime: "2026-09-03T22:00:00.000Z",
      },
      {
        externalId: "ghc-weight-104",
        type: "WeightRecord",
        value: 154.32,
        unit: "lbs",
        startTime: "2026-09-04T08:00:00.000Z",
      },
    ];

    const normalized = googleHealthConnect.normalize("user-123", rawGhc);

    expect(normalized).toHaveLength(4);
    expect(normalized[0]).toMatchObject({
      userId: "user-123",
      type: "steps",
      value: 10500,
      unit: "count",
      source: "google_health_connect",
      sourceId: "ghc-step-101",
    });

    // Distance in meters converted to km
    expect(normalized[1]).toMatchObject({
      type: "distance",
      value: 5.2,
      unit: "km",
    });

    // Sleep in seconds converted to hours
    expect(normalized[2]).toMatchObject({
      type: "sleep_duration",
      value: 8,
      unit: "hours",
    });

    // Weight in lbs converted to kg
    expect(normalized[3]).toMatchObject({
      type: "weight",
      value: 70,
      unit: "kg",
    });
  });

  it("normalizes Apple HealthKit records into canonical types", () => {
    const rawApple: RawProviderMetric[] = [
      {
        externalId: "apple-step-201",
        type: "HKQuantityTypeIdentifierStepCount",
        value: 8500,
        unit: "count",
        startTime: "2026-09-04T06:00:00.000Z",
      },
      {
        externalId: "apple-spo2-202",
        type: "HKQuantityTypeIdentifierOxygenSaturation",
        value: 0.98,
        unit: "%",
        startTime: "2026-09-04T08:00:00.000Z",
      },
      {
        externalId: "apple-hr-203",
        type: "HKQuantityTypeIdentifierHeartRate",
        value: 71,
        unit: "bpm",
        startTime: "2026-09-04T08:30:00.000Z",
      },
    ];

    const normalized = appleHealth.normalize("user-456", rawApple);

    expect(normalized).toHaveLength(3);
    expect(normalized[0].type).toBe("steps");
    expect(normalized[0].source).toBe("apple_health");
    // SpO2 fraction 0.98 converted to 98%
    expect(normalized[1].value).toBe(98);
    expect(normalized[1].unit).toBe("%");
    expect(normalized[2].value).toBe(71);
  });
});
