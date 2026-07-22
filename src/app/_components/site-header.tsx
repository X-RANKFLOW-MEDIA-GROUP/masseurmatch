"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  ChevronDown,
  Compass,
  FileText,
  Info,
  Lightbulb,
  LogOut,
  MapPin,
  Menu,
  Newspaper,
  Phone,
  Scale,
  Search,
  ShieldCheck,
  Tag,
  UserCircle,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { BRAND_ASSETS } from "@/lib/brand";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type NavChild = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  { label: "Therapists", icon: Users, href: "/therapists" },
  {
    label: "Explore",
    icon: Compass,
    children: [
      { href: "/explore", label: "Browse & Map", icon: Compass, description: "Discover therapists visually" },
      { href: "/search", label: "Search", icon: Search, description: "Filter by city, type, and price" },
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
      { href: "/verification", label: "Verification", icon: BadgeCheck, description: "How profiles are verified" },
      { href: "/community-guidelines", label: "Guidelines", icon: BookOpen, description: "Community standards" },
    ],
  },
  { label: "Pricing", icon: Tag, href: "/pricing" },
  {
    label: "About",
    icon: Info,
    children: [
      { href: "/about", label: "About Us", icon: Info, description: "Our story and mission" },
      { href: "/contact", label: "Contact", icon: Phone, description: "Get in touch" },
      { href: "/blog", label: "Blog", icon: Newspaper, description: "Articles and updates" },
      { href: "/legal", label: "Legal", icon: FileText, description: "Terms and privacy" },
    ],
  },
];

