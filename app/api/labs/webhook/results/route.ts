import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, biomarkers, partnerRefId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const booking = await prisma.labBooking.findUnique({
      where: { id: bookingId },
      include: { test: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const resultSummaryStr = JSON.stringify(biomarkers || { verified: true, date: new Date() });

    // Update booking status to COMPLETED
    const updatedBooking = await prisma.labBooking.update({
      where: { id: bookingId },
      data: {
        status: "COMPLETED",
        resultSummary: resultSummaryStr,
      },
    });

    // Ingest into user's permanent MedicalRecord vault
    await prisma.medicalRecord.create({
      data: {
        userId: booking.userId,
        title: `${booking.test.name} — ${booking.partnerName} Report`,
        type: "lab",
        notes: `Automated diagnostic partner ingestion from ${booking.partnerName}. Partner ref: ${partnerRefId || "DIAG-" + Date.now()}`,
        date: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Lab results successfully ingested and synchronized to medical records.",
      booking: updatedBooking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
