"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { AppButton } from "@/app/_components/primitives";
import { supportedLocales, useI18n, type Locale } from "@/app/_lib/i18n";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();

  const closeMobileMenu = () => setMobileOpen(false);

  const headerLinks = [
    { href: "/therapists", label: t("header.therapists", "Therapists") },
    { href: "/compare", label: "Compare" },
    { href: "/pricing", label: t("header.pricing", "Pricing") },
    { href: "/blog", label: t("header.blog", "Blog") },
    { href: "/safety", label: t("header.safety", "Safety") },
    { href: "/contact", label: t("header.contact", "Contact") },
  ];

  const localeLabels: Record<Locale, string> = {
    en: "English (US)",
    es: "Espanol",
    fr: "Francais",
    pt: "Portugues",
    de: "Deutsch",
    it: "Italiano",
    nl: "Nederlands",
    ja: "Japanese",
    zh: "Chinese",
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-[rgb(var(--color-bg-surface-rgb)/0.84)] shadow-[0_10px_28px_rgb(var(--color-brand-primary-rgb)/0.05)] backdrop-blur-2xl">
      <div className="mx-auto flex h-[74px] w-full max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-semibold tracking-[-0.04em] text-text-primary transition-colors hover:text-brand-secondary">
          MasseurMatch
        </Link>
        <div className="flex items-center gap-3">
          <label className="hidden items-center gap-2 rounded-full border border-border-strong bg-white/88 px-3 py-1.5 text-xs font-medium text-text-secondary shadow-[inset_0_1px_0_rgb(255_255_255/_0.92)] md:flex">
            <span>{t("header.language", "Language")}</span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
              className="bg-transparent text-xs font-semibold text-text-primary outline-none"
              aria-label={t("header.language", "Language")}
            >
              {supportedLocales.map((item) => (
                <option key={item} value={item}>
                  {localeLabels[item]}
                </option>
              ))}
            </select>
          </label>

          <nav className="hidden items-center gap-1 rounded-full border border-border-tertiary bg-white/84 p-1 shadow-[inset_0_1px_0_rgb(255_255_255/_0.82)] lg:flex">
            {headerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="motion-premium rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-bg-subtle hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/search"
            className="motion-premium hidden items-center rounded-full border border-border-strong bg-white/88 px-4 py-2 text-sm font-medium text-text-secondary shadow-[inset_0_1px_0_rgb(255_255_255/_0.92)] transition hover:border-action-secondary/20 hover:text-brand-secondary sm:inline-flex"
          >
            Search verified therapists
          </Link>

          <AppButton asChild size="sm" variant="default" className="hidden h-10 rounded-full px-5 text-sm font-semibold sm:inline-flex">
            <Link href="/search">Find trusted therapists</Link>
          </AppButton>

          <button
            type="button"
            className="motion-premium inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/88 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/_0.92)] transition hover:border-border-strong hover:text-text-primary lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
            aria-label={mobileOpen ? t("header.closeMenu", "Close menu") : t("header.openMenu", "Open menu")}
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id="site-mobile-menu" className="border-t border-border-tertiary bg-[rgb(var(--color-bg-surface-rgb)/0.94)] backdrop-blur-2xl lg:hidden">
          <div className="mx-auto w-full max-w-[1320px] px-4 py-4 sm:px-6">
            <div className="mb-3 rounded-[1.5rem] border border-border-tertiary bg-white/88 px-4 py-3 shadow-brand">
              <label className="flex items-center justify-between gap-3 text-sm font-medium text-text-secondary">
                <span>{t("header.language", "Language")}</span>
                <select
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as Locale)}
                  className="rounded-md border border-border-strong bg-white px-2 py-1 text-sm font-semibold text-text-primary outline-none"
                  aria-label={t("header.language", "Language")}
                >
                  {supportedLocales.map((item) => (
                    <option key={item} value={item}>
                      {localeLabels[item]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <nav className="flex flex-col gap-2 text-sm font-semibold text-foreground">
              {headerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="motion-premium rounded-[1.35rem] border border-transparent px-4 py-3 text-sm font-medium text-text-secondary transition hover:border-border-subtle hover:bg-bg-subtle"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/search"
                className="motion-premium rounded-[1.35rem] border border-transparent px-4 py-3 text-sm font-medium text-text-secondary transition hover:border-border-subtle hover:bg-bg-subtle"
                onClick={closeMobileMenu}
              >
                Search verified therapists
              </Link>

              <Link
                href="/search"
                className="motion-premium rounded-[1.35rem] bg-action-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-action-primary-hover"
                onClick={closeMobileMenu}
              >
                Find trusted therapists
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
