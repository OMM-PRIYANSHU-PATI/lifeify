import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, checkUsageStatus } from "@/lib/payments/entitlements";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentPlan = (user.plan === "PREMIUM" ? "PREMIUM" : "FREE") as "FREE" | "PREMIUM";
  const limits = PLAN_LIMITS[currentPlan];

  const [recordsCount, familyMembersCount, connectedWearablesCount] = await Promise.all([
    prisma.medicalRecord.count({ where: { userId: user.id } }),
    prisma.familyMember.count({
      where: {
        family: { ownerId: user.id },
      },
    }),
    prisma.healthDataSource.count({
      where: { userId: user.id, status: "CONNECTED" },
    }),
  ]);

  const recordStatus = checkUsageStatus(recordsCount, limits.maxRecords);
  const familyStatus = checkUsageStatus(familyMembersCount, limits.maxFamilyMembers);

  return NextResponse.json({
    ok: true,
    plan: currentPlan,
    entitlements: limits,
    usage: {
      records: {
        current: recordsCount,
        limit: limits.maxRecords,
        ...recordStatus,
      },
      familyMembers: {
        current: familyMembersCount,
        limit: limits.maxFamilyMembers,
        ...familyStatus,
      },
      wearables: {
        connected: connectedWearablesCount > 0,
        allowed: limits.hasWearableSync,
      },
      hasAdvancedAnalytics: limits.hasAdvancedAnalytics,
    },
  });
}
