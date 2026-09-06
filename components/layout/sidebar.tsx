"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Scale,
  RefreshCw,
  Target,
  CheckSquare,
  Calendar,
  Zap,
  BookOpen,
  Film,
  FileText,
  FolderLock,
  BarChart3,
  Bot,
  Lightbulb,
  Settings,
  Sparkles,
  Compass,
} from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface NavItem {
  href: string;
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "AI & Overview",
    items: [
      { href: "/dashboard", labelKey: "navigation.dashboard", defaultLabel: "Dashboard", icon: LayoutDashboard },
      { href: "/mela/assistant", labelKey: "navigation.assistant", defaultLabel: "Mela AI Assistant", icon: Bot, badge: "AI" },
      { href: "/mela/insights", labelKey: "navigation.insights", defaultLabel: "AI Insights", icon: Lightbulb },
    ],
  },
  {
    title: "Finance & Wealth",
    items: [
      { href: "/finance", labelKey: "navigation.finance", defaultLabel: "Finance & Accounts", icon: Wallet },
      { href: "/investments", labelKey: "navigation.investments", defaultLabel: "Investments", icon: TrendingUp },
      { href: "/net-worth", labelKey: "navigation.netWorth", defaultLabel: "Net Worth", icon: Scale },
      { href: "/subscriptions", labelKey: "navigation.subscriptions", defaultLabel: "Subscriptions", icon: RefreshCw },
    ],
  },
  {
    title: "Productivity",
    items: [
      { href: "/goals", labelKey: "navigation.goals", defaultLabel: "Goals", icon: Target },
      { href: "/tasks", labelKey: "navigation.tasks", defaultLabel: "Tasks", icon: CheckSquare },
      { href: "/calendar", labelKey: "navigation.calendar", defaultLabel: "Calendar", icon: Calendar },
      { href: "/habits", labelKey: "navigation.habits", defaultLabel: "Habits", icon: Zap },
      { href: "/automations", labelKey: "navigation.automations", defaultLabel: "Automations", icon: Sparkles },
    ],
  },
  {
    title: "Knowledge & Lifestyle",
    items: [
      { href: "/books", labelKey: "navigation.books", defaultLabel: "Books", icon: BookOpen },
      { href: "/media", labelKey: "navigation.media", defaultLabel: "Media & Cine", icon: Film },
      { href: "/notes", labelKey: "navigation.notes", defaultLabel: "Notes", icon: FileText },
      { href: "/documents", labelKey: "navigation.documents", defaultLabel: "Documents", icon: FolderLock },
      { href: "/analytics", labelKey: "navigation.analytics", defaultLabel: "Analytics", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200/80 bg-white/95 px-4 py-5 backdrop-blur-md md:flex dark:border-neutral-800/80 dark:bg-neutral-900/95">
      {/* Brand Header */}
      <div className="mb-5 flex items-center justify-between px-2">
        <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              MELA <span className="text-emerald-600 dark:text-emerald-400">AI</span>
            </span>
            <span className="text-[10px] font-medium tracking-wider uppercase text-neutral-400">
              Personal OS
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {group.title}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-emerald-50 font-semibold text-emerald-900 shadow-xs dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-neutral-400 dark:text-neutral-500"
                      }`}
                    />
                    <span>{t(item.labelKey, item.defaultLabel)}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Navigation: Continuum Classic & Settings */}
      <div className="mt-4 border-t border-neutral-200/80 pt-3 space-y-1 dark:border-neutral-800/80">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <Compass className="h-4 w-4 text-neutral-400" />
          <span>{t("navigation.classicView", "Continuum Classic")}</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <Settings className="h-4 w-4 text-neutral-400" />
          <span>{t("navigation.settings", "Settings")}</span>
        </Link>
      </div>
    </aside>
  );
}
