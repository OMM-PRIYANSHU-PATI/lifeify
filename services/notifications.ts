import "server-only";
import { prisma } from "@/lib/prisma";

// Centralized notification engine (Phase 22):
//   Event → Notification Rules → Notification Queue → In-App Notification.
// Push/email channels can be plugged into deliver() later without touching callers.

export type NotificationType =
  | "MED_REMINDER"
  | "MED_MISSED"
  | "STOCK_LOW"
  | "REFILL"
  | "CHECK_IN"
  | "FOLLOW_UP"
  | "HEALTH_LOG"
  | "WEEKLY_SUMMARY"
  | "SYSTEM";

export async function notify(userId: string, type: NotificationType, title: string, body: string, data?: Record<string, unknown>): Promise<void> {
  const rules = await getNotificationSettings(userId);
  if (rules[type] === false) return; // per-type user opt-out

  await prisma.notification.create({
    data: { userId, type, title, body, data: data ? JSON.stringify(data) : undefined },
  });
  await deliver(userId, type, title, body);
}

// Channel abstraction: in-app only for V1; Resend/email plugs in here.
async function deliver(_userId: string, _type: NotificationType, _title: string, _body: string): Promise<void> {
  const channel = process.env.NOTIFICATION_CHANNEL ?? "inapp";
  if (channel === "inapp") return;
  // TODO(production): dispatch to email/push providers here.
}

export async function getNotificationSettings(userId: string): Promise<Record<string, boolean>> {
  const consents = await prisma.consent.findMany({ where: { userId, type: { startsWith: "NOTIFY_" } } });
  const settings: Record<string, boolean> = {};
  for (const c of consents) settings[c.type.replace("NOTIFY_", "")] = c.granted;
  return settings;
}

// Deterministic rules evaluated on demand (called from pages/actions):

export async function runMedicationRules(userId: string): Promise<void> {
  const now = new Date();

  // Missed doses: pending doses scheduled >60 min ago become MISSED + notification.
  const overdue = await prisma.medicationDose.findMany({
    where: { userId, status: "PENDING", scheduledAt: { lt: new Date(now.getTime() - 60 * 60 * 1000) } },
    include: { medication: true },
  });
  for (const dose of overdue) {
    await prisma.medicationDose.update({ where: { id: dose.id }, data: { status: "MISSED" } });
    await notify(
      userId,
      "MED_MISSED",
      "Missed medication",
      `${dose.medication.name} scheduled for ${dose.scheduledAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} was not marked as taken.`,
      { doseId: dose.id }
    );
  }

  // Low stock: remaining ÷ daily required below threshold → refill reminder.
  const stocks = await prisma.medicationStock.findMany({
    where: { medication: { userId, active: true } },
    include: { medication: true },
  });
  for (const stock of stocks) {
    const times = JSON.parse(stock.medication.timesOfDay || "[]") as string[];
    const dailyRequired = Math.max(1, times.length);
    const daysLeft = stock.remainingQty / dailyRequired;
    const threshold = stock.refillThresholdDays ?? stock.refillThreshold ?? 5;
    if (daysLeft <= threshold) {
      const recent = await prisma.notification.findFirst({
        where: { userId, type: "STOCK_LOW", data: { contains: stock.medicationId }, createdAt: { gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) } },
      });
      if (!recent) {
        await notify(
          userId,
          "STOCK_LOW",
          "Refill reminder",
          `Approximately ${Math.max(0, Math.ceil(daysLeft))} day(s) of ${stock.medication.name} remaining. Consider arranging a refill.`,
          { medicationId: stock.medicationId }
        );
      }
    }
  }

  // Daily check-in reminder (once per day).
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const checkinToday = await prisma.dailyCheckIn.findUnique({
    where: { userId_date: { userId, date: todayStart } },
  });
  if (!checkinToday) {
    const reminder = await prisma.notification.findFirst({
      where: { userId, type: "CHECK_IN", createdAt: { gte: todayStart } },
    });
    if (!reminder) {
      await notify(userId, "CHECK_IN", "Daily check-in", "How are you feeling today? A 1-minute check-in keeps your trends accurate.");
    }
  }

  // Upcoming follow-ups (within 3 days).
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const followUps = await prisma.followUp.findMany({
    where: { userId, status: "PENDING", dueDate: { gte: now, lte: soon } },
  });
  for (const fu of followUps) {
    const recent = await prisma.notification.findFirst({
      where: { userId, type: "FOLLOW_UP", data: { contains: fu.id }, createdAt: { gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) } },
    });
    if (!recent) {
      await notify(userId, "FOLLOW_UP", "Follow-up approaching", `You have a follow-up scheduled for ${fu.dueDate.toLocaleDateString("en-IN")}.`, { followUpId: fu.id });
    }
  }
}
