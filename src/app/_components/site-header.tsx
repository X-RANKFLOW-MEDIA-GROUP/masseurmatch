// src/app/_components/SiteHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { BRAND_ASSETS } from "@/lib/brand";
import {
  Users,
  Search,
  MapPin,
  ShieldCheck,
  Tag,
  UserCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Find a Masseur", icon: Search, href: "/search" },
  { label: "Cities", icon: MapPin, href: "/cities" },
  { label: "For Masseurs", icon: Users, href: "/for-therapists" },
  { label: "Safety", icon: ShieldCheck, href: "/safety" },
  { label: "Pricing", icon: Tag, href: "/pricing" },
];

function isPathActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (pathname === href) return true;
  if (href === "/cities") {
    return pathname.startsWith("/states/");
  }
  return false;
}

function DesktopNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Link
        href={item.href}
        className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
          active
            ? "bg-[#8B1E2D] text-white shadow-sm"
            : "text-[#6F6F6F] hover:bg-[#F7F7F7] hover:text-[#111111]"
        }`}
      >
        <item.icon className="h-[0.9rem] w-[0.9rem]" strokeWidth={2.35} />
        {item.label}
      </Link>
    </motion.div>
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#111111] transition-colors hover:bg-[#F7F7F7] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[300px] border-l border-[#E8E8E8] bg-white p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        <div className="flex items-center justify-between border-b border-[#E8E8E8] px-5 py-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
            aria-label="MasseurMatch home"
          >
            <Image
              src={BRAND_ASSETS.logoLockup}
              alt="MasseurMatch"
              width={168}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6F6F6F] transition-colors hover:bg-[#F7F7F7] hover:text-[#111111]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex max-h-[calc(100vh-200px)] flex-col gap-0.5 overflow-y-auto px-3 py-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isPathActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#8B1E2D] text-white"
                    : "text-[#6F6F6F] hover:bg-[#F7F7F7] hover:text-[#111111]"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
                {label}
              </Link>
            );
          })}

          {authenticated !== null && authenticated ? (
            <Link
              href={dashboardPath}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === dashboardPath
                  ? "bg-[#8B1E2D] text-white"
                  : "text-[#6F6F6F] hover:bg-[#F7F7F7] hover:text-[#111111]"
              }`}
            >
              <UserCircle className="h-4 w-4" strokeWidth={2.25} />
              Dashboard
            </Link>
          ) : null}

          {authenticated !== null && !authenticated ? (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === "/login"
                  ? "bg-[#8B1E2D] text-white"
                  : "text-[#6F6F6F] hover:bg-[#F7F7F7] hover:text-[#111111]"
              }`}
            >
              <UserCircle className="h-4 w-4" strokeWidth={2.25} />
              Log In
            </Link>
          ) : null}
        </nav>

        <div className="mt-auto space-y-2 border-t border-[#E8E8E8] px-5 pb-6 pt-4">
          {authenticated === null ? (
            <div className="h-10 animate-pulse rounded-lg bg-[#F7F7F7]" />
          ) : authenticated ? (
            <>
              <Link
                href={dashboardPath}
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg border border-[#E8E8E8] py-2.5 text-center text-sm font-medium text-[#111111] transition-colors hover:bg-[#F7F7F7]"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="block w-full rounded-full bg-[#8B1E2D] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#6E1521]"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg border border-[#E8E8E8] py-2.5 text-center text-sm font-medium text-[#111111] transition-colors hover:bg-[#F7F7F7]"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block w-full rounded-full bg-[#8B1E2D] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#6E1521]"
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
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/pro") ||
    pathname?.startsWith("/providers");

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
          isAuthenticated && data?.dashboardPath ? data.dashboardPath : "/login",
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

  return (
    <motion.header
      initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-0 right-0 top-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled
          ? "border-b border-[#E8E8E8] shadow-[var(--shadow-xs)]"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-3 lg:px-10">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="MasseurMatch home"
        >
          <Image
            src={BRAND_ASSETS.logoLockup}
            alt="MasseurMatch"
            width={236}
            height={56}
            priority
            className="h-11 w-auto object-contain md:h-14"
          />
          <div className="hidden flex-col lg:flex">
            <span className="text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-[#6F6F6F]">
              LGBTQ+-Affirming Male Massage
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" suppressHydrationWarning>
          {navItems.map((item) => (
            <DesktopNavItem
              key={item.label}
              item={item}
              active={isPathActive(pathname, item.href)}
            />
          ))}

          <div suppressHydrationWarning>
            {authenticated === null ? (
              <div className="ml-0.5 h-8 w-16 animate-pulse rounded-md bg-[#F7F7F7]" />
            ) : authenticated ? (
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Link
                  href={dashboardPath}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#6F6F6F] transition-colors hover:bg-[#F7F7F7] hover:text-[#111111]"
                >
                  <UserCircle className="h-[0.9rem] w-[0.9rem]" strokeWidth={2.35} />
                  Dashboard
                </Link>
              </motion.div>
            ) : (
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#6F6F6F] transition-colors hover:bg-[#F7F7F7] hover:text-[#111111]"
                >
                  <UserCircle className="h-[0.9rem] w-[0.9rem]" strokeWidth={2.35} />
                  Login
                </Link>
              </motion.div>
            )}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-3" suppressHydrationWarning>
          {authenticated !== null && authenticated ? (
            <motion.button
              type="button"
              onClick={handleLogout}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#6F6F6F] transition-colors hover:bg-[#F8EDEE] hover:text-[#8B1E2D] lg:flex"
            >
              <LogOut className="h-[0.9rem] w-[0.9rem]" strokeWidth={2.35} />
              Log out
            </motion.button>
          ) : null}
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/signup"
              className="hidden h-10 items-center justify-center rounded-full bg-[#8B1E2D] px-6 text-sm font-bold text-white transition-all duration-200 hover:bg-[#6E1521] hover:shadow-lg hover:shadow-[#8B1E2D]/20 sm:flex"
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
