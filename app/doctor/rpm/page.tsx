import { Metadata } from "next";
import { DoctorRpmClient } from "./rpm-client";

export const metadata: Metadata = {
  title: "Doctor RPM Workstation | LIFEIFY",
  description: "Physician Remote Patient Monitoring workstation, vital alarms, and clinical time tracking.",
};

export default function DoctorRpmPage() {
  return <DoctorRpmClient />;
}
