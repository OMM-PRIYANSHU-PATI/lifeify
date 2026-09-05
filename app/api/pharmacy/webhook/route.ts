import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, trackingNumber } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    const order = await prisma.pharmacyOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.pharmacyOrder.update({
      where: { id: orderId },
      data: {
        status,
        ...(trackingNumber ? { trackingNumber } : {}),
      },
    });

    // If order was delivered, automatically replenish medication stock in database
    if (status === "DELIVERED") {
      const items: Array<{ medicationId?: string; name: string; qty: number }> = JSON.parse(
        order.items || "[]"
      );

      for (const item of items) {
        if (item.medicationId) {
          const medStock = await prisma.medicationStock.findUnique({
            where: { medicationId: item.medicationId },
          });

          if (medStock) {
            await prisma.medicationStock.update({
              where: { medicationId: item.medicationId },
              data: {
                remainingQty: { increment: Number(item.qty) || 30 },
                lastRefillAt: new Date(),
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Order status updated to ${status}.`,
      order: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
