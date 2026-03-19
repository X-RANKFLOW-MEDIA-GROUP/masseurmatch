import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Phone, ShieldCheck, UserCheck } from "lucide-react";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";

const SAFETY_FAQS = [
  {
    question: "Does MasseurMatch verify therapist licenses?",
    answer:
      "No. MasseurMatch is a discovery directory and does not verify licenses or guarantee services. Visitors should do their own screening before contacting a provider.",
  },
  {
    question: "What should I confirm before scheduling?",
    answer:
      "Confirm boundaries, location details, pricing, timing, and contact methods directly with the provider before meeting.",
  },
  {
    question: "How do I report a safety concern?",
    answer:
      "Use the contact page to report suspicious listings, unsafe behavior, or profile concerns so the team can review the issue.",
  },
];

const safetyTips = [
  {
    icon: UserCheck,
    title: "Confirm identity and expectations",
    description:
      "Review the public profile carefully and ask clear questions about services, rates, and boundaries before meeting.",
  },
  {
    icon: Phone,
    title: "Keep communication on record",
    description:
      "Use written communication when possible so pricing, timing, and directions are easy to reference later.",
  },
  {
    icon: ShieldCheck,
    title: "Use your own judgment",
    description:
      "MasseurMatch helps with discovery, but you should always verify the situation independently and leave if something feels wrong.",
  },
  {
    icon: AlertTriangle,
    title: "Report suspicious behavior",
    description:
      "If a profile appears misleading or unsafe, contact the team so it can be reviewed and removed if needed.",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "Trust and safety",
  description:
    "Read the MasseurMatch trust and safety guidance before contacting therapists or scheduling a session.",
  path: "/safety",
  keywords: ["trust and safety", "massage directory safety", "report a listing", "safety guidance"],
});

export default function SafetyPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Trust and safety", path: "/safety" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "Trust and safety",
          description:
            "Safety guidance for using the MasseurMatch directory, reviewing therapist profiles, and reporting concerns.",
          path: "/safety",
        })}
      />
      <JsonLd data={buildFaqJsonLd(SAFETY_FAQS)} />

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Trust and safety</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Safety guidance for using the directory responsibly.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            MasseurMatch is a discovery platform, not a booking or verification service. Use these guidelines when
            reviewing therapist profiles, starting contact, and deciding whether a listing is right for you.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {safetyTips.map((tip) => (
            <article key={tip.title} className="rounded-3xl border border-border p-5 shadow-sm">
              <tip.icon className="h-6 w-6 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">{tip.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{tip.description}</p>
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground">Need to report something?</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            If a listing appears misleading, abusive, or unsafe, contact the team with as much detail as possible so
            it can be reviewed quickly.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
            <Link href="/terms" className="text-primary hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy
            </Link>
          </div>
        </section>

        <section className="mt-10 space-y-4">
          {SAFETY_FAQS.map((item) => (
            <article key={item.question} className="rounded-3xl border border-border p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">{item.question}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
