import { requireUser } from "@/lib/auth";
import { getUserSubscriptionData } from "@/lib/actions/subscription";
import { SubscriptionClient } from "./subscription-client";

export default async function SubscriptionPage() {
  await requireUser();
  const data = await getUserSubscriptionData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Subscription & Entitlements</h1>
        <p className="text-sm text-ink-soft">
          Transparent healthcare plans powered by Razorpay. UPI, Card, and NetBanking supported.
        </p>
      </div>

      <SubscriptionClient
        userPlan={data.userPlan}
        subscription={data.subscription}
        limits={data.limits}
        usage={data.usage}
        payments={data.payments}
      />
    </div>
  );
}
