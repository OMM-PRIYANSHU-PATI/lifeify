import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDoctorConsultationData } from "@/lib/actions/doctor";
import { DoctorChartClient } from "./doctor-chart-client";

export default async function DoctorPatientViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const patient = await getDoctorConsultationData(id);

  if (!patient) {
    redirect("/doctor/access");
  }

  return <DoctorChartClient patient={patient} />;
}
