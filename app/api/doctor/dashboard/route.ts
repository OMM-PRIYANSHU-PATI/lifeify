import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile, activePermissions, appointments, recentNotes] = await Promise.all([
    prisma.doctorProfile.findUnique({ where: { userId: user.id } }),
    prisma.subjectPermission.findMany({
      where: {
        actorUserId: user.id,
        source: "DOCTOR_SESSION",
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    }),
    prisma.appointment.findMany({
      where: { doctorId: user.id, scheduledAt: { gte: new Date() } },
      include: { patient: true },
      orderBy: { scheduledAt: "asc" },
      take: 10,
    }),
    prisma.doctorNote.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    profile,
    activeConsultationCount: activePermissions.length,
    upcomingAppointments: appointments,
    recentNotes,
  });
}
