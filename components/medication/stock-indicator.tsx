import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface StockItem {
  id: string;
  medicationName: string;
  dosage: string;
  remainingUnits: number;
  daysRemaining: number;
  dailyConsumption: number;
  refillThresholdDays?: number;
}

export interface StockIndicatorProps {
  items: StockItem[];
  className?: string;
}

export function StockIndicator({ items, className }: StockIndicatorProps) {
  const lowStockItems = items.filter(
    (i) => i.daysRemaining <= (i.refillThresholdDays ?? 7)
  );

  return (
    <Card className={cn("space-y-4 p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Supply Inventory
          </span>
          <h3 className="text-base font-bold text-ink tracking-tight">Medicine Stock & Refills</h3>
        </div>
        {lowStockItems.length > 0 ? (
          <Badge tone="crisis" dot>
            {lowStockItems.length} Low Stock
          </Badge>
        ) : (
          <Badge tone="success" dot>
            Adequate
          </Badge>
        )}
      </div>

      <div className="divide-y divide-line/60">
        {items.map((item) => {
          const isUrgent = item.daysRemaining <= 4;
          const isWarning = item.daysRemaining <= 7;

          return (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink text-sm">
                    {item.medicationName}
                  </span>
                  <span className="text-ink-muted">{item.dosage}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-soft">
                  <span>{item.remainingUnits} units remaining</span>
                  <span>·</span>
                  <span>{item.dailyConsumption} / day</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span
                    className={cn(
                      "font-mono font-bold text-sm block",
                      isUrgent
                        ? "text-crisis"
                        : isWarning
                        ? "text-accent"
                        : "text-ink"
                    )}
                  >
                    {item.daysRemaining} days left
                  </span>
                  <span className="text-[10px] text-ink-muted">
                    {isUrgent ? "Immediate refill needed" : isWarning ? "Reorder recommended" : "Stock healthy"}
                  </span>
                </div>

                {isWarning && (
                  <Link
                    href={`/app/pharmacy?med=${encodeURIComponent(item.medicationName)}`}
                    className="lif-btn-primary py-1 px-3 text-xs font-semibold whitespace-nowrap"
                  >
                    Refill
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
