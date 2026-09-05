import { requireUser } from "@/lib/auth";
import { getActiveSleepPlan } from "@/lib/actions/sleep";
import { SleepClient } from "./sleep-client";

export default async function SleepPage() {
  await requireUser();
  const plan = await getActiveSleepPlan();

  return <SleepClient plan={plan} />;
}
