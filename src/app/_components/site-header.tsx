// src/app/_components/SiteHeader.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { BRAND_ASSETS } from "@/lib/brand";
import {
  Home,
  Users,
  Heart,
  Tag,
  Info,
  Phone,
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

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/therapists", label: "Masseurs", icon: Users },
  { href: "/how-it-works", label: "How it Works", icon: Heart },
  { href: "/pricing", label: "Pricing", icon: Tag },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Phone },
];

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

  const allLinks: NavLink[] = [
    ...navLinks,
    authenticated
      ? { href: dashboardPath, label: "Dashboard", icon: UserCircle }
      : { href: "/login", label: "Login", icon: UserCircle },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[300px] bg-white border-l border-[#E5E5E5] p-0"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
            aria-label="MasseurMatch home"
          >
            <div className="w-8 h-8 rounded-md bg-[#CC2424] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm leading-none">
                MM
              </span>
            </div>
            <span className="font-bold text-[#1A1A1A] text-sm tracking-tight">
              MASSEURMATCH
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex flex-col px-3 py-4 gap-0.5">
          {allLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#CC2424] text-white"
                    : "text-[#666666] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]"
                }`}
              >
                <Icon
                  className="w-4 h-4"
                  strokeWidth={2.25}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-5 pb-6 pt-4 border-t border-[#E5E5E5] space-y-2">
          {authenticated === null ? (
            <div className="h-10 animate-pulse rounded-lg bg-[#F5F5F5]" />
          ) : authenticated ? (
            <>
              <Link
                href={dashboardPath}
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-lg border border-[#E5E5E5] py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="block w-full text-center rounded-full bg-[#CC2424] py-2.5 text-sm font-semibold text-white hover:bg-[#A81D1D] transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-lg border border-[#E5E5E5] py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-full bg-[#CC2424] py-2.5 text-sm font-semibold text-white hover:bg-[#A81D1D] transition-colors"
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

  // Don't render public marketing header on admin/pro -- they have their own layout shells
  if (isAppSection) return null;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled
          ? "shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-b border-[#E5E5E5]"
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
          <div className="relative w-10 h-10 rounded-lg bg-[#CC2424] flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-base leading-none tracking-tight">
              MM
            </span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold text-[#1A1A1A] text-[15px] tracking-tight leading-tight">
              MASSEURMATCH
            </span>
            <span className="text-[9px] font-semibold text-[#666666] tracking-[0.12em] uppercase leading-tight">
              Premium Sports Recovery &amp; Wellness
            </span>
          </div>
          {/* Keep Image import used -- hidden fallback */}
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
        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <motion.div
                key={href}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Link
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition-colors ${
                    active
                      ? "bg-[#CC2424] text-white shadow-sm"
                      : "text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]"
                  }`}
                >
                  <Icon
                    className="w-[0.9rem] h-[0.9rem]"
                    strokeWidth={2.35}
                  />
                  {label}
                </Link>
              </motion.div>
            );
          })}

          {/* LOGIN nav item */}
          {authenticated === null ? (
            <div className="w-16 h-8 animate-pulse rounded-md bg-[#F5F5F5] ml-0.5" />
          ) : authenticated ? (
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href={dashboardPath}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
              >
                <UserCircle
                  className="w-[0.9rem] h-[0.9rem]"
                  strokeWidth={2.35}
                />
                Login
              </Link>
            </motion.div>
          )}
        </nav>

        {/* Right: CTA + auth actions + mobile nav */}
        <div className="flex items-center gap-3 shrink-0">
          {authenticated !== null && authenticated && (
            <motion.button
              type="button"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md text-[#666666] hover:text-[#CC2424] hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-[0.9rem] h-[0.9rem]" strokeWidth={2.35} />
              Log out
            </motion.button>
          )}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/signup"
              className="hidden sm:flex h-10 px-6 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 bg-[#CC2424] text-white hover:bg-[#A81D1D] hover:shadow-lg hover:shadow-[#CC2424]/20"
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
