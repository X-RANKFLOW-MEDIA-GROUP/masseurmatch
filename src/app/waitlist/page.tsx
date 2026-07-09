import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import {
  BadgeCheck,
  Brain,
  CalendarClock,
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
import { WaitlistChat } from "./_components/WaitlistChat";

// ── SEO ───────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:
    "Join the Waitlist — MasseurMatch | The Verified Male Massage Directory Launching Soon",
  description:
    "MasseurMatch is the modern LGBTQ+-affirming alternative to MasseurFinder and RentMasseur. Identity-verified male massage therapists, AI-powered profiles, direct contact. Join the waitlist — launching in Dallas first.",
  keywords: [
    "MasseurFinder alternative",
    "RentMasseur alternative",
    "LGBTQ male massage therapist directory",
    "verified male massage therapist",
    "gay massage therapist near me",
    "male massage directory",
    "massage therapist waitlist",
    "masseurmatch waitlist",
    "male massage Dallas",
    "gay massage directory US",
    "identity verified massage therapist",
  ],
  openGraph: {
    title: "Join the MasseurMatch Waitlist — Launching Soon",
    description:
      "A better directory for verified LGBTQ+-affirming male massage. No middlemen, no guesswork. Identity-verified therapists. Direct contact. AI on every profile.",
    url: "https://masseurmatch.com/waitlist",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/waitlist" },
  robots: { index: true, follow: true },
};

// ── Structured data ───────────────────────────────────────────────────────────

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "MasseurMatch Waitlist — Coming Soon",
  url: "https://masseurmatch.com/waitlist",
  description:
    "Join the MasseurMatch waitlist. A verified, LGBTQ+-affirming male massage therapist directory launching soon as the better alternative to MasseurFinder and RentMasseur.",
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
        text: "MasseurMatch is preparing verified early access, starting in Dallas and then expanding to other major US cities. Join the waitlist to be first in line.",
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
  ],
};

// ── Data ──────────────────────────────────────────────────────────────────────

const comparison = [
  {
    feature: "Starting price",
    masseurmatch: "$0/month (Free tier)",
    masseurfinder: "~$300/month",
    rentmasseur: "~$375/month",
    mmBetter: true,
  },
  {
    feature: "Identity verification",
    masseurmatch: "Stripe Identity (real ID check)",
    masseurfinder: "None",
    rentmasseur: "None",
    mmBetter: true,
  },
  {
    feature: "AI assistant on profiles",
    masseurmatch: "Knotty AI — 24/7",
    masseurfinder: "None",
    rentmasseur: "None",
    mmBetter: true,
  },
  {
    feature: "Demand data for therapists",
    masseurmatch: "Demand Radar (city + neighborhood)",
    masseurfinder: "None",
    rentmasseur: "None",
    mmBetter: true,
  },
  {
    feature: "Multi-city listings",
    masseurmatch: "Up to 3 cities (Elite)",
    masseurfinder: "Single city only",
    rentmasseur: "Single city only",
    mmBetter: true,
  },
  {
    feature: "LGBTQ+-affirming focus",
    masseurmatch: "Yes — core mission",
    masseurfinder: "Partial",
    rentmasseur: "Partial",
    mmBetter: true,
  },
  {
    feature: "Booking middleman",
    masseurmatch: "No — direct contact only",
    masseurfinder: "No",
    rentmasseur: "No",
    mmBetter: false,
  },
  {
    feature: "Free trial on paid plans",
    masseurmatch: "14-day free trial",
    masseurfinder: "None",
    rentmasseur: "None",
    mmBetter: true,
  },
];

const therapistFeatures = [
  {
    icon: DollarSign,
    title: "List for free",
    body: "Start at $0/month. Legacy directories charge $300–$375 for a single city. MasseurMatch's Elite plan covers 3 cities for $99.",
  },
  {
    icon: TrendingUp,
    title: "Demand Radar",
    body: "See real search demand in your city and neighborhood — know exactly where clients are looking before you invest in visibility.",
  },
  {
    icon: Brain,
    title: "Knotty AI on your profile",
    body: "An AI assistant answers client questions on your profile 24/7. You get more qualified inquiries without lifting a finger.",
  },
  {
    icon: BadgeCheck,
    title: "Identity verification",
    body: "Stripe Identity verifies who you are — giving clients confidence and setting you apart from unverified listings.",
  },
  {
    icon: Zap,
    title: "Available Now",
    body: "Signal real-time availability so clients know you're ready. Boosts your placement in time-sensitive searches.",
  },
  {
    icon: Globe,
    title: "Multi-city tours",
    body: "Auto-generate travel pages when you schedule city visits. Your audience follows you, not just your home base.",
  },
];

