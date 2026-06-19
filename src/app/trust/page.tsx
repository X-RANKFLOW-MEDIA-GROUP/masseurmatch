import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, ShieldCheck, Bot, Lock, CheckCircle2, UserCheck, EyeOff, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Trust & Safety | How MasseurMatch Protects You",
  description:
    "Learn how MasseurMatch reviews profiles, protects your privacy, and promotes a safer environment with AI-driven moderation and identity verification.",
  openGraph: {
    title: "Trust & Safety | MasseurMatch",
    description:
      "AI-driven moderation, identity verification, and encrypted communications — our commitment to your safety.",
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
    "MasseurMatch's commitment to AI-driven moderation, identity verification, data privacy, and secure communications.",
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
          <ShieldCheck className="mx-auto mb-6 h-12 w-12 text-emerald-500" />
          <h1 className="font-display mb-6 text-4xl font-medium tracking-tight text-slate-900 md:text-6xl">
            Trust First. <br />
            <span className="text-slate-400">Uncompromising commitment.</span>
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-lg leading-relaxed text-slate-600">
            Your safety is the foundation of MasseurMatch. We built an AI-driven moderation
            and identity verification infrastructure for peace of mind with every connection.
          </p>
        </section>

        <section className="container mx-auto mb-16 max-w-3xl px-4 md:px-6">
          <div className="flex items-start gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm md:p-8">
            <ShieldAlert className="mt-1 h-10 w-10 flex-shrink-0 text-orange-500" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Important Platform Disclaimer</h3>
              <p className="text-gray-700 font-medium">
                <strong>MasseurMatch verifies therapists&apos; identities but not their professional licenses.</strong> Users are solely responsible for verifying the credentials, legality, and safety of any professional they choose to contact or book outside of this platform.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group relative overflow-hidden bg-slate-950 p-8 text-white md:p-10">
              <div className="absolute right-0 top-0 h-32 w-32 bg-indigo-500/10 blur-[50px] transition-colors group-hover:bg-indigo-500/20" />
              <Bot className="mb-6 h-8 w-8 text-indigo-400" />
              <h3 className="font-display mb-3 text-2xl font-medium">AI Singleton Moderation</h3>
              <p className="mb-6 font-sans text-sm leading-relaxed text-slate-400">
                Our proprietary Artificial Intelligence system reads and verifies every word and
                photo submitted to the platform in real-time. We automatically identify and block
                fake profiles or inappropriate language before they ever go live.
              </p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                  AI Engine Online
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
                <br />
                <span className="mt-2 block font-semibold text-orange-700">
                  Note: Identity verification confirms a person&apos;s legal identity, <u>not</u>{" "}
                  their professional licensure.
                </span>
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Verified Therapists
                </span>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <EyeOff className="mb-6 h-8 w-8 text-slate-900" />
              <h3 className="font-display mb-3 text-2xl font-medium text-slate-900">Data Privacy</h3>
              <p className="font-sans text-sm leading-relaxed text-slate-600">
                We do not sell your data. Your searches, message history, and location data are
                end-to-end encrypted. We only share what is strictly necessary to connect you with
                your chosen therapist.
              </p>
            </div>

            <div className="border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <Lock className="mb-6 h-8 w-8 text-slate-900" />
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
            <RuleRow text="Reviews require a documented contact event to earn a Verified Contact label." />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-600 font-sans">
            <strong className="font-semibold text-slate-800">Verified reviews require proof of contact.</strong>{" "}
            When a client clicks a contact button (call, SMS, or WhatsApp) on a profile, we record
            that event. Only reviewers with a documented contact event receive a &ldquo;Verified
            contact&rdquo; label on their review — making it easy to distinguish genuine first-hand
            experiences from unverifiable submissions.
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/moderation-policy"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            >
              Read our full Moderation Policy
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
