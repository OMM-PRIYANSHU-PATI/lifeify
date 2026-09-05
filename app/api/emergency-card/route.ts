import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const card = await prisma.emergencyMedicalCard.findUnique({
    where: { userId: user.id },
    include: {
      contacts: {
        orderBy: { priority: "asc" },
      },
      accessLogs: {
        orderBy: { accessedAt: "desc" },
        take: 10,
      },
    },
  });

  return NextResponse.json({ ok: true, card });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      bloodGroup,
      allergies, // string or array
      conditions, // string or array
      currentMedications, // string or array
      importantInfo,
      contacts, // array of { name, phone, relation }
    } = body;

    const allergiesJson = typeof allergies === "string" ? allergies : JSON.stringify(allergies || []);
    const conditionsJson = typeof conditions === "string" ? conditions : JSON.stringify(conditions || []);
    const medsJson = typeof currentMedications === "string" ? currentMedications : JSON.stringify(currentMedications || []);

    const existingCard = await prisma.emergencyMedicalCard.findUnique({
      where: { userId: user.id },
    });

    const slug = existingCard?.slug || nanoid(10);

    const card = await prisma.emergencyMedicalCard.upsert({
      where: { userId: user.id },
      update: {
        bloodGroup: bloodGroup ?? undefined,
        allergies: allergiesJson,
        conditions: conditionsJson,
        currentMedications: medsJson,
        importantInfo: importantInfo ?? undefined,
        active: true,
        revoked: false,
      },
      create: {
        userId: user.id,
        slug,
        bloodGroup: bloodGroup ?? null,
        allergies: allergiesJson,
        conditions: conditionsJson,
        currentMedications: medsJson,
        importantInfo: importantInfo ?? null,
        active: true,
        revoked: false,
      },
    });

    // Update contacts if provided
    if (Array.isArray(contacts)) {
      // Clear existing contacts
      await prisma.emergencyContact.deleteMany({
        where: { cardId: card.id },
      });

      // Insert new contacts
      for (let i = 0; i < contacts.length; i++) {
        const c = contacts[i];
        if (!c.name || !c.phone) continue;
        await prisma.emergencyContact.create({
          data: {
            cardId: card.id,
            userId: user.id,
            name: c.name,
            phone: c.phone,
            relation: c.relation || c.relationship || "Emergency Contact",
            relationship: c.relation || c.relationship || "Emergency Contact",
            priority: i + 1,
          },
        });
      }
    }

    await audit({
      userId: user.id,
      action: "EMERGENCY_CARD_UPDATED",
      entity: "EmergencyMedicalCard",
      entityId: card.id,
    });

    const updated = await prisma.emergencyMedicalCard.findUnique({
      where: { id: card.id },
      include: { contacts: true },
    });

    return NextResponse.json({ ok: true, card: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