const clientFeatures = [
  {
    icon: ShieldCheck,
    title: "Verified profiles only",
    body: "Every therapist on MasseurMatch goes through identity and profile review before appearing in search results.",
  },
  {
    icon: MapPin,
    title: "Search by city or neighborhood",
    body: "Find therapists in your exact area — incall, outcall, or both. Filter by specialty, price, and availability.",
  },
  {
    icon: MessageCircle,
    title: "Direct contact — no middleman",
    body: "Phone, WhatsApp, or email goes straight to the therapist. No platform in the middle, no booking fees.",
  },
  {
    icon: Users,
    title: "LGBTQ+-affirming directory",
    body: "A welcoming space where affirming, professional therapists are easy to find — without guessing from a generic listing.",
  },
];

const faqs = [
  {
    q: "How is MasseurMatch different from MasseurFinder?",
    a: "MasseurFinder charges ~$300/month for a single city with no verification or AI features. MasseurMatch starts at $0, uses Stripe Identity for real ID checks, and puts an AI assistant on every profile.",
  },
  {
    q: "How is MasseurMatch different from RentMasseur?",
    a: "RentMasseur charges ~$375/month per city with no demand data or AI. MasseurMatch costs a fraction of that, gives therapists live demand intelligence, and focuses on verified LGBTQ+-affirming professionals.",
  },
  {
    q: "When does MasseurMatch launch?",
    a: "We're opening verified early access soon — starting in Dallas, then expanding to New York, Miami, Los Angeles, and other major US cities. Join the waitlist to get first access.",
  },
  {
    q: "Is MasseurMatch free for therapists?",
    a: "Yes — there's a permanent free tier. Paid plans (Standard $39, Pro $79, Elite $99) unlock better placement, photos, analytics, and AI features. First 50 founding members lock in 50% off for 3 months.",
  },
  {
    q: "Is MasseurMatch for clients too?",
    a: "Browsing, comparing profiles, and contacting therapists is completely free for clients — forever. MasseurMatch never handles payments or takes booking fees.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WaitlistPage() {
  return (
    <>
      <Script id="waitlist-page-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
      <Script id="waitlist-faq-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="bg-white text-[#111111]">

        {/* ── Hero ──────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#080e18] pb-16 pt-24 sm:pb-20 sm:pt-32">
          {/* Dot grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Glow */}
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-[#8B1E2D]/8 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#1d3461]/15 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            {/* Left copy */}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">
                  Coming soon
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B1E2D]/40 bg-[#8B1E2D]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B1E2D]">
                  <CalendarClock className="h-3 w-3" strokeWidth={2.5} />
                  Early access opening soon
                </span>
              </div>
              <h1 className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold leading-[0.95] tracking-tight text-white">
                The verified male massage
                <br />
                <span className="text-[#8B1E2D]">directory you&apos;ve been waiting for.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/55 lg:text-lg">
                MasseurMatch is a premium LGBTQ+-affirming directory of identity-verified male massage therapists. No middlemen, no guesswork — direct contact, AI-powered profiles, real demand data.
              </p>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/35">
                A far better alternative to MasseurFinder and RentMasseur — launching in Dallas, then every major US city.
              </p>

              {/* Trust signals */}
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Identity verified",
                  "LGBTQ+-affirming",
                  "Direct contact",
                  "AI on every profile",
                  "Free for clients",
                ].map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-xs font-medium text-white/70"
                  >
                    <Check className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Knotty Chat */}
            <div>
              <WaitlistChat />
              <p className="mt-3 text-center text-[11px] text-white/25">
                Knotty is MasseurMatch&apos;s AI — it also lives on every therapist profile to answer client questions 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* ── Comparison ────────────────────────────────────────────────────────── */}
        <section className="bg-[#f7f7f7] py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">Comparison</p>
              <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
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
                    <th className="w-[32%] pb-4 text-left text-xs font-semibold uppercase tracking-widest text-[#6F6F6F]">Feature</th>
                    <th className="w-[23%] pb-4 text-center">
                      <span className="inline-block rounded-full bg-[#8B1E2D] px-3 py-1 text-xs font-bold text-white">MasseurMatch</span>
                    </th>
                    <th className="w-[22%] pb-4 text-center text-xs font-semibold text-[#6F6F6F]">MasseurFinder</th>
                    <th className="w-[23%] pb-4 text-center text-xs font-semibold text-[#6F6F6F]">RentMasseur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {comparison.map((row) => (
                    <tr key={row.feature} className="group">
                      <td className="py-3.5 pr-4 text-sm font-medium text-[#111111]">{row.feature}</td>
                      <td className="py-3.5 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B1E2D]/6 px-2.5 py-1 text-xs font-semibold text-[#8B1E2D]">
                          {row.mmBetter && <Check className="h-3 w-3" strokeWidth={3} />}
                          {row.masseurmatch}
                        </span>
                      </td>
                      <td className="py-3.5 text-center text-sm text-[#6F6F6F]">
                        {row.mmBetter ? (
                          <span className="inline-flex items-center gap-1 text-[#6F6F6F]">
                            <X className="h-3.5 w-3.5 text-red-400" strokeWidth={2.5} />
                            {row.masseurfinder}
                          </span>
                        ) : (
                          row.masseurfinder
                        )}
                      </td>
                      <td className="py-3.5 text-center text-sm text-[#6F6F6F]">
                        {row.mmBetter ? (
                          <span className="inline-flex items-center gap-1 text-[#6F6F6F]">
                            <X className="h-3.5 w-3.5 text-red-400" strokeWidth={2.5} />
                            {row.rentmasseur}
                          </span>
                        ) : (
                          row.rentmasseur
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-center text-xs text-[#6F6F6F]">
              Competitor pricing based on publicly available information as of 2026. Features subject to change.
            </p>
          </div>
        </section>

        {/* ── For therapists ─────────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">For massage professionals</p>
              <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
                Tools built for therapist growth — not just a listing
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6F6F6F]">
                Stop paying $300+ for a static city ad that gives you nothing back. MasseurMatch gives you AI, data, and verified credibility.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {therapistFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="rounded-3xl border border-[#E8E8E8] bg-white p-6 shadow-[var(--shadow-xs)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEE] text-[#8B1E2D]">
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </div>
                    <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">{f.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6F6F6F]">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── For clients ───────────────────────────────────────────────────────── */}
        <section className="bg-[#f7f7f7] py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">For clients</p>
              <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
                Find your therapist with confidence
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6F6F6F]">
                Browsing and contacting therapists is always free. No accounts required, no booking fees, no middlemen.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {clientFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="rounded-3xl border border-[#E8E8E8] bg-white p-6 shadow-[var(--shadow-xs)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEE] text-[#8B1E2D]">
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </div>
                    <h3 className="font-display mt-4 text-base font-semibold text-[#111111]">{f.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6F6F6F]">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Founding member strip ─────────────────────────────────────────────── */}
        <section className="bg-[#8B1E2D] py-14">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/80">Founding members</p>
                <h2 className="font-display mt-3 text-2xl font-bold text-white sm:text-3xl">
                  First 50 therapists get 50% off — forever locked in.
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  The founding-member rate never increases while you stay subscribed. Join the waitlist to claim your spot before launch.
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

        {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-[860px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">FAQ</p>
              <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
                Common questions
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-[1.4rem] border border-[#E8E8E8] bg-white px-6 py-4 shadow-sm"
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

        {/* ── Footer strip ──────────────────────────────────────────────────────── */}
        <div className="border-t border-[#E8E8E8] bg-[#f7f7f7] py-8">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 px-4 text-center sm:flex-row sm:justify-between">
            <p className="text-sm font-semibold text-[#111111]">MasseurMatch</p>
            <p className="text-xs text-[#6F6F6F]">
              Launching in Dallas first. More cities coming fast.
            </p>
            <div className="flex gap-4 text-xs text-[#6F6F6F]">
              <Link href="/privacy" className="hover:text-[#111111] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#111111] transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-[#111111] transition-colors">Contact</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
