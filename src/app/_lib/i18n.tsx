"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import de from "@/i18n/locales/de.json";
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import fr from "@/i18n/locales/fr.json";
import pt from "@/i18n/locales/pt.json";

const LOCALE_STORAGE_KEY = "mm-locale";
const LOCALE_COOKIE_KEY = "mm-locale";

export const supportedLocales = ["en", "es", "fr", "pt", "de", "it", "nl", "ja", "zh"] as const;

export type Locale = (typeof supportedLocales)[number];

type Dictionary = Record<string, unknown>;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
  fr,
  pt,
  de,
  it: en,
  nl: en,
  ja: en,
  zh: en,
};

const htmlLangByLocale: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-BR",
  de: "de-DE",
  it: "it-IT",
  nl: "nl-NL",
  ja: "ja-JP",
  zh: "zh-CN",
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && supportedLocales.includes(value as Locale));
}

function getNestedValue(object: Dictionary, key: string): unknown {
  return key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    return (current as Dictionary)[part];
  }, object);
}

function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const language = navigator.language?.slice(0, 2).toLowerCase();
  return isLocale(language) ? language : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(LOCALE_STORAGE_KEY) : null;
    const cookieLocale =
      typeof document !== "undefined"
        ? document.cookie
            .split(";")
            .map((chunk) => chunk.trim())
          .find((chunk) => chunk.startsWith(`${LOCALE_COOKIE_KEY}=`))
            ?.split("=")[1]
        : null;

    if (isLocale(stored)) {
      setLocaleState(stored);
      return;
    }

    if (isLocale(cookieLocale)) {
      setLocaleState(cookieLocale);
      return;
    }

    setLocaleState(getBrowserLocale());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }

    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = htmlLangByLocale[locale];
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key: string, fallback?: string) => {
        const localized = getNestedValue(dictionaries[locale], key);
        if (typeof localized === "string") {
          return localized;
        }

        const englishFallback = getNestedValue(dictionaries.en, key);
        if (typeof englishFallback === "string") {
          return englishFallback;
        }

        return fallback ?? key;
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
