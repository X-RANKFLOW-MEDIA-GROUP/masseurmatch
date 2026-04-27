// src/app/_components/SiteHeader.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  MapPin,
  Users,
  Navigation,
  ArrowUpRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/* ── nav data ─────────────────────────────────────────── */

const exploreItems = [
  { href: "/explore", label: "Explore", icon: Navigation },
  { href: "/therapists", label: "Therapists", icon: Users },
  { href: "/cities", label: "Cities", icon: MapPin },
];

const navLinks = [
  { href: "/therapists", label: "Therapists" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/for-therapists", label: "For Therapists" },
  { href: "/trust", label: "Trust" },
];

/* ── Explore dropdown (desktop) ───────────────────────── */

function ExploreDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1 font-sans text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        Explore
        <ChevronDown
          className={`w-3 h-3 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute top-full left-0 mt-3 w-52 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl p-1.5 shadow-xl"
          >
            {exploreItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
              >
                <Icon className="w-4 h-4 opacity-60" />
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Mobile nav (Sheet) ───────────────────────────────── */

function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const allLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/therapists", label: "Therapists" },
    { href: "/cities", label: "Cities" },
    { href: "/blog", label: "Blog" },
    { href: "/for-therapists", label: "For Therapists" },
    { href: "/how-it-works", label: "How it Works" },
    { href: "/trust", label: "Trust & Safety" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/login", label: "Login / Sign up" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[280px] bg-background border-border p-0"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-display text-lg font-bold tracking-tighter text-foreground"
          >
            Masseur<span className="text-muted-foreground">Match</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* links */}
        <nav className="flex flex-col px-3 py-4 gap-0.5">
          {allLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* auth CTAs */}
        <div className="mt-auto px-5 pb-6 pt-4 border-t border-border space-y-2">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block w-full text-center rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="block w-full text-center rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Main Header ──────────────────────────────────────── */

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm' 
          : 'bg-white/50 backdrop-blur-sm'
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2"
        >
          <span className="font-display text-[24px] font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            MasseurMatch
          </span>
        </Link>

        {/* Center Navigation — desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          <ExploreDropdown />
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-lg"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right CTAs — desktop + mobile hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:flex px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="hidden sm:flex h-10 px-6 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-[1.02]"
          >
            Get Started
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
          <MobileNav />
        </div>
      </div>
    </motion.header>
  );
}
