"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone?: "neutral" | "success" | "warning" | "crisis" | "primary";
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const toneBorder =
            t.tone === "crisis"
              ? "border-crisis bg-crisis-soft text-crisis"
              : t.tone === "warning"
              ? "border-warning bg-warning/10 text-warning"
              : t.tone === "success"
              ? "border-success bg-success/10 text-success"
              : t.tone === "primary"
              ? "border-primary bg-primary-soft text-primary-dark"
              : "border-line bg-surface text-ink";

          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start justify-between rounded-xl border p-4 shadow-lg animate-slideUp transition-all",
                toneBorder
              )}
            >
              <div className="space-y-0.5 pr-2">
                <p className="text-xs font-bold">{t.title}</p>
                {t.description && (
                  <p className="text-[11px] opacity-90">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-xs opacity-60 hover:opacity-100 p-0.5"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return a dummy fallback so it won't crash if called outside provider
    return {
      showToast: (t: Omit<Toast, "id">) => console.log("Toast:", t.title),
    };
  }
  return ctx;
}
