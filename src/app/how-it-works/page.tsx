import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, Search, ShieldCheck, Sparkles, UserRoundSearch } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works | MasseurMatch Directory",
  description:
    "How MasseurMatch works: search by city, compare trust signals, and contact therapists directly.",
  alternates: { canonical: "https://masseurmatch.com/how-it-works" },
};

const howItWorksSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Find a Massage Therapist on MasseurMatch",
  step: [
    { "@type": "HowToStep", position: 1, name: "Search", text: "Search city, area, or therapist specialty." },
    { "@type": "HowToStep", position: 2, name: "Compare", text: "Compare profile details, trust badges, and pricing visibility." },
    { "@type": "HowToStep", position: 3, name: "Contact", text: "Contact the provider directly via listed channels." },
    { "@type": "HowToStep", position: 4, name: "Confirm", text: "Confirm timing, boundaries, location, and exact rates with the therapist." },
  ],
};

const steps = [
  {
    icon: Search,
    title: "Search your city",
    body: "Use city and intent-based routes to narrow results quickly.",
  },
  {
    icon: UserRoundSearch,
    title: "Compare profiles",
    body: "Review modalities, availability, trust badges, and visible pricing information.",
  },
  {
    icon: ShieldCheck,
    title: "Contact directly",
    body: "MasseurMatch is a directory. You communicate with providers directly.",
  },
  {
    icon: Sparkles,
    title: "Use Knotty AI",
    body: "Need help choosing? Knotty can recommend options based on your intent.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Script id="how-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema) }} />
      <main className="page-shell py-12 md:py-16">
        <section className="rounded-3xl border border-border bg-background p-8 md:p-12">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">How MasseurMatch Works</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            Find providers, compare trusted profile signals, and connect directly. We do not intermediate appointments or
            process booking payments.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Start searching <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/knotty" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary">
              How Knotty works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="rounded-2xl border border-border bg-background p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step {index + 1}</p>
                <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-foreground">
                  <Icon className="h-5 w-5" /> {step.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.body}</p>
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}
