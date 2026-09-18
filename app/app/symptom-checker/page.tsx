import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, Stethoscope } from "lucide-react";
import { SymptomCheckerClient } from "./symptom-checker-client";

export const metadata: Metadata = {
  title: "Clinical Symptom Triage & AI Diagnosis | LIFEIFY",
  description:
    "Deterministic algorithmic symptom triage screening and Gemini AI diagnostic reasoning across 8,724 conditions.",
};

export default function SymptomCheckerPage() {
  return (
    <div className="space-y-6">
      {/* Launch Gemini Symptom to Disease Banner */}
      <div className="mx-auto max-w-4xl p-5 rounded-3xl border border-line bg-gradient-to-r from-primary/10 via-teal-500/5 to-purple-500/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              AI Diagnostic Reasoning
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-primary text-white">
              GEMINI FLASH
            </span>
          </div>
          <h2 className="text-base font-bold tracking-tight text-ink">
            Advanced Symptom to Disease Analyzer
          </h2>
          <p className="text-xs text-ink-muted max-w-xl">
            Want ranked differential probabilities, pathophysiological rationale, and interactive doctor follow-up questions across 8,724 disease conditions?
          </p>
        </div>

        <Link
          href="/app/symptom-to-disease"
          className="lif-btn-primary py-2.5 px-4 text-xs font-bold whitespace-nowrap shadow-sm flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <span>Open Symptom to Disease AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <SymptomCheckerClient />
    </div>
  );
}
