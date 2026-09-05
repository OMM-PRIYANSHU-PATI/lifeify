import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, phone, role = "dependent", familyId: passedFamilyId } = body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Valid 10-digit mobile number required" }, { status: 400 });
    }

    // Find or create family for user
    let familyId = passedFamilyId;
    if (!familyId) {
      let fam = await prisma.family.findFirst({
        where: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      });

      if (!fam) {
        fam = await prisma.family.create({
          data: {
            name: `${user.name || "My"} Family`,
            ownerId: user.id,
            members: {
              create: {
                userId: user.id,
                role: "self",
                status: "ACTIVE",
              },
            },
          },
        });
      }
      familyId = fam.id;
    }

    // Find or create target user
    let targetUser = await prisma.user.findUnique({ where: { phone } });
    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          phone,
          name: name || "Family Member",
          role: "user",
        },
      });
    }

    const member = await prisma.familyMember.upsert({
      where: {
        familyId_userId: {
          familyId,
          userId: targetUser.id,
        },
      },
      create: {
        familyId,
        userId: targetUser.id,
        role,
        status: "ACTIVE",
      },
      update: {
        role,
        status: "ACTIVE",
      },
    });

    await audit({
      userId: user.id,
      action: "FAMILY_MEMBER_INVITED",
      entity: "FamilyMember",
      entityId: member.id,
      metadata: { phone, role },
    });

    return NextResponse.json({ ok: true, member, familyId }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
