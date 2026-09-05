import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface MedicationItem {
  id: string;
  name: string;
  genericName?: string;
  dosage: string; // e.g. "500 mg"
  form?: string; // e.g. "Tablet", "Capsule", "Syrup"
  frequency: string; // e.g. "Twice daily"
  timing: string; // e.g. "After meals", "Before breakfast"
  timeOfDay?: string[]; // ["morning", "night"]
  stockRemaining?: number; // count of doses left
  daysRemaining?: number;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  instructions?: string;
  hasInteractionAlert?: boolean;
}

export interface MedicationCardProps {
  medication: MedicationItem;
  onTakeDose?: (id: string) => void;
  className?: string;
}

export function MedicationCard({
  medication,
  onTakeDose,
  className,
}: MedicationCardProps) {
  const isLowStock =
    medication.daysRemaining !== undefined && medication.daysRemaining <= 5;

  return (
    <Card
      className={cn(
        "flex flex-col justify-between space-y-3 p-5 transition-all",
        medication.hasInteractionAlert && "border-warning/50 bg-warning/5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              💊
            </span>
            <h4 className="text-base font-bold text-ink tracking-tight">
              {medication.name}
            </h4>
            <Badge
              tone={
                medication.status === "ACTIVE"
                  ? "primary"
                  : medication.status === "COMPLETED"
                  ? "neutral"
                  : "warning"
              }
            >
              {medication.status}
            </Badge>
          </div>
          {medication.genericName && (
            <p className="text-xs text-ink-muted mt-0.5 font-medium">
              ({medication.genericName})
            </p>
          )}
        </div>

        {medication.hasInteractionAlert && (
          <Badge tone="warning" dot>
            DDI Notice
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-line/60">
        <div>
          <span className="text-ink-muted block text-[11px]">Dosage & Form</span>
          <span className="font-semibold text-ink">
            {medication.dosage} {medication.form ? `· ${medication.form}` : ""}
          </span>
        </div>
        <div>
          <span className="text-ink-muted block text-[11px]">Schedule</span>
          <span className="font-semibold text-ink">
            {medication.frequency} ({medication.timing})
          </span>
        </div>
      </div>

      {medication.instructions && (
        <p className="text-xs text-ink-soft italic">
          &ldquo;{medication.instructions}&rdquo;
        </p>
      )}

      {/* Stock & Refill Alert */}
      <div className="flex items-center justify-between pt-1 text-xs">
        {medication.daysRemaining !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isLowStock ? "bg-crisis" : "bg-success"
              )}
            />
            <span
              className={cn(
                "font-medium",
                isLowStock ? "text-crisis font-bold" : "text-ink-soft"
              )}
            >
              {medication.daysRemaining} days left ({medication.stockRemaining} units)
            </span>
          </div>
        ) : (
          <span className="text-ink-muted text-[11px]">Stock unmetered</span>
        )}

        <div className="flex items-center gap-2">
          {isLowStock && (
            <Link
              href="/app/pharmacy"
              className="text-xs font-semibold text-accent hover:underline"
            >
              Order Refill →
            </Link>
          )}
          {onTakeDose && medication.status === "ACTIVE" && (
            <button
              type="button"
              onClick={() => onTakeDose(medication.id)}
              className="lif-btn-primary py-1 px-3 text-xs font-semibold"
            >
              Take Now
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
