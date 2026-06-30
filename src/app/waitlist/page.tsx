import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Brain,
  Check,
  DollarSign,
  Globe,
  MapPin,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { JsonLd } from "@/app/_components/json-ld";
import { WaitlistChat } from "./_components/WaitlistChat";
import { Countdown } from "./_components/Countdown";

// ── SEO ───────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:
    "Join the Waitlist — MasseurMatch | Verified Gay Massage Directory Launching July 7",
  description:
    "MasseurMatch is the modern LGBTQ+-affirming alternative to MasseurFinder and RentMasseur. Identity-verified male massage therapists, AI-powered profiles, direct contact. Gay massage near me — launching in Dallas July 7, 2026.",
  keywords: [
    // Generic
    "gay massage",
    "male massage",
    "gay masseur",
    "massage for men",
    "male to male massage",
    // Near me
    "gay massage near me",
    "male massage near me",
    "gay masseur near me",
    "gay massage therapist near me",
    // Mobile / hotel
    "mobile gay massage near me",
    "hotel gay massage",
    "gay massage for travelers",
    "outcall gay massage",
    // Austin
    "austin gay massage",
    "gay massage austin tx",
    "gay massage downtown austin",
    "hotel gay massage austin",
    // Houston
    "houston gay massage",
    "gay massage houston tx",
    "gay massage montrose houston",
    "mobile gay massage houston",
    // Dallas
    "dallas gay massage",
    "gay massage dallas tx",
    "gay massage oak lawn dallas",
    "male massage for men dallas",
    // Alternatives
    "MasseurFinder alternative",
    "RentMasseur alternative",
    "masseurmatch waitlist",
    // Informational
    "what is m4m massage",
    "gay massage etiquette",
    "best gay massage near me",
    // Directory
    "LGBTQ male massage therapist directory",
    "verified male massage therapist",
    "identity verified massage therapist",
    "gay massage directory US",
  ],
  openGraph: {
    title: "Join the MasseurMatch Waitlist — Launching July 7, 2026",
    description:
      "A better directory for verified LGBTQ+-affirming male massage. No middlemen, no guesswork. Identity-verified therapists. Direct contact. AI on every profile.",
    url: "https://masseurmatch.com/waitlist",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/waitlist" },
  robots: { index: true, follow: true },
};

// ── Structured data (server-rendered) ────────────────────────────────────────

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "MasseurMatch Waitlist — Coming Soon July 7, 2026",
  url: "https://masseurmatch.com/waitlist",
  description:
    "Join the MasseurMatch waitlist. A verified, LGBTQ+-affirming male massage therapist directory launching July 7, 2026 in Dallas — the better alternative to MasseurFinder and RentMasseur.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is MasseurMatch different from MasseurFinder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MasseurMatch uses Stripe Identity for real identity verification, includes an AI assistant (Knotty) on every profile, and starts at $0/month — compared to MasseurFinder's ~$300/month with no verification or AI features.",
      },
    },
    {
      "@type": "Question",
      name: "How is MasseurMatch different from RentMasseur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MasseurMatch focuses on LGBTQ+-affirming verified professionals, gives therapists real demand data through Demand Radar, and costs a fraction of RentMasseur's ~$375/month single-city listings.",
      },
    },
    {
      "@type": "Question",
      name: "When is MasseurMatch launching?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MasseurMatch launches on July 7, 2026 — starting in Dallas, then expanding to all major US cities. Join the waitlist to get early access.",
      },
    },
    {
      "@type": "Question",
      name: "Is MasseurMatch free for massage therapists?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — MasseurMatch has a free tier that lets therapists list their profile at no cost. Paid plans start at $39/month and go up to $99/month for Elite (3 cities + Knotty AI + Demand Radar).",
      },
    },
    {
      "@type": "Question",
      name: "Where can I find gay massage near me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MasseurMatch makes it easy to find LGBTQ+-affirming male massage therapists near you. Search by city, filter by specialty (deep tissue, Swedish, sports), choose incall or outcall, and contact therapists directly.",
      },
    },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "MasseurMatch — Gay & Male Massage Therapist Directory",
  serviceType: "Male Massage Therapist Directory",
  description:
    "Find verified LGBTQ+-affirming male massage therapists near you. Search gay massage, male massage, and m4m massage by city. Dallas launching July 7, 2026.",
  areaServed: { "@type": "Country", name: "United States" },
  provider: { "@type": "Organization", name: "MasseurMatch", url: "https://masseurmatch.com" },
};

