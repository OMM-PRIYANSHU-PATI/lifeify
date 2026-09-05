"use client";

import { useState } from "react";

interface ConsentItem {
  id: string;
  type: string;
  version: string;
  granted: boolean;
  grantedAt: Date | string;
}

const CONSENT_TYPES = [
  { type: "data_processing", title: "Core Data Processing", description: "Allows LIFEIFY to process your biometric and health metrics locally." },
  { type: "medical_storage", title: "Encrypted Medical Storage", description: "Enables private encrypted storage for prescription scans and lab reports." },
  { type: "emergency_card", title: "Emergency Medical Card", description: "Permits emergency responders to scan your public medical QR code." },
  { type: "analytics", title: "Descriptive Analytics", description: "Permits rolling average and statistical baseline computation on your devices." },
];

export function ConsentClient({ initialConsents }: { initialConsents: ConsentItem[] }) {
  const [consents, setConsents] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const c of initialConsents) map[c.type] = c.granted;
    return map;
  });
  const [message, setMessage] = useState<string | null>(null);

  const toggleConsent = async (type: string) => {
    const nextState = !consents[type];
    setConsents((prev) => ({ ...prev, [type]: nextState }));
    setMessage(null);

    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, granted: nextState }),
      });
      if (res.ok) {
        setMessage(`Consent ${nextState ? "granted" : "revoked"} successfully.`);
      }
    } catch {
      setMessage("Failed to update consent.");
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-lg border border-primary/30 bg-primary-soft/50 p-3 text-xs font-semibold text-primary-dark">
          {message}
        </div>
      )}

      <div className="lif-card divide-y divide-line/60">
        {CONSENT_TYPES.map((c) => (
          <div key={c.type} className="py-4 flex items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-bold text-ink">{c.title}</p>
              <p className="text-ink-muted text-[11px] mt-0.5">{c.description}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleConsent(c.type)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                consents[c.type] !== false
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-ink-muted/15 text-ink-soft"
              }`}
            >
              {consents[c.type] !== false ? "Granted ✓" : "Revoked ✕"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
