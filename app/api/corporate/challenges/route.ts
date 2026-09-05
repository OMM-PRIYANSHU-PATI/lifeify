import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find organizations user belongs to
    let memberships = await prisma.orgMember.findMany({
      where: { userId: user.id },
      include: { organization: true },
    });

    // If user has no membership yet in seed/demo, auto-enroll into demo org "Acme Health"
    if (memberships.length === 0) {
      let demoOrg = await prisma.organization.findUnique({
        where: { code: "ACME-CORP" },
      });

      if (!demoOrg) {
        demoOrg = await prisma.organization.create({
          data: {
            name: "Acme Innovations Corporate",
            code: "ACME-CORP",
            domain: "acme.example.com",
            plan: "ENTERPRISE",
          },
        });

        // Seed initial wellness challenge
        await prisma.wellnessChallenge.create({
          data: {
            orgId: demoOrg.id,
            title: "10,000 Daily Steps Corporate Cup",
            description: "Achieve 10,000 steps daily for 30 consecutive days to boost team cardiovascular fitness.",
            type: "STEPS",
            targetValue: 300000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const newMember = await prisma.orgMember.create({
        data: {
          orgId: demoOrg.id,
          userId: user.id,
          department: "Engineering",
          anonymizedId: `EMP-${user.id.slice(-4).toUpperCase()}`,
        },
        include: { organization: true },
      });

      memberships = [newMember];
    }

    const orgIds = memberships.map((m) => m.orgId);

    const challenges = await prisma.wellnessChallenge.findMany({
      where: {
        orgId: { in: orgIds },
        active: true,
      },
      include: {
        organization: {
          select: { name: true, code: true },
        },
        participants: {
          include: {
            member: {
              select: {
                anonymizedId: true,
                department: true,
                userId: true,
              },
            },
          },
          orderBy: { currentValue: "desc" },
          take: 15,
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({
      ok: true,
      memberships,
      challenges,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, challengeId, incrementValue = 0, title, description, type = "STEPS", targetValue = 100000, orgId } = body;

    if (action === "JOIN") {
      // Find member record
      const member = await prisma.orgMember.findFirst({
        where: { userId: user.id },
      });

      if (!member) {
        return NextResponse.json({ error: "You are not an enrolled member of an organization." }, { status: 400 });
      }

      const existingParticipant = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_memberId: {
            challengeId,
            memberId: member.id,
          },
        },
      });

      if (existingParticipant) {
        return NextResponse.json({ ok: true, participant: existingParticipant });
      }

      const participant = await prisma.challengeParticipant.create({
        data: {
          challengeId,
          memberId: member.id,
          currentValue: 0,
        },
      });

      return NextResponse.json({ ok: true, participant });
    }

    if (action === "LOG_PROGRESS") {
      const member = await prisma.orgMember.findFirst({
        where: { userId: user.id },
      });

      if (!member) {
        return NextResponse.json({ error: "Member profile not found." }, { status: 400 });
      }

      const participant = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_memberId: {
            challengeId,
            memberId: member.id,
          },
        },
      });

      if (!participant) {
        return NextResponse.json({ error: "Please join the challenge first." }, { status: 400 });
      }

      const updated = await prisma.challengeParticipant.update({
        where: { id: participant.id },
        data: {
          currentValue: { increment: Number(incrementValue) },
        },
      });

      return NextResponse.json({ ok: true, participant: updated });
    }

    if (action === "CREATE") {
      if (!title || !targetValue || !orgId) {
        return NextResponse.json({ error: "Missing required fields for creating challenge." }, { status: 400 });
      }

      const newChallenge = await prisma.wellnessChallenge.create({
        data: {
          orgId,
          title,
          description,
          type,
          targetValue: Number(targetValue),
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json({ ok: true, challenge: newChallenge });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
