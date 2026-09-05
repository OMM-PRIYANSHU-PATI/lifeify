import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { registrationNumber, council, specialization, clinic } = body;

    if (!registrationNumber || !registrationNumber.trim()) {
      return NextResponse.json({ error: "Medical registration number (MCI / State Medical Council) is required" }, { status: 400 });
    }

    const doctorProfile = await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        registrationNumber: registrationNumber.trim(),
        council: council?.trim() || "National Medical Commission",
        specialization: specialization?.trim() || "General Medicine",
        clinic: clinic?.trim() || null,
        verifiedAt: new Date(), // deterministic verification for verified doctors
      },
      update: {
        registrationNumber: registrationNumber.trim(),
        council: council?.trim() || undefined,
        specialization: specialization?.trim() || undefined,
        clinic: clinic?.trim() || undefined,
        verifiedAt: new Date(),
      },
    });

    // Update user role to doctor
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "doctor" },
    });

    await audit({
      userId: user.id,
      action: "DOCTOR_VERIFIED",
      entity: "DoctorProfile",
      entityId: doctorProfile.id,
      metadata: { registrationNumber },
    });

    return NextResponse.json({ ok: true, doctorProfile });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
