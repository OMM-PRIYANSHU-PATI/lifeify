"use client";

import { useState } from "react";
import { connectWearableProvider, disconnectWearableProvider, triggerWearableSync } from "@/lib/actions/wearables";

interface Device {
  id: string;
  provider: string;
  status: string;
  lastSyncAt: Date | string | null;
}

interface Metric {
  id: string;
  type: string;
  value: number;
  unit: string;
  source: string;
  startTime: Date | string;
}

export function WearablesClient({
  devices,
  recentMetrics,
}: {
  devices: Device[];
  recentMetrics: Metric[];
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const ghcDevice = devices.find((d) => d.provider === "google_health_connect");
  const appleDevice = devices.find((d) => d.provider === "apple_health");

  const handleConnect = async (provider: "google_health_connect" | "apple_health") => {
    setLoading(provider);
    setMessage(null);
    try {
      const res = await connectWearableProvider(provider);
      if (res.ok) {
        setMessage(`Successfully connected ${provider === "google_health_connect" ? "Google Health Connect" : "Apple Health"}`);
      } else {
        setMessage(`Error: ${res.error}`);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (provider: "google_health_connect" | "apple_health") => {
    setLoading(provider);
    setMessage(null);
    try {
      const res = await disconnectWearableProvider(provider);
      if (res.ok) {
        setMessage(`Disconnected provider`);
      } else {
        setMessage(`Error: ${res.error}`);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSync = async (provider: "google_health_connect" | "apple_health") => {
    setLoading(`sync-${provider}`);
    setMessage(null);
    try {
      const res = await triggerWearableSync(provider);
      if (res.ok) {
        const data = res.data as { recordsSynced: number; duplicatesSkipped: number };
        setMessage(`Sync complete: ${data.recordsSynced} records added, ${data.duplicatesSkipped} duplicates skipped.`);
      } else {
        setMessage(`Sync failed: ${res.error}`);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg border border-primary/30 bg-primary-soft/50 p-4 text-sm font-medium text-primary-dark">
          {message}
        </div>
      )}

      {/* Provider Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Google Health Connect */}
        <div className="lif-card space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="font-semibold text-ink">Google Health Connect</h3>
                <p className="text-xs text-ink-muted">Android 14+ / Wear OS / Pixel Watch</p>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                ghcDevice && ghcDevice.status === "CONNECTED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-ink-muted/10 text-ink-muted"
              }`}
            >
              {ghcDevice?.status === "CONNECTED" ? "Connected" : "Not Connected"}
            </span>
          </div>

          <p className="text-xs text-ink-soft">
            Syncs steps, heart rate, sleep stages, SpO2, and blood glucose automatically.
          </p>

          {ghcDevice?.lastSyncAt && (
            <p className="text-[11px] text-ink-muted">
              Last synced: {new Date(ghcDevice.lastSyncAt).toLocaleString()}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            {ghcDevice?.status === "CONNECTED" ? (
              <>
                <button
                  onClick={() => handleSync("google_health_connect")}
                  disabled={!!loading}
                  className="lif-btn-primary flex-1 py-1.5 text-xs"
                >
                  {loading === "sync-google_health_connect" ? "Syncing..." : "Sync Now"}
                </button>
                <button
                  onClick={() => handleDisconnect("google_health_connect")}
                  disabled={!!loading}
                  className="lif-btn-secondary py-1.5 text-xs"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnect("google_health_connect")}
                disabled={!!loading}
                className="lif-btn-primary w-full py-1.5 text-xs"
              >
                {loading === "google_health_connect" ? "Connecting..." : "Connect Health Connect"}
              </button>
            )}
          </div>
        </div>

        {/* Apple Health */}
        <div className="lif-card space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍎</span>
              <div>
                <h3 className="font-semibold text-ink">Apple Health</h3>
                <p className="text-xs text-ink-muted">iPhone / Apple Watch / HealthKit</p>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                appleDevice && appleDevice.status === "CONNECTED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-ink-muted/10 text-ink-muted"
              }`}
            >
              {appleDevice?.status === "CONNECTED" ? "Connected" : "Not Connected"}
            </span>
          </div>

          <p className="text-xs text-ink-soft">
            Syncs Apple HealthKit records, resting heart rate, active calories, and sleep intervals.
          </p>

          {appleDevice?.lastSyncAt && (
            <p className="text-[11px] text-ink-muted">
              Last synced: {new Date(appleDevice.lastSyncAt).toLocaleString()}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            {appleDevice?.status === "CONNECTED" ? (
              <>
                <button
                  onClick={() => handleSync("apple_health")}
                  disabled={!!loading}
                  className="lif-btn-primary flex-1 py-1.5 text-xs"
                >
                  {loading === "sync-apple_health" ? "Syncing..." : "Sync Now"}
                </button>
                <button
                  onClick={() => handleDisconnect("apple_health")}
                  disabled={!!loading}
                  className="lif-btn-secondary py-1.5 text-xs"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnect("apple_health")}
                disabled={!!loading}
                className="lif-btn-primary w-full py-1.5 text-xs"
              >
                {loading === "apple_health" ? "Connecting..." : "Connect Apple Health"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reconciliation Invariant Banner */}
      <div className="rounded-lg border border-line bg-surface p-4 text-xs text-ink-soft">
        <span className="font-bold text-ink">🔒 Data Invariant & Reconciliation:</span>{" "}
        All synced biometric streams are normalized into canonical SI units upon ingestion. If you manually enter a log
        (e.g., blood pressure, weight, or steps) within 24 hours of a wearable reading, your manual entry always takes precedence in health score and trend calculations.
      </div>

      {/* Recent Synced Stream */}
      <div className="lif-card">
        <h3 className="mb-3 text-sm font-bold text-ink">Recent Synced Metrics (Canonical Store)</h3>
        {recentMetrics.length === 0 ? (
          <p className="text-xs text-ink-muted">No wearable metrics synced yet. Click &quot;Connect&quot; and &quot;Sync Now&quot; above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line text-ink-muted">
                <tr>
                  <th className="pb-2">Metric Type</th>
                  <th className="pb-2">Value</th>
                  <th className="pb-2">Unit</th>
                  <th className="pb-2">Source</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {recentMetrics.map((m) => (
                  <tr key={m.id} className="py-2">
                    <td className="py-2 font-medium capitalize text-ink">{m.type.replace(/_/g, " ")}</td>
                    <td className="py-2 font-bold text-primary-dark">{m.value}</td>
                    <td className="py-2 text-ink-soft">{m.unit}</td>
                    <td className="py-2 text-ink-muted">{m.source}</td>
                    <td className="py-2 text-ink-muted">{new Date(m.startTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
