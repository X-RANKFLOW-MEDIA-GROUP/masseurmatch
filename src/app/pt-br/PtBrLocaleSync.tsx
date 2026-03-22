"use client";

import { useEffect } from "react";
import { useI18n } from "@/app/_lib/i18n";

export function PtBrLocaleSync() {
  const { locale, setLocale } = useI18n();

  useEffect(() => {
    if (locale !== "pt") {
      setLocale("pt");
    }
  }, [locale, setLocale]);

  return null;
}
