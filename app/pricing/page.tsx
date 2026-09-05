import React from "react";
import Link from "next/link";
import { Check, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Pricing & Plans | LIFEIFY",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Free Foundation",
      price: "₹0",
      period: "forever",
      description: "Essential deterministic health tracking and medication safety.",
      features: [
        "Up to 5 Medical Records in Secure Vault",
        "Deterministic Prescription OCR Review",
        "Medication Schedule & Stock Refill Alerts",
        "Daily Health Check-in & Habit Streaks",
        "Emergency Medical Card & QR Code",
        "10-Minute Doctor Consultation Access Codes",
        "Informational Clinical Summaries",
      ],
      ctaText: "Get Started Free",
      ctaHref: "/app/dashboard",
      popular: false,
    },
    {
      name: "Premium Personal",
      price: "₹499",
      period: "per month",
      annualPrice: "₹4,999/yr (Save 17%)",
      description: "Complete health platform with wearable sync and unlimited vault storage.",
      features: [
        "Unlimited Medical Records & OCR Scans",
        "Google Health Connect & Apple Health Sync",
        "Advanced Analytics & 12-Month Telemetry Trends",
        "Personalized Rule-Based Nutrition & Fitness Plans",
        "Printable Clinical Doctor Visit Summaries (PDF)",
        "Structured Adverse Drug Reaction (ADR) Reports",
        "Voice Health Logging with Confirmation Guard",
        "Priority Customer & Clinical Support",
      ],
      ctaText: "Upgrade to Premium",
      ctaHref: "/app/subscription",
      popular: true,
    },
    {
      name: "Family Care Circle",
      price: "₹999",
      period: "per month",
      annualPrice: "₹9,999/yr (Save 17%)",
      description: "Peace of mind for the whole family and designated caregivers.",
      features: [
        "Everything in Premium for up to 6 Family Members",
        "Shared Family Wellness & Telemetry Dashboard",
        "Time-Bound Revocable Caregiver Delegations",
        "Emergency QR IDs for Elderly Parents & Dependents",
        "Centralized Refill Tracking for Senior Citizens",
        "Comprehensive Audit Log of All Family File Access",
      ],
      ctaText: "Start Family Plan",
      ctaHref: "/app/subscription",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary-dark text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Zero-AI • Deterministic Privacy
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight">
            Transparent Healthcare Pricing
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
            No hidden fees, no opaque data sales, and zero speculative AI diagnoses. Just clinical-grade tools built on deterministic rules.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 flex flex-col justify-between transition-all relative ${
                p.popular
                  ? "bg-surface border-2 border-primary shadow-lg ring-4 ring-primary/10"
                  : "lif-card"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">{p.name}</h3>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-ink">{p.price}</span>
                  <span className="text-xs text-ink-muted">{p.period}</span>
                </div>
                {p.annualPrice && (
                  <div className="text-xs font-bold text-primary">
                    {p.annualPrice}
                  </div>
                )}

                <div className="pt-4 border-t border-line space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Features Included:</div>
                  <ul className="space-y-2.5">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-ink-soft">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={p.ctaHref}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                    p.popular
                      ? "lif-btn-primary"
                      : "lif-btn-secondary"
                  }`}
                >
                  {p.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* DPDP Compliance Footer */}
        <div className="p-6 rounded-2xl bg-surface border border-line text-center space-y-2">
          <h4 className="text-xs sm:text-sm font-bold text-ink">
            Compliant with Indian Digital Personal Data Protection (DPDP) Act 2023
          </h4>
          <p className="text-xs text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Your personal telemetry and medical files are strictly private by architecture. We do not sell user data to pharmaceutical companies, insurers, or advertising brokers.
          </p>
        </div>
      </div>
    </div>
  );
}
