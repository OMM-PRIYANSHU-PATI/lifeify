import { prisma } from "@/lib/db";
import { NotificationRule } from "./types";

export const refillDueRule: NotificationRule = async (context) => {
  const now = context.now ?? new Date();

  const stocks = await prisma.medicationStock.findMany({
    where: {
      medication: { userId: context.userId, active: true },
      remainingQty: { lte: 2 },
    },
    include: { medication: true },
  });

  for (const stock of stocks) {
    const recent = await prisma.notification.findFirst({
      where: {
        userId: context.userId,
        type: "REFILL",
        data: { contains: stock.medicationId },
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!recent) {
      const isOut = stock.remainingQty <= 0;
      return {
        type: "REFILL",
        title: isOut ? "Urgent: Refill Overdue" : "Refill Due Immediately",
        body: isOut
          ? `You have run out of ${stock.medication.name}. Please contact your pharmacy for an immediate refill.`
          : `Only ${stock.remainingQty} ${stock.unit} of ${stock.medication.name} left. Refill needed today.`,
        data: { medicationId: stock.medicationId, remainingQty: stock.remainingQty },
        severity: isOut ? "CRITICAL" : "WARNING",
      };
    }
  }

  return null;
};
