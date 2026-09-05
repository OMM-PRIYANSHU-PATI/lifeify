import { requireUser } from "@/lib/auth";
import { getConnectedDevices, getRecentSyncedMetrics } from "@/lib/actions/wearables";
import { WearablesClient } from "./wearables-client";

export default async function WearablesPage() {
  await requireUser();
  const devices = await getConnectedDevices();
  const recentMetrics = await getRecentSyncedMetrics(20);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Wearables & Health Platforms</h1>
        <p className="text-sm text-ink-soft">
          Connect your smartwatches, continuous monitors, and mobile health platforms for unified synchronization.
        </p>
      </div>

      <WearablesClient devices={devices} recentMetrics={recentMetrics} />
    </div>
  );
}
