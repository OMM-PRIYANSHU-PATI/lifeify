"use client";

import { useState } from "react";
import {
  createSubscriptionOrderAction,
  verifySubscriptionPaymentAction,
  cancelSubscriptionAction,
} from "@/lib/actions/subscription";

interface SubscriptionClientProps {
  userPlan: "FREE" | "PREMIUM";
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: Date | string | null;
  } | null;
  limits: {
    maxRecords: number;
    maxFamilyMembers: number;
    hasWearableSync: boolean;
    hasAdvancedAnalytics: boolean;
  };
  usage: {
    recordCount: number;
    familyMembersCount: number;
    recordUsage: {
      isHardCapped: boolean;
      isSoftCapped: boolean;
      percentage: number;
    };
  };
  payments: {
    id: string;
    amount: number;
    status: string;
    createdAt: Date | string;
  }[];
}

export function SubscriptionClient({
  userPlan,
  subscription,
  limits,
  usage,
  payments,
}: SubscriptionClientProps) {
  const [selectedDuration, setSelectedDuration] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await createSubscriptionOrderAction(selectedDuration);
      if (!res.ok || !res.order) {
        setMessage("Failed to create checkout order");
        return;
      }

      // Simulate client-side Razorpay flow or complete payment in dev mock mode
      const verifyRes = await verifySubscriptionPaymentAction({
        orderId: res.order.orderId,
        paymentId: `pay_mock_${Date.now()}`,
        signature: "mock_sig_valid",
        duration: selectedDuration,
      });

      if (verifyRes.ok) {
        setMessage("Payment confirmed! Your account has been upgraded to Premium.");
      } else {
        setMessage(verifyRes.error ?? "Payment verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel your Premium subscription?")) {
      await cancelSubscriptionAction();
      setMessage("Subscription cancelled. You will maintain access until current period ends.");
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg border border-primary/30 bg-primary-soft/50 p-4 text-xs font-semibold text-primary-dark">
          {message}
        </div>
      )}

      {/* Current Plan Overview & Usage Alert */}
      <div className="lif-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-ink-muted">Active Tier</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-xl font-extrabold text-ink">{userPlan} Plan</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${userPlan === "PREMIUM" ? "bg-amber-100 text-amber-900" : "bg-ink-muted/10 text-ink-soft"}`}>
                {subscription?.status === "ACTIVE" ? "Active" : "Free Forever"}
              </span>
            </div>
            {subscription?.currentPeriodEnd && (
              <p className="text-xs text-ink-muted mt-1">
                Renews / Valid until: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>

          {userPlan === "PREMIUM" && subscription?.status === "ACTIVE" && (
            <button
              onClick={handleCancel}
              className="text-xs text-crisis hover:underline font-semibold"
            >
              Cancel Renewal
            </button>
          )}
        </div>

        {/* Usage Bar for Free Tier */}
        {userPlan === "FREE" && (
          <div className="rounded-lg bg-surface-subtle p-3 space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-ink">
              <span>Medical Records Storage</span>
              <span>{usage.recordCount} / {limits.maxRecords} records</span>
            </div>
            <div className="w-full bg-line rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${usage.recordUsage.isHardCapped ? "bg-crisis" : usage.recordUsage.isSoftCapped ? "bg-amber-500" : "bg-primary"}`}
                style={{ width: `${Math.min(100, usage.recordUsage.percentage)}%` }}
              />
            </div>
            {usage.recordUsage.isHardCapped ? (
              <p className="text-[11px] font-bold text-crisis">
                ⚠️ Record limit reached (5/5). Upgrade to Premium for unlimited medical file and prescription storage.
              </p>
            ) : usage.recordUsage.isSoftCapped ? (
              <p className="text-[11px] font-semibold text-amber-700">
                Notice: You have used {usage.recordUsage.percentage}% of your free tier record storage.
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Free Plan */}
        <div className={`lif-card flex flex-col justify-between space-y-4 ${userPlan === "FREE" ? "border-primary" : ""}`}>
          <div className="space-y-3">
            <h4 className="font-bold text-ink">Free Tier</h4>
            <div className="text-3xl font-extrabold text-ink">₹0 <span className="text-xs font-normal text-ink-muted">forever</span></div>
            <p className="text-xs text-ink-soft">Essential personal health tracking and medicine adherence.</p>
            <ul className="space-y-2 text-xs text-ink-soft pt-2">
              <li className="flex items-center gap-2">✓ 5 Medical Records & Prescriptions</li>
              <li className="flex items-center gap-2">✓ 1 Household Family Member</li>
              <li className="flex items-center gap-2">✓ Daily Doses & Adherence Check-ins</li>
              <li className="flex items-center gap-2">✓ 10-Minute Doctor Access Codes</li>
              <li className="flex items-center gap-2 text-ink-muted line-through">✕ Google & Apple Wearables Sync</li>
              <li className="flex items-center gap-2 text-ink-muted line-through">✕ 12-Month Bivariate Correlations</li>
            </ul>
          </div>
          <button disabled className="lif-btn-secondary py-2 text-xs font-semibold opacity-60">
            {userPlan === "FREE" ? "Current Plan" : "Downgrade"}
          </button>
        </div>

        {/* Premium Plan */}
        <div className={`lif-card border-2 flex flex-col justify-between space-y-4 ${userPlan === "PREMIUM" ? "border-primary" : "border-amber-400 bg-amber-50/20"}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-ink">Premium Healthcare</h4>
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                Recommended
              </span>
            </div>

            {/* Monthly / Yearly Switch */}
            <div className="flex rounded-lg bg-surface border border-line p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedDuration("monthly")}
                className={`flex-1 py-1 rounded transition-colors ${selectedDuration === "monthly" ? "bg-primary text-white" : "text-ink-soft"}`}
              >
                ₹199 / month
              </button>
              <button
                type="button"
                onClick={() => setSelectedDuration("yearly")}
                className={`flex-1 py-1 rounded transition-colors ${selectedDuration === "yearly" ? "bg-primary text-white" : "text-ink-soft"}`}
              >
                ₹1,499 / year (Save 37%)
              </button>
            </div>

            <div className="text-3xl font-extrabold text-ink">
              {selectedDuration === "monthly" ? "₹199" : "₹1,499"}
              <span className="text-xs font-normal text-ink-muted"> / {selectedDuration === "monthly" ? "month" : "year"}</span>
            </div>

            <ul className="space-y-2 text-xs text-ink pt-2 font-medium">
              <li className="flex items-center gap-2">✓ <strong>Unlimited</strong> Medical Records & Prescriptions</li>
              <li className="flex items-center gap-2">✓ Up to <strong>6 Family Members</strong></li>
              <li className="flex items-center gap-2">✓ <strong>Wearable Sync</strong> (Google Health Connect & Apple Health)</li>
              <li className="flex items-center gap-2">✓ <strong>12-Month Trends</strong> & Pearson Correlation Analytics</li>
              <li className="flex items-center gap-2">✓ Priority OCR & ADR Drug Reaction Reports</li>
              <li className="flex items-center gap-2">✓ Razorpay UPI, Cards & NetBanking</li>
            </ul>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading || userPlan === "PREMIUM"}
            className="lif-btn-primary w-full py-2.5 text-xs font-bold shadow-md shadow-primary/20"
          >
            {userPlan === "PREMIUM" ? "Plan Active" : loading ? "Processing..." : `Upgrade via Razorpay (${selectedDuration === "monthly" ? "₹199/mo" : "₹1,499/yr"})`}
          </button>
        </div>
      </div>

      {/* Payment Invoices */}
      <div className="lif-card space-y-3">
        <h3 className="font-bold text-sm text-ink">Payment Invoices & Receipts</h3>
        {payments.length === 0 ? (
          <p className="text-xs text-ink-muted py-4 text-center">No payment transactions recorded.</p>
        ) : (
          <div className="divide-y divide-line/60 text-xs">
            {payments.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">LIFEIFY Premium Subscription</p>
                  <p className="text-[11px] text-ink-muted">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-dark">₹{p.amount / 100}</p>
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
