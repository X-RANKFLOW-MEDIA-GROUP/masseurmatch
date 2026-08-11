import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Bot, CheckCircle2, EyeOff, UserCheck } from "lucide-react";

import { IconArrowRight, IconLock, IconShield } from "@/components/icons";

export const metadata: Metadata = {
  title: "Trust & Safety | How MasseurMatch Protects You",
  description: "Learn how MasseurMatch reviews profiles, verifies identity, protects privacy, and maintains a professional directory.",
  openGraph: {
    title: "Trust & Safety | MasseurMatch",
    description: "Human-reviewed profiles, identity verification, and responsible data handling — our commitment to safety and transparency.",
    url: "https://www.masseurmatch.com/trust",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://www.masseurmatch.com/trust" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Trust & Safety - MasseurMatch",
  url: "https://www.masseurmatch.com/trust",
  description: "MasseurMatch's commitment to profile moderation, identity verification, and responsible data handling.",
  publisher: { "@type": "Organization", name: "MasseurMatch", url: "https://www.masseurmatch.com" },
};

function RuleRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4 border border-slate-200 bg-white p-4 shadow-sm">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
      <span className="font-sans text-sm leading-relaxed text-slate-700">{text}</span>
    </div>
  );
}

export default function TrustPage() {
  return (
    <>
      <Script id="trust-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-slate-50 pb-32 pt-24">
        <section className="container mx-auto mb-20 max-w-4xl px-4 text-center md:px-6">
          <IconShield size={48} sketch="medium" className="mx-auto mb-6 text-emerald-500" />
          <h1 className="font-display mb-6 text-4xl font-medium tracking-tight text-slate-900 md:text-6xl">Trust First. <br /><span className="text-slate-400">Transparent by design.</span></h1>
          <p className="mx-auto max-w-2xl font-sans text-lg leading-relaxed text-slate-600">MasseurMatch is a professional directory. Profiles are moderated before publication, and identity verification can add an additional point-in-time identity signal.</p>
        </section>

        <section className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group relative overflow-hidden bg-slate-950 p-8 text-white md:p-10">
              <div className="absolute right-0 top-0 h-32 w-32 bg-[#8B1E2D]/10 blur-[50px] transition-colors group-hover:bg-[#8B1E2D]/20" />
              <Bot className="mb-6 h-8 w-8 text-[#F8EDEE]" />
              <h3 className="font-display mb-3 text-2xl font-medium">Profile Moderation</h3>
              <p className="mb-6 font-sans text-sm leading-relaxed text-slate-400">New profiles are reviewed before publication. Automated screening may assist moderators, but publication decisions remain subject to human review and platform policies.</p>
              <div className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span><span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">Review Team Active</span></div>
            </div>

            <div className="border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <UserCheck className="mb-6 h-8 w-8 text-slate-900" />
              <h3 className="font-display mb-3 text-2xl font-medium text-slate-900">Identity Verification</h3>
              <p className="mb-6 font-sans text-sm leading-relaxed text-slate-900">Providers who complete identity verification submit a government-issued ID and a current selfie showing a one-time challenge code. MasseurMatch reviews the evidence and deletes the sensitive images after the final decision.</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><IconShield size={16} className="text-emerald-500" /><span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-600">Identity Verified</span></div>
              <p className="mt-4 font-sans text-xs leading-relaxed text-slate-500">The badge confirms identity only. It does not verify professional licensing, background history, qualifications, services, or service quality.</p>
            </div>

            <div className="border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <EyeOff className="mb-6 h-8 w-8 text-slate-900" />
              <h3 className="font-display mb-3 text-2xl font-medium text-slate-900">Data Privacy</h3>
              <p className="font-sans text-sm leading-relaxed text-slate-600">We limit access to sensitive verification evidence, store it privately during review, and remove identity images after the review decision. See the Privacy Policy for details about other platform data and retention.</p>
            </div>

            <div className="border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <IconLock size={32} sketch="medium" className="mb-6 text-slate-900" />
              <h3 className="font-display mb-3 text-2xl font-medium text-slate-900">Directory Contact</h3>
              <p className="font-sans text-sm leading-relaxed text-slate-600">MasseurMatch helps clients discover providers and use the contact options on their profiles. Scheduling, session payments, and service arrangements happen directly between clients and providers outside MasseurMatch.</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto mt-24 max-w-3xl px-4 md:px-6">
          <h2 className="font-display mb-8 text-center text-2xl font-medium text-slate-900 md:text-3xl">Our Unbreakable Rules</h2>
          <div className="space-y-4">
            <RuleRow text="Zero tolerance for solicitations of illegal or sexual services." />
            <RuleRow text="Profile photos and descriptions must comply with professional content standards." />
            <RuleRow text="Harassment, discrimination, scams, trafficking, or deceptive conduct may result in removal." />
          </div>
          <div className="mt-8 text-center"><Link href="/moderation-policy" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline">Read our full Moderation Policy<IconArrowRight size={14} /></Link></div>
        </section>
      </div>
    </>
  );
}
