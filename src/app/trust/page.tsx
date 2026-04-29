import type { Metadata } from "next";
import Script from "next/script";
import {
  BadgeCheck,
  CalendarClock,
  CircleAlert,
  FileSearch,
  LockKeyhole,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trust & Safety | MasseurMatch",
  description:
    "Public, auditable trust definitions for Identity Checked, Profile Reviewed, and Photo Checked badges, including audit cadence and oversight.",
  alternates: { canonical: "https://masseurmatch.com/trust" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Trust & Safety - MasseurMatch",
  url: "https://masseurmatch.com/trust",
  description:
    "Public trust framework with independent verification definitions, legal disclaimers, and security posture statements.",
};

const trustBadges = [
  {
    icon: UserRoundCheck,
    name: "Identity Checked",
    definition:
      "Provider completed a government-ID verification workflow. This badge confirms identity matching at the time of review.",
    cadence: "Re-validated every 12 months or after legal-name/profile-ownership changes.",
    auditor: "Primary check by Stripe Identity workflow + internal compliance verification.",
    note: "Identity checks do not confirm professional license, certifications, or legal authorization to practice in every jurisdiction.",
  },
  {
    icon: BadgeCheck,
    name: "Profile Reviewed",
    definition:
      "Listing text, categories, and contact metadata were reviewed against content standards and prohibited-content policy.",
    cadence: "Automated checks continuously + manual spot checks at least every 30 days.",
    auditor: "MasseurMatch trust team with moderation tooling and policy checklist.",
    note: "Review means policy conformance at review time, not endorsement or guarantee of service quality.",
  },
  {
    icon: FileSearch,
    name: "Photo Checked",
    definition:
      "Photos passed moderation checks for policy compliance (professional framing, prohibited-content controls, and quality rules).",
    cadence: "Every upload is scanned pre-publication; high-risk profiles receive manual re-check within 7 days.",
    auditor: "Automated moderation model + human escalation queue for borderline or flagged cases.",
    note: "Photo checks do not verify real-time appearance, current condition, or identity continuity outside submitted assets.",
  },
];

export default function TrustPage() {
  return (
    <>
      <Script id="trust-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="page-shell py-12 md:py-16">
        <section className="rounded-3xl border border-border bg-slate-950 px-6 py-10 text-white md:px-10 md:py-14">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Trust Framework</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
            Public definitions below are designed to be auditable, specific, and legally precise. Badge language reflects
            what is checked — and what is not checked.
          </p>
        </section>

        <section className="mt-8 grid gap-5">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;

            return (
              <article key={badge.name} className="rounded-2xl border border-border bg-background p-6">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-800">
                    <Icon className="h-4 w-4" />
                  </span>
                  {badge.name}
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{badge.definition}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Audit Cadence</p>
                    <p className="mt-2 text-sm text-foreground">{badge.cadence}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Who Audits</p>
                    <p className="mt-2 text-sm text-foreground">{badge.auditor}</p>
                  </div>
                </div>
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900">{badge.note}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-background p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <LockKeyhole className="h-5 w-5" /> Security posture
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              MasseurMatch uses TLS in transit, scoped access controls, and moderation/abuse monitoring. We do not state
              SOC 2 certification unless and until formally completed.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Current statement: <strong>independent security assessment in progress.</strong>
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-background p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <CircleAlert className="h-5 w-5" /> Legal disclaimer
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              MasseurMatch is a discovery directory. Users are responsible for due diligence before any session, including
              legal compliance, credentials, boundaries, and pricing confirmation.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Badge status is a trust signal, not a guarantee, warranty, or medical/legal endorsement.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-background p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <CalendarClock className="h-5 w-5" /> Audit transparency cadence
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Monthly: moderation quality report and policy exception review.</li>
            <li>• Quarterly: sampled badge accuracy review by internal compliance owners.</li>
            <li>• Annual: independent security review summary and trust-page update.</li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Last policy refresh: April 28, 2026.</p>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-background p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <ShieldCheck className="h-5 w-5" /> Contact support
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">Need a trust clarification? Call support at 978-MASSEUR or use the contact page.</p>
        </section>
      </main>
    </>
  );
}
