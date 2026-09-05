import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar, BottomNav, NotificationBell } from "@/components/nav";
import { QuickLogButton } from "@/components/quick-log";
import { logoutAction } from "@/lib/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const unread = user ? await prisma.notification.count({ where: { userId: user.id, read: false } }) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isAdmin={user?.role === "ADMIN"} />
      <BottomNav />
      <div className="sm:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/60 bg-surface/70 px-4 py-3.5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] backdrop-blur-lg sm:px-8">
          <p className="text-sm font-medium tracking-tight text-ink">
            {greeting()}, <span className="font-semibold">{user?.name ?? "Explorer"}</span> 👋
          </p>
          <div className="flex items-center gap-3">
            <NotificationBell unreadCount={unread} />
            <form action={logoutAction}>
              <button type="submit" className="lif-btn-secondary px-3 py-1.5 text-xs">Log out</button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-28 sm:px-8">{children}</main>
      </div>
      <QuickLogButton />
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
