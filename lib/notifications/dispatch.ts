import "server-only";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export type NotificationSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  severity?: NotificationSeverity;
}

/**
 * Single centralized entry point for sending notifications in LIFEIFY.
 * V1 delivers to the user's in-app inbox and records the severity and context.
 */
export async function notify(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
  severity: NotificationSeverity = "INFO"
) {
  try {
    const record = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        data: data ? JSON.stringify(data) : undefined,
        severity,
        read: false,
      },
    });

    logger.info(`Notification dispatched: [${severity}] ${type} to user ${userId}`);
    return record;
  } catch (err) {
    logger.error("Failed to dispatch notification", err, { userId, type, title });
    throw err;
  }
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

export async function getUserNotifications(userId: string, limit = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}
