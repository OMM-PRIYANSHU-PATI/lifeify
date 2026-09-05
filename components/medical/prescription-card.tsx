import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PrescribedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionCardProps {
  id: string;
  doctorName: string;
  specialty?: string;
  clinicOrHospital: string;
  date: string;
  diagnosis?: string;
  medications: PrescribedMedicine[];
  ocrConfidence?: number; // e.g. 0.96
  status: "ACTIVE" | "ARCHIVED" | "PENDING_CONFIRMATION";
  onConfirmMedications?: (id: string) => void;
  className?: string;
}

export function PrescriptionCard({
  id,
  doctorName,
  specialty,
  clinicOrHospital,
  date,
  diagnosis,
  medications,
  ocrConfidence,
  status,
  onConfirmMedications,
  className,
}: PrescriptionCardProps) {
  return (
    <Card className={cn("space-y-4 p-6 border-line", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            📝
          </span>
          <div>
            <h4 className="text-base font-bold text-ink">
              Prescription by Dr. {doctorName}
            </h4>
            <p className="text-xs text-ink-muted">
              {specialty ? `${specialty} · ` : ""}
              {clinicOrHospital} · {date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ocrConfidence !== undefined && (
            <Badge tone="neutral">
              OCR: {Math.round(ocrConfidence * 100)}% Match
            </Badge>
          )}
          <Badge
            tone={
              status === "ACTIVE"
                ? "primary"
                : status === "PENDING_CONFIRMATION"
                ? "warning"
                : "neutral"
            }
          >
            {status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {diagnosis && (
        <div className="rounded-xl bg-surface-subtle p-3 text-xs">
          <span className="font-semibold text-ink-soft">Clinical Diagnosis: </span>
          <span className="font-bold text-ink">{diagnosis}</span>
        </div>
      )}

      {/* Medications list */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Prescribed Medications ({medications.length})
        </span>
        <div className="divide-y divide-line/60 rounded-xl border border-line bg-surface overflow-hidden">
          {medications.map((m, idx) => (
            <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink text-sm">{m.name}</span>
                  <span className="text-ink-muted">{m.dosage}</span>
                </div>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  {m.frequency} · {m.duration} {m.instructions ? `· ${m.instructions}` : ""}
                </p>
              </div>
              <span className="text-[11px] text-primary-dark font-medium self-start sm:self-auto">
                Verified Rx
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-line/60 text-xs">
        <Link
          href={`/app/pharmacy?rx=${id}`}
          className="lif-btn-secondary py-1.5 px-3 text-xs font-semibold"
        >
          📦 Order All at Pharmacy
        </Link>

        {status === "PENDING_CONFIRMATION" && onConfirmMedications && (
          <button
            type="button"
            onClick={() => onConfirmMedications(id)}
            className="lif-btn-primary py-1.5 px-4 text-xs font-bold"
          >
            ✓ Confirm & Add to Dosing Schedule
          </button>
        )}
      </div>
    </Card>
  );
}
