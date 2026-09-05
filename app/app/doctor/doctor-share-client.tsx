"use client";

import { useState } from "react";
import { generateDoctorAccessCodeAction } from "@/lib/actions/doctor";

export function DoctorShareClient({
  appointments,
  notes,
}: {
  appointments: {
    id: string;
    scheduledAt: Date | string;
    reason: string | null;
    status: string;
    doctor: { name: string | null; phone: string | null };
  }[];
  notes: {
    id: string;
    body: string;
    createdAt: Date | string;
    user: { name: string | null };
  }[];
}) {
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const res = await generateDoctorAccessCodeAction();
      if (res.ok && res.code) {
        setAccessCode(res.code);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 10-minute temporary access code card */}
      <div className="lif-card space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🩺</span>
            <div>
              <h3 className="font-bold text-ink">Temporary Clinical Access Code</h3>
              <p className="text-xs text-ink-muted">
                Generate a secure 6-digit numeric PIN for your doctor during in-clinic or telemedicine visits.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary-dark">
            10-Minute Expiry
          </span>
        </div>

        {accessCode ? (
          <div className="rounded-xl border border-primary/40 bg-primary-soft/40 p-6 text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-primary-dark font-bold">Your 10-Minute Consultation Code</span>
            <div className="text-4xl font-extrabold tracking-widest text-primary-dark font-mono">
              {accessCode}
            </div>
            <p className="text-xs text-ink-soft">
              Show this PIN to your doctor. They can enter it on <strong>/doctor/access</strong> to view your chart in read-only mode for exactly 10 minutes.
            </p>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="lif-btn-primary py-2.5 px-4 text-xs font-semibold w-full sm:w-auto"
            >
              {loading ? "Generating..." : "Generate 10-Minute Doctor Access Code"}
            </button>
          </div>
        )}

        <div className="text-[11px] text-ink-muted bg-surface-subtle p-3 rounded leading-relaxed">
          🔒 <strong>Privacy Invariant:</strong> The doctor cannot edit or modify your records. Their read access automatically terminates after 10 minutes. Every record or vital viewed during the session is recorded in your immutable Privacy Audit Log.
        </div>
      </div>

      {/* Doctor Notes Section */}
      <div className="lif-card space-y-4">
        <h3 className="font-bold text-ink text-sm">Notes Shared by Your Doctor</h3>
        {notes.length === 0 ? (
          <p className="text-xs text-ink-muted py-4 text-center">No doctor clinical notes shared yet.</p>
        ) : (
          <div className="divide-y divide-line/60">
            {notes.map((n) => (
              <div key={n.id} className="py-3 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-ink">
                  <span>Dr. {n.user.name ?? "Clinician"}</span>
                  <span className="text-[11px] font-normal text-ink-muted">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-ink-soft leading-relaxed">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointments */}
      <div className="lif-card space-y-4">
        <h3 className="font-bold text-ink text-sm">Scheduled Appointments</h3>
        {appointments.length === 0 ? (
          <p className="text-xs text-ink-muted py-4 text-center">No upcoming appointments scheduled.</p>
        ) : (
          <div className="divide-y divide-line/60">
            {appointments.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-ink">{a.reason ?? "Consultation"}</p>
                  <p className="text-[11px] text-ink-muted">
                    With Dr. {a.doctor.name ?? a.doctor.phone} • {new Date(a.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-dark">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
