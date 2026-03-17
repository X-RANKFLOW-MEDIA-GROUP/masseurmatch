"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AppButton } from "@/app/_components/primitives";

export const SITE_HEADER_LINKS = [
  { href: "/therapists", label: "Therapists" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/safety", label: "Safety" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="font-heading text-xl font-bold tracking-tight text-text-primary">
          MasseurMatch
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-6 text-sm font-semibold text-text-secondary lg:flex">
            {SITE_HEADER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/search"
            className="hidden items-center rounded-full border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/20 hover:text-primary sm:inline-flex"
          >
            Search
          </Link>
          <AppButton asChild size="sm" className="hidden rounded-full px-5 sm:inline-flex">
            <Link href="/register">Upgrade profile</Link>
          </AppButton>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:border-primary/20 hover:text-primary lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id="site-mobile-menu" className="border-t border-border bg-white lg:hidden">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-2 text-sm font-semibold text-foreground">
              {SITE_HEADER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-transparent px-4 py-3 transition hover:border-primary/15 hover:bg-secondary"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/search"
                className="rounded-2xl border border-transparent px-4 py-3 transition hover:border-primary/15 hover:bg-secondary"
                onClick={closeMobileMenu}
              >
                Search
              </Link>
              <Link
                href="/register"
                className="rounded-2xl bg-action-primary px-4 py-3 text-center text-white transition hover:bg-action-primary-hover"
                onClick={closeMobileMenu}
              >
                Upgrade profile
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
