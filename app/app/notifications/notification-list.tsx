"use client";

import { useState } from "react";
import { markReadAction, markAllReadAction, triggerRulesEvaluationAction } from "@/lib/actions/notifications";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  read: boolean;
  createdAt: string;
}

export function NotificationList({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "important">("all");
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleMarkRead(id: string) {
    try {
      await markReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  }

  async function handleCheckUpdates() {
    setIsUpdating(true);
    try {
      await triggerRulesEvaluationAction();
      window.location.reload();
    } catch (err) {
      console.error("Failed to trigger rules", err);
    } finally {
      setIsUpdating(false);
    }
  }

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "important") return n.severity === "WARNING" || n.severity === "CRITICAL";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === "all" ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-subtle"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === "unread" ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-subtle"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("important")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === "important" ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-subtle"
            }`}
          >
            Important
          </button>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-ink-soft hover:text-ink hover:underline"
            >
              Mark all as read
            </button>
          )}
          <button
            type="button"
            disabled={isUpdating}
            onClick={handleCheckUpdates}
            className="rounded-lg border border-line bg-surface-subtle px-2.5 py-1 text-xs font-medium text-ink-soft hover:bg-surface disabled:opacity-50"
          >
            {isUpdating ? "Checking..." : "↻ Check alerts"}
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-12 text-center">
          <span className="text-3xl">📭</span>
          <p className="mt-2 text-sm font-medium text-ink">No notifications</p>
          <p className="text-xs text-ink-muted">
            {filter === "unread"
              ? "You're all caught up! No unread messages."
              : "No notifications found in this category."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => {
            const severityStyles =
              n.severity === "CRITICAL"
                ? "border-l-4 border-l-rose-500 bg-rose-50/40"
                : n.severity === "WARNING"
                ? "border-l-4 border-l-amber-500 bg-amber-50/40"
                : "border-l-4 border-l-primary bg-surface";

            return (
              <div
                key={n.id}
                className={`rounded-xl border border-line p-4 transition-all shadow-xs ${severityStyles} ${
                  n.read ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink">{n.title}</span>
                      {n.severity === "CRITICAL" && (
                        <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700">
                          CRITICAL
                        </span>
                      )}
                      {n.severity === "WARNING" && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-700">
                          ATTENTION
                        </span>
                      )}
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ink-soft leading-relaxed">{n.body}</p>
                    <span className="mt-2 block text-[10px] text-ink-muted">
                      {new Date(n.createdAt).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
