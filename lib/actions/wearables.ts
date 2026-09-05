"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { googleHealthConnect } from "@/lib/providers/health-connect";
import { appleHealth } from "@/lib/providers/apple-health";

export type ActionResult<T = unknown> = {
  ok: boolean;
  error?: string;
  data?: T;
};

export async function connectWearableProvider(provider: "google_health_connect" | "apple_health"): Promise<ActionResult> {
  const user = await requireUser();
  const adapter = provider === "google_health_connect" ? googleHealthConnect : appleHealth;
  const res = await adapter.connect(user.id);

  if (res.success) {
    await audit({
      userId: user.id,
      action: "WEARABLE_CONNECT",
      entity: "HealthDataSource",
      metadata: { provider },
    });
    revalidatePath("/app/wearables");
    return { ok: true };
  }
  return { ok: false, error: res.error ?? "Failed to connect provider" };
}

export async function disconnectWearableProvider(provider: "google_health_connect" | "apple_health"): Promise<ActionResult> {
  const user = await requireUser();
  const adapter = provider === "google_health_connect" ? googleHealthConnect : appleHealth;
  const ok = await adapter.disconnect(user.id);

  if (ok) {
    await audit({
      userId: user.id,
      action: "WEARABLE_DISCONNECT",
      entity: "HealthDataSource",
      metadata: { provider },
    });
    revalidatePath("/app/wearables");
    return { ok: true };
  }
  return { ok: false, error: "Failed to disconnect" };
}

export async function triggerWearableSync(provider: "google_health_connect" | "apple_health"): Promise<ActionResult> {
  const user = await requireUser();
  const adapter = provider === "google_health_connect" ? googleHealthConnect : appleHealth;
  const result = await adapter.sync(user.id);

  await audit({
    userId: user.id,
    action: "WEARABLE_SYNC",
    entity: "HealthDataSource",
    metadata: { provider, result },
  });

  revalidatePath("/app/wearables");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/insights");

  return { ok: result.success, data: result };
}

export async function getConnectedDevices() {
  const user = await requireUser();
  return prisma.healthDataSource.findMany({
    where: { userId: user.id },
    orderBy: { connectedAt: "desc" },
  });
}

export async function getRecentSyncedMetrics(limit = 20) {
  const user = await requireUser();
  return prisma.healthMetric.findMany({
    where: { userId: user.id },
    orderBy: { startTime: "desc" },
    take: limit,
  });
}
