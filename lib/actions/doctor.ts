"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

// In-memory or database temporary access tokens
// We store doctor access tokens as an OtpCode with type/phone mapped or SubjectPermission
export async function generateDoctorAccessCodeAction() {
  const patient = await requireUser();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // exactly 10 minutes

  // Store in OtpCode table for redemption
  await prisma.otpCode.create({
    data: {
      userId: patient.id,
      phone: `DOC-${code}`,
      codeHash: code,
      expiresAt,
    },
  });

  await audit({
    userId: patient.id,
    action: "DOCTOR_ACCESS_CODE_GENERATED",
    entity: "OtpCode",
    metadata: { expiresAt },
  });

  return { ok: true, code, expiresAt: expiresAt.toISOString() };
}

export async function redeemDoctorAccessCodeAction(code: string) {
  const doctor = await requireUser();
  const now = new Date();

  const otp = await prisma.otpCode.findFirst({
    where: {
      phone: `DOC-${code}`,
      codeHash: code,
      consumedAt: null,
      expiresAt: { gt: now },
    },
  });

  if (!otp || !otp.userId) {
    return { ok: false, error: "Invalid or expired 10-minute access code" };
  }

  // Mark consumed
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: now },
  });

  // Grant 10-minute consultation read permission
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.subjectPermission.upsert({
    where: {
      actorUserId_targetUserId_permissionKey_source: {
        actorUserId: doctor.id,
        targetUserId: otp.userId,
        permissionKey: "DOCTOR_CONSULTATION_READ",
        source: "DOCTOR_CODE",
      },
    },
    create: {
      actorUserId: doctor.id,
      targetUserId: otp.userId,
      permissionKey: "DOCTOR_CONSULTATION_READ",
      scope: "READ_ONLY",
      source: "DOCTOR_CODE",
      expiresAt,
    },
    update: {
      expiresAt,
      revokedAt: null,
    },
  });

  await audit({
    userId: doctor.id,
    targetUserId: otp.userId,
    action: "DOCTOR_ACCESS_CODE_REDEEMED",
    entity: "SubjectPermission",
    metadata: { expiresAt },
  });

  revalidatePath("/doctor");
  return { ok: true, patientId: otp.userId };
}

export async function createDoctorNoteAction(input: {
  patientId: string;
  body: string;
  sharedWithPatient: boolean;
}) {
  const doctor = await requireUser();
  const note = await prisma.doctorNote.create({
    data: {
      userId: doctor.id,
      patientId: input.patientId,
      body: input.body,
      sharedWithPatient: input.sharedWithPatient,
    },
  });

  await audit({
    userId: doctor.id,
    targetUserId: input.patientId,
    action: "DOCTOR_NOTE_CREATED",
    entity: "DoctorNote",
    entityId: note.id,
    metadata: { sharedWithPatient: input.sharedWithPatient },
  });

  revalidatePath("/doctor");
  revalidatePath("/app/doctor");
  return { ok: true, data: note };
}

export async function scheduleAppointmentAction(input: {
  patientId?: string;
  doctorId?: string;
  scheduledAt: string;
  durationMin?: number;
  reason: string;
}) {
  const user = await requireUser();
  const isDoctor = user.role === "doctor";

  const patientId = isDoctor ? (input.patientId ?? user.id) : user.id;
  const doctorId = isDoctor ? user.id : (input.doctorId ?? user.id);

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      scheduledAt: new Date(input.scheduledAt),
      durationMin: input.durationMin ?? 15,
      reason: input.reason,
      status: "SCHEDULED",
    },
  });

  await audit({
    userId: user.id,
    action: "APPOINTMENT_SCHEDULED",
    entity: "Appointment",
    entityId: appointment.id,
  });

  revalidatePath("/app/doctor");
  revalidatePath("/doctor");
  return { ok: true, data: appointment };
}

export async function getDoctorConsultationData(patientId: string) {
  const doctor = await requireUser();
  const now = new Date();

  // Verify permission
  const perm = await prisma.subjectPermission.findFirst({
    where: {
      actorUserId: doctor.id,
      targetUserId: patientId,
      permissionKey: "DOCTOR_CONSULTATION_READ",
      revokedAt: null,
      expiresAt: { gt: now },
    },
  });

  if (!perm) return null;

  // Log chart access in audit
  await audit({
    userId: doctor.id,
    targetUserId: patientId,
    action: "DOCTOR_CHART_VIEWED",
    entity: "PatientRecord",
  });

  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    include: {
      profile: true,
      medications: { where: { active: true }, include: { stock: true } },
      sideEffects: { take: 10, orderBy: { createdAt: "desc" } },
      doctorNotes: { where: { userId: doctor.id }, orderBy: { createdAt: "desc" } },
    },
  });

  return patient;
}
