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
  LayoutDashboard,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

function ExploreDropdown({ isDarkHero = false }: { isDarkHero?: boolean }) {
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
        className={`flex items-center gap-1 font-sans text-sm font-medium transition-colors ${
          isDarkHero
            ? "text-white/80 hover:text-white"
            : "text-[#4A4F5C] hover:text-[#0B1F3A]"
        }`}
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

function MobileNav({ dashboardPath, authenticated }: { dashboardPath: string; authenticated: boolean }) {
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
    authenticated
      ? { href: dashboardPath, label: "Dashboard" }
      : { href: "/login", label: "Login / Sign up" },
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

      <SheetContent side="right" className="w-[280px] bg-background border-border p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-display text-lg font-bold tracking-tighter text-foreground"
          >
            Masseur<span className="text-[#FF8A1F]">Match</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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

        <div className="mt-auto px-5 pb-6 pt-4 border-t border-border space-y-2">
          <Link
            href={authenticated ? dashboardPath : "/login"}
            onClick={() => setOpen(false)}
            className="block w-full text-center rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {authenticated ? "Dashboard" : "Log In"}
          </Link>
          <Link
            href={authenticated ? dashboardPath : "/signup"}
            onClick={() => setOpen(false)}
            className="block w-full text-center rounded-lg bg-[#FF8A1F] py-2.5 text-sm font-semibold text-[#0B1F3A] hover:bg-[#ff9d3f] transition-colors"
          >
            {authenticated ? "Open Dashboard" : "Get Started"}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [dashboardPath, setDashboardPath] = useState("/pro/dashboard");
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(Boolean(data?.authenticated));
        if (data?.dashboardPath) {
          setDashboardPath(data.dashboardPath);
        }
      })
      .catch(() => {
        setAuthenticated(false);
      });
  }, []);

  const isDarkHero = isHomepage && !isScrolled;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#FCFBF8]/95 backdrop-blur-xl border-b border-[#E2E6F0] shadow-sm"
          : isDarkHero
            ? "bg-transparent"
            : "bg-[#FCFBF8]/90 backdrop-blur-sm"
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 py-4">
        <Link href="/" className="group flex items-center gap-2">
          <span
            className={`font-['Georgia','Times_New_Roman',serif] text-[24px] font-bold tracking-tight transition-colors ${
              isDarkHero ? "text-white" : "text-[#0B1F3A]"
            }`}
          >
            Masseur<span className="text-[#FF8A1F]">Match</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <ExploreDropdown isDarkHero={isDarkHero} />
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                isDarkHero
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-[#4A4F5C] hover:text-[#0B1F3A] hover:bg-[#F4F6F9]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={authenticated ? dashboardPath : "/login"}
            className={`hidden md:flex px-4 py-2 text-sm font-medium transition-colors items-center gap-2 ${
              isDarkHero ? "text-white/80 hover:text-white" : "text-[#4A4F5C] hover:text-[#0B1F3A]"
            }`}
          >
            {authenticated ? <LayoutDashboard className="w-4 h-4" /> : null}
            {authenticated ? "Dashboard" : "Log in"}
          </Link>
          <Link
            href={authenticated ? dashboardPath : "/signup"}
            className="hidden sm:flex h-10 px-6 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 bg-[#FF8A1F] text-[#0B1F3A] hover:bg-[#ff9d3f] hover:shadow-lg hover:shadow-[#FF8A1F]/30 hover:scale-[1.02]"
          >
            {authenticated ? "Open Dashboard" : "Get Started"}
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
          <MobileNav dashboardPath={dashboardPath} authenticated={authenticated} />
        </div>
      </div>
    </motion.header>
  );
}
