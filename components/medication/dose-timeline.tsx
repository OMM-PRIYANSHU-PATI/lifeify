"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface DoseEntry {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string; // e.g. "08:00 AM", "01:30 PM", "08:00 PM"
  timeSlot: "Morning" | "Afternoon" | "Evening" | "Night";
  status: "TAKEN" | "SCHEDULED" | "SKIPPED";
  instructions?: string;
}

export interface DoseTimelineProps {
  doses: DoseEntry[];
  onTakeDose?: (doseId: string) => Promise<void> | void;
  onSkipDose?: (doseId: string, reason?: string) => Promise<void> | void;
  className?: string;
}

export function DoseTimeline({
  doses,
  onTakeDose,
  onSkipDose,
  className,
}: DoseTimelineProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const timeSlots = ["Morning", "Afternoon", "Evening", "Night"] as const;

  const handleTake = async (id: string) => {
    setLoadingId(id);
    try {
      await onTakeDose?.(id);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSkip = async (id: string) => {
    setLoadingId(id);
    try {
      await onSkipDose?.(id);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className={cn("space-y-6 p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Chronotherapeutic Schedule
          </span>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Today&apos;s Medication Timeline
          </h3>
        </div>
        <span className="text-xs text-ink-soft">
          {doses.filter((d) => d.status === "TAKEN").length} of {doses.length} completed
        </span>
      </div>

      {doses.length === 0 ? (
        <div className="py-8 text-center text-ink-muted text-xs">
          No medication doses scheduled for today.
        </div>
      ) : (
        <div className="space-y-5">
          {timeSlots.map((slot) => {
            const slotDoses = doses.filter((d) => d.timeSlot === slot);
            if (slotDoses.length === 0) return null;

            const slotEmoji =
              slot === "Morning"
                ? "🌅"
                : slot === "Afternoon"
                ? "☀️"
                : slot === "Evening"
                ? "🌇"
                : "🌙";

            return (
              <div key={slot} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-soft">
                  <span aria-hidden="true">{slotEmoji}</span>
                  <span>{slot}</span>
                </div>

                <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-line/60">
                  {slotDoses.map((dose) => {
                    const isTaken = dose.status === "TAKEN";
                    const isSkipped = dose.status === "SKIPPED";
                    const isLoading = loadingId === dose.id;

                    return (
                      <div
                        key={dose.id}
                        className={cn(
                          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all text-xs",
                          isTaken
                            ? "border-success/30 bg-success/5"
                            : isSkipped
                            ? "border-line bg-surface-subtle opacity-70"
                            : "border-line bg-surface hover:border-primary/40 shadow-xs"
                        )}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink text-sm">
                              {dose.medicationName}
                            </span>
                            <span className="text-ink-muted font-medium">
                              {dose.dosage}
                            </span>
                            <Badge
                              tone={
                                isTaken
                                  ? "success"
                                  : isSkipped
                                  ? "neutral"
                                  : "primary"
                              }
                            >
                              {dose.status}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-ink-soft flex items-center gap-2">
                            <span>Scheduled: {dose.scheduledTime}</span>
                            {dose.instructions && (
                              <>
                                <span>·</span>
                                <span>{dose.instructions}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {dose.status === "SCHEDULED" && (
                            <>
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleTake(dose.id)}
                                className="lif-btn-primary py-1 px-3 text-xs font-semibold"
                              >
                                {isLoading ? "Saving…" : "Take Dose"}
                              </button>
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleSkip(dose.id)}
                                className="lif-btn-secondary py-1 px-2.5 text-xs text-ink-soft hover:text-crisis"
                              >
                                Skip
                              </button>
                            </>
                          )}
                          {isTaken && (
                            <span className="flex items-center gap-1 font-semibold text-success text-xs">
                              ✓ Taken
                            </span>
                          )}
                          {isSkipped && (
                            <span className="text-xs text-ink-muted italic">
                              Skipped
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
