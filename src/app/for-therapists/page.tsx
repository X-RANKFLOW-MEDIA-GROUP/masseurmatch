import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "List Your Massage Practice | For Therapists - MasseurMatch",
  description:
    "Build a professional MasseurMatch profile, reach LGBTQ+-affirming clients, and manage your visibility without booking commissions.",
  openGraph: {
    title: "List Your Massage Practice on MasseurMatch",
    description: "Join a professional LGBTQ+-affirming massage directory.",
    url: "https://masseurmatch.com/for-therapists",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/for-therapists" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "List Your Massage Practice - MasseurMatch",
  url: "https://masseurmatch.com/for-therapists",
  description: "MasseurMatch helps independent massage therapists create professional listings and connect directly with clients.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
  potentialAction: {
    "@type": "RegisterAction",
    target: "https://masseurmatch.com/signup/account",
    name: "List Your Practice",
  },
};

const benefits = [
  {
    icon: Search,
    title: "Be discovered locally",
    body: "Appear in city, neighborhood, technique, and nearby searches built around real client intent.",
  },
  {
    icon: UserRoundCheck,
    title: "Own your professional profile",
    body: "Present your training, services, rates, languages, travel dates, and photos in one clear profile.",
  },
  {
    icon: ShieldCheck,
    title: "Build trust",
    body: "Identity, photo, and profile status help clients understand which information has been reviewed.",
  },
  {
    icon: Zap,
    title: "Control your visibility",
    body: "Use Available Now, travel schedules, specials, and plan-based growth tools without giving up your independence.",
  },
  {
    icon: BarChart3,
    title: "Understand demand",
    body: "Use analytics and Market Intelligence to see where clients search and how to strengthen your listing.",
  },
  {
    icon: BadgeCheck,
    title: "Direct client connection",
    body: "MasseurMatch is a directory. Clients contact you directly; we do not take booking commissions from sessions.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    body: "Verify your email, confirm you are at least 18, and accept the professional provider terms.",
  },
  {
    number: "02",
    title: "Build your profile",
    body: "Add services, languages, free-form session times, Incall and Outcall rates, photos, and location details.",
  },
  {
    number: "03",
    title: "Complete identity verification",
    body: "You can use the dashboard while Stripe Identity is pending. Verification is required for public visibility.",
  },
  {
    number: "04",
    title: "Choose your plan and go public",
    body: "After approval, confirm your plan and payment settings. Your profile can then appear in public discovery.",
  },
];

const faqs = [
  {
    question: "Does MasseurMatch take bookings or session payments?",
    answer: "No. MasseurMatch is a directory. Clients contact providers directly, and providers manage their own schedules and payments.",
  },
  {
    question: "Can I finish my profile while ID verification is pending?",
    answer: "Yes. You can access the provider dashboard, edit your profile, set rates, upload photos, and prepare travel dates while verification is pending.",
  },
  {
    question: "Can I enter my own session lengths and prices?",
    answer: "Yes. Session minutes and prices are flexible. Numeric prices must remain at or below US$3.33 per minute; otherwise select Ask Me.",
  },
  {
    question: "Is there a Free plan?",
    answer: "Yes. The Free plan provides a basic listing and selected visibility tools. Paid plans add photos, travel capacity, analytics, placement, and advanced tools.",
  },
];

export default function ForTherapistsPage() {
  return (
    <>
      <Script id="therapists-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="bg-white pt-16 text-[#111111] md:pt-0">
        <section className="relative overflow-hidden bg-[#111111] px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-12">
          <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_75%_20%,rgba(139,30,45,0.38),transparent_34%),radial-gradient(circle_at_15%_85%,rgba(139,30,45,0.2),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#E18A96]">For Massage Therapists</p>
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.96] tracking-tight sm:text-6xl lg:text-7xl">
                Build a profile that works as professionally as you do.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
                Reach clients searching for professional, LGBTQ+-affirming massage while keeping direct control of your rates, schedule, and client relationships.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup/account" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#9D2335] px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-xl shadow-[#8B1E2D]/30 transition hover:bg-[#B62B40]">
                  Create Your Profile <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/pricing" className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/10">
                  View Plans
                </Link>
              </div>
            </div>

            <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Direct", "Client contact"],
                ["$0", "Booking commission"],
                ["Flexible", "Minutes and rates"],
                ["80+", "US markets planned"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur">
                  <p className="text-2xl font-extrabold text-white">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/65">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8B1E2D]">Why MasseurMatch</p>
            <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">A professional home for your independent practice.</h2>
              <p className="text-lg leading-8 text-[#555B64]">Create a clear listing, improve discovery, and use data-backed growth tools without turning your practice over to a booking marketplace.</p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="rounded-3xl border border-[#E4E4E4] bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8B1E2D]/10 text-[#8B1E2D]"><benefit.icon className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-xl font-bold">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5E626A]">{benefit.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#101010] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#E18A96]">The Process</p>
              <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">From account to public profile.</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/75">Every step remains visible, readable, and manageable from mobile or desktop.</p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-4">
              {steps.map((step) => (
                <article key={step.number} className="relative rounded-3xl border border-white/14 bg-white/[0.065] p-6 shadow-lg shadow-black/20">
                  <p className="text-4xl font-black text-[#E18A96]">{step.number}</p>
                  <h3 className="mt-8 text-xl font-bold leading-7 text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/78">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8B1E2D]">Your Dashboard</p>
              <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Manage visibility without losing control.</h2>
              <p className="mt-5 text-base leading-8 text-[#555B64]">Pending providers can finish their profile before ID approval. Verified providers continue to plan/payment setup and public discovery.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [Zap, "Available Now", "Tier-based live windows with cooldown protection."],
                [MapPin, "Travel Schedule", "Clear destination and date fields with monthly plan limits."],
                [DollarSign, "Flexible Rates", "One Simple Rate, Rates by Technique, or Ask Me."],
                [Sparkles, "Market Intelligence", "Search trends, keywords, locations, and demand timing."],
              ].map(([Icon, title, body]) => {
                const FeatureIcon = Icon as typeof Zap;
                return (
                  <div key={title as string} className="rounded-3xl border border-[#E4E4E4] bg-[#FAFAFA] p-6">
                    <FeatureIcon className="h-5 w-5 text-[#8B1E2D]" />
                    <h3 className="mt-4 font-bold">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#60646B]">{body as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#F6F3F3] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8B1E2D]">Questions</p><h2 className="mt-4 font-display text-4xl font-extrabold">Before you join.</h2></div>
            <div className="mt-10 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-[#DEDEDE] bg-white p-5 open:shadow-sm">
                  <summary className="cursor-pointer list-none font-bold text-[#171717]">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-7 text-[#5C6169]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#8B1E2D] px-5 py-20 text-white sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Ready to build your profile?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80">Create your account, complete the profile at your pace, and finish identity verification when ready for public visibility.</p>
            <Link href="/signup/account" className="mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#8B1E2D] shadow-xl transition hover:bg-[#F8EDEE]">
              Join MasseurMatch <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
