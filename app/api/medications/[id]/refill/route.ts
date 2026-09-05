import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const qty = Number(body.qty);

    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "Please specify a positive refill quantity" }, { status: 400 });
    }

    const stock = await prisma.medicationStock.findFirst({
      where: { medicationId: id, userId: user.id },
    });

    if (!stock) {
      // Create new stock if not exists
      const newStock = await prisma.medicationStock.create({
        data: {
          medicationId: id,
          userId: user.id,
          initialQuantity: qty,
          initialQty: qty,
          remainingQty: qty,
          unit: body.unit || "tablets",
          lastRefillAt: new Date(),
        },
      });
      return NextResponse.json({ ok: true, stock: newStock });
    }

    const updated = await prisma.medicationStock.update({
      where: { id: stock.id },
      data: {
        remainingQty: stock.remainingQty + qty,
        initialQuantity: stock.initialQuantity + qty,
        initialQty: (stock.initialQty ?? stock.initialQuantity) + qty,
        lastRefillAt: new Date(),
      },
    });

    await audit({
      userId: user.id,
      action: "STOCK_REFILLED",
      entity: "Medication",
      entityId: id,
      metadata: { addedQty: qty, totalQty: updated.remainingQty },
    });

    return NextResponse.json({ ok: true, stock: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
