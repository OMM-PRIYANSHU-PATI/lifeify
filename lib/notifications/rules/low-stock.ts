import { prisma } from "@/lib/db";
import { NotificationRule } from "./types";

export const lowStockRule: NotificationRule = async (context) => {
  const now = context.now ?? new Date();

  const stocks = await prisma.medicationStock.findMany({
    where: { medication: { userId: context.userId, active: true } },
    include: { medication: true },
  });

  for (const stock of stocks) {
    const times = JSON.parse(stock.medication.timesOfDay || "[]") as string[];
    const dailyRequired = Math.max(1, times.length);
    const daysLeft = stock.remainingQty / dailyRequired;

    const threshold = stock.refillThresholdDays ?? stock.refillThreshold ?? 5;
    if (daysLeft <= threshold) {
      // Check deduplication (do not spam if notified in last 48 hours)
      const recent = await prisma.notification.findFirst({
        where: {
          userId: context.userId,
          type: "STOCK_LOW",
          data: { contains: stock.medicationId },
          createdAt: { gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
        },
      });

      if (!recent) {
        return {
          type: "STOCK_LOW",
          title: "Low Medicine Stock",
          body: `Approximately ${Math.max(0, Math.ceil(daysLeft))} day(s) of ${stock.medication.name} remaining (${stock.remainingQty} ${stock.unit}).`,
          data: { medicationId: stock.medicationId, daysRemaining: daysLeft },
          severity: "WARNING",
        };
      }
    }
  }

  return null;
};
