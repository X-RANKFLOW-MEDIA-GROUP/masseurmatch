import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Users, MessageCircle, Star, ArrowUpRight, X } from "lucide-react";
import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "How MasseurMatch Works — Find a Verified Male Massage Therapist",
  description:
    "Learn how MasseurMatch connects you with verified LGBTQ+-affirming male massage therapists. Search by city, compare profiles with trust signals, and contact therapists directly — no booking middleman.",
  path: "/how-it-works",
  keywords: [
    "how masseurmatch works",
    "find male massage therapist",
    "massage therapist directory guide",
    "LGBTQ affirming massage",
    "verified massage therapist",
    "how to book massage",
    "incall outcall massage directory",
  ],
});

const howItWorksSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Find a Verified Male Massage Therapist on MasseurMatch",
  description:
    "Step-by-step guide to finding and connecting with a verified, LGBTQ+-affirming male massage therapist using the MasseurMatch directory.",
  url: siteUrl("/how-it-works"),
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Search Your City",
      text: "Enter your city or browse top markets — Dallas, Miami, New York, LA, Chicago and 250+ more. Filter by massage modality, incall or outcall, and price range.",
      url: siteUrl("/search"),
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Compare Verified Profiles",
      text: "Review in-depth therapist profiles including services, rates, photos, trust signals, availability, and years of experience.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Contact Directly",
      text: "Reach out via the contact buttons on each profile — phone, WhatsApp, or email. All contact goes directly to the therapist with no platform middleman.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Confirm & Book",
      text: "Confirm session details, rates, and availability directly with the therapist. MasseurMatch never handles payments or takes commissions.",
    },
  ],
  totalTime: "PT5M",
};

const FAQ_ITEMS = [
  {
    question: "Is MasseurMatch free to use?",
    answer:
      "Yes — browsing, comparing profiles, and contacting therapists is completely free for clients. Therapists pay for premium listing tiers.",
  },
  {
    question: "Does MasseurMatch collect payments or take booking fees?",
    answer:
      "No. MasseurMatch is a directory only. We never collect payments, process transactions, or take commissions. All arrangements are made directly between you and the therapist.",
  },
  {
    question: "How is MasseurMatch different from Soothe or Zeel?",
    answer:
      "Soothe and Zeel are on-demand platforms that dispatch employees and take 20–30% of every booking. MasseurMatch is a discovery directory — we connect you with independent therapists and step aside.",
  },
  {
    question: "How do I know a therapist is verified?",
    answer:
      "Verified therapists display trust badges on their profiles: identity verification, profile review status, years of experience, and approval by the MasseurMatch moderation team before going live.",
  },
  {
    question: "Can I find therapists who offer incall and outcall on MasseurMatch?",
    answer:
      "Yes. Every profile clearly shows whether a therapist offers incall (at their location), outcall (to your home or hotel), or both — with pricing where available.",
  },
];

const clientSteps = [
  {
    n: "01",
    icon: Users,
    title: "Search your city",
    body: "Enter any US city — or browse the top markets. Filter by technique, incall/outcall, price range, and LGBTQ+ affirmation.",
    badge: "250+ cities",
  },
  {
    n: "02",
    icon: ShieldCheck,
    title: "Compare verified profiles",
    body: "Review photos, services, pricing, trust badges, availability, reviews, and years of experience before reaching out.",
    badge: "Trust signals",
  },
  {
    n: "03",
    icon: MessageCircle,
    title: "Contact directly",
    body: "Use the phone, WhatsApp, or email buttons on each profile. No platform middleman — you communicate with the therapist directly.",
    badge: "Direct contact",
  },
  {
    n: "04",
    icon: Star,
    title: "Book & experience",
    body: "Confirm details with the therapist and book the session. After, your review helps others in the community.",
    badge: "Community",
  },
];

const therapistSteps = [
  {
    n: "01",
    title: "Create your profile",
    body: "Add your bio, services, pricing, availability, photos, and specialties. Build a profile that represents your practice.",
  },
  {
    n: "02",
    title: "Pass review & go live",
    body: "MasseurMatch reviews each profile before it's published. Approved profiles are indexed by search engines and appear in local searches.",
  },
  {
    n: "03",
    title: "Clients reach out",
    body: "Clients contact you through the buttons on your profile — phone, WhatsApp, or email. You control your schedule and communication.",
  },
  {
    n: "04",
    title: "Build your reputation",
    body: "A complete, accurate profile with clear pricing and great photos drives more inquiries. Reviews and trust badges help you stand out.",
  },
];

