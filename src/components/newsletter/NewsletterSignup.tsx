"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !city) return;
    
    setStatus("loading");
    // Simulate API call to your backend
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <section className="bg-slate-950 text-white py-20 relative overflow-hidden">
      {/* Subtle luxury glow effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Copywriting Side */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Mail className="w-4 h-4 text-slate-300" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
                The City Digest
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.1]">
              Exclusive wellness, <br />
              <span className="text-slate-400">delivered weekly.</span>
            </h2>
            <p className="font-sans text-slate-400 text-lg leading-relaxed max-w-md">
              Join the elite network. Get curated therapist recommendations, private member perks, and local LGBTQ+ wellness events straight to your inbox.
            </p>
          </div>

          {/* Form Side */}
          <div className="bg-white/5 border border-white/10 p-8 shadow-2xl backdrop-blur-sm">
            {status === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center space-y-4 py-8"
              >
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-2 border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-medium text-white">You&apos;re on the list.</h3>
                <p className="font-sans text-sm text-slate-400">Expect your first curated briefing this Friday.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Your City</label>
                  <input 
                    type="text" 
                    id="city"
                    required
                    placeholder="e.g. Dallas, TX"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 font-sans text-sm focus:border-indigo-500 focus:outline-none transition-colors placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    placeholder="hello@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 font-sans text-sm focus:border-indigo-500 focus:outline-none transition-colors placeholder:text-slate-600"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={status === "loading"}
                  className="w-full mt-4 bg-white text-slate-950 flex items-center justify-center gap-2 py-4 font-sans text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 group"
                >
                  {status === "loading" ? "Processing..." : (
                    <>
                      Request Access
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <p className="text-center font-sans text-xs text-slate-500 mt-4">
                  We respect your privacy. No spam, ever.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

export default NewsletterSignup;
