"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const familySchema = z.object({
  name: z.string().trim().min(2).max(60),
});

export async function createFamilyHouseholdAction(name: string) {
  const user = await requireUser();
  const parsed = familySchema.safeParse({ name });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid family name" };

  const family = await prisma.family.create({
    data: {
      name: parsed.data.name,
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

  await audit({
    userId: user.id,
    action: "FAMILY_CREATE",
    entity: "Family",
    entityId: family.id,
    metadata: { name },
  });

  revalidatePath("/app/family");
  return { ok: true, data: family };
}

export async function inviteFamilyMemberAction(input: {
  familyId: string;
  phone: string;
  name?: string;
  role: "parent" | "child" | "spouse" | "dependent";
}) {
  const user = await requireUser();
  const family = await prisma.family.findFirst({
    where: { id: input.familyId, ownerId: user.id },
  });
  if (!family) return { ok: false, error: "Family household not found or unauthorized" };

  // Find or create user by phone
  let memberUser = await prisma.user.findUnique({
    where: { phone: input.phone },
  });

  if (!memberUser) {
    memberUser = await prisma.user.create({
      data: {
        phone: input.phone,
        name: input.name ?? null,
        role: "user",
      },
    });
  }

  const member = await prisma.familyMember.upsert({
    where: { familyId_userId: { familyId: family.id, userId: memberUser.id } },
    create: {
      familyId: family.id,
      userId: memberUser.id,
      role: input.role,
      status: "ACTIVE",
    },
    update: {
      role: input.role,
      status: "ACTIVE",
    },
  });

  await audit({
    userId: user.id,
    action: "FAMILY_MEMBER_ADD",
    entity: "FamilyMember",
    targetUserId: memberUser.id,
    metadata: { role: input.role },
  });

  revalidatePath("/app/family");
  return { ok: true, data: member };
}

export async function getFamilyHousehold() {
  const user = await requireUser();

  // Find family where user is owner or member
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
            select: { id: true, name: true, phone: true, role: true },
          },
        },
      },
    },
  });

  return family;
}