const comparison = {
  us: [
    "Free to search & browse",
    "Direct therapist contact",
    "Independent therapists",
    "No platform middleman",
    "Therapist sets their own rates",
    "LGBTQ+-affirming profiles available",
    "Identity-verified listings",
  ],
  them: [
    "Free to browse",
    "20–30% commission per booking",
    "Platform-employed workers",
    "Platform controls all communication",
    "Platform sets pricing tiers",
    "Inclusion varies widely",
    "Variable verification standards",
  ],
};

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={howItWorksSchema} />
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "How It Works", path: "/how-it-works" },
      ])} />
      <JsonLd data={buildFaqJsonLd(FAQ_ITEMS)} />

      <main className="bg-white text-[#111111]">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#111111]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#8B1E2D]/[0.07] blur-3xl" />

          <div className="relative mx-auto max-w-[1200px] px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-32">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">
              How It Works
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[0.96] tracking-tight text-white">
              Finding your therapist
              <br />
              <span className="text-[#8B1E2D]">takes minutes.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/55 lg:text-lg">
              MasseurMatch is a discovery directory — we connect you with verified,
              LGBTQ+-affirming male massage therapists and step aside.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#8B1E2D]/20 transition hover:bg-[#6E1521]"
              >
                Search therapists
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <Link
                href="#for-therapists"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.10]"
              >
                I&apos;m a therapist
              </Link>
            </div>
          </div>
        </section>

        {/* ── Model explainer bar ──────────────────────────────────────────── */}
        <div className="bg-[#8B1E2D] px-4 py-4 text-center">
          <p className="mx-auto max-w-2xl text-sm font-semibold leading-6 text-white">
            <strong className="font-extrabold">MasseurMatch is a directory service.</strong>{" "}
            We connect you with therapists and facilitate direct contact.
            All arrangements happen between you and the therapist — we never take a cut.
          </p>
        </div>

        {/* ── Client steps ─────────────────────────────────────────────────── */}
        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1100px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">For clients</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#111111]">
              Connect directly in four steps.
            </h2>

            <div className="mt-14 grid grid-cols-1 gap-px bg-[#F0F0F0] sm:grid-cols-2 lg:grid-cols-4">
              {clientSteps.map(({ n, icon: Icon, title, body, badge }) => (
                <div key={n} className="flex flex-col bg-white p-8">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8B1E2D]/10">
                      <Icon size={20} className="text-[#8B1E2D]" strokeWidth={2.25} />
                    </div>
                    <span className="font-display text-4xl font-extrabold text-[#F0F0F0]">{n}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#111111]">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#6F6F6F]">{body}</p>
                  <span className="mt-5 inline-block rounded-full bg-[#8B1E2D]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8B1E2D]">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison table ─────────────────────────────────────────────── */}
        <section className="bg-[#111111] px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1000px]">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">
              The difference
            </p>
            <h2 className="mt-3 text-center font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white">
              Directory vs. on-demand platform.
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-px bg-white/[0.06] sm:grid-cols-2">
              {/* MasseurMatch */}
              <div className="flex flex-col bg-[#0E1C2E] p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8B1E2D]">MasseurMatch</p>
                <div className="mt-6 space-y-0 divide-y divide-white/[0.06]">
                  {comparison.us.map((item) => (
                    <div key={item} className="flex items-center gap-3 py-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                        <Check size={11} className="text-emerald-400" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-white/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitors */}
              <div className="flex flex-col bg-[#080F1A] p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/30">On-demand platforms</p>
                <div className="mt-6 space-y-0 divide-y divide-white/[0.04]">
                  {comparison.them.map((item, i) => (
                    <div key={item} className="flex items-center gap-3 py-3 opacity-45">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                        {i === 0
                          ? <Check size={11} className="text-white/40" strokeWidth={3} />
                          : <X size={11} className="text-white/40" strokeWidth={3} />
                        }
                      </div>
                      <span className="text-sm text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── For therapists ───────────────────────────────────────────────── */}
        <section id="for-therapists" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1100px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">For therapists</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#111111]">
              Get your practice listed.
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-px bg-[#F0F0F0] sm:grid-cols-2">
              {therapistSteps.map(({ n, title, body }) => (
                <div key={n} className="flex gap-6 bg-white p-8">
                  <span className="font-display text-3xl font-extrabold text-[#EBEBEB]">{n}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#111111]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6F6F6F]">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/for-therapists"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#8B1E2D] transition hover:opacity-75"
              >
                Full therapist guide
                <ArrowUpRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section className="border-t border-[#F0F0F0] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[720px]">
            <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-extrabold tracking-tight text-[#111111]">
              Quick answers.
            </h2>
            <dl className="mt-8 divide-y divide-[#F0F0F0]">
              {FAQ_ITEMS.map(({ question, answer }) => (
                <div key={question} className="py-6">
                  <dt className="font-display text-base font-bold text-[#111111]">{question}</dt>
                  <dd className="mt-2 text-sm leading-6 text-[#6F6F6F]">{answer}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-sm text-[#999999]">
              More questions?{" "}
              <Link href="/contact" className="font-semibold text-[#8B1E2D] hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#111111] px-4 py-20 text-center sm:px-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#8B1E2D]/[0.08] blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-xl">
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white">
              Ready to find your match?
            </h2>
            <p className="mt-4 text-base leading-7 text-white/50">
              Free for clients. Verified for everyone.
            </p>
            <Link
              href="/search"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-xl shadow-[#8B1E2D]/20 transition hover:bg-[#6E1521]"
            >
              Search therapists now
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
