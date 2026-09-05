"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POINT_VALUES, calculateNewLevel, BADGE_DEFINITIONS } from "@/lib/rules/domains/gamification";

export async function awardGamificationPoints(actionType: string) {
  const user = await requireUser();
  const addedPoints = POINT_VALUES[actionType] ?? 5;

  const current = await prisma.gamificationProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      points: addedPoints,
      level: 1,
      streak: 1,
    },
    update: {
      points: { increment: addedPoints },
    },
  });

  const newLevel = calculateNewLevel(current.points);
  if (newLevel !== current.level) {
    await prisma.gamificationProfile.update({
      where: { userId: user.id },
      data: { level: newLevel },
    });
  }

  return { points: current.points, level: newLevel };
}

export async function getUserGamificationData() {
  const user = await requireUser();
  const profile = await prisma.gamificationProfile.findUnique({
    where: { userId: user.id },
  });

  const earnedBadges = await prisma.userBadge.findMany({
    where: { userId: user.id },
  });

  return {
    profile: profile ?? { points: 0, level: 1, streak: 0 },
    badges: BADGE_DEFINITIONS.map((def) => ({
      ...def,
      isEarned: earnedBadges.some((b) => b.badgeCode === def.code),
    })),
  };
}
