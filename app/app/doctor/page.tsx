import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DoctorShareClient } from "./doctor-share-client";

export default async function DoctorSharePage() {
  const user = await requireUser();

  const appointments = await prisma.appointment.findMany({
    where: { patientId: user.id },
    include: {
      doctor: { select: { name: true, phone: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const notes = await prisma.doctorNote.findMany({
    where: { patientId: user.id, sharedWithPatient: true },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Doctor Consultations & Sharing</h1>
        <p className="text-sm text-ink-soft">
          Share your health record safely with doctors using 10-minute temporary access codes and view clinician notes.
        </p>
      </div>

      <DoctorShareClient appointments={appointments} notes={notes} />
    </div>
  );
}
