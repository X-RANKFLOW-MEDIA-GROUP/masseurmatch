"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Phone, Mail } from "lucide-react";
import { IconShield } from "@/components/icons";
import { SiteFooterTalk } from "@/components/marketing/SiteFooterTalk";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname === "/") {
    return <SiteFooterTalk />;
  }

  // Admin, Pro, and the provider landing pages have their own chrome —
  // hide the marketing footer
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/pro") ||
    pathname?.startsWith("/providers")
  ) {
    return null;
  }

  return (
    <footer className="bg-[#111111] text-gray-400 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">

        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">

          {/* Brand + contact */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl font-extrabold tracking-tight text-white">
                MASSEURMATCH
              </span>
            </Link>
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
            <div className="flex items-center gap-2">
              <IconShield size={18} className="text-emerald-400" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
                Verified Secure Network
              </span>
            </div>
          </div>

        </div>

        {/* Policy link grid */}
        <div className="mb-12 grid grid-cols-2 gap-y-8 gap-x-6 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-3">Legal</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/platform-disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
              <li><Link href="/law-enforcement" className="hover:text-white transition-colors">Law Enforcement</Link></li>
              <li><Link href="/legal" className="hover:text-white transition-colors">Legal Notices</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-3">Safety</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/community-guidelines" className="hover:text-white transition-colors">Community Guidelines</Link></li>
              <li><Link href="/content-guidelines" className="hover:text-white transition-colors">Content Guidelines</Link></li>
              <li><Link href="/report-block-safety" className="hover:text-white transition-colors">Report &amp; Safety</Link></li>
              <li><Link href="/prohibited-conduct" className="hover:text-white transition-colors">Prohibited Conduct</Link></li>
              <li><Link href="/moderation-policy" className="hover:text-white transition-colors">Moderation Policy</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-3">Providers</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/provider-terms" className="hover:text-white transition-colors">Provider Terms</Link></li>
              <li><Link href="/photo-profile-policy" className="hover:text-white transition-colors">Photo &amp; Profile Policy</Link></li>
              <li><Link href="/badge-disclaimer" className="hover:text-white transition-colors">Badge Disclaimer</Link></li>
              <li><Link href="/subscriptions" className="hover:text-white transition-colors">Subscriptions</Link></li>
              <li><Link href="/advertising-terms" className="hover:text-white transition-colors">Advertising Terms</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-3">Users</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/client-terms" className="hover:text-white transition-colors">Client Terms</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-white transition-colors">Acceptable Use</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/ai-disclosure" className="hover:text-white transition-colors">AI Disclosure</Link></li>
              <li><Link href="/data-deletion" className="hover:text-white transition-colors">Data Deletion</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-3">Communications</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/sms-terms" className="hover:text-white transition-colors">SMS Terms</Link></li>
              <li><Link href="/email-opt-out" className="hover:text-white transition-colors">Email Opt-Out</Link></li>
              <li><Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link></li>
              <li><Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Links */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.08] gap-4">
          <p className="font-sans text-xs text-gray-400">
            &copy; {currentYear} MasseurMatch. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
