import { Metadata } from "next";
import { SymptomCheckerClient } from "./symptom-checker-client";

export const metadata: Metadata = {
  title: "Clinical Symptom Triage | LIFEIFY",
  description: "Deterministic algorithmic symptom triage screening engine based on validated clinical safety pathways.",
};

export default function SymptomCheckerPage() {
  return <SymptomCheckerClient />;
}
