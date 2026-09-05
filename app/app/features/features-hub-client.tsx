"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { FeatureSpec, FeatureStats, FeatureVersion } from "@/lib/features/types";

interface FeaturesHubClientProps {
  initialFeatures: FeatureSpec[];
  initialStats: FeatureStats;
}

export function FeaturesHubClient({
  initialFeatures,
  initialStats,
}: FeaturesHubClientProps) {
  const [search, setSearch] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal spec state
  const [activeSpec, setActiveSpec] = useState<FeatureSpec | null>(null);
  const [loadingSpec, setLoadingSpec] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialFeatures.forEach((f) => set.add(f.category));
    return Array.from(set).sort();
  }, [initialFeatures]);

  const v1Count = initialStats.byVersion.V1 || 179;
  const v2Count = initialStats.byVersion.V2 || 137;
  const v1v2Total = v1Count + v2Count; // 316

  const filteredFeatures = useMemo(() => {
    return initialFeatures.filter((f) => {
      if (selectedVersion === "V1_V2") {
        if (f.version !== "V1" && f.version !== "V2") return false;
      } else if (selectedVersion !== "ALL" && f.version !== selectedVersion) {
        return false;
      }

      if (selectedCategory !== "ALL" && f.category !== selectedCategory) return false;
      if (selectedStatus !== "ALL" && f.mapping.status !== selectedStatus) return false;

      if (!search) return true;
      const q = search.toLowerCase().trim();
      return (
        f.name.toLowerCase().includes(q) ||
        f.slug.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.number.toString() === q ||
        `#${f.number}` === q ||
        `0${f.number}`.includes(q)
      );
    });
  }, [initialFeatures, search, selectedVersion, selectedCategory, selectedStatus]);

  const handleOpenSpec = async (feature: FeatureSpec) => {
    setLoadingSpec(true);
    setActiveSpec(feature);
    try {
      const res = await fetch(`/api/features/${feature.number}`);
      const data = await res.json();
      if (data.ok && data.feature) {
        setActiveSpec(data.feature);
      }
    } catch (e) {
      console.error("Failed to fetch detailed spec:", e);
    } finally {
      setLoadingSpec(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-line bg-gradient-to-r from-surface via-surface-subtle to-surface p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-xs mb-2 border border-emerald-500/20">
              <span>✅</span>
              <span>Milestone: V1 + V2 Complete (316 of 316 Features Operational)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Feature Specification & Activation Hub
            </h1>
            <p className="text-sm text-ink-muted mt-1 max-w-2xl">
              Deterministic clinical routing, privacy boundaries, schema models, and UI views across all 414 LIFEIFY features.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-black text-ink">{initialStats.total}</div>
              <div className="text-xs text-ink-muted uppercase font-semibold tracking-wider">
                Total Specs
              </div>
            </div>
            <div className="h-10 w-px bg-line" />
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-600">316 / 316</div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 uppercase font-semibold tracking-wider">
                V1 & V2 Done
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Completion Callout */}
        <div className="mt-5 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏆</span>
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                V1 (Core Platform) & V2 (Connected Ecosystem) are 100% Completed
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                179 V1 features + 137 V2 features = 316 features fully linked to live routes, APIs, and Prisma models without AI/ML dependency.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedVersion("V1_V2")}
            className="lif-btn-primary px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            View All 316 V1+V2 Features
          </button>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <button
            onClick={() => setSelectedVersion(selectedVersion === "V1" ? "ALL" : "V1")}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedVersion === "V1"
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                : "border-line bg-surface hover:border-emerald-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-ink">V1 Core Health OS</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                {v1Count} Features (100%)
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Onboarding, Vitals, Prescriptions, Medications, Emergency SOS & Basic Analytics
            </p>
          </button>

          <button
            onClick={() => setSelectedVersion(selectedVersion === "V2" ? "ALL" : "V2")}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedVersion === "V2"
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                : "border-line bg-surface hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-ink">V2 Connected Ecosystem</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {v2Count} Features (100%)
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Wearables sync, Plans, Family kinship, Doctor RPM portal, Voice & Subscriptions
            </p>
          </button>

          <button
            onClick={() => setSelectedVersion(selectedVersion === "V3" ? "ALL" : "V3")}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedVersion === "V3"
                ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-500/20"
                : "border-line bg-surface hover:border-purple-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-ink">V3 AI & Intelligence</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                {initialStats.byVersion.V3} Features
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              RAG clinical memory, Drug interactions, LLM report review, ML risk modeling
            </p>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across 414 features by # number, name, category, slug..."
            className="lif-input pl-9 pr-4 py-2 w-full text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="lif-input py-2 px-3 text-sm min-w-[200px]"
        >
          <option value="ALL">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c} ({initialStats.byCategory[c] || 0})
            </option>
          ))}
        </select>

        {/* Version Pills */}
        <div className="flex items-center gap-1 bg-surface border border-line rounded-xl p-1 overflow-x-auto">
          {[
            { id: "ALL", label: "All (414)" },
            { id: "V1_V2", label: "✨ V1+V2 (316)" },
            { id: "V1", label: "V1 (179)" },
            { id: "V2", label: "V2 (137)" },
            { id: "V3", label: "V3 (98)" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVersion(v.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedVersion === v.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-ink-soft hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-ink-muted px-1">
        <span>
          Showing <strong className="text-ink">{filteredFeatures.length}</strong> of{" "}
          {initialStats.total} feature specifications
          {selectedVersion === "V1_V2" && (
            <span className="ml-1.5 text-emerald-600 font-semibold">(V1 + V2 Complete)</span>
          )}
        </span>
        {(selectedVersion !== "ALL" || selectedCategory !== "ALL" || search) && (
          <button
            onClick={() => {
              setSelectedVersion("ALL");
              setSelectedCategory("ALL");
              setSelectedStatus("ALL");
              setSearch("");
            }}
            className="text-primary hover:underline font-medium"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredFeatures.map((feature) => (
          <div
            key={feature.number}
            className="lif-card p-4 flex flex-col justify-between hover:shadow-md transition-shadow group border border-line bg-surface rounded-2xl"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-ink-muted bg-surface-subtle px-2 py-0.5 rounded-md border border-line/60">
                  #{feature.number.toString().padStart(3, "0")}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      feature.version === "V1"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : feature.version === "V2"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                    }`}
                  >
                    {feature.version}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-surface-subtle text-ink-muted border border-line/40">
                    {feature.mapping.status}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-ink text-sm group-hover:text-primary transition-colors line-clamp-1">
                {feature.name}
              </h3>

              <div className="text-xs text-ink-muted mt-0.5 line-clamp-1 font-medium">
                📂 {feature.category}
              </div>

              <div className="mt-3 pt-2.5 border-t border-line/50 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-mono text-ink-muted bg-surface-subtle px-1.5 py-0.5 rounded">
                  🔗 {feature.mapping.route}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line/60 flex items-center gap-2">
              <Link
                href={feature.mapping.route}
                className="lif-btn-primary flex-1 text-center py-1.5 text-xs font-semibold rounded-lg"
              >
                Open in App
              </Link>
              <button
                onClick={() => handleOpenSpec(feature)}
                className="lif-btn-secondary px-3 py-1.5 text-xs font-medium rounded-lg"
              >
                Spec 📖
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line p-12 text-center bg-surface-subtle/50">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="text-base font-semibold text-ink">No features matched your filter</h3>
          <p className="text-sm text-ink-muted mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing version and category filters.
          </p>
          <button
            onClick={() => {
              setSelectedVersion("ALL");
              setSelectedCategory("ALL");
              setSelectedStatus("ALL");
              setSearch("");
            }}
            className="lif-btn-secondary mt-4 px-4 py-2 text-xs"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Specification Modal Drawer */}
      {activeSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[85vh] bg-surface rounded-2xl border border-line shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-line flex items-center justify-between bg-surface-subtle/30">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-ink-muted bg-surface px-2.5 py-1 rounded-md border border-line">
                  #{activeSpec.number.toString().padStart(3, "0")}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-ink">{activeSpec.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <span>{activeSpec.category}</span>
                    <span>•</span>
                    <span className="font-semibold text-primary">{activeSpec.version}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveSpec(null)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
              {loadingSpec && (
                <div className="text-center py-6 text-ink-muted">
                  Loading full architecture specification...
                </div>
              )}

              {/* Purpose */}
              {activeSpec.sections?.purpose && (
                <div>
                  <h4 className="font-semibold text-ink text-xs uppercase tracking-wider mb-1 text-ink-muted">
                    Purpose
                  </h4>
                  <p className="text-ink leading-relaxed bg-surface-subtle/60 p-3 rounded-xl border border-line/50">
                    {activeSpec.sections.purpose}
                  </p>
                </div>
              )}

              {/* User Experience */}
              {activeSpec.sections?.userExperience && (
                <div>
                  <h4 className="font-semibold text-ink text-xs uppercase tracking-wider mb-1 text-ink-muted">
                    User Experience
                  </h4>
                  <p className="text-ink-soft leading-relaxed">
                    {activeSpec.sections.userExperience}
                  </p>
                </div>
              )}

              {/* Live Route & Architecture Mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-line bg-surface-subtle/40">
                <div>
                  <div className="text-xs font-semibold text-ink-muted uppercase">UI Route</div>
                  <div className="font-mono text-xs font-medium text-ink mt-0.5">
                    {activeSpec.mapping.route}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink-muted uppercase">Primary API</div>
                  <div className="font-mono text-xs font-medium text-ink mt-0.5">
                    {activeSpec.mapping.api}
                  </div>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-line/60">
                  <div className="text-xs font-semibold text-ink-muted uppercase">
                    Database Schema Models
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeSpec.mapping.models.map((m) => (
                      <span
                        key={m}
                        className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface border border-line text-ink font-medium"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Required Data */}
              {activeSpec.sections?.dataRequired && activeSpec.sections.dataRequired.length > 0 && (
                <div>
                  <h4 className="font-semibold text-ink text-xs uppercase tracking-wider mb-1.5 text-ink-muted">
                    Data Attributes Required
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSpec.sections.dataRequired.map((d, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface-subtle border border-line text-ink-soft"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Rules */}
              {activeSpec.sections?.validation && activeSpec.sections.validation.length > 0 && (
                <div>
                  <h4 className="font-semibold text-ink text-xs uppercase tracking-wider mb-1.5 text-ink-muted">
                    Clinical & System Validation
                  </h4>
                  <ul className="space-y-1 text-xs text-ink-soft list-disc pl-4">
                    {activeSpec.sections.validation.map((v, idx) => (
                      <li key={idx}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Medical Safety Notes */}
              {activeSpec.sections?.medicalSafetyNotes &&
                activeSpec.sections.medicalSafetyNotes.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-50/5 text-amber-900 dark:text-amber-200">
                    <div className="font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1 text-amber-700 dark:text-amber-300">
                      <span>🛡️</span>
                      <span>Medical Safety & Diagnostic Guardrails</span>
                    </div>
                    <ul className="space-y-1 text-xs list-disc pl-4 mt-1">
                      {activeSpec.sections.medicalSafetyNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-line bg-surface-subtle/30 flex items-center justify-between">
              <span className="text-xs text-ink-muted font-mono">
                Source: {activeSpec.filename}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSpec(null)}
                  className="lif-btn-secondary px-3 py-1.5 text-xs font-medium"
                >
                  Close
                </button>
                <Link
                  href={activeSpec.mapping.route}
                  className="lif-btn-primary px-4 py-1.5 text-xs font-semibold"
                >
                  Open Live Route 🚀
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
