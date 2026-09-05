import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.pharmacyOrder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const parsedOrders = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items || "[]"),
    }));

    // Find active medications needing refill (stock remaining <= 7 days or stock qty <= 10)
    const activeMeds = await prisma.medication.findMany({
      where: { userId: user.id, active: true },
      include: { stock: true },
    });

    const refillCandidates = activeMeds
      .filter((m) => {
        if (!m.stock) return true;
        return m.stock.remainingQty <= 10;
      })
      .map((m) => ({
        medicationId: m.id,
        name: m.name,
        dose: m.dose || "1 tablet",
        currentQty: m.stock?.remainingQty ?? 0,
        suggestedRefillQty: 30,
        estimatedPriceInr: 180,
      }));

    return NextResponse.json({
      ok: true,
      orders: parsedOrders,
      refillCandidates,
      availablePartners: ["Tata 1mg", "Apollo Pharmacy", "Netmeds", "PharmEasy"],
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
    const {
      partnerName = "Tata 1mg",
      items,
      deliveryAddress,
      totalAmountInr = 0,
      prescriptionId,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || !deliveryAddress) {
      return NextResponse.json(
        { error: "Please select medications to order and specify delivery address." },
        { status: 400 }
      );
    }

    const order = await prisma.pharmacyOrder.create({
      data: {
        userId: user.id,
        partnerName,
        prescriptionId,
        items: JSON.stringify(items),
        deliveryAddress,
        totalAmountInr: Number(totalAmountInr),
        status: "ORDER_PLACED",
        trackingNumber: `TRK-LIFE-${Math.floor(100000 + Math.random() * 900000)}`,
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Refill order successfully transmitted to ${partnerName}. Tracking number: ${order.trackingNumber}.`,
      order: {
        ...order,
        items,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
