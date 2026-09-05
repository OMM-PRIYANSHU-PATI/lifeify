import { requireUser } from "@/lib/auth";
import { ConditionsClient } from "./conditions-client";

export const metadata = {
  title: "Chronic Conditions & Vitals | LIFEIFY",
};

export default async function ConditionsPage() {
  await requireUser();
  return <ConditionsClient />;
}
