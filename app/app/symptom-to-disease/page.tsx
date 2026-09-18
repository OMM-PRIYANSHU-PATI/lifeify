import { Metadata } from "next";
import { getSymptoms } from "@/lib/medical/server-data";
import { analyzeSymptomsWithGemini } from "@/lib/medical/gemini-symptom-analyzer";
import { SymptomToDiseaseClient } from "./symptom-to-disease-client";

export const metadata: Metadata = {
  title: "Symptom to Disease Analyzer | LIFEIFY Health OS",
  description:
    "AI-powered clinical differential diagnostic analyzer combining Google Gemini Flash with the 8,724-condition Biomedical Knowledge Graph.",
};

export default async function SymptomToDiseasePage() {
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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <SymptomToDiseaseClient
        initialResult={initialResult}
        availableSymptoms={availableSymptoms}
      />
    </div>
  );
}
