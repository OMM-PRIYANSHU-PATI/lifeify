import { requireUser } from "@/lib/auth";
import { DoctorSummaryClient } from "./doctor-summary-client";

export const metadata = {
  title: "Doctor Visit Summary | LIFEIFY",
};

export default async function DoctorSummaryPage() {
  await requireUser();
  return <DoctorSummaryClient />;
}
