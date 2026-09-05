import { requireUser } from "@/lib/auth/session";
import { ProfileEditorForm } from "./profile-form";
import { PwaInstallButton } from "@/components/pwa/install-button";
import Link from "next/link";

export const metadata = {
  title: "Edit Profile — LIFEIFY",
};

export default async function ProfileSettingsPage() {
  const user = await requireUser();

  const profileData = {
    name: user.name ?? "",
    phone: user.phone ?? "",
    age: user.healthProfile?.age ?? 25,
    sex: user.healthProfile?.sex ?? "OTHER",
    heightCm: user.healthProfile?.heightCm ?? 170,
    weightKg: user.healthProfile?.weightKg ?? 65,
    bloodGroup: user.healthProfile?.bloodGroup ?? "",
    dietType: user.lifestyleProfile?.dietType ?? user.healthProfile?.dietType ?? "VEG",
    activityLevel: user.lifestyleProfile?.activityLevel ?? user.healthProfile?.activityLevel ?? "MODERATE",
    sleepTargetH: user.lifestyleProfile?.sleepTargetH ?? user.healthProfile?.sleepTargetH ?? 8,
    waterTargetMl: user.lifestyleProfile?.waterTargetMl ?? user.healthProfile?.waterTargetMl ?? 2000,
    stepTarget: user.lifestyleProfile?.stepTarget ?? user.healthProfile?.stepTarget ?? 6000,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Account & Health Profile</h1>
          <p className="text-sm text-ink-soft">
            Manage your personal baseline and daily wellness targets.
          </p>
        </div>
        <Link
          href="/app/dashboard"
          className="lif-btn-secondary text-xs"
        >
          ← Back to App
        </Link>
      </div>

      <div className="mb-5">
        <PwaInstallButton />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
        <ProfileEditorForm initial={profileData} />
      </div>
    </div>
  );
}
