import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type MedicalRecordType =
  | "LAB_REPORT"
  | "PRESCRIPTION"
  | "DISCHARGE_SUMMARY"
  | "IMAGING"
  | "VACCINATION"
  | "CLINICAL_NOTE";

export interface MedicalRecordItem {
  id: string;
  title: string;
  recordType: MedicalRecordType;
  recordDate: string; // e.g. "2026-08-28"
  facilityOrDoctor?: string;
  summary?: string;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  tags?: string[];
}

export interface RecordCardProps {
  record: MedicalRecordItem;
  onView?: (id: string) => void;
  className?: string;
}

export function RecordCard({ record, onView, className }: RecordCardProps) {
  const typeDetails: Record<MedicalRecordType, { emoji: string; label: string; tone: "primary" | "accent" | "success" | "warning" | "neutral" }> = {
    LAB_REPORT: { emoji: "🧪", label: "Diagnostic Lab", tone: "primary" },
    PRESCRIPTION: { emoji: "📝", label: "Prescription", tone: "accent" },
    DISCHARGE_SUMMARY: { emoji: "🏥", label: "Hospital Summary", tone: "neutral" },
    IMAGING: { emoji: "🩻", label: "Radiology / Imaging", tone: "primary" },
    VACCINATION: { emoji: "💉", label: "Immunization", tone: "success" },
    CLINICAL_NOTE: { emoji: "🩺", label: "Doctor Note", tone: "neutral" },
  };

  const currentType = typeDetails[record.recordType] || {
    emoji: "📄",
    label: record.recordType,
    tone: "neutral" as const,
  };

  return (
    <Card className={cn("flex flex-col justify-between space-y-3 p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5" aria-hidden="true">
            {currentType.emoji}
          </span>
          <div>
            <h4 className="text-base font-bold text-ink tracking-tight">
              {record.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-muted">
              <span>{record.recordDate}</span>
              {record.facilityOrDoctor && (
                <>
                  <span>·</span>
                  <span>{record.facilityOrDoctor}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <Badge tone={currentType.tone}>
          {currentType.label}
        </Badge>
      </div>

      {record.summary && (
        <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
          {record.summary}
        </p>
      )}

      {record.tags && record.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-surface-subtle border border-line px-2 py-0.5 text-[10px] font-medium text-ink-soft"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-line/60 text-xs">
        <span className="text-ink-muted text-[11px]">
          {record.fileName ? record.fileName : "Verified Medical Attachment"}
        </span>

        {onView && (
          <button
            type="button"
            onClick={() => onView(record.id)}
            className="lif-btn-secondary py-1 px-3 text-xs font-semibold"
          >
            View Document →
          </button>
        )}
      </div>
    </Card>
  );
}
