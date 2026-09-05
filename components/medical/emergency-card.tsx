import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface EmergencyCardProps {
  fullName: string;
  dateOfBirth?: string;
  bloodType: string; // e.g. "O+", "A-", "B+"
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContacts: EmergencyContact[];
  organDonor?: boolean;
  publicSlug?: string;
  notes?: string;
  className?: string;
}

export function EmergencyCard({
  fullName,
  dateOfBirth,
  bloodType,
  allergies,
  chronicConditions,
  currentMedications,
  emergencyContacts,
  organDonor = true,
  publicSlug,
  notes,
  className,
}: EmergencyCardProps) {
  return (
    <Card
      className={cn(
        "space-y-5 p-6 border-crisis/30 bg-surface shadow-md relative overflow-hidden",
        className
      )}
    >
      {/* Top Banner for First Responders */}
      <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              🚨
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-crisis">
              Emergency Medical Information
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-ink mt-1 tracking-tight">
            {fullName}
          </h3>
          {dateOfBirth && (
            <p className="text-xs text-ink-muted">DOB: {dateOfBirth}</p>
          )}
        </div>

        {/* High-Contrast Blood Type Badge */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-crisis px-4 py-2 text-white shadow-sm shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
            Blood
          </span>
          <span className="text-2xl font-black font-mono leading-none">
            {bloodType}
          </span>
        </div>
      </div>

      {/* Allergies Highlight Box */}
      <div className="rounded-xl border border-crisis/40 bg-crisis-soft p-4 space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-crisis flex items-center gap-1.5">
          <span>⚠️</span> Critical Allergies & Sensitivities
        </span>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {allergies.length > 0 ? (
            allergies.map((a) => (
              <span
                key={a}
                className="rounded-lg bg-crisis text-white font-bold px-2.5 py-1 text-xs shadow-xs"
              >
                {a}
              </span>
            ))
          ) : (
            <span className="text-xs text-crisis font-medium">
              No known drug or environmental allergies recorded.
            </span>
          )}
        </div>
      </div>

      {/* Chronic Conditions & Active Meds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5 rounded-xl border border-line p-3.5 bg-surface-subtle">
          <span className="font-bold text-ink-soft block text-[11px] uppercase tracking-wider">
            Chronic Medical Conditions
          </span>
          {chronicConditions.length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5 text-ink font-medium">
              {chronicConditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted">None specified.</p>
          )}
        </div>

        <div className="space-y-1.5 rounded-xl border border-line p-3.5 bg-surface-subtle">
          <span className="font-bold text-ink-soft block text-[11px] uppercase tracking-wider">
            Active Medications
          </span>
          {currentMedications.length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5 text-ink font-medium">
              {currentMedications.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted">No active medications.</p>
          )}
        </div>
      </div>

      {/* Emergency Contacts with Direct Dial */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Emergency Contacts (1-Tap Dial)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {emergencyContacts.map((contact, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-line bg-surface p-3 text-xs"
            >
              <div>
                <p className="font-bold text-ink">{contact.name}</p>
                <p className="text-[11px] text-ink-soft">{contact.relationship}</p>
              </div>
              <a
                href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                className="lif-btn-primary py-1 px-3 text-xs font-bold"
              >
                📞 Call
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Directives & Public Emergency QR Code indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line text-xs">
        <div className="flex items-center gap-2">
          {organDonor && (
            <Badge tone="success">
              ❤️ Registered Organ Donor
            </Badge>
          )}
          {notes && <span className="text-ink-muted">{notes}</span>}
        </div>

        {publicSlug && (
          <span className="text-[11px] text-ink-muted">
            Emergency URL: <strong>lifeify.health/emergency/{publicSlug}</strong>
          </span>
        )}
      </div>
    </Card>
  );
}
