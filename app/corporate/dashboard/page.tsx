import { Metadata } from "next";
import { CorporateDashboardClient } from "./corporate-client";

export const metadata: Metadata = {
  title: "Corporate Wellness Dashboard | LIFEIFY",
  description: "B2B enterprise corporate health challenges, privacy-preserving aggregate metrics, and team leaderboards.",
};

export default function CorporateDashboardPage() {
  return <CorporateDashboardClient />;
}
