"use client";

import { useActionState, useState, useEffect } from "react";
import { requestOtpAction, verifyOtpAction, type AuthState } from "@/lib/actions/auth";

const initial: AuthState = { stage: "identifier" };

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, requestOtp, isRequesting] = useActionState(requestOtpAction, initial);
  const [verifyState, verifyOtp, isVerifying] = useActionState(verifyOtpAction, initial);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  useEffect(() => {
    if (state.stage === "otp") {
      setCountdown(60);
      setCanResend(false);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.stage, state.identifier]);

  if (state.stage === "otp" && state.identifier) {
    const vState = verifyState.stage === "otp" ? verifyState : { error: undefined };
    return (
      <div className="space-y-4">
        <form action={verifyOtp} className="space-y-4">
          <input type="hidden" name="identifier" value={state.identifier} />
          <input type="hidden" name="mode" value={mode} />
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-soft">
              Sent 6-digit code to <span className="font-semibold text-ink">{state.identifier}</span>
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-xs font-medium text-primary hover:underline"
            >
              Change
            </button>
          </div>
          {state.devCode && (
            <div className="rounded-lg border border-primary/20 bg-primary-soft px-3 py-2 text-sm text-primary-dark">
              <span>Development Code: </span>
              <strong className="tracking-widest font-mono text-base">{state.devCode}</strong>
            </div>
          )}
          <div>
            <label htmlFor="code" className="lif-label">Enter 6-digit verification code</label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              autoFocus
              className="lif-input tracking-[0.4em] text-center text-xl font-mono font-semibold"
              placeholder="••••••"
            />
          </div>
          {vState.error && <p className="text-sm font-medium text-crisis">{vState.error}</p>}
          <button
            type="submit"
            disabled={isVerifying}
            className="lif-btn-primary w-full disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="text-center pt-2">
          {canResend ? (
            <form action={requestOtp}>
              <input type="hidden" name="identifier" value={state.identifier} />
              <button
                type="submit"
                disabled={isRequesting}
                className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              >
                {isRequesting ? "Resending..." : "Resend Code"}
              </button>
            </form>
          ) : (
            <p className="text-xs text-ink-soft">
              Resend code in {countdown}s
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form action={requestOtp} className="space-y-4">
      <div>
        <label htmlFor="identifier" className="lif-label">Phone number</label>
        <input
          id="identifier"
          name="identifier"
          type="tel"
          required
          autoFocus
          className="lif-input text-lg"
          placeholder="e.g. 9876543210"
          autoComplete="tel"
        />
        <p className="mt-1 text-xs text-ink-soft">
          We will send a 6-digit OTP to verify your account securely.
        </p>
      </div>
      {state.error && <p className="text-sm font-medium text-crisis">{state.error}</p>}
      <button
        type="submit"
        disabled={isRequesting}
        className="lif-btn-primary w-full disabled:opacity-50"
      >
        {isRequesting ? "Sending code..." : mode === "signup" ? "Send Sign-up Code" : "Send Login Code"}
      </button>
    </form>
  );
}
