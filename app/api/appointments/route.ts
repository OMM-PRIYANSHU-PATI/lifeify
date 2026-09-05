import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        { patientId: user.id },
        { doctorId: user.id },
      ],
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      doctor: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({ ok: true, appointments });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { doctorId, scheduledAt, reason, durationMin = 15 } = body;

    if (!doctorId || !scheduledAt) {
      return NextResponse.json({ error: "Doctor ID and scheduled date/time required" }, { status: 400 });
    }

    const appt = await prisma.appointment.create({
      data: {
        patientId: user.id,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        durationMin: Number(durationMin) || 15,
        reason: reason || "General Medical Follow-up",
        status: "SCHEDULED",
      },
    });

    await audit({
      userId: user.id,
      action: "APPOINTMENT_SCHEDULED",
      entity: "Appointment",
      entityId: appt.id,
      metadata: { doctorId, scheduledAt },
    });

    return NextResponse.json({ ok: true, appointment: appt }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