// ── Data ──────────────────────────────────────────────────────────────────────

const comparison = [
  { feature: "Starting price", masseurmatch: "$0/month (Free tier)", masseurfinder: "~$300/month", rentmasseur: "~$375/month", mmBetter: true },
  { feature: "Identity verification", masseurmatch: "Stripe Identity (real ID check)", masseurfinder: "None", rentmasseur: "None", mmBetter: true },
  { feature: "AI assistant on profiles", masseurmatch: "Knotty AI — 24/7", masseurfinder: "None", rentmasseur: "None", mmBetter: true },
  { feature: "Demand data for therapists", masseurmatch: "Demand Radar (city + neighborhood)", masseurfinder: "None", rentmasseur: "None", mmBetter: true },
  { feature: "Multi-city listings", masseurmatch: "Up to 3 cities (Elite)", masseurfinder: "Single city only", rentmasseur: "Single city only", mmBetter: true },
  { feature: "LGBTQ+-affirming focus", masseurmatch: "Yes — core mission", masseurfinder: "Partial", rentmasseur: "Partial", mmBetter: true },
  { feature: "Booking middleman", masseurmatch: "No — direct contact only", masseurfinder: "No", rentmasseur: "No", mmBetter: false },
  { feature: "Free trial on paid plans", masseurmatch: "14-day free trial", masseurfinder: "None", rentmasseur: "None", mmBetter: true },
];

const therapistFeatures = [
  { icon: DollarSign, title: "List for free", body: "Start at $0/month. Legacy directories charge $300–$375 for a single city. MasseurMatch's Elite plan covers 3 cities for $99." },
  { icon: TrendingUp, title: "Demand Radar", body: "See real search demand in your city and neighborhood — know exactly where clients are looking before you invest in visibility." },
  { icon: Brain, title: "Knotty AI on your profile", body: "An AI assistant answers client questions on your profile 24/7. You get more qualified inquiries without lifting a finger." },
  { icon: BadgeCheck, title: "Identity verification", body: "Stripe Identity verifies who you are — giving clients confidence and setting you apart from unverified listings." },
  { icon: Zap, title: "Available Now", body: "Signal real-time availability so clients know you're ready. Boosts your placement in time-sensitive searches." },
  { icon: Globe, title: "Multi-city tours", body: "Auto-generate travel pages when you schedule city visits. Your audience follows you, not just your home base." },
];

const clientFeatures = [
  { icon: ShieldCheck, title: "Verified profiles only", body: "Every therapist on MasseurMatch goes through identity and profile review before appearing in search results." },
  { icon: MapPin, title: "Search by city or neighborhood", body: "Find gay massage therapists in your exact area — incall, outcall, or both. Filter by specialty, price, and availability." },
  { icon: MessageCircle, title: "Direct contact — no middleman", body: "Phone, WhatsApp, or email goes straight to the therapist. No platform in the middle, no booking fees." },
  { icon: Users, title: "LGBTQ+-affirming directory", body: "A welcoming space where affirming, professional male massage therapists are easy to find — without guessing from a generic listing." },
];

