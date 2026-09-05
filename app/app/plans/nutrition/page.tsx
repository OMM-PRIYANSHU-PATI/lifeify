import { requireUser } from "@/lib/auth";
import { getActiveNutritionPlan } from "@/lib/actions/nutrition";
import { NutritionClient } from "./nutrition-client";

export default async function NutritionPage() {
  await requireUser();
  const data = await getActiveNutritionPlan();

  return (
    <NutritionClient
      plan={data.plan}
      consumed={data.consumed}
      todayLogs={data.todayLogs}
      indianFoods={data.indianFoods}
    />
  );
}
