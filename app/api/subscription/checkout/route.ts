import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { plan = "PREMIUM", billingCycle = "monthly" } = body;

    const priceRupees = billingCycle === "annual" ? 4999 : 499;
    const receiptId = `rcpt_${user.id.slice(-6)}_${Date.now()}`;

    const order = await createRazorpayOrder(priceRupees, receiptId);

    await audit({
      userId: user.id,
      action: "SUBSCRIPTION_CHECKOUT_INITIATED",
      entity: "Payment",
      metadata: { plan, billingCycle, amount: order.amount, orderId: order.orderId },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      isMock: order.isMock,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
