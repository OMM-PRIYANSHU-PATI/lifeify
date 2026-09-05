import { prisma } from "@/lib/db";
import { NotificationRule } from "./types";

export const missedDoseRule: NotificationRule = async (context) => {
  const now = context.now ?? new Date();
  const gracePeriodAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour grace

  const overdueDose = await prisma.medicationDose.findFirst({
    where: {
      userId: context.userId,
      status: "PENDING",
      scheduledAt: { lt: gracePeriodAgo },
    },
    include: { medication: true },
    orderBy: { scheduledAt: "desc" },
  });

  if (!overdueDose) return null;

  // Mark dose as MISSED in database
  await prisma.medicationDose.update({
    where: { id: overdueDose.id },
    data: { status: "MISSED" },
  });

  const timeStr = overdueDose.scheduledAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    type: "MED_MISSED",
    title: "Missed Medication Dose",
    body: `${overdueDose.medication.name} scheduled for ${timeStr} was not recorded as taken.`,
    data: { doseId: overdueDose.id, medicationId: overdueDose.medicationId },
    severity: "WARNING",
  };
};
