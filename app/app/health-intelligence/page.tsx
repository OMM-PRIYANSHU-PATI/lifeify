import { healthIntelligenceEngine } from "@/lib/core-engine";
import { HealthIntelligenceClient } from "./health-intelligence-client";

export const dynamic = "force-dynamic";

export default async function HealthIntelligencePage() {
  // Generate initial synchronous health overview
  const initialOverview = healthIntelligenceEngine.generateOverviewSync("demo_patient_001");

  return <HealthIntelligenceClient initialOverview={initialOverview} />;
}
