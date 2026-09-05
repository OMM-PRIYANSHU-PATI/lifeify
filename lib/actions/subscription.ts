"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { PLAN_LIMITS, checkUsageStatus } from "@/lib/payments/entitlements";

export async function createSubscriptionOrderAction(duration: "monthly" | "yearly") {
  const user = await requireUser();
  const amountRupees = duration === "monthly" ? 199 : 1499;

  const order = await createRazorpayOrder(amountRupees, `lifeify_${user.id}_${duration}`);

  await prisma.payment.create({
    data: {
      userId: user.id,
      providerPaymentId: order.orderId,
      amount: order.amount,
      currency: "INR",
      status: "CREATED",
      method: "RAZORPAY",
    },
  });

  return { ok: true, order, duration };
}

export async function verifySubscriptionPaymentAction(input: {
  orderId: string;
  paymentId: string;
  signature?: string;
  duration: "monthly" | "yearly";
}) {
  const user = await requireUser();
  const isValid = verifyRazorpaySignature(input.orderId, input.paymentId, input.signature ?? "mock_sig");

  if (!isValid) {
    return { ok: false, error: "Payment verification failed: invalid signature" };
  }

  const periodEnd = new Date();
  if (input.duration === "monthly") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  // Update subscription & user plan
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { plan: "PREMIUM" },
    }),
    prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: "PREMIUM",
        status: "ACTIVE",
        provider: "razorpay",
        providerSubId: input.orderId,
        currentPeriodEnd: periodEnd,
      },
      update: {
        plan: "PREMIUM",
        status: "ACTIVE",
        currentPeriodEnd: periodEnd,
      },
    }),
    prisma.payment.updateMany({
      where: { userId: user.id, providerPaymentId: input.orderId },
      data: {
        status: "PAID",
        invoiceUrl: `/api/invoices/${input.orderId}`,
      },
    }),
  ]);

  await audit({
    userId: user.id,
    action: "SUBSCRIPTION_UPGRADED",
    entity: "Subscription",
    metadata: { plan: "PREMIUM", duration: input.duration, expiresAt: periodEnd },
  });

  revalidatePath("/app/subscription");
  revalidatePath("/app/dashboard");
  return { ok: true, message: "Welcome to LIFEIFY Premium!" };
}

export async function cancelSubscriptionAction() {
  const user = await requireUser();

  await prisma.subscription.updateMany({
    where: { userId: user.id },
    data: { status: "CANCELLED" },
  });

  await audit({
    userId: user.id,
    action: "SUBSCRIPTION_CANCELLED",
    entity: "Subscription",
  });

  revalidatePath("/app/subscription");
  return { ok: true, message: "Subscription cancelled. Access remains until period end." };
}

export async function getUserSubscriptionData() {
  const user = await requireUser();

  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  const recordCount = await prisma.medicalRecord.count({
    where: { userId: user.id },
  });

  const familyMembersCount = await prisma.familyMember.count({
    where: { family: { ownerId: user.id } },
  });

  const currentPlan: "FREE" | "PREMIUM" = (sub?.plan === "PREMIUM" && sub.status === "ACTIVE") ? "PREMIUM" : "FREE";
  const limits = PLAN_LIMITS[currentPlan];

  const recordUsage = checkUsageStatus(recordCount, limits.maxRecords);

  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    userPlan: currentPlan,
    subscription: sub,
    limits,
    usage: {
      recordCount,
      familyMembersCount,
      recordUsage,
    },
    payments,
  };
}
