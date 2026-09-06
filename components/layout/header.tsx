"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { toEthiopianDate } from "@/lib/utils/ethiopian-calendar";
import { Search, Globe, Coins, Sparkles, LogIn, LogOut, Menu } from "lucide-react";

export function Header() {
interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { user, loginWithGoogle, logout } = useAuth();
  const { locale, setLocale, t, locales } = useI18n();

  const ethDate = toEthiopianDate(new Date());

  const handleOpenSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-mela-search"));
    }
  };

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "am" : "en");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 px-6 dark:border-neutral-800">
      <div className="font-medium">MelaAI Platform</div>
      <div className="flex items-center gap-4">
        {/* Header actions */}
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200/80 bg-white/80 px-4 backdrop-blur-md md:px-6 dark:border-neutral-800/80 dark:bg-neutral-900/80">
      {/* Left side: Mobile menu toggle + Search Trigger */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-100 md:hidden dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Global Search Button */}
        <button
          onClick={handleOpenSearch}
          className="flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-100/70 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("common.search", "Search across MELA")}...</span>
          <span className="sm:hidden">{t("common.search", "Search")}</span>
          <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 shadow-xs sm:inline-block dark:bg-neutral-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: Ethiopian Calendar Badge, Language Switcher, Currency & User */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Ethiopian Date Badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[11px] font-medium text-emerald-800 lg:flex dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span>{locale === "am" ? ethDate.formattedAm : `${ethDate.monthNameEn} ${ethDate.day}, ${ethDate.year} E.C.`}</span>
        </div>

        {/* Primary Currency Badge (ETB) */}
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200/70 bg-neutral-50 px-2 py-1 text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300">
          <Coins className="h-3.5 w-3.5 text-amber-500" />
          <span>ETB (Br)</span>
        </div>

        {/* Language Switcher (EN / አማ) */}
        <button
          onClick={toggleLanguage}
          title="Switch Language / ቋንቋ ቀይር"
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Globe className="h-3.5 w-3.5 text-neutral-400" />
          <span className="font-semibold">{locale === "am" ? "አማ" : "EN"}</span>
        </button>

        {/* User Auth Info */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-xs">
              {user.displayName ? user.displayName[0].toUpperCase() : "U"}
            </div>
            <button
              onClick={logout}
              title={t("navigation.signOut", "Sign out")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
