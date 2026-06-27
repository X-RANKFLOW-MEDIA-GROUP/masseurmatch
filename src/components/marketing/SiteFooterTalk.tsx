"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

export function SiteFooterTalk() {
  const [formState, setFormState] = useState<FormState>("idle");
  const currentYear = new Date().getFullYear();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/contact-footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setFormState("success");
        form.reset();
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  }

  return (
    <footer className="border-t border-white/[0.06] bg-[#1A1A1A] text-slate-400">
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">

          {/* Left: Let's talk + contact form */}
          <div className="lg:col-span-5">
            <h3 className="font-display text-5xl font-extrabold leading-none tracking-tight text-white">
              Let&apos;s talk.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Questions about listing your practice, partnership inquiries, or press — reach us directly.
            </p>

            {formState === "success" ? (
              <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <p className="text-sm font-semibold text-emerald-400">
                  Message received — we&apos;ll be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:border-[#8B1E2D]/60 focus:outline-none"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:border-[#8B1E2D]/60 focus:outline-none"
                />
                <textarea
                  name="message"
                  placeholder="Your message"
                  required
                  minLength={10}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:border-[#8B1E2D]/60 focus:outline-none"
                />
                {formState === "error" && (
                  <p className="text-xs text-red-400">Something went wrong — please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#8B1E2D] px-8 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                >
                  {formState === "loading" ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>

          {/* Right: nav link columns */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              <div className="space-y-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-white">Explore</h4>
                <ul className="space-y-4 text-sm">
                  <li><Link href="/search" className="transition-colors hover:text-white">Find a Therapist</Link></li>
                  <li><Link href="/near-me" className="transition-colors hover:text-white">Therapists Near Me</Link></li>
                  <li><Link href="/cities" className="transition-colors hover:text-white">Browse by City</Link></li>
                  <li><Link href="/blog" className="transition-colors hover:text-white">Wellness Journal</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-white">For Professionals</h4>
                <ul className="space-y-4 text-sm">
                  <li><Link href="/for-therapists" className="transition-colors hover:text-white">Join the Network</Link></li>
                  <li><Link href="/pricing" className="transition-colors hover:text-white">Plans &amp; Pricing</Link></li>
                  <li><Link href="/login" className="transition-colors hover:text-white">Provider Login</Link></li>
                  <li><Link href="/trust" className="transition-colors hover:text-white">Quality Guidelines</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-white">Trust &amp; Legal</h4>
                <ul className="space-y-4 text-sm">
                  <li><Link href="/about" className="transition-colors hover:text-white">About Us</Link></li>
                  <li><Link href="/trust" className="transition-colors hover:text-white">Trust &amp; Safety</Link></li>
                  <li><Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="transition-colors hover:text-white">Terms of Service</Link></li>
                  <li><Link href="/contact" className="transition-colors hover:text-white">Contact Support</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" strokeWidth={2.25} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Verified Secure Network
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 md:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} MasseurMatch. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <Link href="/cookie-policy" className="transition-colors hover:text-white">Cookies</Link>
            <Link href="/accessibility" className="transition-colors hover:text-white">Accessibility</Link>
            <span className="flex items-center gap-1">
              United States <ArrowUpRight className="h-3 w-3 text-[#8B1E2D]" strokeWidth={2.25} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
