// src/app/_components/SiteHeader.tsx
"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/* ── nav data ─────────────────────────────────────────── */

const exploreItems = [
  { href: "/cities", label: "Cities", icon: MapPin },
  { href: "/therapists", label: "All Therapists", icon: Users },
  { href: "/explore", label: "Near Me", icon: Navigation },
];

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/for-therapists", label: "For Therapists" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/trust", label: "Trust & Safety" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
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
    { href: "/cities", label: "Cities" },
    { href: "/therapists", label: "All Therapists" },
    ...navLinks,
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
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ width: "40%", opacity: 0, y: -20 }}
      animate={{ width: "100%", opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300 ${isScrolled ? 'pt-0' : 'pt-4'}`}
    >
      <div className={`w-full max-w-7xl pointer-events-auto flex items-center justify-between px-5 py-3 rounded-2xl shadow-2xl border ${isScrolled
        ? 'bg-white/70 backdrop-blur-md border-white/20 shadow-sm'
        : 'bg-transparent border-transparent'} transition-all duration-300`}>
        {/* Logo */}
        <Link
          href="/"
          className={`font-display text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 select-none`}
        >
          Masseur<span className="text-brand-secondary">Match</span>
        </Link>

        {/* Center Navigation — desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <ExploreDropdown />
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-sans text-sm font-medium transition-colors relative group ${isScrolled ? 'text-gray-700 hover:text-black' : 'text-white hover:text-gray-200'}`}
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Right CTAs — desktop + mobile hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`font-sans text-sm font-medium transition-colors hidden md:block ${isScrolled ? 'text-gray-700 hover:text-black' : 'text-white hover:text-brand-secondary'}`}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="hidden sm:flex h-9 px-4 bg-black text-white items-center justify-center rounded-full font-sans text-sm font-semibold hover:bg-gray-800 transition-colors active:scale-95 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Sign Up
          </Link>
          <MobileNav />
        </div>
      </div>
    </motion.header>
  );
}