import { requireUser } from "@/lib/auth";
import { getActiveFitnessPlan } from "@/lib/actions/fitness";
import { FitnessClient } from "./fitness-client";

export default async function FitnessPage() {
  await requireUser();
  const plan = await getActiveFitnessPlan();

  return <FitnessClient plan={plan} />;
}
