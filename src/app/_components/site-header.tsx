// src/app/_components/SiteHeader.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function SiteHeader() {
  return (
    <motion.header 
      // Shrink and expand from center animation on load
      initial={{ width: "40%", opacity: 0, y: -20 }}
      animate={{ width: "100%", opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none"
    >
      <div className="w-full max-w-7xl bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl px-6 py-4 flex items-center justify-between pointer-events-auto shadow-2xl">
        
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-bold tracking-tighter text-white">
          Masseur<span className="text-slate-500">Match</span>
        </Link>

        {/* Center Navigation (Hidden on mobile for now) */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="relative group">
            <button className="flex items-center gap-1 font-sans text-sm text-slate-300 hover:text-white transition-colors">
              Explore <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform" />
            </button>
            {/* Submenu */}
            <div className="absolute top-full left-0 mt-4 w-48 bg-slate-900 border border-slate-800 rounded-xl p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all shadow-xl">
              <Link href="/cities" className="block px-4 py-2 font-sans text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg">Cities</Link>
              <Link href="/therapists" className="block px-4 py-2 font-sans text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg">All Therapists</Link>
            </div>
          </div>
          <Link href="/blog" className="font-sans text-sm text-slate-300 hover:text-white transition-colors">Journal</Link>
          <Link href="/trust" className="font-sans text-sm text-slate-300 hover:text-white transition-colors">Trust & Safety</Link>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="font-sans text-sm text-slate-300 hover:text-white transition-colors hidden sm:block">
            Log In
          </Link>
          <Link href="/signup" className="h-10 px-5 bg-white text-slate-950 flex items-center justify-center rounded-lg font-sans text-sm font-semibold hover:bg-slate-200 transition-colors active:scale-95">
            Sign Up
          </Link>
        </div>

      </div>
    </motion.header>
  );
}