"use client";

import { useState } from "react";
import { toggleConsentAction } from "@/lib/actions/settings";

interface ConsentItem {
  type: string;
  label: string;
  description: string;
  requiredForFeature?: string;
  granted: boolean;
  grantedAt: Date | null;
  revokedAt: Date | null;
  version: string;
}

export function PrivacyToggleList({ initialConsents }: { initialConsents: ConsentItem[] }) {
  const [consents, setConsents] = useState(initialConsents);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleToggle(type: string, currentState: boolean) {
    const nextState = !currentState;
    setLoadingType(type);
    setFeedback(null);

    try {
      await toggleConsentAction(type, nextState);
      setConsents((prev) =>
        prev.map((c) => (c.type === type ? { ...c, granted: nextState } : c))
      );
      setFeedback(
        nextState
          ? `Consent granted for ${consents.find((c) => c.type === type)?.label}`
          : `Consent revoked. Dependent features will be disabled.`
      );
    } catch {
      setFeedback("Failed to update consent status. Please try again.");
    } finally {
      setLoadingType(null);
    }
  }

  return (
    <div className="space-y-6 divide-y divide-line">
      {feedback && (
        <div className="rounded-2xl bg-primary-soft p-3 text-xs text-primary-dark border border-primary/30">
          {feedback}
        </div>
      )}

      {consents.map((consent) => (
        <div key={consent.type} className={`pt-5 first:pt-0 flex items-start justify-between gap-4`}>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-ink">{consent.label}</h3>
              {consent.requiredForFeature && (
                <span className="rounded bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-ink-soft">
                  {consent.requiredForFeature}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">{consent.description}</p>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-muted">
              <span>Policy v{consent.version}</span>
              {consent.granted && consent.grantedAt && (
                <span>Granted: {new Date(consent.grantedAt).toLocaleDateString()}</span>
              )}
              {!consent.granted && consent.revokedAt && (
                <span className="text-amber-600 font-medium">Revoked: {new Date(consent.revokedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              disabled={loadingType === consent.type}
              onClick={() => handleToggle(consent.type, consent.granted)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                consent.granted ? "bg-primary" : "bg-ink-muted/30"
              } ${loadingType === consent.type ? "opacity-50" : ""}`}
              role="switch"
              aria-checked={consent.granted}
              aria-label={`Toggle consent for ${consent.label}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-sm ring-0 transition duration-200 ease-in-out ${
                  consent.granted ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
