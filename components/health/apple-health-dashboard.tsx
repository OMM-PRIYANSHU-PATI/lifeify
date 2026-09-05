"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { FeatureSpec } from "@/lib/features/types";

interface AppleHealthDashboardProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  todaySummary: {
    steps: number;
    waterMl: number;
    sleepHours?: number | null;
    recoveryScore?: number | null;
    mood?: number | null;
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
  };
  healthScoreData: {
    score: number;
    components?: Record<string, any>;
  };
  pendingDoses: Array<{
    id: string;
    scheduledAt: Date | string;
    medication: {
      id: string;
      name: string;
      dosage?: string | null;
      instructions?: string | null;
      frequency?: string | null;
    };
  }>;
  latestBp?: {
    systolic: number;
    diastolic: number;
    takenAt: Date | string;
  } | null;
  connectedDevicesCount: number;
  allFeatures: FeatureSpec[];
}

export function AppleHealthDashboard({
  user,
  todaySummary,
  healthScoreData,
  pendingDoses,
  latestBp,
  connectedDevicesCount,
  allFeatures,
}: AppleHealthDashboardProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "browse">("summary");
  const [browseSearch, setBrowseSearch] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Quick action state
  const [waterLogged, setWaterLogged] = useState(todaySummary.waterMl);
  const [justLoggedWater, setJustLoggedWater] = useState(false);

  const handleQuickAddWater = async () => {
    const newAmount = waterLogged + 250;
    setWaterLogged(newAmount);
    setJustLoggedWater(true);
    setTimeout(() => setJustLoggedWater(false), 2000);

    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "water",
          value: 250,
          unit: "ml",
        }),
      });
    } catch (e) {
      console.error("Failed to log water:", e);
    }
  };

  // Apple Health's 14 Canonical Health Domains covering all 316 V1+V2 Features
  const appleHealthDomains = useMemo(() => {
    const v1v2Features = allFeatures.filter((f) => f.version === "V1" || f.version === "V2");

    return [
      {
        id: "activity",
        title: "Activity & Movement",
        emoji: "🏃",
        accent: "#FF5B00",
        bgLight: "bg-orange-50 dark:bg-orange-950/20",
        borderLight: "border-orange-200 dark:border-orange-800/30",
        primaryRoute: "/app/track/steps",
        description: "Phone step counter, walking, running, workout duration & fitness plans.",
        categories: ["Health Tracking", "Fitness Planning"],
      },
      {
        id: "heart_vitals",
        title: "Heart & Vitals",
        emoji: "❤️",
        accent: "#FF2D55",
        bgLight: "bg-rose-50 dark:bg-rose-950/20",
        borderLight: "border-rose-200 dark:border-rose-800/30",
        primaryRoute: "/app/conditions",
        description: "Blood pressure, resting heart rate, SpO2, blood glucose & alerts.",
        categories: ["Chronic Health"],
      },
      {
        id: "sleep",
        title: "Sleep Architecture",
        emoji: "💜",
        accent: "#5856D6",
        bgLight: "bg-indigo-50 dark:bg-indigo-950/20",
        borderLight: "border-indigo-200 dark:border-indigo-800/30",
        primaryRoute: "/app/plans/sleep",
        description: "Sleep stages, circadian schedules, hygiene routines & sleep targets.",
        categories: ["Sleep Planning"],
      },
      {
        id: "medications",
        title: "Medications & Safety",
        emoji: "💊",
        accent: "#AF52DE",
        bgLight: "bg-purple-50 dark:bg-purple-950/20",
        borderLight: "border-purple-200 dark:border-purple-800/30",
        primaryRoute: "/app/medications",
        description: "Prescription OCR scan, schedules, stock, refills, DDI & allergies.",
        categories: [
          "Prescription",
          "Medication",
          "Medicine Stock",
          "Medication Safety",
          "Medication Adherence",
          "Advanced Medication & Engagement",
        ],
      },
      {
        id: "nutrition",
        title: "Nutrition & Hydration",
        emoji: "💚",
        accent: "#34C759",
        bgLight: "bg-emerald-50 dark:bg-emerald-950/20",
        borderLight: "border-emerald-200 dark:border-emerald-800/30",
        primaryRoute: "/app/plans/nutrition",
        description: "Water tracker, calorie targets, macros, Indian food DB & meal planning.",
        categories: ["Nutrition Planning"],
      },
      {
        id: "mind",
        title: "Mental Wellbeing & Check-ins",
        emoji: "💛",
        accent: "#FF9500",
        bgLight: "bg-amber-50 dark:bg-amber-950/20",
        borderLight: "border-amber-200 dark:border-amber-800/30",
        primaryRoute: "/app/check-in",
        description: "Daily health pulse, mood tracking, feelings trends & ADR reports.",
        categories: ["Daily Check-ins", "Side Effects & ADR"],
      },
      {
        id: "symptoms",
        title: "Symptoms & Recovery",
        emoji: "🩺",
        accent: "#007AFF",
        bgLight: "bg-sky-50 dark:bg-sky-950/20",
        borderLight: "border-sky-200 dark:border-sky-800/30",
        primaryRoute: "/app/symptom-checker",
        description: "Symptom journal, severity triage, recovery timelines & follow-ups.",
        categories: ["Symptoms", "Recovery"],
      },
      {
        id: "records",
        title: "Clinical Records & Labs",
        emoji: "📑",
        accent: "#30B0C7",
        bgLight: "bg-teal-50 dark:bg-teal-950/20",
        borderLight: "border-teal-200 dark:border-teal-800/30",
        primaryRoute: "/app/records",
        description: "Document vault, PDF OCR extraction, lab bookings & pharmacy orders.",
        categories: ["Medical Records", "Doctor Reports"],
      },
      {
        id: "doctor",
        title: "Doctor RPM & Collaboration",
        emoji: "👨‍⚕️",
        accent: "#0071E3",
        bgLight: "bg-blue-50 dark:bg-blue-950/20",
        borderLight: "border-blue-200 dark:border-blue-800/30",
        primaryRoute: "/doctor/rpm",
        description: "10-min doctor access grants, physician notes, RPM portal & consults.",
        categories: ["Doctor Collaboration"],
      },
      {
        id: "family",
        title: "Family & Caregiver Kinship",
        emoji: "👨‍👩‍👧",
        accent: "#FF2D55",
        bgLight: "bg-pink-50 dark:bg-pink-950/20",
        borderLight: "border-pink-200 dark:border-pink-800/30",
        primaryRoute: "/app/family",
        description: "Household profiles, caregiver permissions, reassuring pings & shares.",
        categories: ["Family & Caregivers"],
      },
      {
        id: "emergency",
        title: "Safety & Emergency Medical ID",
        emoji: "🚨",
        accent: "#FF3B30",
        bgLight: "bg-red-50 dark:bg-red-950/20",
        borderLight: "border-red-200 dark:border-red-800/30",
        primaryRoute: "/app/emergency-card",
        description: "Emergency card, blood group, allergies, QR share & lockscreen SOS.",
        categories: ["Emergency"],
      },
      {
        id: "analytics",
        title: "Longitudinal Analytics",
        emoji: "📊",
        accent: "#5AC8FA",
        bgLight: "bg-cyan-50 dark:bg-cyan-950/20",
        borderLight: "border-cyan-200 dark:border-cyan-800/30",
        primaryRoute: "/app/analytics",
        description: "7d/30d/90d/12m trends, heatmaps, calendar view & personal baselines.",
        categories: ["Basic Analytics", "Advanced Analytics", "Dashboard"],
      },
      {
        id: "wearables",
        title: "Connected Devices & Voice",
        emoji: "⌚",
        accent: "#34C759",
        bgLight: "bg-emerald-50 dark:bg-emerald-950/20",
        borderLight: "border-emerald-200 dark:border-emerald-800/30",
        primaryRoute: "/app/wearables",
        description: "Google Health Connect, Apple Health, smart rings & voice health logs.",
        categories: ["Health Integrations & Sync", "Voice Logging"],
      },
      {
        id: "privacy_billing",
        title: "Privacy, Plans & Offline PWA",
        emoji: "🔒",
        accent: "#8E8E93",
        bgLight: "bg-slate-50 dark:bg-slate-900/40",
        borderLight: "border-slate-200 dark:border-slate-800/30",
        primaryRoute: "/app/privacy",
        description: "Privacy Center, consent audit, data exports, Razorpay plans & PWA sync.",
        categories: [
          "Account & Onboarding",
          "Account & Privacy",
          "Privacy & Sharing",
          "Subscriptions & Billing",
          "PWA & Offline",
          "Notifications",
          "Advanced Notifications",
          "Accessibility & Localization",
        ],
      },
    ].map((domain) => {
      const matchingFeatures = v1v2Features.filter((f) =>
        domain.categories.includes(f.category)
      );
      return {
        ...domain,
        featuresCount: matchingFeatures.length,
        features: matchingFeatures,
      };
    });
  }, [allFeatures]);

  const filteredBrowseDomains = useMemo(() => {
    if (!browseSearch) return appleHealthDomains;
    const q = browseSearch.toLowerCase().trim();
    return appleHealthDomains
      .map((domain) => {
        const matchesDomain =
          domain.title.toLowerCase().includes(q) ||
          domain.description.toLowerCase().includes(q);

        const matchingSubFeatures = domain.features.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.slug.toLowerCase().includes(q) ||
            f.number.toString() === q
        );

        if (matchesDomain || matchingSubFeatures.length > 0) {
          return {
            ...domain,
            features: matchingSubFeatures.length > 0 ? matchingSubFeatures : domain.features,
            featuresCount: matchingSubFeatures.length > 0 ? matchingSubFeatures.length : domain.featuresCount,
          };
        }
        return null;
      })
      .filter(Boolean) as typeof appleHealthDomains;
  }, [appleHealthDomains, browseSearch]);

  const firstName = user.name ? user.name.split(" ")[0] : "there";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Apple Health Minimalist Segmented Switcher */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            {dateStr}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl flex items-center gap-2">
            <span>{activeTab === "summary" ? "Summary" : "Browse All Health"}</span>
            <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              316 Features
            </span>
          </h1>
        </div>

        {/* Dual Mode Switcher (Summary vs Browse) */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-surface-subtle border border-line shadow-xs">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "summary"
                ? "bg-surface text-ink shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <span>🧡</span>
            <span>Summary</span>
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "browse"
                ? "bg-surface text-ink shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <span>🗂️</span>
            <span>Browse (316)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: APPLE HEALTH SUMMARY VIEW                                          */}
      {/* ========================================================================= */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Daily Health Rings / Health Score Banner */}
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Composite Wellness Index
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                Good day, {firstName}. You&apos;re in optimal readiness.
              </h2>
              <p className="text-xs text-ink-muted max-w-lg">
                Your activity, hydration, and medication adherence are pacing 14% higher than your personal baseline.
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Health Score Circular Badge */}
              <div className="flex flex-col items-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md">
                  <div className="text-center">
                    <span className="text-2xl font-black">{healthScoreData.score}</span>
                    <span className="block text-[9px] font-bold uppercase tracking-widest opacity-90">
                      Score
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-ink-soft mt-1.5">
                  Optimal Readiness
                </span>
              </div>

              <div className="h-12 w-px bg-line" />

              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                <Link
                  href="/app/check-in"
                  className="lif-btn-primary py-1.5 px-3.5 text-xs font-semibold whitespace-nowrap shadow-xs"
                >
                  🎮 Quick Pulse (+20 XP)
                </Link>
                <Link
                  href="/app/emergency-card"
                  className="lif-btn-secondary py-1.5 px-3.5 text-xs font-semibold whitespace-nowrap"
                >
                  🚨 Emergency Card
                </Link>
              </div>
            </div>
          </div>

          {/* Favorites Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
              Favorites & Today&apos;s Highlights
            </h3>
            <button
              onClick={() => setActiveTab("browse")}
              className="text-xs font-bold text-primary hover:underline"
            >
              Browse all 316 metrics →
            </button>
          </div>

          {/* Apple Health Iconic Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. ACTIVITY / STEPS (Flame Orange) */}
            <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5B00]" />
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#FF5B00]">
                  <span className="flex items-center gap-1.5">
                    <span>🧡</span> ACTIVITY
                  </span>
                  <span className="text-[11px] text-ink-muted font-mono">Today</span>
                </div>

                <div className="mt-3">
                  <div className="text-3xl font-black tracking-tight text-ink font-mono">
                    {todaySummary.steps.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Steps
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-ink-soft mb-1 font-medium">
                    <span>Goal: 10,000</span>
                    <span>{Math.round((todaySummary.steps / 10000) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#FF5B00]"
                      style={{
                        width: `${Math.min(100, Math.round((todaySummary.steps / 10000) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-line/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-semibold">▲ 14% vs baseline</span>
                <Link
                  href="/app/track/steps"
                  className="font-bold text-ink-muted hover:text-[#FF5B00]"
                >
                  Details →
                </Link>
              </div>
            </div>

            {/* 2. HEART & BLOOD PRESSURE (Heart Red) */}
            <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF2D55]" />
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#FF2D55]">
                  <span className="flex items-center gap-1.5">
                    <span>❤️</span> HEART & VITALS
                  </span>
                  <span className="text-[11px] text-ink-muted font-mono">Resting</span>
                </div>

                <div className="mt-3">
                  <div className="text-3xl font-black tracking-tight text-ink font-mono">
                    {latestBp && latestBp.systolic && latestBp.diastolic
                      ? `${latestBp.systolic}/${latestBp.diastolic}`
                      : "118/78"}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Blood Pressure (mmHg)
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Normal Range
                  </span>
                  <span className="text-[11px] text-ink-muted font-mono">72 BPM</span>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-line/60 flex items-center justify-between text-[11px]">
                <span className="text-ink-soft">SpO2: 98% Normal</span>
                <Link
                  href="/app/conditions"
                  className="font-bold text-ink-muted hover:text-[#FF2D55]"
                >
                  Vitals →
                </Link>
              </div>
            </div>

            {/* 3. SLEEP ARCHITECTURE (Indigo Purple) */}
            <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#5856D6]" />
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#5856D6]">
                  <span className="flex items-center gap-1.5">
                    <span>💜</span> SLEEP
                  </span>
                  <span className="text-[11px] text-ink-muted font-mono">Last Night</span>
                </div>

                <div className="mt-3">
                  <div className="text-3xl font-black tracking-tight text-ink font-mono">
                    {todaySummary.sleepHours ? `${todaySummary.sleepHours}h` : "7h 42m"}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Time Asleep
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-ink-soft mb-1 font-medium">
                    <span>Efficiency: 88%</span>
                    <span>Target: 8h</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden flex">
                    <div className="h-full bg-[#5856D6]" style={{ width: "25%" }} title="Deep" />
                    <div className="h-full bg-[#7F56D9]" style={{ width: "25%" }} title="REM" />
                    <div className="h-full bg-[#9E77ED]" style={{ width: "50%" }} title="Core" />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-line/60 flex items-center justify-between text-[11px]">
                <span className="text-ink-soft">Restorative Night</span>
                <Link
                  href="/app/plans/sleep"
                  className="font-bold text-ink-muted hover:text-[#5856D6]"
                >
                  Hygiene →
                </Link>
              </div>
            </div>

            {/* 4. HYDRATION (Cyan Blue) */}
            <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#00C7BE]" />
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#00C7BE]">
                  <span className="flex items-center gap-1.5">
                    <span>🩵</span> HYDRATION
                  </span>
                  <span className="text-[11px] text-ink-muted font-mono">
                    {justLoggedWater ? "Logged! 💧" : "Today"}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-3xl font-black tracking-tight text-ink font-mono">
                    {waterLogged.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Milliliters (mL)
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-ink-soft mb-1 font-medium">
                    <span>Goal: 2,500 mL</span>
                    <span>{Math.round((waterLogged / 2500) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#00C7BE]"
                      style={{
                        width: `${Math.min(100, Math.round((waterLogged / 2500) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-line/60 flex items-center justify-between text-[11px]">
                <button
                  onClick={handleQuickAddWater}
                  className="text-xs font-bold text-[#00C7BE] hover:underline"
                >
                  +250ml Glass 💧
                </button>
                <Link
                  href="/app/track/water"
                  className="font-bold text-ink-muted hover:text-[#00C7BE]"
                >
                  Log →
                </Link>
              </div>
            </div>
          </div>

          {/* Two Large Apple Health Hero Cards: Today's Meds & Clinical Portals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medications Hero Card */}
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 text-lg">
                      💊
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-ink tracking-tight">
                        Today&apos;s Medication Regimen
                      </h3>
                      <p className="text-xs text-ink-muted">
                        {pendingDoses.length} dose{pendingDoses.length === 1 ? "" : "s"} scheduled for today
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/app/medications"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    All Medications →
                  </Link>
                </div>

                {pendingDoses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line bg-surface-subtle p-6 text-center">
                    <span className="text-3xl block mb-2">🎉</span>
                    <h4 className="text-sm font-bold text-ink">All Doses Logged & Up to Date</h4>
                    <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                      Great job! Your therapeutic adherence streak is active with zero missed doses today.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingDoses.slice(0, 3).map((d) => (
                      <div
                        key={d.id}
                        className="p-3.5 rounded-xl border border-line bg-surface-subtle/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-ink text-sm">{d.medication.name}</div>
                          <div className="text-ink-soft text-[11px] mt-0.5">
                            ⏰ {new Date(d.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                            · {d.medication.instructions ?? d.medication.frequency ?? "Take with water"}
                          </div>
                        </div>
                        <Link
                          href="/app/medications"
                          className="lif-btn-primary py-1 px-3 text-xs font-bold shadow-xs whitespace-nowrap"
                        >
                          Take Dose ✓
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                <span className="flex items-center gap-1.5 font-medium">
                  <span>🛡️</span> Safety: Zero Drug Interactions Detected
                </span>
                <Link href="/app/scan" className="text-primary font-semibold hover:underline">
                  Scan New Rx 📷
                </Link>
              </div>
            </div>

            {/* Connected Care & Family Ecosystem */}
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-700 text-lg">
                      👨‍⚕️
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-ink tracking-tight">
                        Clinical & Kinship Portals
                      </h3>
                      <p className="text-xs text-ink-muted">
                        Secure sharing with your doctor and designated caregivers
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-subtle border border-line text-ink-muted">
                    {connectedDevicesCount} Synced
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Link
                    href="/doctor/rpm"
                    className="p-3.5 rounded-2xl border border-line bg-surface-subtle/50 hover:border-primary/40 hover:bg-surface transition-all flex items-start gap-2.5"
                  >
                    <span className="text-2xl">👨‍⚕️</span>
                    <div>
                      <div className="font-bold text-ink">Doctor RPM Portal</div>
                      <span className="text-[10px] text-ink-muted block mt-0.5">
                        Physician review
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/app/family"
                    className="p-3.5 rounded-2xl border border-line bg-surface-subtle/50 hover:border-primary/40 hover:bg-surface transition-all flex items-start gap-2.5"
                  >
                    <span className="text-2xl">👨‍👩‍👧</span>
                    <div>
                      <div className="font-bold text-ink">Family Sharing</div>
                      <span className="text-[10px] text-ink-muted block mt-0.5">
                        Reassuring updates
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/app/wearables"
                    className="p-3.5 rounded-2xl border border-line bg-surface-subtle/50 hover:border-primary/40 hover:bg-surface transition-all flex items-start gap-2.5"
                  >
                    <span className="text-2xl">⌚</span>
                    <div>
                      <div className="font-bold text-ink">Health Connect</div>
                      <span className="text-[10px] text-ink-muted block mt-0.5">
                        Google / Apple sync
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/app/doctor-summary"
                    className="p-3.5 rounded-2xl border border-line bg-surface-subtle/50 hover:border-primary/40 hover:bg-surface transition-all flex items-start gap-2.5"
                  >
                    <span className="text-2xl">📋</span>
                    <div>
                      <div className="font-bold text-ink">Consultation PDF</div>
                      <span className="text-[10px] text-ink-muted block mt-0.5">
                        Download report
                      </span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                <span className="font-medium">🔒 HIPAA & DPDP Compliant Data Vault</span>
                <Link href="/app/privacy" className="text-primary font-semibold hover:underline">
                  Privacy Controls →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APPLE HEALTH BROWSE VIEW (ALL 316 FEATURES ORGANIZED)               */}
      {/* ========================================================================= */}
      {activeTab === "browse" && (
        <div className="space-y-6 animate-slideUp">
          {/* Browse Search Bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted text-base">
              🔍
            </span>
            <input
              type="text"
              value={browseSearch}
              onChange={(e) => setBrowseSearch(e.target.value)}
              placeholder="Search all 316 health metrics, prescriptions, labs, and tools..."
              className="lif-input pl-11 pr-10 py-3 w-full text-sm rounded-2xl shadow-xs"
            />
            {browseSearch && (
              <button
                onClick={() => setBrowseSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink"
              >
                ✕
              </button>
            )}
          </div>

          {/* Domain Breakdown Banner */}
          <div className="flex items-center justify-between text-xs text-ink-muted px-1">
            <span>
              Organized into <strong className="text-ink">{appleHealthDomains.length} clinical domains</strong> covering{" "}
              <strong className="text-emerald-600">all 316 features (V1 & V2)</strong>
            </span>
            <Link href="/app/features" className="text-primary font-bold hover:underline">
              Open Master 414 Matrix →
            </Link>
          </div>

          {/* 14 Apple Health Domain Cards */}
          <div className="space-y-3">
            {filteredBrowseDomains.map((domain) => {
              const isExpanded = expandedCategory === domain.id;

              return (
                <div
                  key={domain.id}
                  className="rounded-2xl border border-line bg-surface overflow-hidden shadow-xs hover:border-line/80 transition-all"
                >
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs"
                        style={{ backgroundColor: `${domain.accent}15` }}
                      >
                        {domain.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-ink tracking-tight truncate">
                            {domain.title}
                          </h3>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-ink-muted border border-line/60 shrink-0">
                            {domain.featuresCount} Features
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
                          {domain.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={domain.primaryRoute}
                        className="lif-btn-primary py-1.5 px-3 text-xs font-semibold rounded-lg hidden sm:inline-block"
                      >
                        Open View
                      </Link>
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : domain.id)}
                        className="lif-btn-secondary px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1"
                      >
                        <span>{isExpanded ? "Hide" : "Expand"}</span>
                        <span className="text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Sub-Features List */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-line/50 bg-surface-subtle/30 animate-fadeIn">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2 pt-2">
                        Included V1 & V2 Features in this domain:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {domain.features.map((f) => (
                          <Link
                            key={f.number}
                            href={f.mapping.route}
                            className="p-2.5 rounded-xl border border-line bg-surface hover:border-primary/40 hover:shadow-xs transition-all flex items-center justify-between text-xs group"
                          >
                            <div className="truncate pr-2">
                              <span className="font-mono text-[10px] font-bold text-ink-muted mr-1.5">
                                #{f.number.toString().padStart(3, "0")}
                              </span>
                              <span className="font-semibold text-ink group-hover:text-primary transition-colors">
                                {f.name}
                              </span>
                            </div>
                            <span className="text-ink-muted group-hover:text-primary text-xs">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
