import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const family = await prisma.family.findFirst({
    where: {
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      members: {
        include: {
          user: {
            include: {
              profile: true,
              medications: { where: { active: true } },
              checkIns: { orderBy: { date: "desc" }, take: 1 },
              emergencyCard: true,
            },
          },
        },
      },
    },
  });

  if (!family) {
    return NextResponse.json({ ok: true, family: null, members: [] });
  }

  const memberSummaries = family.members.map((m) => {
    const u = m.user;
    const activeMedsCount = u.medications?.length || 0;
    const latestCheckin = u.checkIns?.[0];

    return {
      memberId: m.id,
      userId: u.id,
      name: u.name || "Family Member",
      phone: u.phone,
      role: m.role,
      status: m.status,
      activeMedsCount,
      lastCheckinDate: latestCheckin?.date ? latestCheckin.date.toISOString().slice(0, 10) : null,
      hasEmergencyCard: !!u.emergencyCard?.active,
      bloodGroup: u.profile?.bloodGroup || u.emergencyCard?.bloodGroup || "—",
    };
  });

  return NextResponse.json({
    ok: true,
    family: {
      id: family.id,
      name: family.name,
      ownerId: family.ownerId,
    },
    members: memberSummaries,
  });
}
