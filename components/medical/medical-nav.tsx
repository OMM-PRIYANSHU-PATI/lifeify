"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Network,
  Activity,
  Layers,
  Search,
  BookOpen,
  BarChart3,
  Stethoscope,
  Info,
  ChevronRight,
  Sparkles,
  HeartPulse,
  X,
  GitCompare,
  Database,
  FlaskConical,
  Gamepad2,
  Flame,
} from "lucide-react";
import type { SearchResultItem } from "@/lib/medical/server-data";

import { GeminiFloatingButton } from "@/components/medical/gemini-ai-assistant";

export function MedicalNav({
  onSelectSearchResult,
}: {
  onSelectSearchResult?: (item: SearchResultItem) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isResearchMode, setIsResearchMode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/medical/search?q=${encodeURIComponent(query.trim())}&limit=12`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const navItems = [
    { href: "/app/dashboard", label: "Health OS", icon: HeartPulse, highlight: true },
    { href: "/symptom-to-disease", label: "🩺 Symptom AI", icon: Stethoscope, highlight: true },
    { href: "/future-disease-predictor", label: "🔮 Predictor", icon: Sparkles, highlight: true },
    { href: "/features", label: "316 Features", icon: Layers },
    { href: "/diagnostic-arena", label: "Arena", icon: Flame },
    { href: "/tree", label: "Knowledge Graph", icon: Network },
    { href: "/rpg-quest", label: "RPG Quest", icon: Gamepad2 },
    { href: "/symptom-analyzer", label: "Inference", icon: FlaskConical },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/diseases", label: "Diseases", icon: BookOpen },
    { href: "/symptoms", label: "Symptoms", icon: Activity },
    { href: "/triage", label: "Triage", icon: Stethoscope },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleItemClick = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery("");
    if (onSelectSearchResult) {
      onSelectSearchResult(item);
    } else {
      if (item.type === "disease") {
        router.push(`/diseases?select=${encodeURIComponent(item.code || item.id)}`);
      } else if (item.type === "symptom") {
        router.push(`/symptoms?select=${encodeURIComponent(item.id)}`);
      } else {
        router.push(`/tree?search=${encodeURIComponent(item.name)}`);
      }
    }
  };

  const getTypeBadge = (type: SearchResultItem["type"]) => {
    switch (type) {
      case "disease":
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">DISEASE</span>;
      case "symptom":
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">SYMPTOM</span>;
      case "category":
        return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">CATEGORY</span>;
      case "subcategory":
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">SUBCATEGORY</span>;
      case "organ_system":
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">ORGAN SYSTEM</span>;
      default:
        return <span className="bg-slate-500/20 text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-mono">NODE</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-400 transition">
                    Lifeify
                  </span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-semibold tracking-wider uppercase">
                    Knowledge Graph V2
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  8,724 Diseases · 377 Symptoms
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar with Autocomplete */}
          <div className="flex-1 max-w-sm relative" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Search diseases, symptoms, codes, categories..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-900/90 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition shadow-inner"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Autocomplete Results */}
            {isOpen && query.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-slate-800 animate-fadeIn">
                <div className="p-2 bg-slate-950/80 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>Results for &quot;{query}&quot;</span>
                  {isLoading && <span className="text-cyan-400 animate-pulse">Searching...</span>}
                </div>
                {results.length === 0 && !isLoading && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching diseases, symptoms or categories found.
                  </div>
                )}
                {results.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleItemClick(item)}
                    className="w-full text-left p-2.5 hover:bg-slate-800/80 transition flex items-start justify-between gap-2 group"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(item.type)}
                        {item.code && (
                          <span className="text-[11px] font-mono text-slate-400 font-medium">
                            [{item.code}]
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                          {item.name}
                        </span>
                      </div>
                      {item.snippet && (
                        <p className="text-[11px] text-slate-400 truncate pl-0.5">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold"
                      : item.highlight
                      ? "bg-slate-800/70 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 border border-slate-700/50"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile & Tablet Subnav */}
        <div className="xl:hidden flex items-center gap-1 py-2 overflow-x-auto border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap shrink-0 transition ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 bg-slate-900/60"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <GeminiFloatingButton />
    </header>
  );
}
