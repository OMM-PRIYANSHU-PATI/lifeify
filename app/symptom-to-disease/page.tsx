import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { MedicalNav } from "@/components/medical/medical-nav";
import { MedicalDisclaimer } from "@/components/medical/medical-disclaimer";
import { getSymptoms } from "@/lib/medical/server-data";
import { analyzeSymptomsWithGemini } from "@/lib/medical/gemini-symptom-analyzer";
import { SymptomToDiseaseClient } from "@/app/app/symptom-to-disease/symptom-to-disease-client";

export const metadata: Metadata = {
  title: "Symptom to Disease Analyzer | Gemini AI Clinical Differential | LIFEIFY",
  description:
    "Evaluate symptoms across 8,724 disease conditions using Google Gemini Flash AI. Ranked differential diagnosis, red flags, and clinical questions.",
};

export default async function PublicSymptomToDiseasePage() {
  const allSymptoms = getSymptoms();
  const availableSymptoms = allSymptoms.map((s) => ({
    id: s.id,
    name: s.name,
    organSystem: s.organSystem,
  }));

  const initialResult = await analyzeSymptomsWithGemini({
    symptoms: ["Fever", "Cough", "Fatigue"],
    severity: 6,
    durationDays: 3,
    age: 35,
  });

  return (
    <div className="min-h-screen bg-background text-ink selection:bg-primary-soft selection:text-primary-dark">
      <MedicalNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Breadcrumb banner */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Symptom to Disease Analyzer</span>
          </div>

          <Link
            href="/app/symptom-to-disease"
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-soft text-primary-dark hover:bg-primary/20 transition-colors"
          >
            Launch in Health OS →
          </Link>
        </div>

        <SymptomToDiseaseClient
          initialResult={initialResult}
          availableSymptoms={availableSymptoms}
        />

        <div className="mt-12">
          <MedicalDisclaimer />
        </div>
      </main>
    </div>
  );
}
