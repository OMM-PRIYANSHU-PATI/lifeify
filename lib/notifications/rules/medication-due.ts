import { prisma } from "@/lib/db";
import { NotificationRule } from "./types";

export const medicationDueRule: NotificationRule = async (context) => {
  const now = context.now ?? new Date();
  const thirtyMinAhead = new Date(now.getTime() + 30 * 60 * 1000);

  const dueDose = await prisma.medicationDose.findFirst({
    where: {
      userId: context.userId,
      status: "PENDING",
      scheduledAt: { gte: now, lte: thirtyMinAhead },
    },
    include: { medication: true },
    orderBy: { scheduledAt: "asc" },
  });

  if (!dueDose) return null;

  const timeStr = dueDose.scheduledAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    type: "MED_REMINDER",
    title: "Medication Reminder",
    body: `Upcoming dose: ${dueDose.medication.name} is scheduled for ${timeStr}.`,
    data: { doseId: dueDose.id, medicationId: dueDose.medicationId },
    severity: "INFO",
  };
};
