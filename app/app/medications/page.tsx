import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSymptomHistory } from "@/lib/actions/symptoms";
import { getUserGamificationData } from "@/lib/actions/gamification";
import { MedicationsClient } from "./medications-client";

export default async function MedicationsPage() {
  const user = await requireUser();

  const medications = await prisma.medication.findMany({
    where: { userId: user.id, active: true },
    include: { stock: true },
    orderBy: { createdAt: "desc" },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayDoses = await prisma.medicationDose.findMany({
    where: {
      userId: user.id,
      scheduledAt: { gte: todayStart, lte: todayEnd },
    },
    include: { medication: true },
    orderBy: { scheduledAt: "asc" },
  });

  const formattedDoses = todayDoses.map((d) => ({
    id: d.id,
    medicationName: d.medication.name,
    scheduledAt: d.scheduledAt,
    status: d.status,
  }));

  const symptoms = await getSymptomHistory();
  const gamification = await getUserGamificationData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Medications & Regimen</h1>
        <p className="text-sm text-ink-soft">
          Dosage tracking, refill monitoring, symptom journal, weekly feeling check-ins, and adherence rewards.
        </p>
      </div>

      <MedicationsClient
        medications={medications}
        todayDoses={formattedDoses}
        symptoms={symptoms}
        gamification={gamification}
      />
    </div>
  );
}
