import Link from "next/link";
import { ShieldCheck, ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="font-display text-2xl font-bold tracking-tighter text-white inline-block">
              Masseur<span className="text-slate-500">Match</span>
            </Link>
            <p className="font-sans text-sm leading-relaxed max-w-sm">
              The world&apos;s leading directory for high-performance massage therapy and elite holistic wellness professionals.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">Verified Secure Network</span>
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
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-900 gap-4">
          <p className="font-sans text-xs">
            &copy; {currentYear} MasseurMatch. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest">
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            <span className="flex items-center gap-1">
              Made in <ArrowUpRight className="w-3 h-3 text-slate-600" /> Dallas, TX
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
