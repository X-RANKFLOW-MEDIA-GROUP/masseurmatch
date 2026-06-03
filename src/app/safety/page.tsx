import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Camera, Phone, ShieldCheck, UserCheck } from "lucide-react";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";

const SAFETY_FAQS = [
  {
    question: "What do MasseurMatch verification badges mean?",
    answer:
      "Badges reflect the reviews completed by MasseurMatch when shown, such as identity review, profile review, or photo review. They are trust signals, not a guarantee of service quality, licensure, or session outcome.",
  },
  {
    question: "Does MasseurMatch verify therapist licenses?",
    answer:
      "Not universally. Unless a profile explicitly states otherwise, you should still confirm licenses, certifications, boundaries, pricing, and location details directly with the provider.",
  },
  {
    question: "What should I confirm before scheduling?",
    answer:
      "Confirm boundaries, location details, pricing, timing, session format, and contact methods directly with the provider before meeting.",
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
    title: "Review the profile before you reach out",
    description:
      "Use the public listing to check specialties, rates, session format, reviews, and any visible verification signals before first contact.",
  },
  {
    icon: Phone,
    title: "Keep communication on record",
    description:
      "Use written communication when possible so pricing, timing, directions, and expectations are easy to reference later.",
  },
  {
    icon: ShieldCheck,
    title: "Use badges as signals, not guarantees",
    description:
      "MasseurMatch helps with discovery, but you should still verify the situation independently and leave if something feels wrong.",
  },
  {
    icon: AlertTriangle,
    title: "Report suspicious behavior",
    description:
      "If a profile appears misleading or unsafe, contact the team so it can be reviewed and removed if needed.",
  },
];

const badgeMeanings = [
  {
    icon: BadgeCheck,
    title: "Profile reviewed",
    description: "The listing content was reviewed for presentation quality and trust and safety fit.",
  },
  {
    icon: UserCheck,
    title: "Identity reviewed",
    description: "The provider submitted identity information for trust and safety review.",
  },
  {
    icon: Camera,
    title: "Photos reviewed",
    description: "The visible photos were reviewed as part of the profile-quality process.",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "Trust and safety",
  description:
    "Understand what MasseurMatch trust badges mean, how to contact providers more safely, and how to report a concern.",
  path: "/safety",
  keywords: ["trust and safety", "massage directory safety", "verification badges", "report a listing", "safety guidance"],
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
            "Safety guidance for using the MasseurMatch directory, understanding verification badges, and reporting concerns.",
          path: "/safety",
        })}
      />
      <JsonLd data={buildFaqJsonLd(SAFETY_FAQS)} />

      <div className="page-shell py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Trust and safety</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">How MasseurMatch handles trust and safety.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            MasseurMatch is a discovery platform, not a booking intermediary. We make trust signals more visible, but
            users should still review each profile carefully and confirm details directly before scheduling.
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
          <h2 className="text-2xl font-semibold text-foreground">What the badges mean</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Trust badges are there to reduce ambiguity, not to replace personal judgment. Here is what they are intended to communicate.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {badgeMeanings.map((badge) => (
              <article key={badge.title} className="rounded-2xl border border-border bg-secondary/20 p-4">
                <badge.icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="mt-3 font-semibold text-foreground">{badge.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{badge.description}</p>
              </article>
            ))}
          </div>
        </section>

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
