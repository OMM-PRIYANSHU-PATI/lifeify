import { requireUser } from "@/lib/auth/session";
import { getUserNotifications } from "@/lib/notifications/dispatch";
import { NotificationList } from "./notification-list";

export const metadata = {
  title: "Notifications — LIFEIFY",
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const rawNotifications = await getUserNotifications(user.id, 50);

  const notifications = rawNotifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    severity: (n.severity ?? "INFO") as "INFO" | "WARNING" | "CRITICAL",
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Notifications</h1>
          <p className="text-sm text-ink-soft">
            In-app alerts, reminders, and health rule evaluations.
          </p>
        </div>
      </div>

      <NotificationList initialNotifications={notifications} />
    </div>
  );
}
