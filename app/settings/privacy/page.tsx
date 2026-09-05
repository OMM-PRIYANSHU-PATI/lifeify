import { requireUser } from "@/lib/auth/session";
import { getUserConsents } from "@/lib/consent";
import { PrivacyToggleList } from "./toggle-list";
import Link from "next/link";

export const metadata = {
  title: "Privacy & Consent Settings — LIFEIFY",
};

export default async function PrivacySettingsPage() {
  const user = await requireUser();
  const consents = await getUserConsents(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Privacy & Consent Center</h1>
          <p className="text-sm text-ink-soft">
            LIFEIFY is private by default. You control exactly how your health information is used.
          </p>
        </div>
        <Link
          href="/app/dashboard"
          className="lif-btn-secondary text-xs"
        >
          ← Back to App
        </Link>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
        <div className="mb-4 rounded-2xl bg-primary-soft p-3 text-xs text-primary-dark border border-primary/30">
          <p className="font-semibold">🔒 Privacy Guarantee</p>
          <p className="mt-0.5">
            Your medical records and health data are never publicly accessible, never shared with third parties for marketing, and never processed with un-audited AI. Every access is recorded in your immutable audit log.
          </p>
        </div>

        <PrivacyToggleList initialConsents={consents} />
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-surface-subtle p-5 text-xs text-ink-soft space-y-2">
        <p className="font-semibold text-ink">Need data export or full account deletion?</p>
        <p>
          You can request a complete data export bundle or permanently erase your account and all associated health records at any time from the account security settings.
        </p>
      </div>
    </div>
  );
}
