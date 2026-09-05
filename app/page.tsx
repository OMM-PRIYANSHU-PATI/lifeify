import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function HomePage() {
  const user = await getCurrentUser();

  const appleHealthCards = [
    {
      domain: "Activity & Movement",
      emoji: "🧡",
      accent: "#FF5B00",
      headline: "8,420 Steps",
      sub: "Goal: 10,000 · 84% reached",
      href: "/app/track/steps",
    },
    {
      domain: "Heart & Vitals",
      emoji: "❤️",
      accent: "#FF2D55",
      headline: "118/78 mmHg",
      sub: "72 BPM · Optimal resting range",
      href: "/app/conditions",
    },
    {
      domain: "Sleep Architecture",
      emoji: "💜",
      accent: "#5856D6",
      headline: "7h 42m Asleep",
      sub: "Deep 1h 45m · REM 1h 50m",
      href: "/app/plans/sleep",
    },
    {
      domain: "Hydration Dynamics",
      emoji: "🩵",
      accent: "#00C7BE",
      headline: "1,750 mL",
      sub: "Target: 2,500 mL · 70% daily",
      href: "/app/track/water",
    },
    {
      domain: "Prescription OCR & Meds",
      emoji: "💊",
      accent: "#AF52DE",
      headline: "Today's Regimen",
      sub: "Zero DDI interactions · On schedule",
      href: "/app/medications",
    },
    {
      domain: "Emergency Medical ID",
      emoji: "🚨",
      accent: "#FF3B30",
      headline: "SOS Ready (O+)",
      sub: "QR health card & contact links",
      href: "/app/emergency-card",
    },
  ];

  const clinicalDomains = [
    {
      emoji: "📷",
      title: "Prescription OCR Scanner",
      desc: "Deterministic extraction of drug names, dosages, frequency, and instructions with mandatory user confirmation.",
      href: "/app/scan",
      tag: "Feature #050",
    },
    {
      emoji: "🩺",
      title: "Clinical Symptom Triage",
      desc: "Emergency (112), urgent care, and self-care routing using evidence-based medical decision trees.",
      href: "/app/symptom-checker",
      tag: "Feature #241",
    },
    {
      emoji: "🎯",
      title: "Indian Diabetes & CVD Risk (IDRS)",
      desc: "Validated Indian Diabetes Risk Score and 10-year Framingham Cardiovascular assessment algorithms.",
      href: "/app/risk-assessment",
      tag: "Feature #026",
    },
    {
      emoji: "💊",
      title: "Drug-Drug & Food Interaction Matrix",
      desc: "Active ingredient safety engine checking contraindications, duplicate brands, and nutrient timing.",
      href: "/app/medications",
      tag: "Feature #080",
    },
    {
      emoji: "👨‍⚕️",
      title: "Doctor RPM & Remote Care",
      desc: "10-minute secure clinical access codes, longitudinal physician review, and digital consultation summaries.",
      href: "/doctor/rpm",
      tag: "Feature #258",
    },
    {
      emoji: "👨‍👩‍👧",
      title: "Family Kinship & Caregivers",
      desc: "Reassuring passive milestone updates for elderly parents and working children with zero guilt.",
      href: "/app/family",
      tag: "Feature #249",
    },
    {
      emoji: "🧪",
      title: "Diagnostic Lab Bookings",
      desc: "Home phlebotomy sample collection (Thyrocare, Lal PathLabs) with electronic report ingestion.",
      href: "/app/labs",
      tag: "Feature #044",
    },
    {
      emoji: "📦",
      title: "Pharmacy Refills (1mg / Apollo)",
      desc: "Automated low-stock detection with 1-click prescription fulfillment routing.",
      href: "/app/pharmacy",
      tag: "Feature #074",
    },
    {
      emoji: "⌚",
      title: "Google Health & Apple Health Sync",
      desc: "Unified ingestion from phone sensors, Wear OS, and Apple HealthKit with deduplication.",
      href: "/app/wearables",
      tag: "Feature #180",
    },
    {
      emoji: "🎙️",
      title: "Voice Health Logging",
      desc: "Natural speech logging with deterministic intent parsing and strict user review before saving.",
      href: "/app/voice",
      tag: "Feature #270",
    },
    {
      emoji: "🌐",
      title: "8 Regional Indian Languages",
      desc: "Full localization across English, हिन्दी, தமிழ், తెలుగు, বাংলা, मराठी, ಕನ್ನಡ, and ગુજરાતી.",
      href: "/app/dashboard",
      tag: "Feature #274",
    },
    {
      emoji: "🔒",
      title: "Privacy Center & Local PWA",
      desc: "Full DPDP & HIPAA data sovereignty, exportable JSON/CSV, and offline-first queue.",
      href: "/app/privacy",
      tag: "Feature #303",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-line bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-2">
            <span className="text-primary font-extrabold">LIFE</span>IFY
            <span className="rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-bold">
              316 Features Active
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/features"
              className="text-xs font-bold text-ink-muted hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-surface-subtle transition-colors hidden sm:inline-block"
            >
              Browse All 316 Specs
            </Link>
            <LanguageSwitcher />
            <Link
              href="/app/dashboard"
              className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all flex items-center gap-1.5"
            >
              <span>🚀</span> Open App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Apple Health Minimalist Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold">
            <span>✨</span>
            <span>Inspired by Apple Health · Clean, Minimalist UI on Web &amp; Mobile</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-ink leading-tight">
            The Complete Personal Health OS. <br className="hidden sm:inline" />
            <span className="text-primary">316 Verified Features. Zero AI Guesswork.</span>
          </h1>

          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            From ambulatory step tracking and restorative sleep architecture to deterministic prescription OCR, clinical drug safety, doctor RPM, and emergency SOS — all unified in an Apple Health-inspired interface.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app/dashboard"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all"
            >
              Launch Dashboard (Summary) 🧡
            </Link>
            <Link
              href="/features"
              className="rounded-xl border border-line bg-surface px-6 py-3 text-sm font-bold text-ink hover:bg-surface-subtle shadow-sm transition-all"
            >
              Browse All 316 Categories 🗂️
            </Link>
          </div>
        </div>

        {/* Apple Health Live Preview Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
              Live Health Summary Highlights (Web &amp; App)
            </span>
            <Link href="/app/dashboard" className="text-xs font-bold text-primary hover:underline">
              Experience Full OS →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {appleHealthCards.map((card, i) => (
              <Link
                key={i}
                href={card.href}
                className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: card.accent }}
                />
                <div>
                  <div className="flex items-center justify-between text-xs font-bold" style={{ color: card.accent }}>
                    <span className="flex items-center gap-1.5">
                      <span>{card.emoji}</span> {card.domain}
                    </span>
                    <span className="text-ink-muted group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-2xl font-black tracking-tight text-ink font-mono">
                      {card.headline}
                    </div>
                    <div className="text-xs text-ink-muted mt-0.5 font-medium">
                      {card.sub}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 12 Core Clinical Domains Grid */}
        <div className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              14 Standard Clinical Domains
            </h2>
            <p className="text-xs text-ink-muted">
              Fully deterministic algorithms, verified medical safety bounds, and patient-sovereign privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinicalDomains.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="group rounded-2xl border border-line bg-surface p-4 shadow-sm hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-[10px] font-mono font-bold text-ink-muted bg-surface-subtle px-2 py-0.5 rounded border border-line/60">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs text-primary font-semibold">
                  <span>Open Route</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface py-6 text-center text-xs text-ink-muted">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 LIFEIFY Personal Health OS — 316 V1 &amp; V2 Features Completed.</span>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/features" className="hover:text-ink">316 Feature Directory</Link>
            <Link href="/pricing" className="hover:text-ink">Pricing</Link>
            <Link href="/app/privacy" className="hover:text-ink">Privacy &amp; DPDP</Link>
            <Link href="/doctor" className="hover:text-ink">Doctor Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
