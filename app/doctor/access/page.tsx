"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemDoctorAccessCodeAction } from "@/lib/actions/doctor";

export default function DoctorAccessPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await redeemDoctorAccessCodeAction(code);
      if (res.ok && res.patientId) {
        router.push(`/doctor/patient/${res.patientId}`);
      } else {
        setError(res.error ?? "Failed to redeem code");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="lif-card w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <span className="text-4xl">🩺</span>
          <h1 className="text-xl font-bold text-ink">LIFEIFY Clinician Access</h1>
          <p className="text-xs text-ink-muted">
            Enter the 6-digit temporary consultation code provided by the patient.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-crisis/10 border border-crisis p-3 text-xs font-semibold text-crisis">
            {error}
          </div>
        )}

        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1 text-center">
              6-Digit Access Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="lif-input w-full text-center text-2xl font-mono tracking-widest font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="lif-btn-primary w-full py-2.5 text-xs font-semibold"
          >
            {loading ? "Verifying..." : "Unlock 10-Minute Patient Chart"}
          </button>
        </form>

        <div className="text-[11px] text-ink-muted border-t border-line pt-4 text-center leading-relaxed">
          Access grant is read-only and automatically terminates in 10 minutes. All actions are cryptographically audit-logged.
        </div>
      </div>
    </div>
  );
}