const cities = [
  { name: "Dallas", state: "TX", slug: "dallas", desc: "Oak Lawn & Uptown" },
  { name: "Houston", state: "TX", slug: "houston", desc: "Montrose & Midtown" },
  { name: "Austin", state: "TX", slug: "austin", desc: "6th Street & Downtown" },
  { name: "New York", state: "NY", slug: "new-york", desc: "Chelsea & Hell's Kitchen" },
  { name: "Miami", state: "FL", slug: "miami", desc: "South Beach & Brickell" },
  { name: "Los Angeles", state: "CA", slug: "los-angeles", desc: "West Hollywood & Silver Lake" },
  { name: "Chicago", state: "IL", slug: "chicago", desc: "Boystown & River North" },
  { name: "Atlanta", state: "GA", slug: "atlanta", desc: "Midtown & Virginia-Highland" },
  { name: "Washington", state: "DC", slug: "washington-dc", desc: "Dupont Circle & Logan" },
  { name: "San Francisco", state: "CA", slug: "san-francisco", desc: "Castro & SoMa" },
  { name: "Denver", state: "CO", slug: "denver", desc: "Capitol Hill & LoDo" },
  { name: "Phoenix", state: "AZ", slug: "phoenix", desc: "Scottsdale & Midtown" },
];

