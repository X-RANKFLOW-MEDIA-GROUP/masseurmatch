import type { Metadata } from "next";
import Script from "next/script";
import { ShieldCheck, Bot, Lock, CheckCircle2, UserCheck, EyeOff, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Trust & Safety | How MasseurMatch Protects You",
  description:
    "Learn how MasseurMatch verifies therapists, protects your privacy, and ensures a safe environment with AI-driven moderation and identity verification.",
  openGraph: {
    title: "Trust & Safety | MasseurMatch",
    description:
      "AI-driven moderation, identity verification, and encrypted communications — uncompromising commitment to your safety.",
    url: "https://masseurmatch.com/trust",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/trust" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Trust & Safety – MasseurMatch",
  url: "https://masseurmatch.com/trust",
  description:
    "MasseurMatch's commitment to AI-driven moderation, identity verification, data privacy, and secure communications.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
};

function RuleRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 shadow-sm">
      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
      <span className="font-sans text-sm text-slate-700 leading-relaxed">{text}</span>
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

      <div className="bg-slate-50 min-h-screen pt-24 pb-32">

        {/* Security-Focused Header */}
        <section className="container mx-auto px-4 md:px-6 max-w-4xl mb-20 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
          <h1 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6">
            Trust First. <br />
            <span className="text-slate-400">Uncompromising commitment.</span>
          </h1>
          <p className="font-sans text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Your safety is the foundation of MasseurMatch. We built an AI-driven and rigorously verified technological infrastructure to guarantee peace of mind with every booking.
          </p>
        </section>

        {/* Platform Disclaimer - Legal Notice */}
        <section className="container mx-auto px-4 md:px-6 max-w-3xl mb-16">
          <div className="flex items-start gap-4 bg-orange-50 border border-orange-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <ShieldAlert className="w-10 h-10 text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Important Platform Disclaimer</h3>
              <p className="text-gray-700 font-medium">
                <strong>MasseurMatch verifies therapists&apos; identities but not their professional licenses.</strong> Users are solely responsible for verifying the credentials, legality, and safety of any professional they choose to contact or book outside of this platform.
              </p>
            </div>
          </div>
        </section>

        {/* Security Features Grid */}
        <section className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* AI Singleton Block */}
            <div className="bg-slate-950 text-white p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] group-hover:bg-indigo-500/20 transition-colors" />
              <Bot className="w-8 h-8 text-indigo-400 mb-6" />
              <h3 className="font-display text-2xl font-medium mb-3">AI Singleton Moderation</h3>
              <p className="font-sans text-sm text-slate-400 leading-relaxed mb-6">
                Our proprietary Artificial Intelligence system reads and verifies every word and photo submitted to the platform in real-time. We automatically identify and block fake profiles or inappropriate language before they ever go live.
              </p>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">AI Engine Online</span>
              </div>
            </div>

            {/* Stripe Identity Block */}
            <div className="bg-white border border-slate-200 p-8 md:p-10 shadow-sm">
              <UserCheck className="w-8 h-8 text-slate-900 mb-6" />
              <h3 className="font-display text-2xl font-medium text-slate-900 mb-3">Identity Verification</h3>
              <p className="font-sans text-sm text-slate-600 leading-relaxed mb-6">
                Powered by Stripe Identity, we require therapists to provide valid government-issued documents. Look for the blue &ldquo;Verified&rdquo; badge for professionals who have passed our strictest audit.<br />
                <span className="block mt-2 text-orange-700 font-semibold">Note: Identity verification confirms a person's legal identity, <u>not</u> their professional licensure.</span>
              </p>
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Verified Therapists</span>
              </div>
            </div>

            {/* Privacy Block */}
            <div className="bg-white border border-slate-200 p-8 md:p-10 shadow-sm">
              <EyeOff className="w-8 h-8 text-slate-900 mb-6" />
              <h3 className="font-display text-2xl font-medium text-slate-900 mb-3">Data Privacy</h3>
              <p className="font-sans text-sm text-slate-600 leading-relaxed">
                We do not sell your data. Your searches, message history, and location data are end-to-end encrypted. We only share what is strictly necessary to connect you with your chosen therapist.
              </p>
            </div>

            {/* Secure Contact Block */}
            <div className="bg-white border border-slate-200 p-8 md:p-10 shadow-sm">
              <Lock className="w-8 h-8 text-slate-900 mb-6" />
              <h3 className="font-display text-2xl font-medium text-slate-900 mb-3">Secure Contact</h3>
              <p className="font-sans text-sm text-slate-600 leading-relaxed">
                Our floating contact bar allows for quick initial communication (SMS/Call) without forcing you to fill out long forms, keeping you in total control of who has your phone number.
              </p>
            </div>

          </div>
        </section>

        {/* Community Rules */}
        <section className="container mx-auto px-4 md:px-6 max-w-3xl mt-24">
          <h2 className="font-display text-2xl md:text-3xl font-medium text-slate-900 mb-8 text-center">Our Unbreakable Rules</h2>

          <div className="space-y-4">
            <RuleRow text="Zero tolerance for solicitations of illegal or sexual services." />
            <RuleRow text="Profile photos must be strictly professional and free of watermarks." />
            <RuleRow text="Verbal aggression, discrimination, or harassment in chat results in an instant ban." />
            <RuleRow text="All reviews must come from real clients to combat fake reputations." />
          </div>
        </section>

      </div>
    </>
  );
}
