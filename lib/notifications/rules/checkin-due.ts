import { prisma } from "@/lib/db";
import { NotificationRule } from "./types";

export const checkinDueRule: NotificationRule = async (context) => {
  const now = context.now ?? new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const checkinToday = await prisma.dailyCheckIn.findUnique({
    where: { userId_date: { userId: context.userId, date: todayStart } },
  });

  if (checkinToday?.completed) return null;

  // Check if reminder was already sent today
  const existingReminder = await prisma.notification.findFirst({
    where: {
      userId: context.userId,
      type: "CHECK_IN",
      createdAt: { gte: todayStart },
    },
  });

  if (existingReminder) return null;

  return {
    type: "CHECK_IN",
    title: "Daily Wellness Check-in",
    body: "Take 60 seconds to log how you are feeling and keep your health score accurate.",
    data: { date: todayStart.toISOString() },
    severity: "INFO",
  };
};
