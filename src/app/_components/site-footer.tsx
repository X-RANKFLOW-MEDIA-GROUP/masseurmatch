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

  return (
    <footer className="bg-[#060E1A] text-slate-400 pt-20 pb-10 border-t border-white/[0.06]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="font-['Georgia','Times_New_Roman',serif] text-2xl font-bold tracking-tight text-white inline-block">
              Masseur<span className="text-[#FF8A1F]">Match</span>
            </Link>
            <p className="font-sans text-sm leading-relaxed max-w-sm text-slate-400">
              A privacy-first directory connecting clients with independent LGBTQ+-affirming massage therapists across the United States.
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
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Verified Secure Network</span>
            </div>
          </div>

          {/* Links: Explore */}
          <div className="space-y-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-white">Explore</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li><Link href="/search" className="hover:text-white transition-colors">Find a Therapist</Link></li>
              <li><Link href="/near-me" className="hover:text-white transition-colors">Therapists Near Me</Link></li>
              <li><Link href="/cities" className="hover:text-white transition-colors">Browse by City</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Wellness Journal</Link></li>
            </ul>
          </div>

          {/* Links: For Professionals */}
          <div className="space-y-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-white">For Professionals</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li><Link href="/for-therapists" className="hover:text-white transition-colors">Join the Network</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Plans &amp; Pricing</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Provider Login</Link></li>
              <li><Link href="/trust" className="hover:text-white transition-colors">Quality Guidelines</Link></li>
            </ul>
          </div>

          {/* Links: Trust & Legal */}
          <div className="space-y-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-white">Trust &amp; Legal</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/trust" className="hover:text-white transition-colors">Trust &amp; Safety</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Location */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.06] gap-4">
          <p className="font-sans text-xs text-slate-500">
            &copy; {currentYear} MasseurMatch. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            <span className="flex items-center gap-1">
              United States <ArrowUpRight className="w-3 h-3 text-[#FF8A1F]" />
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
