import { requireUser } from "@/lib/auth";
import { EmergencyCardClient } from "./emergency-client";

export const metadata = {
  title: "Emergency Medical Card | LIFEIFY",
};

export default async function EmergencyCardPage() {
  await requireUser();
  return <EmergencyCardClient />;
}
