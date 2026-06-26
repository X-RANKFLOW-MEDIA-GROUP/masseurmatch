"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ArrowUpRight, Phone, Mail } from "lucide-react";
import { SiteFooterTalk } from "@/components/marketing/SiteFooterTalk";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname === "/") {
    return <SiteFooterTalk />;
  }

  // Admin and Pro layouts have their own chrome — hide the marketing footer
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/pro")) {
    return null;
  }

  return (
    <footer className="bg-[#1A1A1A] text-gray-400 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">

        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">

          {/* Left side: Logo text + email */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl font-extrabold tracking-tight text-white">
                MASSEUR MATCH
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              e.mail@masseurmatch.com
            </p>
            <div className="space-y-2">
              <a href="tel:+19786277387" className="flex items-center gap-2 font-sans text-sm text-slate-400 hover:text-white transition-colors">
                <Phone className="w-[0.9rem] h-[0.9rem] shrink-0" strokeWidth={2.25} />
                978-MASSEUR (627-7387)
              </a>
              <a href="mailto:support@masseurmatch.com" className="flex items-center gap-2 font-sans text-sm text-slate-400 hover:text-white transition-colors">
                <Mail className="w-[0.9rem] h-[0.9rem] shrink-0" strokeWidth={2.25} />
                support@masseurmatch.com
              </a>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <ShieldCheck className="w-[1.1rem] h-[1.1rem] text-emerald-400" strokeWidth={2.25} />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Verified Secure Network
              </span>
            </div>
          </div>

          {/* Right side: Contact info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <Phone className="w-[1.1rem] h-[1.1rem] text-white" strokeWidth={2.25} />
              <span className="text-sm text-white">+(00) 234-6870</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-[1.1rem] h-[1.1rem] text-white" strokeWidth={2.25} />
              <span className="text-sm text-white">+(519) 255-6779</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Links */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.08] gap-4">
          <p className="font-sans text-xs text-gray-500">
            &copy; {currentYear} MasseurMatch. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
