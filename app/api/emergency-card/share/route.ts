import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let card = await prisma.emergencyMedicalCard.findUnique({
      where: { userId: user.id },
    });

    if (!card) {
      card = await prisma.emergencyMedicalCard.create({
        data: {
          userId: user.id,
          slug: nanoid(10),
          active: true,
          revoked: false,
        },
      });
    } else if (card.revoked) {
      card = await prisma.emergencyMedicalCard.update({
        where: { id: card.id },
        data: {
          slug: nanoid(10),
          active: true,
          revoked: false,
        },
      });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const shareUrl = `${protocol}://${host}/emergency/${card.slug}`;

    const qrDataUrl = await QRCode.toDataURL(shareUrl, { width: 300, margin: 2 });

    return NextResponse.json({
      ok: true,
      slug: card.slug,
      shareUrl,
      qrDataUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
