import { prisma } from "@/lib/db";
import { NotificationRule } from "./types";

export const followupDueRule: NotificationRule = async (context) => {
  const now = context.now ?? new Date();
  const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcomingFollowUp = await prisma.followUp.findFirst({
    where: {
      userId: context.userId,
      status: "PENDING",
      dueDate: { gte: now, lte: threeDaysAhead },
    },
    orderBy: { dueDate: "asc" },
  });

  if (!upcomingFollowUp) return null;

  // Check if reminder was already sent in last 24 hours
  const recentReminder = await prisma.notification.findFirst({
    where: {
      userId: context.userId,
      type: "FOLLOW_UP",
      data: { contains: upcomingFollowUp.id },
      createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    },
  });

  if (recentReminder) return null;

  const dateStr = upcomingFollowUp.dueDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const doctor = upcomingFollowUp.doctorName ? ` with Dr. ${upcomingFollowUp.doctorName}` : "";

  return {
    type: "FOLLOW_UP",
    title: "Upcoming Doctor Follow-up",
    body: `You have a scheduled follow-up${doctor} on ${dateStr}.`,
    data: { followUpId: upcomingFollowUp.id, dueDate: upcomingFollowUp.dueDate.toISOString() },
    severity: "INFO",
  };
};
