import { requireUser } from "@/lib/auth";
import { getFamilyHousehold } from "@/lib/actions/family";
import { getActiveCaregiverGrants } from "@/lib/actions/caregivers";
import { FamilyClient } from "./family-client";

export default async function FamilyPage() {
  await requireUser();
  const family = await getFamilyHousehold();
  const caregiverGrants = await getActiveCaregiverGrants();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Family & Caregivers</h1>
        <p className="text-sm text-ink-soft">
          Manage your household, support dependent health tracking, and delegate time-bound caregiver permissions.
        </p>
      </div>

      <FamilyClient family={family} caregiverGrants={caregiverGrants} />
    </div>
  );
}
