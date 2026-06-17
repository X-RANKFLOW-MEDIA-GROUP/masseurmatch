// src/app/_components/EnterpriseStyleHero.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import KnottyGlassChat from "./KnottyGlassChat"; // We will build this next
import FastSEOTextBanner from "./FastSEOTextBanner";

export default function EnterpriseStyleHero() {
  const [userLocation, setUserLocation] = useState<string | null>(null);

  // Request Location on Mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse-geocode these coords to a city name
          setUserLocation("Location Shared"); 
        },
        () => { /* location denied or unavailable — silently skip */ }
      );
    }
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col bg-slate-950 overflow-hidden pt-32 pb-0">
      {/* Subtle Glowing Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 z-10">
        
        {/* LEFT COLUMN: Clean, Legible Typography */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 flex flex-col items-start text-left"
        >
          {/* Replaced hardcoded local cities with a dynamic/inclusive badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-slate-900 border border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
              {userLocation ? "Therapists available near you" : "Nationwide Network"}
            </span>
          </div>

          {/* Adjusted Font Spacing for Readability */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.1] mb-6">
            Elite wellness, <br/>
            <span className="text-slate-400">tailored for you.</span>
          </h1>

          <p className="font-sans text-lg sm:text-xl font-light text-slate-300 max-w-lg leading-relaxed mb-8">
            Experience the highest standard of holistic massage therapy. Inclusive, professional, and discreet.
          </p>
        </motion.div>

        {/* RIGHT COLUMN: Knotty AI Chat Box */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 w-full max-w-md lg:max-w-none relative z-20"
        >
          <KnottyGlassChat userLocation={userLocation} />
        </motion.div>

      </div>

      {/* BOTTOM BANNER: Fast moving SEO Marquee */}
      <div className="mt-auto w-full border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
        <FastSEOTextBanner />
      </div>
    </section>
  );
}