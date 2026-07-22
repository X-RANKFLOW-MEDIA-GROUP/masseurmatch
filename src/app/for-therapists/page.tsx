import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  DollarSign,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "List Your Massage Practice | For Therapists - MasseurMatch",
  description: "Build a professional MasseurMatch profile, reach LGBTQ+-affirming clients, and manage visibility without booking commissions.",
  alternates: { canonical: "https://masseurmatch.com/for-therapists" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "List Your Massage Practice - MasseurMatch",
  url: "https://masseurmatch.com/for-therapists",
  potentialAction: {
    "@type": "RegisterAction",
    target: "https://masseurmatch.com/signup/account",
    name: "List Your Practice",
  },
};

const benefits = [
  [Search, "Be discovered locally", "Appear in city, neighborhood, technique, and nearby searches built around real client intent."],
  [UserRoundCheck, "Own your professional profile", "Present your services, rates, languages, travel dates, and photos in one clear profile."],
  [ShieldCheck, "Build trust", "Identity, photo, and profile status help clients understand which information has been reviewed."],
  [Zap, "Control your visibility", "Use Available Now, travel schedules, specials, and plan-based growth tools."],
  [BarChart3, "Understand demand", "Use analytics and Market Intelligence to improve your listing."],
  [BadgeCheck, "Direct client connection", "Clients contact you directly. MasseurMatch does not take booking commissions."],
] as const;

const steps = [
  ["01", "Create your account", "Verify your email, confirm you are at least 18, and accept the provider terms."],
  ["02", "Build your profile", "Add services, languages, free-form session times, rates, photos, and location details."],
  ["03", "Complete identity verification", "Use the dashboard while Stripe Identity is pending. Verification is required for public visibility."],
  ["04", "Choose your plan and go public", "After approval, confirm plan and payment settings so your profile can enter public discovery."],
] as const;

const faqs = [
  ["Does MasseurMatch take bookings or session payments?", "No. MasseurMatch is a directory. Clients contact providers directly."],
  ["Can I finish my profile while ID verification is pending?", "Yes. You can use the provider dashboard, set rates, upload photos, and prepare travel dates."],
  ["Can I enter my own session lengths and prices?", "Yes. Minutes and prices are flexible. Numeric prices must remain at or below US$3.33 per minute; otherwise choose Ask Me."],
  ["Is there a Free plan?", "Yes. The Free plan provides a basic listing and selected visibility tools."],
] as const;

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
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.96] tracking-tight sm:text-6xl lg:text-7xl">Build a profile that works as professionally as you do.</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">Reach clients searching for professional, LGBTQ+-affirming massage while keeping direct control of rates, schedule, and client relationships.</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup/account" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#9D2335] px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-xl hover:bg-[#B62B40]">Create Your Profile <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/pricing" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-white/10">View Plans</Link>
              </div>
            </div>
            <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[["Direct", "Client contact"], ["$0", "Booking commission"], ["Flexible", "Minutes and rates"], ["Mobile", "Dashboard ready"]].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur"><p className="text-2xl font-extrabold">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">{label}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8B1E2D]">Why MasseurMatch</p>
            <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">A professional home for your independent practice.</h2>
              <p className="text-lg leading-8 text-[#555B64]">Create a clear listing, improve discovery, and use growth tools without turning your practice over to a booking marketplace.</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map(([Icon, title, body]) => (
                <article key={title} className="rounded-3xl border border-[#E4E4E4] bg-white p-6 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8B1E2D]/10 text-[#8B1E2D]"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-[#5E626A]">{body}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#101010] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.26em] text-[#E18A96]">The Process</p><h2 className="mt-5 font-display text-4xl font-extrabold sm:text-5xl">From account to public profile.</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80">Every step stays readable and manageable on mobile or desktop.</p></div>
            <div className="mt-12 grid gap-4 lg:grid-cols-4">
              {steps.map(([number, title, body]) => (
                <article key={number} className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-lg"><p className="text-4xl font-black text-[#E18A96]">{number}</p><h3 className="mt-8 text-xl font-bold leading-7">{title}</h3><p className="mt-3 text-sm leading-7 text-white/80">{body}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8B1E2D]">Your Dashboard</p><h2 className="mt-5 font-display text-4xl font-extrabold sm:text-5xl">Manage visibility without losing control.</h2><p className="mt-5 text-base leading-8 text-[#555B64]">Pending providers can finish the profile before ID approval. Verified providers continue to plan and payment setup.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[[Zap, "Available Now", "Tier-based live windows with cooldown protection."], [MapPin, "Travel Schedule", "Labeled destinations and dates with monthly plan limits."], [DollarSign, "Flexible Rates", "One Simple Rate, Rates by Technique, or Ask Me."], [Sparkles, "Market Intelligence", "Search trends, keywords, locations, and demand timing."]].map(([Icon, title, body]) => {
                const FeatureIcon = Icon as typeof Zap;
                return <div key={title as string} className="rounded-3xl border border-[#E4E4E4] bg-[#FAFAFA] p-6"><FeatureIcon className="h-5 w-5 text-[#8B1E2D]" /><h3 className="mt-4 font-bold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-[#60646B]">{body as string}</p></div>;
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#F6F3F3] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto max-w-4xl"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8B1E2D]">Questions</p><h2 className="mt-4 font-display text-4xl font-extrabold">Before you join.</h2></div><div className="mt-10 space-y-3">{faqs.map(([question, answer]) => <details key={question} className="rounded-2xl border border-[#DEDEDE] bg-white p-5 open:shadow-sm"><summary className="cursor-pointer list-none font-bold">{question}</summary><p className="mt-3 text-sm leading-7 text-[#5C6169]">{answer}</p></details>)}</div></div>
        </section>

        <section className="bg-[#8B1E2D] px-5 py-20 text-white sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center"><h2 className="font-display text-4xl font-extrabold sm:text-5xl">Ready to build your profile?</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80">Create your account, complete the profile at your pace, and finish identity verification when ready for public visibility.</p><Link href="/signup/account" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-[#8B1E2D] shadow-xl hover:bg-[#F8EDEE]">Join MasseurMatch <ArrowRight className="h-4 w-4" /></Link></div>
        </section>
      </main>
    </>
  );
}
