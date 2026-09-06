"use client";

import { useState, useEffect, useCallback } from "react";
import enCommon from "@/i18n/en/common.json";
import enNav from "@/i18n/en/navigation.json";
import enFinance from "@/i18n/en/finance.json";
import enMela from "@/i18n/en/mela.json";

import amCommon from "@/i18n/am/common.json";
import amNav from "@/i18n/am/navigation.json";
import amFinance from "@/i18n/am/finance.json";
import amMela from "@/i18n/am/mela.json";

export type SupportedLocale = "en" | "am" | "om" | "ti" | "so";

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  isAvailable: boolean;
}

export const AVAILABLE_LOCALES: LocaleInfo[] = [
  { code: "en", name: "English", nativeName: "English", isAvailable: true },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", isAvailable: true },
  { code: "om", name: "Afaan Oromo", nativeName: "Afaan Oromoo", isAvailable: false },
  { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ", isAvailable: false },
  { code: "so", name: "Somali", nativeName: "Soomaali", isAvailable: false },
];

const DICTIONARIES: Record<string, Record<string, any>> = {
  en: {
    common: enCommon,
    navigation: enNav,
    finance: enFinance,
    mela: enMela,
  },
  am: {
    common: amCommon,
    navigation: amNav,
    finance: amFinance,
    mela: amMela,
  },
};

export function useI18n() {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_locale") as SupportedLocale | null;
      if (saved && (saved === "en" || saved === "am")) {
        setLocaleState(saved);
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (newLocale === "en" || newLocale === "am") {
      setLocaleState(newLocale);
      if (typeof window !== "undefined") {
        localStorage.setItem("mela_locale", newLocale);
      }
    }
  }, []);

  /**
   * Translates a dot-notated key (e.g., "navigation.dashboard", "finance.expenses")
   * with English fallback.
   */
  const t = useCallback(
    (path: string, fallback?: string): string => {
      const parts = path.split(".");
      const section = parts.length > 1 ? parts[0] : "common";
      const key = parts.length > 1 ? parts.slice(1).join(".") : parts[0];

      // Try active locale
      const activeDict = DICTIONARIES[locale]?.[section];
      let val = activeDict;
      for (const p of parts.length > 1 ? parts.slice(1) : [path]) {
        val = val?.[p];
      }
      if (typeof val === "string") return val;

      // Fallback to English
      const enDict = DICTIONARIES.en?.[section];
      let enVal = enDict;
      for (const p of parts.length > 1 ? parts.slice(1) : [path]) {
        enVal = enVal?.[p];
      }
      if (typeof enVal === "string") return enVal;

      return fallback || key;
    },
    [locale]
  );

  return {
    locale,
    setLocale,
    t,
    locales: AVAILABLE_LOCALES,
  };
}

