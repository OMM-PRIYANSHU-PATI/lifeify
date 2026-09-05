import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.labBooking.findMany({
      where: { userId: user.id },
      include: { test: true },
      orderBy: { createdAt: "desc" },
    });

    const parsed = bookings.map((b) => ({
      ...b,
      resultSummary: b.resultSummary ? JSON.parse(b.resultSummary) : null,
    }));

    return NextResponse.json({ ok: true, bookings: parsed });
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
      testId,
      partnerName = "Thyrocare",
      scheduledDate,
      timeSlot = "07:00 AM - 09:00 AM",
      address,
      patientName,
      patientPhone,
    } = body;

    if (!testId || !scheduledDate || !address || !patientName || !patientPhone) {
      return NextResponse.json(
        { error: "Missing required booking details (test, date, address, contact)." },
        { status: 400 }
      );
    }

    const test = await prisma.labTestCatalog.findUnique({
      where: { id: testId },
    });

    if (!test) {
      return NextResponse.json({ error: "Test catalog item not found." }, { status: 404 });
    }

    const booking = await prisma.labBooking.create({
      data: {
        userId: user.id,
        testId,
        partnerName,
        scheduledDate: new Date(scheduledDate),
        timeSlot,
        address,
        patientName,
        patientPhone,
        status: "BOOKED",
      },
      include: { test: true },
    });

    return NextResponse.json({
      ok: true,
      message: `Diagnostic sample collection scheduled with ${partnerName} for ${new Date(scheduledDate).toLocaleDateString()}. Phlebotomist will arrive during ${timeSlot}.`,
      booking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
