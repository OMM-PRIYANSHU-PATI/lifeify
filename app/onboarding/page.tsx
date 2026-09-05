import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/onboarding");

  return (
    <main className="mx-auto w-full max-w-3xl bg-background px-4 py-8 sm:py-12 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <p className="text-2xl font-black tracking-tight text-ink">
          <span className="text-primary">LIFE</span>IFY
        </p>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
          Health Calibration Quest 🚀
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
        Calibrate Your Health Picture
      </h1>
      <p className="mb-6 mt-1.5 text-xs sm:text-sm text-ink-soft leading-relaxed max-w-xl">
        Complete your 7-stage health calibration quest to earn starting XP, establish your personalized Health Score baseline, and configure your daily habit loops.
      </p>
      <OnboardingWizard defaultName={user.name ?? ""} />
    </main>
  );
}
