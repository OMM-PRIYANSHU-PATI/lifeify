import React from "react";
import Link from "next/link";
import {
  getCategories,
  getCompactDiseases,
  getSymptoms,
  getTriageRules,
  getOrganSystems,
  getAnalyticsSummary,
} from "@/lib/medical/server-data";
import { MedicalNav } from "@/components/medical/medical-nav";
import { MedicalDisclaimer } from "@/components/medical/medical-disclaimer";
import {
  Network,
  Activity,
  Layers,
  HeartPulse,
  Stethoscope,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  BookOpen,
  BarChart3,
  Search,
  CheckCircle2,
  ChevronRight,
  Database,
  Gamepad2,
} from "lucide-react";

export const metadata = {
  title: "Lifeify Medical Knowledge Tree & Clinical Intelligence",
  description: "Interactive Medical Disease & Symptom Knowledge Tree powered by comprehensive biomedical taxonomy.",
};

export default async function HomePage() {
  const categories = getCategories();
  const symptoms = getSymptoms();
  const triageRules = getTriageRules();
  const organSystems = getOrganSystems();
  const analytics = getAnalyticsSummary();

  const treeModes = [
    {
      mode: "taxonomy",
      title: "Mode 1: Taxonomy Hierarchy Tree",
      badge: "Default Taxonomy",
      color: "from-cyan-950/40 via-slate-900 to-slate-900 border-cyan-500/30 text-cyan-300",
      icon: Layers,
      description: "Category (25) → Subcategory (407) → Disease (8,724) → Symptoms with frequency profiles.",
      href: "/tree?mode=taxonomy",
    },
    {
      mode: "symptom",
      title: "Mode 2: Symptom Reverse Tree",
      badge: "Reverse Graph",
      color: "from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30 text-amber-300",
      icon: Activity,
      description: "Symptom (377) → Associated Diseases → Disease Categories with prevalence & specificity ratings.",
      href: "/tree?mode=symptom",
    },
    {
      mode: "triage",
      title: "Mode 3: Clinical Triage Tree",
      badge: "Emergency & Vitals",
      color: "from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/30 text-rose-300",
      icon: Stethoscope,
      description: "Triage Level (Emergency / Doctor / Routine) → Diseases → Symptoms → Management Protocols.",
      href: "/tree?mode=triage",
    },
    {
      mode: "organ_system",
      title: "Mode 4: Organ-System Tree",
      badge: "Anatomical",
      color: "from-purple-950/40 via-slate-900 to-slate-900 border-purple-500/30 text-purple-300",
      icon: HeartPulse,
      description: "9 Anatomical Organ Systems → Symptoms → Disease Pathologies.",
      href: "/tree?mode=organ_system",
    },
    {
      mode: "graph",
      title: "Mode 5: Relational Network Graph",
      badge: "Graph Explorer",
      color: "from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30 text-emerald-300",
      icon: Network,
      description: "Multidimensional cross-domain graph linking Categories ↔ Subcategories ↔ Symptoms ↔ Triage.",
      href: "/tree?mode=graph",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <MedicalNav />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
        <MedicalDisclaimer />

        {/* ========================================================================= */}
        {/* APPLE HEALTH OS & FUTURE PREDICTOR HERO SHOWCASE                          */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-line bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                <span>🧡</span>
                <span>Apple Health-Inspired Clean &amp; Minimalist Health OS</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                LIFEIFY <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Health OS</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                316 clinical, behavioral, and longevity features designed in a minimalist dual-mode interface. Monitor real-time readiness, track vitals, and forecast long-term health risks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/app/dashboard"
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-2xl text-sm transition shadow-lg shadow-emerald-600/30 flex items-center gap-2.5 group"
              >
                <span>🧡</span>
                <span>Open Health OS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/future-disease-predictor"
                className="px-5 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-purple-600/25 flex items-center gap-2"
              >
                <span>🔮</span>
                <span>Future Disease Predictor</span>
              </Link>
              <Link
                href="/features"
                className="px-4 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl text-sm transition border border-slate-700 flex items-center gap-1.5"
              >
                <span>🗂️</span>
                <span>Browse 316 Features</span>
              </Link>
            </div>
          </div>

          {/* Apple Health 4 Mini Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            {/* 1. Steps & Movement */}
            <Link
              href="/app/dashboard"
              className="p-4 rounded-2xl bg-slate-900/80 border border-orange-500/30 hover:border-orange-500/60 hover:bg-slate-850 transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-orange-400">
                <span>🧡 ACTIVITY</span>
                <span className="text-[10px] text-slate-400">Today</span>
              </div>
              <div className="my-3">
                <div className="text-2xl font-black text-white font-mono">8,420</div>
                <div className="text-[11px] font-semibold text-slate-400">Steps · Goal: 6,000</div>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </Link>

            {/* 2. Heart & BP */}
            <Link
              href="/app/dashboard"
              className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-500/60 hover:bg-slate-850 transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                <span>❤️ VITALS &amp; BP</span>
                <span className="text-[10px] text-slate-400">Latest</span>
              </div>
              <div className="my-3">
                <div className="text-2xl font-black text-white font-mono">118/78</div>
                <div className="text-[11px] font-semibold text-slate-400">Optimal Blood Pressure</div>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "85%" }} />
              </div>
            </Link>

            {/* 3. Sleep Architecture */}
            <Link
              href="/app/dashboard"
              className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-slate-850 transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                <span>💜 SLEEP</span>
                <span className="text-[10px] text-slate-400">Last Night</span>
              </div>
              <div className="my-3">
                <div className="text-2xl font-black text-white font-mono">7h 45m</div>
                <div className="text-[11px] font-semibold text-slate-400">88% Sleep Efficiency</div>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-indigo-500" style={{ width: "30%" }} />
                <div className="h-full bg-purple-500" style={{ width: "25%" }} />
                <div className="h-full bg-violet-400" style={{ width: "45%" }} />
              </div>
            </Link>

            {/* 4. Future Disease Predictor */}
            <Link
              href="/future-disease-predictor"
              className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 hover:bg-slate-850 transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                <span>🔮 PREDICTOR</span>
                <span className="text-[10px] text-emerald-400 font-bold">NEW</span>
              </div>
              <div className="my-3">
                <div className="text-2xl font-black text-white font-mono">Low Risk</div>
                <div className="text-[11px] font-semibold text-slate-400">6 Multi-System Diseases</div>
              </div>
              <div className="text-[11px] text-purple-300 font-bold flex items-center gap-1 group-hover:underline">
                <span>Launch What-If Lab</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CLINICAL MEDICAL KNOWLEDGE GRAPH & DATA SCIENCE ENGINE                    */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Medical Knowledge Graph &amp; Clinical Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Medical Disease &amp; Symptom{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Knowledge Tree
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore dynamic multi-hierarchical relationships across <strong>8,724 disease conditions</strong>, <strong>377 symptoms</strong>, and <strong>25 medical categories</strong> derived from empirical clinical cohorts.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/diagnostic-arena"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-rose-600/25 flex items-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Diagnostic Arena (Drag &amp; Drop Deck)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/rpg-quest"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-600/25 flex items-center gap-2 group"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>20-Question RPG Quest</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/symptom-analyzer"
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/25 flex items-center gap-2 group"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Symptom Inference &amp; Graph</span>
            </Link>
            <Link
              href="/tree"
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition border border-slate-700 flex items-center gap-2"
            >
              <Network className="w-4 h-4" />
              <span>Knowledge Tree</span>
            </Link>
            <Link
              href="/compare"
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition border border-slate-700 flex items-center gap-2"
            >
              <span>Compare</span>
            </Link>
          </div>

          {/* KPI Dashboard Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-800/80">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Diseases</span>
              <p className="text-xl font-bold text-cyan-300 font-mono">{analytics.totalDiseases.toLocaleString()}</p>
              <span className="text-[9px] text-slate-500">Master Catalog</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Categories</span>
              <p className="text-xl font-bold text-indigo-300 font-mono">{analytics.totalCategories}</p>
              <span className="text-[9px] text-slate-500">Top Taxonomy</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Subcategories</span>
              <p className="text-xl font-bold text-purple-300 font-mono">{analytics.totalSubcategories}</p>
              <span className="text-[9px] text-slate-500">Ontology Branches</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Symptoms</span>
              <p className="text-xl font-bold text-amber-300 font-mono">{analytics.totalSymptoms}</p>
              <span className="text-[9px] text-slate-500">Organ Classified</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Empirical Profiles</span>
              <p className="text-xl font-bold text-emerald-300 font-mono">{analytics.totalEmpiricalProfiles}</p>
              <span className="text-[9px] text-slate-500">Vitals &amp; Pain Scale</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Triage Protocols</span>
              <p className="text-xl font-bold text-rose-300 font-mono">{analytics.totalTriageRules}</p>
              <span className="text-[9px] text-slate-500">Clinical Benchmarks</span>
            </div>
          </div>
        </div>

        {/* 5 Tree Modes Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Network className="w-5 h-5 text-cyan-400" />
                <span>5 Interactive Visualization Modes</span>
              </h2>
              <p className="text-xs text-slate-400">
                Explore the dataset through multiple complementary clinical and taxonomic perspectives.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {treeModes.map((m) => {
              const ModeIcon = m.icon;
              return (
                <Link
                  key={m.mode}
                  href={m.href}
                  className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] bg-gradient-to-br ${m.color} flex flex-col justify-between space-y-3 group shadow-lg`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <ModeIcon className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800">
                        {m.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-300/80 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition pt-2">
                    <span>Launch Mode</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Medical Categories Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Primary Medical Categories ({categories.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Comprehensive classification spanning infectious, cardiovascular, neurological, oncological, and systemic domains.
              </p>
            </div>
            <Link
              href="/diseases"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>View all diseases</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {categories.map((c) => (
              <Link
                key={c.code}
                href={`/tree?search=${encodeURIComponent(c.name)}`}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/40 transition group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    CAT {c.code}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {c.subcategoriesCount} subcats
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition line-clamp-1">
                  {c.name}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Diseases:</span>
                  <span className="font-bold text-slate-200 font-mono">{c.diseasesCount}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <p>Lifeify Medical Intelligence Platform · Comprehensive Disease &amp; Symptoms Knowledge Graph</p>
        <p className="text-[11px] text-slate-600">Built from 2023 Master Dataset · Strictly for research &amp; knowledge exploration</p>
      </footer>
    </div>
  );
}
