// src/app/_components/SiteHeader.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { BRAND_ASSETS } from "@/lib/brand";
import {
  Users,
  Search,
  MapPin,
  Scale,
  Compass,
  Lightbulb,
  ShieldCheck,
  BadgeCheck,
  BookOpen,
  Tag,
  Info,
  Phone,
  FileText,
  Newspaper,
  UserCircle,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import type { LucideIcon } from "lucide-react";

interface NavChild {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { label: "Therapists", icon: Users, href: "/therapists" },
  {
    label: "Explore",
    icon: Compass,
    children: [
      { href: "/explore", label: "Browse & Map", icon: Compass, description: "Discover therapists visually" },
      { href: "/search", label: "Search", icon: Search, description: "Filter by city, type, price" },
      { href: "/near-me", label: "Near Me", icon: MapPin, description: "Find therapists nearby" },
      { href: "/compare", label: "Compare", icon: Scale, description: "Side-by-side comparison" },
    ],
  },
  { label: "How It Works", icon: Lightbulb, href: "/how-it-works" },
  {
    label: "Trust",
    icon: ShieldCheck,
    children: [
      { href: "/trust", label: "Trust & Safety", icon: ShieldCheck, description: "Our safety commitment" },
      { href: "/verification", label: "Verification", icon: BadgeCheck, description: "How we verify profiles" },
      { href: "/community-guidelines", label: "Guidelines", icon: BookOpen, description: "Community standards" },
    ],
  },
  { label: "Pricing", icon: Tag, href: "/pricing" },
  {
    label: "About",
    icon: Info,
    children: [
      { href: "/about", label: "About Us", icon: Info, description: "Our story & mission" },
      { href: "/contact", label: "Contact", icon: Phone, description: "Get in touch" },
      { href: "/blog", label: "Blog", icon: Newspaper, description: "Articles & updates" },
      { href: "/legal", label: "Legal", icon: FileText, description: "Terms & privacy" },
    ],
  },
];

function DropdownMenu({
  children,
  isOpen,
  onClose,
}: {
  children: NavChild[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-full pt-2 -translate-x-1/2"
        >
          <div
            className="min-w-[240px] rounded-xl border border-[#E8E8E8] bg-white p-1.5 shadow-[var(--shadow-sm)]"
            role="menu"
          >
            {children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                role="menuitem"
                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#F7F7F7]"
              >
                <child.icon
                  className="mt-0.5 w-4 h-4 text-[#6F6F6F] group-hover:text-[#8B1E2D] transition-colors shrink-0"
                  strokeWidth={2.25}
                />
                <div>
                  <p className="text-sm font-semibold text-[#111111]">
                    {child.label}
                  </p>
                  {child.description && (
                    <p className="text-[11px] text-[#6F6F6F] leading-snug mt-0.5">
                      {child.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DesktopNavItem({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const openMenu = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 150);
  }, []);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (item.href) {
    return (
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Link
          href={item.href}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition-colors ${
            active
              ? "bg-[#8B1E2D] text-white shadow-sm"
              : "text-[#6F6F6F] hover:text-[#111111] hover:bg-[#F7F7F7]"
          }`}
        >
          <item.icon className="w-[0.9rem] h-[0.9rem]" strokeWidth={2.35} />
          {item.label}
        </Link>
      </motion.div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <motion.button
        type="button"
        whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition-colors ${
          active
            ? "bg-[#8B1E2D] text-white shadow-sm"
            : "text-[#6F6F6F] hover:text-[#111111] hover:bg-[#F7F7F7]"
        }`}
      >
        <item.icon className="w-[0.9rem] h-[0.9rem]" strokeWidth={2.35} />
        {item.label}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </motion.button>
      {item.children && (
        <DropdownMenu isOpen={isOpen} onClose={closeMenu}>
          {item.children}
        </DropdownMenu>
      )}
    </div>
  );
}

function MobileNav({
  dashboardPath,
  authenticated,
  onLogout,
}: {
  dashboardPath: string;
  authenticated: boolean | null;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const flatLinks: { href: string; label: string; icon: LucideIcon; section?: string }[] = [];
  for (const item of navItems) {
    if (item.href) {
      flatLinks.push({ href: item.href, label: item.label, icon: item.icon });
    } else if (item.children) {
      for (const child of item.children) {
        flatLinks.push({ href: child.href, label: child.label, icon: child.icon, section: item.label });
      }
    }
  }

  const sections: { label: string | null; links: typeof flatLinks }[] = [];
  let currentSection: string | null | undefined = undefined;
  for (const link of flatLinks) {
    const sec = link.section ?? null;
    if (sec !== currentSection) {
      currentSection = sec;
      sections.push({ label: sec, links: [] });
    }
    sections[sections.length - 1].links.push(link);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#111111] hover:bg-[#F7F7F7] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[300px] bg-white border-l border-[#E8E8E8] p-0"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
            aria-label="MasseurMatch home"
          >
            <div className="w-8 h-8 rounded-md bg-[#8B1E2D] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm leading-none">
                MM
              </span>
            </div>
            <span className="font-bold text-[#111111] text-sm tracking-tight">
              MASSEURMATCH
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F6F] hover:text-[#111111] hover:bg-[#F7F7F7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex flex-col px-3 py-3 gap-0.5 overflow-y-auto max-h-[calc(100vh-200px)]">
          {sections.map((section, si) => (
            <div key={si}>
              {section.label && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F6F6F]">
                  {section.label}
                </p>
              )}
              {section.links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#8B1E2D] text-white"
                        : "text-[#6F6F6F] hover:bg-[#F7F7F7] hover:text-[#111111]"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2.25} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}

          {authenticated !== null && authenticated && (
            <Link
              href={dashboardPath}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === dashboardPath
                  ? "bg-[#8B1E2D] text-white"
                  : "text-[#6F6F6F] hover:bg-[#F7F7F7] hover:text-[#111111]"
              }`}
            >
              <UserCircle className="w-4 h-4" strokeWidth={2.25} />
              Dashboard
            </Link>
          )}
          {authenticated !== null && !authenticated && (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/login"
                  ? "bg-[#8B1E2D] text-white"
                  : "text-[#6F6F6F] hover:bg-[#F7F7F7] hover:text-[#111111]"
              }`}
            >
              <UserCircle className="w-4 h-4" strokeWidth={2.25} />
              Log In
            </Link>
          )}
        </nav>

        <div className="mt-auto px-5 pb-6 pt-4 border-t border-[#E8E8E8] space-y-2">
          {authenticated === null ? (
            <div className="h-10 animate-pulse rounded-lg bg-[#F7F7F7]" />
          ) : authenticated ? (
            <>
              <Link
                href={dashboardPath}
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-lg border border-[#E8E8E8] py-2.5 text-sm font-medium text-[#111111] hover:bg-[#F7F7F7] transition-colors"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="block w-full text-center rounded-full bg-[#8B1E2D] py-2.5 text-sm font-semibold text-white hover:bg-[#6E1521] transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-lg border border-[#E8E8E8] py-2.5 text-sm font-medium text-[#111111] hover:bg-[#F7F7F7] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-full bg-[#8B1E2D] py-2.5 text-sm font-semibold text-white hover:bg-[#6E1521] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [dashboardPath, setDashboardPath] = useState("/login");
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const isAppSection =
    pathname?.startsWith("/admin") || pathname?.startsWith("/pro");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        const isAuthenticated = Boolean(data?.authenticated);
        setAuthenticated(isAuthenticated);
        setDashboardPath(
          isAuthenticated && data?.dashboardPath
            ? data.dashboardPath
            : "/login"
        );
      })
      .catch(() => {
        if (!mounted) return;
        setAuthenticated(false);
        setDashboardPath("/login");
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }
    setAuthenticated(false);
    setDashboardPath("/login");
    router.push("/");
    router.refresh();
  }

  if (isAppSection) return null;

  function isItemActive(item: NavItem): boolean {
    if (item.href) return pathname === item.href;
    return item.children?.some((c) => pathname === c.href) ?? false;
  }

  return (
    <motion.header
      initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled
          ? "shadow-[var(--shadow-xs)] border-b border-[#E8E8E8]"
          : "border-b border-transparent"
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 py-3">
        {/* Left: Logo area */}
        <Link
          href="/"
          className="group flex items-center gap-3 shrink-0"
          aria-label="MasseurMatch home"
        >
          <div className="relative w-10 h-10 rounded-lg bg-[#8B1E2D] flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-base leading-none tracking-tight">
              MM
            </span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold text-[#111111] text-[15px] tracking-tight leading-tight">
              MASSEURMATCH
            </span>
            <span className="text-[9px] font-semibold text-[#6F6F6F] tracking-[0.12em] uppercase leading-tight">
              Premium Sports Recovery &amp; Wellness
            </span>
          </div>
          <Image
            src={BRAND_ASSETS.logo}
            alt="MasseurMatch"
            width={1}
            height={1}
            priority
            className="sr-only"
          />
        </Link>

        {/* Center: Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5" suppressHydrationWarning>
          {navItems.map((item) => (
            <DesktopNavItem
              key={item.label}
              item={item}
              active={isItemActive(item)}
            />
          ))}

          <div suppressHydrationWarning>
          {authenticated === null ? (
            <div className="w-16 h-8 animate-pulse rounded-md bg-[#F7F7F7] ml-0.5" />
          ) : authenticated ? (
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href={dashboardPath}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md text-[#6F6F6F] hover:text-[#111111] hover:bg-[#F7F7F7] transition-colors"
              >
                <UserCircle
                  className="w-[0.9rem] h-[0.9rem]"
                  strokeWidth={2.35}
                />
                Dashboard
              </Link>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md text-[#6F6F6F] hover:text-[#111111] hover:bg-[#F7F7F7] transition-colors"
              >
                <UserCircle
                  className="w-[0.9rem] h-[0.9rem]"
                  strokeWidth={2.35}
                />
                Login
              </Link>
            </motion.div>
          )}
          </div>
        </nav>

        {/* Right: CTA + auth actions + mobile nav */}
        <div className="flex items-center gap-3 shrink-0" suppressHydrationWarning>
          {authenticated !== null && authenticated && (
            <motion.button
              type="button"
              onClick={handleLogout}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md text-[#6F6F6F] hover:text-[#8B1E2D] hover:bg-[#F8EDEE] transition-colors"
            >
              <LogOut className="w-[0.9rem] h-[0.9rem]" strokeWidth={2.35} />
              Log out
            </motion.button>
          )}
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/signup"
              className="hidden sm:flex h-10 px-6 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 bg-[#8B1E2D] text-white hover:bg-[#6E1521] hover:shadow-lg hover:shadow-[#8B1E2D]/20"
            >
              GET STARTED
            </Link>
          </motion.div>
          <MobileNav
            dashboardPath={dashboardPath}
            authenticated={authenticated}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </motion.header>
  );
}
