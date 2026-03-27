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
        className="flex items-center gap-1 font-sans text-sm text-slate-300 hover:text-white transition-colors"
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
            className="absolute top-full left-0 mt-3 w-52 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl p-1.5 shadow-xl"
          >
            {exploreItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
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
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[280px] bg-slate-950 border-slate-800 p-0"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-display text-lg font-bold tracking-tighter text-white"
          >
            Masseur<span className="text-slate-500">Match</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
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
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* auth CTAs */}
        <div className="mt-auto px-5 pb-6 pt-4 border-t border-slate-800 space-y-2">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block w-full text-center rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="block w-full text-center rounded-lg bg-white py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-colors"
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
          ? 'bg-slate-950/95 backdrop-blur-xl border-b border-white/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2"
        >
          <span className="font-serif text-[22px] font-medium tracking-tight text-white">
            Masseur<span className="text-white/50">Match</span>
          </span>
        </Link>

        {/* Center Navigation — desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 text-[13px] font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right CTAs — desktop + mobile hamburger */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden md:flex px-4 py-2 text-[13px] font-medium text-white/70 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="hidden sm:flex h-10 px-5 items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-300 bg-white text-slate-950 hover:bg-white/90 hover:scale-[1.02]"
          >
            Get Started
            <ArrowUpRight className="ml-1.5 w-3.5 h-3.5" />
          </Link>
          <MobileNav />
        </div>
      </div>
    </motion.header>
  );
}
