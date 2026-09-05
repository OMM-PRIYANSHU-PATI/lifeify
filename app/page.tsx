import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function HomePage() {
  const user = await getCurrentUser();

  // If user is already authenticated, redirect directly to their dashboard
  if (user) {
    redirect("/app/dashboard");
  }

  const features = [
    {
      emoji: "📷",
      title: "Prescription OCR Scanner",
      desc: "Instant deterministic regex extraction of medications, dosages, frequency, and duration with mandatory user confirmation.",
      href: "/app/scan",
    },
    {
      emoji: "🩺",
      title: "Clinical Symptom Triage",
      desc: "Deterministic decision-tree analysis classifying urgency: EMERGENCY (112/108), URGENT CARE, PRIMARY CARE, or SELF CARE.",
      href: "/app/symptom-checker",
    },
    {
      emoji: "🎯",
      title: "Disease-Risk Scoring",
      desc: "ICMR-endorsed Indian Diabetes Risk Score (IDRS) and Framingham 10-year Cardiovascular Disease (CVD) calculator.",
      href: "/app/risk-assessment",
    },
    {
      emoji: "💊",
      title: "Drug-Drug & Food Interaction Matrix",
      desc: "Zero-AI pure clinical cross-checks flagging CONTRAINDICATED, MAJOR, and MODERATE drug pairs plus nutrient timing advisories.",
      href: "/app/medications",
    },
    {
      emoji: "🚨",
      title: "Emergency Dangerous-Reading Alarms",
      desc: "Immediate audible alarms and 1-tap SOS dialers (112/108/102) for hypertensive crisis, severe hypoglycemia, or hypoxemia.",
      href: "/app/emergency-card",
    },
    {
      emoji: "👨‍⚕️",
      title: "Remote Doctor Monitoring (RPM)",
      desc: "Physician workstation with real-time patient physiological telemetry, threshold alarm reviews, and compliance time logs.",
      href: "/doctor/rpm",
    },
    {
      emoji: "🧪",
      title: "Diagnostic Lab Partnerships",
      desc: "Certified home phlebotomy sample collection (Thyrocare, SRL, Apollo) with automated electronic report synchronization.",
      href: "/app/labs",
    },
    {
      emoji: "📦",
      title: "E-Pharmacy Refill Bridges",
      desc: "Low-stock detection with 1-click fulfillment routing (Tata 1mg, Apollo Pharmacy, Netmeds) and automated inventory replenishment.",
      href: "/app/pharmacy",
    },
    {
      emoji: "🏢",
      title: "Corporate Wellness & B2B Tenancy",
      desc: "Differential privacy-guaranteed population health aggregates and inter-departmental wellness challenges.",
      href: "/corporate/dashboard",
    },
    {
      emoji: "🌐",
      title: "8 Regional Indian Languages",
      desc: "Complete localization across English, हिन्दी, தமிழ், తెలుగు, বাংলা, मराठी, ಕನ್ನಡ, and ગુજરાતી.",
      href: "/app/dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-line bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-2">
            <span className="text-primary font-extrabold">LIFE</span>IFY
            <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary-dark">
              Clinical Foundation
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="rounded-xl border border-line bg-surface px-3.5 py-1.5 text-xs font-bold text-ink hover:bg-background transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
            <span>🛡️</span> Zero-Hallucination Deterministic Health Platform
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-ink leading-tight">
            Advanced Clinical Intelligence &amp; Healthcare Foundation
          </h1>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Prescription OCR scanning, deterministic drug-drug &amp; food interactions, steady-state pharmacokinetic modeling, validated Indian diabetes &amp; CVD risk calculators, and emergency SOS triage.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app/dashboard"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all"
            >
              Open Dashboard
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-line bg-surface px-6 py-3 text-sm font-bold text-ink hover:bg-background shadow-sm transition-all"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <Link
              key={i}
              href={feat.href}
              className="group rounded-2xl border border-line bg-surface p-5 shadow-sm hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{feat.emoji}</span>
                  <span className="text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                    Explore →
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink group-hover:text-primary transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface py-6 text-center text-xs text-ink-muted">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 LIFEIFY — Healthcare Foundation &amp; Clinical Safety.</span>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/pricing" className="hover:text-ink">Pricing</Link>
            <Link href="/app/privacy" className="hover:text-ink">Privacy &amp; Data Rights</Link>
            <Link href="/login" className="hover:text-ink">Doctor Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
