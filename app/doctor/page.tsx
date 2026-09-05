import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DoctorRootPage() {
  const user = await getCurrentUser();
  if (user?.role === "DOCTOR") {
    redirect("/doctor/rpm");
  }
  redirect("/app/doctor");
}
