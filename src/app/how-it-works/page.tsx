import type { Metadata } from "next";
import Link from "next/link";
import { Check, Users } from "lucide-react";

import { IconArrowRight, IconMessage, IconShield, IconStar } from "@/components/icons";
import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "How MasseurMatch Works — Find and Contact Male Massage Therapists",
  description:
    "Search MasseurMatch by city and service, compare public profile details and clearly labeled trust signals, then contact independent therapists directly.",
  path: "/how-it-works",
  keywords: [
    "how masseurmatch works",
    "find male massage therapist",
    "massage therapist directory guide",
    "LGBTQ affirming massage",
    "identity verified massage therapist",
    "incall outcall massage directory",
  ],
});

const howItWorksSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Find a Massage Therapist on MasseurMatch",
  description:
    "Search the MasseurMatch directory, compare provider information and trust signals, and contact an independent therapist directly.",
  url: siteUrl("/how-it-works"),
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Search",
      text: "Browse by city, service, availability, and other directory filters.",
      url: siteUrl("/search"),
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Compare profiles",
      text: "Review the information providers publish, including services, pricing where available, photos, availability, and clearly labeled trust signals.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Contact directly",
      text: "Use the contact methods displayed by the provider. MasseurMatch does not act as the booking middleman for massage sessions.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Confirm details",
      text: "Confirm timing, rates, location, boundaries, and other session details directly with the independent provider.",
    },
  ],
};

const FAQ_ITEMS = [
  {
    question: "Is MasseurMatch free for clients to browse?",
    answer:
      "Yes. Clients can browse public directory pages and contact providers through the contact methods the provider makes available.",
  },
  {
    question: "Does MasseurMatch process massage-session bookings or payments?",
    answer:
      "No. MasseurMatch is a discovery and advertising directory. Session arrangements and session payments are handled directly between the client and the independent provider.",
  },
  {
    question: "What does Profile Reviewed mean?",
    answer:
      "Profile Reviewed means the listing passed the platform's publication and content review. It is not an identity check, professional license check, background check, or endorsement.",
  },
  {
    question: "What does Identity Verified mean?",
    answer:
      "Identity Verified means the provider successfully completed MasseurMatch's identity-only review using government-issued identity evidence, a current challenge selfie, and human review. It does not verify professional licensing, background, qualifications, or service quality.",
  },
  {
    question: "What does Featured mean?",
    answer:
      "Featured is a promotional placement signal. It does not mean the provider is identity verified, licensed, endorsed, or recommended by MasseurMatch.",
  },
];

const clientSteps = [
  {
    n: "01",
    icon: Users,
    title: "Search your market",
    body: "Browse available city and service pages and use directory filters to narrow the public listings.",
    badge: "Discovery",
  },
  {
    n: "02",
    icon: IconShield,
    title: "Read the trust signals",
    body: "Compare profile information and distinguish Profile Reviewed, Identity Verified, and promotional labels such as Featured.",
    badge: "Clear labels",
  },
  {
    n: "03",
    icon: IconMessage,
    title: "Contact directly",
    body: "Use the provider's available contact methods. MasseurMatch does not negotiate the massage session for you.",
    badge: "Direct contact",
  },
  {
    n: "04",
    icon: IconStar,
    title: "Confirm before meeting",
    body: "Confirm rates, location, timing, services, boundaries, and any questions directly with the independent provider.",
    badge: "Your decision",
  },
];

const therapistSteps = [
  {
    n: "01",
    title: "Create an accurate profile",
    body: "Add your real contact information, city, professional services, pricing where applicable, availability, photos, and practice details.",
  },
  {
    n: "02",
    title: "Complete required verification",
    body: "Complete the required account and identity steps presented in onboarding. Identity verification is separate from professional licensing.",
  },
  {
    n: "03",
    title: "Submit for publication review",
    body: "MasseurMatch reviews the profile for publication readiness and platform-policy compliance before it becomes public.",
  },
  {
    n: "04",
    title: "Manage your listing",
    body: "Keep your profile accurate and respond directly to clients who choose to contact you. Paid placement remains separate from trust signals.",
  },
];

