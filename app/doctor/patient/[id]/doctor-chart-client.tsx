"use client";

import { useState } from "react";
import { createDoctorNoteAction } from "@/lib/actions/doctor";

interface PatientChartProps {
  patient: {
    id: string;
    name: string | null;
    phone: string | null;
    profile: {
      age: number | null;
      sex: string | null;
      bloodGroup: string | null;
      allergies: string | null;
    } | null;
    medications: {
      id: string;
      name: string;
      dose: string | null;
      frequency: string;
      startDate: Date | string;
    }[];
    sideEffects: {
      id: string;
      name: string;
      severity: string;
      redFlag: boolean;
      createdAt: Date | string;
    }[];
    doctorNotes: {
      id: string;
      body: string;
      sharedWithPatient: boolean;
      createdAt: Date | string;
    }[];
  };
}

export function DoctorChartClient({ patient }: PatientChartProps) {
  const [noteBody, setNoteBody] = useState("");
  const [shareWithPatient, setShareWithPatient] = useState(true);
  const [loading, setLoading] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createDoctorNoteAction({
        patientId: patient.id,
        body: noteBody,
        sharedWithPatient: shareWithPatient,
      });
      if (res.ok) {
        setNoteSaved(true);
        setNoteBody("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">10-Minute Consultation Session</span>
          <h1 className="text-2xl font-extrabold text-ink">
            Patient Chart: {patient.name ?? "Anonymous Patient"}
          </h1>
          <p className="text-xs text-ink-muted">
            Phone: {patient.phone} • Age: {patient.profile?.age ?? "—"} • Sex: {patient.profile?.sex ?? "—"} • Blood Group: {patient.profile?.bloodGroup ?? "—"}
          </p>
        </div>
        <div className="bg-emerald-100 text-emerald-800 rounded-full px-3 py-1 text-xs font-bold">
          Active Consultation Grant
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="lif-card space-y-3">
            <h3 className="font-bold text-sm text-ink">Current Medications</h3>
            {patient.medications.length === 0 ? (
              <p className="text-xs text-ink-muted">No active medications registered.</p>
            ) : (
              <div className="divide-y divide-line/60">
                {patient.medications.map((m) => (
                  <div key={m.id} className="py-2 text-xs">
                    <p className="font-semibold text-ink">{m.name} {m.dose && `(${m.dose})`}</p>
                    <p className="text-[11px] text-ink-muted">Frequency: {m.frequency}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lif-card space-y-3">
            <h3 className="font-bold text-sm text-ink">Reported Symptoms & ADRs</h3>
            {patient.sideEffects.length === 0 ? (
              <p className="text-xs text-ink-muted">No symptoms recorded by patient.</p>
            ) : (
              <div className="divide-y divide-line/60">
                {patient.sideEffects.map((s) => (
                  <div key={s.id} className="py-2 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-ink">{s.name}</p>
                      <p className="text-[11px] text-ink-muted">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.redFlag ? "bg-crisis text-white" : "bg-ink-muted/10 text-ink"}`}>
                      {s.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lif-card space-y-4">
          <h3 className="font-bold text-sm text-ink">Add Clinical Consultation Note</h3>
          {noteSaved && (
            <div className="rounded bg-emerald-50 border border-emerald-300 p-2.5 text-xs text-emerald-800 font-medium">
              ✓ Clinical note recorded to patient record!
            </div>
          )}

          <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
            <div>
              <label className="block mb-1 font-medium text-ink-soft">Consultation Assessment & Plan</label>
              <textarea
                required
                rows={5}
                placeholder="Document clinical observations, diagnosis, or medication recommendations..."
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                className="lif-input w-full"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shareWithPatient}
                onChange={(e) => setShareWithPatient(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-ink-soft font-medium">Share note with patient in their LIFEIFY app</span>
            </label>

            <button type="submit" disabled={loading} className="lif-btn-primary w-full py-2.5">
              {loading ? "Recording..." : "Save Clinical Note"}
            </button>
          </form>

          <div className="border-t border-line pt-4 space-y-2">
            <h4 className="font-bold text-xs text-ink">Past Notes for this Patient</h4>
            {patient.doctorNotes.length === 0 ? (
              <p className="text-[11px] text-ink-muted">No prior consultation notes on file.</p>
            ) : (
              <div className="space-y-2">
                {patient.doctorNotes.map((n) => (
                  <div key={n.id} className="rounded bg-surface-subtle p-2.5 text-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-ink-muted">
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      <span>{n.sharedWithPatient ? "Shared" : "Internal"}</span>
                    </div>
                    <p className="text-ink-soft">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
