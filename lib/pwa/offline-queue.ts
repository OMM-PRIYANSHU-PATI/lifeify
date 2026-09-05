/**
 * Offline Sync Queue & Conflict Resolution for LIFEIFY PWA.
 * Invariant: Server timestamp wins in conflict resolution!
 */

export interface QueuedOfflineAction {
  id: string;
  type: "LOG_WATER" | "LOG_STEPS" | "DOSE_TAKEN" | "DAILY_CHECKIN";
  payload: Record<string, unknown>;
  clientTimestamp: number;
}

const STORAGE_KEY = "lifeify_offline_action_queue";

export function getOfflineQueue(): QueuedOfflineAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineAction(
  type: QueuedOfflineAction["type"],
  payload: Record<string, unknown>
): QueuedOfflineAction {
  const item: QueuedOfflineAction = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    clientTimestamp: Date.now(),
  };

  const current = getOfflineQueue();
  current.push(item);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  return item;
}

export function removeQueuedAction(id: string): void {
  if (typeof window === "undefined") return;
  const current = getOfflineQueue().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

/**
 * Resolves conflict between client offline entry and server state.
 * Invariant: Server timestamp wins! If server has a more recent entry,
 * client offline payload is reconciled without overwriting newer server records.
 */
export function resolveConflict(
  clientEntry: { timestamp: number; value: unknown },
  serverEntry: { timestamp: number; value: unknown } | null
): { winner: "server" | "client"; finalValue: unknown } {
  if (!serverEntry) {
    return { winner: "client", finalValue: clientEntry.value };
  }

  // Server timestamp wins if server record is equal or more recent
  if (serverEntry.timestamp >= clientEntry.timestamp) {
    return { winner: "server", finalValue: serverEntry.value };
  }

  return { winner: "client", finalValue: clientEntry.value };
}