const directoryFacts = [
  "Independent providers",
  "Direct provider contact",
  "No massage-session commission",
  "Profile review before public publication",
  "Identity verification labeled separately",
  "Paid promotional placement labeled separately",
  "No professional license verification by MasseurMatch",
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={howItWorksSchema} />
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "How It Works", path: "/how-it-works" },
      ])} />
      <JsonLd data={buildFaqJsonLd(FAQ_ITEMS)} />

      <div className="bg-white text-[#111111]">
        <section className="relative overflow-hidden bg-[#111111]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div className="relative mx-auto max-w-[1200px] px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-32">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">How It Works</p>
            <h1 className="mt-4 max-w-[14ch] font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[0.96] tracking-tight text-white">
              Discover. Compare. Contact directly.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 lg:text-lg">
              MasseurMatch is a U.S. discovery directory for professional massage and bodywork profiles. We provide search, profile information, and clearly labeled trust and promotional signals; independent providers handle session arrangements directly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:bg-[var(--color-primary-hover)]">
                Search therapists <IconArrowRight size={16} />
              </Link>
              <Link href="#for-therapists" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.10]">
                For therapists
              </Link>
            </div>
          </div>
        </section>

        <div className="bg-[#8B1E2D] px-4 py-4 text-center">
          <p className="mx-auto max-w-3xl text-sm font-semibold leading-6 text-white">
            MasseurMatch does not provide massage services, employ listed providers, or process massage-session bookings or payments.
          </p>
        </div>

        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1100px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">For clients</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight">Use the directory in four steps.</h2>
            <div className="mt-14 grid grid-cols-1 gap-px bg-[#F0F0F0] sm:grid-cols-2 lg:grid-cols-4">
              {clientSteps.map(({ n, icon: Icon, title, body, badge }) => (
                <div key={n} className="flex flex-col bg-white p-8">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8B1E2D]/10"><Icon size={20} className="text-[#8B1E2D]" /></div>
                    <span className="font-display text-4xl font-extrabold text-[#F0F0F0]">{n}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#6F6F6F]">{body}</p>
                  <span className="mt-5 inline-block rounded-full bg-[#8B1E2D]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8B1E2D]">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#111111] px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">Directory model</p>
            <h2 className="mt-3 text-center font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white">What MasseurMatch actually does.</h2>
            <div className="mx-auto mt-10 max-w-2xl divide-y divide-white/[0.07] rounded-2xl border border-white/10 bg-white/[0.04] px-7">
              {directoryFacts.map((fact) => (
                <div key={fact} className="flex items-center gap-3 py-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8B1E2D]/20"><Check size={13} className="text-[#D4717E]" strokeWidth={3} /></span>
                  <span className="text-sm text-white/80">{fact}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="for-therapists" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1100px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">For therapists</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight">Publish an accurate professional listing.</h2>
            <div className="mt-12 grid grid-cols-1 gap-px bg-[#F0F0F0] sm:grid-cols-2 lg:grid-cols-4">
              {therapistSteps.map((step) => (
                <div key={step.n} className="bg-white p-8">
                  <span className="font-display text-4xl font-extrabold text-[#EFEFEF]">{step.n}</span>
                  <h3 className="mt-5 font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6F6F6F]">{step.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/signup/plan" className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white">
                View provider plans <IconArrowRight size={16} />
              </Link>
              <Link href="/verification" className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] px-6 py-3 text-sm font-semibold text-[#111111]">
                Read identity verification details
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[#E8E8E8] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[760px]">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Common questions</h2>
            <dl className="mt-8 divide-y divide-[#E8E8E8]">
              {FAQ_ITEMS.map((item) => (
                <div key={item.question} className="py-6">
                  <dt className="font-display text-base font-bold">{item.question}</dt>
                  <dd className="mt-2 text-sm leading-7 text-[#6F6F6F]">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </>
  );
}
