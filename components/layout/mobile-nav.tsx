"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Bot, CheckSquare, Search } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const handleOpenSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-mela-search"));
    }
  };

  const navItems = [
    { href: "/dashboard", labelKey: "navigation.dashboard", defaultLabel: "Home", icon: LayoutDashboard },
    { href: "/finance", labelKey: "navigation.finance", defaultLabel: "Finance", icon: Wallet },
    { href: "/mela/assistant", labelKey: "navigation.assistant", defaultLabel: "Mela", icon: Bot, isPrimary: true },
    { href: "/tasks", labelKey: "navigation.tasks", defaultLabel: "Tasks", icon: CheckSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white p-2 md:hidden dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex justify-around text-xs">
        {/* Mobile Navigation Icons */}
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200/80 bg-white/95 px-3 py-2 backdrop-blur-md md:hidden dark:border-neutral-800/80 dark:bg-neutral-900/95">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5"
              >
                <div className="flex h-10 w-10 -translate-y-2 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white shadow-lg">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {t(item.labelKey, item.defaultLabel)}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
                isActive
                  ? "font-bold text-emerald-600 dark:text-emerald-400"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.labelKey, item.defaultLabel)}</span>
            </Link>
          );
        })}

        {/* Universal Search trigger */}
        <button
          onClick={handleOpenSearch}
          className="flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <Search className="h-4 w-4" />
          <span>{t("common.search", "Search")}</span>
        </button>
      </div>
    </nav>
  );
}