function DropdownMenu({ children, isOpen, onClose }: { children: NavChild[]; isOpen: boolean; onClose: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-full -translate-x-1/2 pt-2"
        >
          <div className="min-w-[250px] rounded-xl border border-[#E8E8E8] bg-white p-1.5 shadow-xl" role="menu">
            {children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                role="menuitem"
                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#F7F7F7]"
              >
                <child.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#6F6F6F] transition-colors group-hover:text-[#8B1E2D]" strokeWidth={2.25} />
                <div>
                  <p className="text-sm font-semibold text-[#111111]">{child.label}</p>
                  {child.description ? <p className="mt-0.5 text-[11px] leading-snug text-[#6F6F6F]">{child.description}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DesktopNavItem({ item, active, dark }: { item: NavItem; active: boolean; dark: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  const openMenu = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 150);
  }, []);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const inactiveClass = dark
    ? "text-white/80 hover:bg-white/10 hover:text-white"
    : "text-[#5B5B5B] hover:bg-[#F7F7F7] hover:text-[#111111]";
  const itemClass = `flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
    active ? "bg-[#8B1E2D] text-white shadow-sm" : inactiveClass
  }`;

  if (item.href) {
    return (
      <motion.div whileHover={reduceMotion ? undefined : { scale: 1.04 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
        <Link href={item.href} className={itemClass}>
          <item.icon className="h-[0.9rem] w-[0.9rem]" strokeWidth={2.35} />
          {item.label}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <motion.button
        type="button"
        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={itemClass}
      >
        <item.icon className="h-[0.9rem] w-[0.9rem]" strokeWidth={2.35} />
        {item.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
      </motion.button>
      {item.children ? <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>{item.children}</DropdownMenu> : null}
    </div>
  );
}

function MobileNav({ dashboardPath, authenticated, onLogout }: { dashboardPath: string; authenticated: boolean | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#A83A49] bg-[#8B1E2D] text-white shadow-lg shadow-black/20 transition hover:bg-[#6E1521] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4717E] focus-visible:ring-offset-2 lg:hidden"
        >
          <Menu className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="flex h-dvh w-[min(92vw,360px)] flex-col border-l border-white/10 bg-[#111111] p-0 text-white shadow-2xl">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        <div className="flex items-center justify-between border-b border-white/10 bg-[#151515] px-5 py-4">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center" aria-label="MasseurMatch home">
            <Image
              src={BRAND_ASSETS.logoLockup}
              alt="MasseurMatch"
              width={247}
              height={40}
              className="h-9 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-[#8B1E2D]"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {navItems.map((item) => {
            if (item.href) {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`mb-1 flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition ${
                    active ? "bg-[#8B1E2D] text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0 text-[#D4717E]" strokeWidth={2.25} />
                  {item.label}
                </Link>
              );
            }

            return (
              <div key={item.label} className="mt-4 border-t border-white/10 pt-3">
                <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D4717E]">{item.label}</p>
                {item.children?.map((child) => {
                  const active = pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className={`mb-1 flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition ${
                        active ? "bg-[#8B1E2D] text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <child.icon className="h-5 w-5 shrink-0 text-[#D4717E]" strokeWidth={2.25} />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {authenticated ? (
            <Link href={dashboardPath} onClick={() => setOpen(false)} className="mt-4 flex min-h-12 items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] font-semibold text-white">
              <UserCircle className="h-5 w-5 text-[#D4717E]" /> Dashboard
            </Link>
          ) : null}
        </nav>

        <div className="border-t border-white/10 bg-[#151515] p-5">
          {authenticated === null ? <div className="h-11 animate-pulse rounded-xl bg-white/10" /> : authenticated ? (
            <button
              type="button"
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B1E2D] py-3 text-sm font-bold text-white hover:bg-[#6E1521]"
            >
              <LogOut className="h-4 w-4" /> Log Out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-bold text-white hover:bg-white/10">Log In</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="rounded-xl bg-[#8B1E2D] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#6E1521]">Get Started</Link>
            </div>
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
  const reduceMotion = useReducedMotion();
  const isAppSection = pathname?.startsWith("/admin") || pathname?.startsWith("/pro") || pathname?.startsWith("/providers");
  const darkAtTop = pathname === "/about" && !isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!mounted) return;
        const loggedIn = Boolean(data?.authenticated);
        setAuthenticated(loggedIn);
        setDashboardPath(loggedIn && data?.dashboardPath ? data.dashboardPath : "/login");
      })
      .catch(() => {
        if (!mounted) return;
        setAuthenticated(false);
        setDashboardPath("/login");
      });
    return () => { mounted = false; };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Keep local logout responsive even if the request fails.
    }
    setAuthenticated(false);
    setDashboardPath("/login");
    router.push("/");
    router.refresh();
  }

  if (isAppSection) return null;

  const isItemActive = (item: NavItem) => item.href ? pathname === item.href : item.children?.some((child) => pathname === child.href) ?? false;

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        darkAtTop
          ? "border-white/10 bg-[#111111]/95 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-[#E8E8E8] bg-white/95 shadow-sm backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-2.5 sm:px-6 lg:px-10 lg:py-3">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="MasseurMatch home">
          <Image
            src={BRAND_ASSETS.logoLockup}
            alt="MasseurMatch"
            width={345}
            height={56}
            priority
            className={`h-10 w-auto object-contain transition md:h-14 ${darkAtTop ? "brightness-0 invert" : ""}`}
          />
          <span className={`hidden text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] lg:block ${darkAtTop ? "text-white/65" : "text-[#6F6F6F]"}`}>
            LGBTQ+-Affirming Male Massage
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" suppressHydrationWarning>
          {navItems.map((item) => <DesktopNavItem key={item.label} item={item} active={isItemActive(item)} dark={darkAtTop} />)}
          {authenticated === null ? <div className={`ml-1 h-8 w-16 animate-pulse rounded-md ${darkAtTop ? "bg-white/10" : "bg-[#F7F7F7]"}`} /> : (
            <Link
              href={authenticated ? dashboardPath : "/login"}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                darkAtTop ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-[#5B5B5B] hover:bg-[#F7F7F7] hover:text-[#111111]"
              }`}
            >
              <UserCircle className="h-[0.9rem] w-[0.9rem]" strokeWidth={2.35} />
              {authenticated ? "Dashboard" : "Login"}
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-3" suppressHydrationWarning>
          {authenticated ? (
            <button type="button" onClick={handleLogout} className={`hidden items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors lg:flex ${darkAtTop ? "text-white/75 hover:bg-white/10 hover:text-white" : "text-[#6F6F6F] hover:bg-[#F8EDEE] hover:text-[#8B1E2D]"}`}>
              <LogOut className="h-[0.9rem] w-[0.9rem]" /> Log out
            </button>
          ) : null}
          <Link href="/signup" className="hidden h-10 items-center justify-center rounded-full bg-[#8B1E2D] px-6 text-sm font-bold text-white transition hover:bg-[#6E1521] hover:shadow-lg sm:flex">
            GET STARTED
          </Link>
          <MobileNav dashboardPath={dashboardPath} authenticated={authenticated} onLogout={handleLogout} />
        </div>
      </div>
    </motion.header>
  );
}
