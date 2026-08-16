import type { Metadata } from "next";
import Link from "next/link";

import { createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "List Your Massage Practice | For Providers",
  description:
    "Create a public MasseurMatch profile, present your services and rates, receive direct inquiries, and choose optional paid visibility without booking commissions from MasseurMatch.",
  path: "/for-therapists",
  keywords: [
    "massage therapist directory listing",
    "list massage practice",
    "LGBTQ affirming massage directory",
    "independent massage therapist profile",
  ],
});

const benefits = [
  {
    title: "Control your public profile",
    body: "Present your provider supplied biography, specialties, service formats, rates, availability, photos, location, and direct contact options.",
  },
  {
    title: "Keep client communication direct",
    body: "MasseurMatch is a discovery directory. Clients contact independent providers directly to discuss scheduling, pricing, payment, location, and session details.",
  },
  {
    title: "Use clear trust signals",
    body: "Profile Reviewed reflects platform moderation. Identity Verified is a separate identity review available only through the applicable verification workflow. Neither is a license check or service guarantee.",
  },
  {
    title: "Choose visibility separately",
    body: "Eligible paid plans and add ons can increase placement or visibility. Paid placement is advertising and never creates or implies identity verification, professional credentials, leads, bookings, or revenue.",
  },
  {
    title: "Built for independent providers",
    body: "MasseurMatch does not employ providers, set session terms, take a commission from off platform massage session payments, or manage the provider client relationship.",
  },
  {
    title: "Eligible profiles can be discoverable",
    body: "Approved public profiles may appear in MasseurMatch directory pages and may be eligible for search engine indexing according to current publication and indexing rules. Search visibility is not guaranteed.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    body: "Add the required account and contact information, including a valid phone number.",
  },
  {
    number: "02",
    title: "Complete your profile",
    body: "Add accurate city, services, rates, photos, availability, and other provider supplied information relevant to your practice.",
  },
  {
    number: "03",
    title: "Submit for profile review",
    body: "MasseurMatch reviews the profile for publication requirements and platform content rules. Approval timing is not guaranteed.",
  },
  {
    number: "04",
    title: "Manage your listing",
    body: "Keep your information current, respond to inquiries directly, and choose optional paid visibility if it fits your business.",
  },
];

export default function ForTherapistsPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="border-b border-border bg-[#111111] px-6 py-24 text-white sm:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8B1E2D]">
            For massage providers
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
            Build a professional profile clients can evaluate before they contact you.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            MasseurMatch is a professional, LGBTQ+ affirming discovery directory for independent massage and bodywork providers. You control your profile and clients contact you directly.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup/account"
              className="rounded-full bg-[#8B1E2D] px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Create a profile
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:border-white/50"
            >
              View plans
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E2D]">What you get</p>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
              A directory listing without pretending the platform runs your practice.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-3xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E2D]">Publication flow</p>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">From account to public profile.</h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.number} className="rounded-3xl border border-border bg-background p-6">
                <div className="text-sm font-semibold text-[#8B1E2D]">{step.number}</div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-border bg-card p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E2D]">Trust signals</p>
            <h2 className="mt-4 font-display text-2xl font-semibold">Identity verification is separate from advertising.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Where available and eligible, the Identity Verified workflow uses a supported government issued ID, a current challenge selfie, and human review. It confirms a point in time identity review only. It does not verify a professional license, background, training, service quality, legality, safety, or results.
            </p>
            <Link href="/verification" className="mt-6 inline-flex text-sm font-semibold text-[#8B1E2D] hover:underline">
              Read how verification works
            </Link>
          </article>

          <article className="rounded-3xl border border-border bg-card p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E2D]">Provider responsibility</p>
            <h2 className="mt-4 font-display text-2xl font-semibold">Keep every public claim accurate.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Providers are responsible for accurate profile information, lawful professional conduct, current rates and availability, credentials they choose to claim, and compliance with applicable laws. MasseurMatch does not verify professional licenses or guarantee client inquiries, bookings, revenue, or outcomes.
            </p>
            <Link href="/provider-terms" className="mt-6 inline-flex text-sm font-semibold text-[#8B1E2D] hover:underline">
              Read Provider Terms
            </Link>
          </article>
        </div>
      </section>

      <section className="bg-[#111111] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready to create your provider profile?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/65">
            Start with the free profile flow. You can review paid visibility options separately after your account is set up.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup/account" className="rounded-full bg-[#8B1E2D] px-7 py-3 text-sm font-semibold text-white">
              Create a profile
            </Link>
            <Link href="/subscriptions" className="rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white">
              Subscription terms
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
