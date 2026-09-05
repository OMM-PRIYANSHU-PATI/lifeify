"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { connectWearableProvider, disconnectWearableProvider, triggerWearableSync } from "@/lib/actions/wearables";

interface ConnectionsProps {
  initialSources: Array<{ provider: string; status: string; lastSyncAt?: string | null }>;
}

export function ConnectionsClient({ initialSources }: ConnectionsProps) {
  const [sources, setSources] = useState(initialSources);
  const [syncing, setSyncing] = useState<string | null>(null);

  const isConnected = (p: string) => sources.some((s) => s.provider === p && s.status === "CONNECTED");

  const handleToggleConnect = async (provider: "google_health_connect" | "apple_health") => {
    if (isConnected(provider)) {
      await disconnectWearableProvider(provider);
      setSources((prev) => prev.filter((s) => s.provider !== provider));
    } else {
      await connectWearableProvider(provider);
      setSources((prev) => [...prev, { provider, status: "CONNECTED", lastSyncAt: new Date().toISOString() }]);
    }
  };

  const handleSync = async (provider: "google_health_connect" | "apple_health") => {
    setSyncing(provider);
    try {
      await triggerWearableSync(provider);
      setSources((prev) =>
        prev.map((s) => (s.provider === provider ? { ...s, lastSyncAt: new Date().toISOString() } : s))
      );
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink flex items-center gap-2">
          ⌚ Health Platforms & Wearables
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Synchronize activity, heart rate, oxygen levels, and sleep from Android Health Connect and Apple Health.
        </p>
      </div>

      {/* Provider List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Health Connect */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center font-bold">
                G
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  isConnected("google_health_connect")
                    ? "bg-primary-soft text-primary-dark"
                    : "bg-surface-subtle text-ink-muted"
                }`}
              >
                {isConnected("google_health_connect") ? "Connected" : "Not Linked"}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-ink">Google Health Connect</h3>
              <p className="text-xs text-ink-soft mt-1">
                Reads steps, heart rate, SpO2, and sleep from compatible Android smartwatches and wearables.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex items-center justify-between">
            {isConnected("google_health_connect") ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSync("google_health_connect")}
                  disabled={syncing === "google_health_connect"}
                  className="lif-btn-secondary text-xs flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing === "google_health_connect" ? "animate-spin" : ""}`} />
                  Sync Now
                </button>
                <button
                  onClick={() => handleToggleConnect("google_health_connect")}
                  className="text-xs text-crisis hover:underline font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleToggleConnect("google_health_connect")}
                className="lif-btn-primary text-xs"
              >
                Connect Provider
              </button>
            )}
          </div>
        </div>

        {/* Apple Health */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-surface-subtle text-ink flex items-center justify-center font-bold">
                🍎
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  isConnected("apple_health")
                    ? "bg-primary-soft text-primary-dark"
                    : "bg-surface-subtle text-ink-muted"
                }`}
              >
                {isConnected("apple_health") ? "Connected" : "Not Linked"}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-ink">Apple HealthKit</h3>
              <p className="text-xs text-ink-soft mt-1">
                Reads resting heart rate, active energy, walking distance, and sleep analysis from Apple Watch.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex items-center justify-between">
            {isConnected("apple_health") ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSync("apple_health")}
                  disabled={syncing === "apple_health"}
                  className="lif-btn-secondary text-xs flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing === "apple_health" ? "animate-spin" : ""}`} />
                  Sync Now
                </button>
                <button
                  onClick={() => handleToggleConnect("apple_health")}
                  className="text-xs text-crisis hover:underline font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleToggleConnect("apple_health")}
                className="lif-btn-primary text-xs"
              >
                Connect Provider
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
