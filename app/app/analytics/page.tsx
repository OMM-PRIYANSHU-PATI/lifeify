import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { computeAnalytics } from "@/services/analytics";
import { AnalyticsClient } from "@/app/features/analytics/analytics-client";

export const metadata = {
  title: "Health Analytics & Insights | LIFEIFY",
};

export default async function AppAnalyticsPage() {
  const user = await getCurrentUser();
  const data = await computeAnalytics(user?.id, "30d");
  return <AnalyticsClient initialData={{ ok: true, ...data }} />;
}