const faqs = [
  { q: "How is MasseurMatch different from MasseurFinder?", a: "MasseurFinder charges ~$300/month for a single city with no verification or AI features. MasseurMatch starts at $0, uses Stripe Identity for real ID checks, and puts an AI assistant on every profile." },
  { q: "How is MasseurMatch different from RentMasseur?", a: "RentMasseur charges ~$375/month per city with no demand data or AI. MasseurMatch costs a fraction of that, gives therapists live demand intelligence, and focuses on verified LGBTQ+-affirming professionals." },
  { q: "When does MasseurMatch launch?", a: "MasseurMatch launches on July 7, 2026 — starting in Dallas, then expanding fast to Houston, Austin, New York, Miami, Los Angeles, and every major US city. Join the waitlist to get first access." },
  { q: "How do I find gay massage near me?", a: "On MasseurMatch, search by your city to find verified LGBTQ+-affirming male massage therapists near you. Filter by specialty, incall or outcall, and contact directly. No booking middleman." },
  { q: "Is MasseurMatch free for therapists?", a: "Yes — there's a permanent free tier. Paid plans (Standard $39, Pro $79, Elite $99) unlock better placement, photos, analytics, and AI features. First 50 founding members lock in 50% off for 3 months." },
  { q: "Is MasseurMatch for clients too?", a: "Browsing, comparing profiles, and contacting therapists is completely free for clients — forever. MasseurMatch never handles payments or takes booking fees." },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WaitlistPage() {
  return (
    <>
      {/* Server-rendered JSON-LD — crawlers see it immediately */}
      <JsonLd data={pageJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={serviceJsonLd} />

      {/* CSS animations — injected once, no JS runtime cost */}
      <style>{`
        @keyframes mm-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mm-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mm-badge {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139,30,45,0); }
          50%       { box-shadow: 0 0 0 6px rgba(139,30,45,0.15); }
        }
        .anim-up   { animation: mm-up 0.75s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-in   { animation: mm-in 0.6s ease both; }
        .anim-badge { animation: mm-badge 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .anim-up, .anim-in, .anim-badge { animation: none !important; }
        }
      `}</style>

      <main className="bg-white text-[#111111]">

        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #100a0b 0%, #1a0d10 40%, #0d0d0d 100%)" }}>
          {/* Red top accent line */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8B1E2D]/60 to-transparent" />

          {/* Radial glow — CSS only, no filter blur */}
          <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-[36rem] w-[36rem] bg-[radial-gradient(ellipse_at_top_right,rgba(139,30,45,0.15),transparent_65%)]" />
          <div aria-hidden className="pointer-events-none absolute left-0 bottom-0 h-[28rem] w-[28rem] bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,30,45,0.08),transparent_65%)]" />

          <div className="relative mx-auto max-w-[1200px] px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">

            {/* Coming soon badge */}
            <div className="anim-in flex justify-center lg:justify-start" style={{ animationDelay: "0.05s" }}>
              <span className="anim-badge inline-flex items-center gap-2 rounded-full border border-[#8B1E2D]/40 bg-[#8B1E2D]/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#c0506a]">
                <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-[#c0506a]" />
                Coming soon · July 7, 2026
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">

              {/* Left — copy */}
              <div>
                <h1
                  className="anim-up font-display text-[clamp(2.4rem,5.5vw,4rem)] font-extrabold leading-[0.95] tracking-tight text-white"
                  style={{ animationDelay: "0.1s" }}
                >
                  The verified gay massage
                  <br />
                  <span style={{ color: "#c0506a" }}>directory you deserve.</span>
                </h1>

                <p
                  className="anim-up mt-5 max-w-lg text-base leading-7 text-white/50 lg:text-[17px]"
                  style={{ animationDelay: "0.2s" }}
                >
                  MasseurMatch is a premium LGBTQ+-affirming directory of identity-verified male massage therapists. Find gay massage near you — no middlemen, no guesswork, direct contact.
                </p>
                <p
                  className="anim-up mt-2.5 max-w-lg text-sm leading-6 text-white/28"
                  style={{ animationDelay: "0.25s" }}
                >
                  A far better alternative to MasseurFinder and RentMasseur — launching in Dallas, then every major US city.
                </p>

                {/* Countdown */}
                <div className="anim-up mt-8" style={{ animationDelay: "0.3s" }}>
                  <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/28">Launching in</p>
                  <Countdown />
                </div>

                {/* Trust badges */}
                <div
                  className="anim-up mt-8 flex flex-wrap gap-2.5"
                  style={{ animationDelay: "0.4s" }}
                >
                  {[
                    "Identity verified",
                    "LGBTQ+-affirming",
                    "Direct contact",
                    "AI on every profile",
                    "Free for clients",
                  ].map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/60"
                    >
                      <Check className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — Knotty Chat */}
              <div className="anim-up" style={{ animationDelay: "0.35s" }}>
                <WaitlistChat />
                <p className="mt-3 text-center text-[11px] text-white/22">
                  Knotty is MasseurMatch&apos;s AI — it also lives on every therapist profile to answer client questions 24/7.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom fade to white */}
          <div aria-hidden className="h-12 bg-gradient-to-b from-transparent to-white" />
        </section>

        {/* ── Comparison ──────────────────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">Comparison</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
                Why choose MasseurMatch over MasseurFinder or RentMasseur?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6F6F6F]">
                Legacy directories have barely changed in a decade. MasseurMatch is built from scratch with verification, AI, and real data — at a fraction of the price.
              </p>
            </div>

            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-[32%] pb-4 text-left text-xs font-semibold uppercase tracking-widest text-[#8E8E8E]">Feature</th>
                    <th className="w-[23%] pb-4 text-center">
                      <span className="inline-block rounded-full bg-[#8B1E2D] px-3 py-1 text-xs font-bold text-white">MasseurMatch</span>
                    </th>
                    <th className="w-[22%] pb-4 text-center text-xs font-semibold text-[#8E8E8E]">MasseurFinder</th>
                    <th className="w-[23%] pb-4 text-center text-xs font-semibold text-[#8E8E8E]">RentMasseur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {comparison.map((row) => (
                    <tr key={row.feature}>
                      <td className="py-3.5 pr-4 text-sm font-medium text-[#111111]">{row.feature}</td>
                      <td className="py-3.5 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B1E2D]/6 px-2.5 py-1 text-xs font-semibold text-[#8B1E2D]">
                          {row.mmBetter && <Check className="h-3 w-3" strokeWidth={3} />}
                          {row.masseurmatch}
                        </span>
                      </td>
                      <td className="py-3.5 text-center text-sm text-[#6F6F6F]">
                        {row.mmBetter ? (
                          <span className="inline-flex items-center gap-1 text-[#8E8E8E]">
                            <X className="h-3.5 w-3.5 text-red-400" strokeWidth={2.5} />
                            {row.masseurfinder}
                          </span>
                        ) : row.masseurfinder}
                      </td>
                      <td className="py-3.5 text-center text-sm text-[#6F6F6F]">
                        {row.mmBetter ? (
                          <span className="inline-flex items-center gap-1 text-[#8E8E8E]">
                            <X className="h-3.5 w-3.5 text-red-400" strokeWidth={2.5} />
                            {row.rentmasseur}
                          </span>
                        ) : row.rentmasseur}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-center text-xs text-[#8E8E8E]">
              Competitor pricing based on publicly available information as of 2026. Features subject to change.
            </p>
          </div>
        </section>

        {/* ── For therapists ──────────────────────────────────────────────────── */}
        <section className="bg-[#f7f7f7] py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">For massage professionals</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
                Tools built for therapist growth — not just a listing
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6F6F6F]">
                Stop paying $300+ for a static city ad that gives you nothing back. MasseurMatch gives you AI, demand data, and verified credibility at a fraction of the cost.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {therapistFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <article key={f.title} className="rounded-[1.6rem] border border-[#E8E8E8] bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEE] text-[#8B1E2D]">
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[#111111]">{f.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6F6F6F]">{f.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── For clients ─────────────────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">For clients</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
                Find your therapist with confidence
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6F6F6F]">
                Browse and contact therapists free — no accounts required, no booking fees, no middlemen.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {clientFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <article key={f.title} className="rounded-[1.6rem] border border-[#E8E8E8] bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEE] text-[#8B1E2D]">
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-[#111111]">{f.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6F6F6F]">{f.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Cities SEO grid ─────────────────────────────────────────────────── */}
        <section className="bg-[#f7f7f7] py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">Coverage</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
                Gay massage therapists across the US
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6F6F6F]">
                Launching in Dallas on July 7, then expanding to every major US city. Find verified male massage therapists near you — incall, outcall, and mobile options.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {cities.map((city, i) => (
                <div
                  key={city.slug}
                  className="group relative rounded-2xl border border-[#E8E8E8] bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
                >
                  {i === 0 && (
                    <span className="absolute -top-2 left-3 rounded-full bg-[#8B1E2D] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      Launching first
                    </span>
                  )}
                  <p className="text-sm font-semibold text-[#111111]">
                    {city.name}, <span className="text-[#8E8E8E]">{city.state}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-[#8E8E8E]">{city.desc}</p>
                  <p className="mt-2 text-[10px] font-medium text-[#8B1E2D]">
                    Gay massage · Male massage
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Founding member strip ───────────────────────────────────────────── */}
        <section style={{ background: "linear-gradient(135deg, #8B1E2D 0%, #6E1521 100%)" }} className="py-14">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Founding members</p>
                <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                  First 50 therapists get 50% off — forever locked in.
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  The founding-member rate never increases while you stay subscribed. Join the waitlist to claim your spot before July 7.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  href="/waitlist"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#8B1E2D] shadow-lg transition hover:bg-white/90"
                >
                  Join the waitlist
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-[860px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">FAQ</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
                Common questions
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-[1.4rem] border border-[#E8E8E8] bg-[#fafafa] px-6 py-4"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold text-[#111111] group-open:text-[#8B1E2D]">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[#6F6F6F]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer strip ────────────────────────────────────────────────────── */}
        <div className="border-t border-[#E8E8E8] bg-[#f7f7f7] py-8">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 px-4 text-center sm:flex-row sm:justify-between">
            <p className="text-sm font-semibold text-[#111111]">MasseurMatch</p>
            <p className="text-xs text-[#8E8E8E]">
              Launching July 7, 2026 in Dallas. More cities coming fast.
            </p>
            <div className="flex gap-4 text-xs text-[#8E8E8E]">
              <Link href="/privacy" className="transition-colors hover:text-[#111111]">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-[#111111]">Terms</Link>
              <Link href="/contact" className="transition-colors hover:text-[#111111]">Contact</Link>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
