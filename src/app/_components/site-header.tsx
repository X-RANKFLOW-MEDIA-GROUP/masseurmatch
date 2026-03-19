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
    <header className="sticky top-0 z-50 border-b border-[#e6eaf2] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] w-full max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-mono text-[15px] font-semibold uppercase tracking-[0.22em] text-[#10223f]">
          MasseurMatch
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-1 rounded-full border border-[#e5eaf1] bg-[#f8f9fc] p-1 lg:flex">
            {SITE_HEADER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#5b6574] transition hover:bg-white hover:text-[#10223f]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/search"
            className="hidden items-center rounded-full border border-[#d7dfec] bg-white px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f9cb0] transition hover:border-[#c5d0e1] hover:text-[#3a4f6f] sm:inline-flex"
          >
            Client Portal
          </Link>
          <AppButton asChild size="sm" className="hidden h-10 rounded-full bg-[#082145] px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[#0d2e5d] sm:inline-flex">
            <Link href="/search">Book a Demo</Link>
          </AppButton>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e2e8f3] bg-white text-foreground transition hover:border-[#b7c4da] hover:text-[#10223f] lg:hidden"
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
        <div id="site-mobile-menu" className="border-t border-[#e5eaf1] bg-white lg:hidden">
          <div className="mx-auto w-full max-w-[1320px] px-4 py-4 sm:px-6">
            <nav className="flex flex-col gap-2 text-sm font-semibold text-foreground">
              {SITE_HEADER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-transparent px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#43566f] transition hover:border-[#dbe2ef] hover:bg-[#f7f9fc]"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/search"
                className="rounded-2xl border border-transparent px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#43566f] transition hover:border-[#dbe2ef] hover:bg-[#f7f9fc]"
                onClick={closeMobileMenu}
              >
                Client Portal
              </Link>
              <Link
                href="/search"
                className="rounded-2xl bg-[#082145] px-4 py-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-white transition hover:bg-[#0d2e5d]"
                onClick={closeMobileMenu}
              >
                Book a Demo
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
