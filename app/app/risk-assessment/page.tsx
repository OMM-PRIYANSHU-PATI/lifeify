import { Metadata } from "next";
import { RiskAssessmentClient } from "./risk-assessment-client";

export const metadata: Metadata = {
  title: "Disease Risk Intelligence | LIFEIFY",
  description: "Evidence-based cardiovascular and diabetes risk calculators (IDRS and Framingham CVD).",
};

export default function RiskAssessmentPage() {
  return <RiskAssessmentClient />;
}
