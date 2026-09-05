import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { computeAnalytics } from "@/services/analytics";
import { AnalyticsClient } from "./analytics-client";

export const metadata = {
  title: "Health Analytics & Insights | LIFEIFY Features",
  description:
    "Comprehensive health analytics, 12-month longitudinal trends, adherence curves, non-AI statistical correlations, and personal baselines.",
};

export default async function FeaturesAnalyticsPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/app/analytics");
  }

  const initialData = await computeAnalytics(undefined, "30d");

  return (
    <div className="min-h-screen bg-background text-ink p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <AnalyticsClient initialData={{ ok: true, ...initialData }} />
    </div>
  );
}
