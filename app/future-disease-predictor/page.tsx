import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { MedicalNav } from "@/components/medical/medical-nav";
import { MedicalDisclaimer } from "@/components/medical/medical-disclaimer";
import {
  predictFutureDiseases,
  FutureDiseasePredictorInputs,
} from "@/lib/rules/risk-scores/future-disease-predictor";
import { FutureDiseasePredictorClient } from "@/app/app/future-disease-predictor/future-disease-predictor-client";

export const metadata: Metadata = {
  title: "Future Disease Predictor & Longitudinal Risk Forecast | LIFEIFY",
  description:
    "Evidence-based future disease predictor for Type 2 Diabetes, ASCVD Heart Attack, Hypertension, Fatty Liver (MASLD), CKD, and Stroke with interactive What-If simulation.",
};

export default function PublicFutureDiseasePredictorPage() {
  const defaultInputs: FutureDiseasePredictorInputs = {
    age: 40,
    gender: "MALE",
    heightCm: 175,
    weightKg: 82,
    waistCircumferenceCm: 91,
    systolicBp: 130,
    diastolicBp: 84,
    restingHeartRate: 74,
    fastingGlucoseMgDl: 106,
    hba1cPercent: 5.8,
    totalCholesterolMgDl: 210,
    hdlCholesterolMgDl: 42,
    triglyceridesMgDl: 170,
    serumCreatinineMgDl: 0.95,
    familyDiabetes: "ONE_PARENT",
    familyPrematureCad: true,
    familyHypertension: true,
    familyStroke: false,
    familyCkd: false,
    dailySteps: 4800,
    sleepHours: 6.5,
    smokingStatus: "NEVER",
    alcoholFrequency: "OCCASIONAL",
    dietType: "BALANCED",
    stressLevel: 7,
    symptoms: {
      postMealBrainFog: true,
      unexplainedFatigue: true,
    },
  };

  const initialReport = predictFutureDiseases(defaultInputs);

  return (
    <div className="min-h-screen bg-background text-ink selection:bg-primary-soft selection:text-primary-dark">
      <MedicalNav />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Breadcrumb banner */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Future Disease Predictor</span>
          </div>

          <Link
            href="/app/future-disease-predictor"
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-soft text-primary-dark hover:bg-primary/20 transition-colors"
          >
            Launch in Health OS →
          </Link>
        </div>

        <FutureDiseasePredictorClient
          initialInputs={defaultInputs}
          initialReport={initialReport}
        />

        <div className="mt-12">
          <MedicalDisclaimer />
        </div>
      </main>
    </div>
  );
}
