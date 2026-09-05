"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-provider";

export interface NavSection {
  title?: string;
  items: Array<{
    href: string;
    label: string;
    emoji: string;
    badge?: string;
  }>;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Daily Health OS",
    items: [
      { href: "/app/dashboard", label: "Overview", emoji: "🏠" },
      { href: "/app/features", label: "414 Feature Hub", emoji: "✨", badge: "414" },
      { href: "/app/analytics", label: "Analytics & Trends", emoji: "📊" },
      { href: "/app/insights", label: "Clinical Intelligence", emoji: "🧠" },
      { href: "/app/wearables", label: "Wearables & Vitals", emoji: "⌚" },
      { href: "/app/plans", label: "Personalized Plans", emoji: "📋" },
    ],
  },
  {
    title: "Clinical & Medical",
    items: [
      { href: "/app/medications", label: "Medications & DDI", emoji: "💊" },
      { href: "/app/scan", label: "Prescription OCR", emoji: "📷" },
      { href: "/app/records", label: "Health Records", emoji: "📑" },
      { href: "/app/labs", label: "Diagnostic Labs", emoji: "🧪" },
      { href: "/app/pharmacy", label: "Pharmacy Refills", emoji: "📦" },
      { href: "/app/symptom-checker", label: "Symptom Triage", emoji: "🩺" },
      { href: "/app/risk-assessment", label: "Disease Risk (IDRS)", emoji: "🎯" },
    ],
  },
  {
    title: "Care & Emergency",
    items: [
      { href: "/app/emergency-card", label: "Emergency Card", emoji: "🚨", badge: "SOS" },
      { href: "/app/family", label: "Family & Caregivers", emoji: "👨‍👩‍👧" },
      { href: "/doctor/rpm", label: "Doctor RPM Portal", emoji: "👨‍⚕️" },
      { href: "/corporate/dashboard", label: "Corporate Wellness", emoji: "🏢" },
      { href: "/app/privacy", label: "Privacy Center", emoji: "🔒" },
    ],
  },
];

const MOBILE_ITEMS = [
  { href: "/app/dashboard", label: "Summary", emoji: "🧡" },
  { href: "/app/features", label: "Browse", emoji: "🗂️" },
  { href: "/app/medications", label: "Meds", emoji: "💊" },
  { href: "/app/family", label: "Sharing", emoji: "👨‍👩‍👧" },
  { href: "/app/emergency-card", label: "Medical ID", emoji: "🚨" },
];

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface px-4 py-5 sm:flex overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-5 px-2">
        <Link href="/app/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white font-extrabold text-sm shadow-xs">
            L
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">
            <span className="text-primary">LIFE</span>IFY
          </span>
        </Link>
        <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary-dark">
          Health OS
        </span>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-5" aria-label="Main Navigation">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && (
              <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors duration-150",
                      active
                        ? "bg-primary-soft text-primary-dark font-bold shadow-xs"
                        : "text-ink-soft hover:bg-surface-subtle hover:text-ink"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-md bg-crisis-soft px-1.5 py-0.5 text-[10px] font-extrabold text-crisis">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div className="pt-2 border-t border-line/60">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-ink-soft hover:bg-surface-subtle hover:text-ink"
            >
              <span className="text-base" aria-hidden="true">
                🛡️
              </span>
              <span>Admin Console</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom Controls: Theme & Language */}
      <div className="mt-4 pt-4 border-t border-line/70 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-ink-muted">Theme</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-ink-muted">Language</span>
          <LanguageSwitcher />
        </div>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-surface/95 backdrop-blur px-2 py-1.5 sm:hidden"
      aria-label="Mobile Navigation"
    >
      {MOBILE_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-semibold transition-colors",
              active ? "text-primary font-bold" : "text-ink-soft hover:text-ink"
            )}
            aria-current={active ? "page" : undefined}
          >
            <span className="text-lg" aria-hidden="true">
              {item.emoji}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/app/notifications"
      className="relative rounded-xl p-2 text-ink-soft hover:bg-surface-subtle hover:text-ink transition-colors"
      aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
    >
      <span className="text-lg" aria-hidden="true">
        🔔
      </span>
      {unreadCount > 0 && (
        <span className="absolute 1 top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-crisis px-1 text-[9px] font-bold text-white shadow-xs">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
