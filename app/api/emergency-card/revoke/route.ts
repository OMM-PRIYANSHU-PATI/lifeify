import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const card = await prisma.emergencyMedicalCard.findUnique({
    where: { userId: user.id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.emergencyMedicalCard.update({
    where: { id: card.id },
    data: {
      revoked: true,
      active: false,
    },
  });

  await audit({
    userId: user.id,
    action: "EMERGENCY_CARD_REVOKED",
    entity: "EmergencyMedicalCard",
    entityId: card.id,
  });

  return NextResponse.json({ ok: true, message: "Emergency card link revoked immediately" });
}
