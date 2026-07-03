import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Bot, CheckCircle2, EyeOff, ShieldAlert, UserCheck } from "lucide-react";

import { IconArrowRight, IconLock, IconShield } from "@/components/icons";

export const metadata: Metadata = {
  title: "Trust & Safety | How MasseurMatch Protects You",
  description:
    "Learn how MasseurMatch reviews profiles, protects your privacy, and maintains a safer environment for clients and therapists.",
  openGraph: {
    title: "Trust & Safety | MasseurMatch",
    description:
      "Human-reviewed profiles, identity verification, and responsible data handling — our commitment to your safety.",
    url: "https://masseurmatch.com/trust",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/trust" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Trust & Safety - MasseurMatch",
  url: "https://masseurmatch.com/trust",
  description:
    "MasseurMatch's commitment to human-reviewed profiles, identity verification, and responsible data handling.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
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
      <Script
        id="trust-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-50 pb-32 pt-24">
        <section className="container mx-auto mb-20 max-w-4xl px-4 text-center md:px-6">
          <IconShield size={48} sketch="medium" className="mx-auto mb-6 text-emerald-500" />
          <h1 className="font-display mb-6 text-4xl font-medium tracking-tight text-slate-900 md:text-6xl">
            Trust First. <br />
            <span className="text-slate-400">Uncompromising commitment.</span>
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-lg leading-relaxed text-slate-600">
            Your safety is the foundation of MasseurMatch. Every profile is reviewed before
            going live, and identity verification adds an extra layer of confidence with every
            connection.
          </p>
        </section>


        <section className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group relative overflow-hidden bg-slate-950 p-8 text-white md:p-10">
              <div className="absolute right-0 top-0 h-32 w-32 bg-[#8B1E2D]/10 blur-[50px] transition-colors group-hover:bg-[#8B1E2D]/20" />
              <Bot className="mb-6 h-8 w-8 text-[#F8EDEE]" />
              <h3 className="font-display mb-3 text-2xl font-medium">Profile Moderation</h3>
              <p className="mb-6 font-sans text-sm leading-relaxed text-slate-400">
                Every new profile is reviewed by our team before it is published. Automated
                screening assists our moderators in flagging content that may violate our
                guidelines — but a human makes the final call.
              </p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                  Review Team Active
                </span>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <UserCheck className="mb-6 h-8 w-8 text-slate-900" />
              <h3 className="font-display mb-3 text-2xl font-medium text-slate-900">
                Identity Verification
              </h3>
              <p className="mb-6 font-sans text-sm leading-relaxed text-slate-600">
                Powered by Stripe Identity, we require therapists to provide valid
                government-issued documents. Look for the blue &ldquo;Verified&rdquo; badge for
                professionals who have passed our strictest audit.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                <IconShield size={16} className="text-emerald-500" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Verified Therapists
                </span>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <EyeOff className="mb-6 h-8 w-8 text-slate-900" />
              <h3 className="font-display mb-3 text-2xl font-medium text-slate-900">Data Privacy</h3>
              <p className="font-sans text-sm leading-relaxed text-slate-600">
                We do not sell your data. We only collect what is necessary to operate the
                platform and connect you with your chosen therapist. Your personal information
                is never shared with third parties for advertising purposes.
              </p>
            </div>

            <div className="border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <IconLock size={32} sketch="medium" className="mb-6 text-slate-900" />
              <h3 className="font-display mb-3 text-2xl font-medium text-slate-900">Secure Contact</h3>
              <p className="font-sans text-sm leading-relaxed text-slate-600">
                Our floating contact bar allows for quick initial communication (SMS/Call) without
                forcing you to fill out long forms, keeping you in total control of who has your
                phone number.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto mt-24 max-w-3xl px-4 md:px-6">
          <h2 className="font-display mb-8 text-center text-2xl font-medium text-slate-900 md:text-3xl">
            Our Unbreakable Rules
          </h2>

          <div className="space-y-4">
            <RuleRow text="Zero tolerance for solicitations of illegal or sexual services." />
            <RuleRow text="Profile photos must be strictly professional and free of watermarks." />
            <RuleRow text="Verbal aggression, discrimination, or harassment in chat results in an instant ban." />
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/moderation-policy"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            >
              Read our full Moderation Policy
              <IconArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
