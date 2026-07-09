import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Info, ShieldOff, TriangleAlert } from "lucide-react";

import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Badge and Verification Disclaimer",
  description:
    "What MasseurMatch badges and profile signals mean — and what they do not mean. Badges are platform indicators, not license verification or background checks.",
  path: "/badge-disclaimer",
  keywords: ["badge disclaimer", "verification disclaimer", "profile badges", "trust signals"],
});

const badgeTypes = [
  {
    icon: BadgeCheck,
    name: "Verified Profile",
    meaning: "The provider has completed a basic identity confirmation step to confirm they are a real person operating a genuine account.",
    notMeaning: "This badge does not verify professional licenses, certifications, background history, insurance, qualifications, or that the provider is safe or suitable for any purpose.",
  },
  {
    icon: BadgeCheck,
    name: "Licensed Practitioner (self-declared)",
    meaning: "The provider has self-reported holding a professional license or certification relevant to their listed services.",
    notMeaning: "MasseurMatch does not independently verify the existence, validity, currency, or scope of any self-declared license or certification. Clients must verify licenses directly with the relevant licensing authority.",
  },
  {
    icon: BadgeCheck,
    name: "LGBTQ+ Affirming",
    meaning: "The provider has self-declared that they are inclusive, welcoming, and affirming of LGBTQ+ clients.",
    notMeaning: "This is a self-declaration and has not been independently assessed or verified by MasseurMatch.",
  },
  {
    icon: BadgeCheck,
    name: "Profile Complete",
    meaning: "The provider has filled in all recommended profile fields, including bio, service description, photos, and contact information.",
    notMeaning: "Profile completeness is a formatting indicator. It does not reflect the accuracy, truthfulness, or quality of any information provided.",
  },
];

export default function BadgeDisclaimerPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Badge and Verification Disclaimer", path: "/badge-disclaimer" },
        ])}
      />

      <div className="page-shell py-10">
        <section className="rounded-3xl border border-border-subtle bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,246,250,0.96))] p-6 shadow-brand sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Trust Signals</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Badge and Verification Disclaimer
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
            Badges and profile signals on MasseurMatch are limited platform indicators. This page explains exactly
            what each badge means — and what it does not mean — so you can make informed decisions.
          </p>
          <p className="mt-3 text-xs text-text-muted">Last updated: June 29, 2026</p>
        </section>

        <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <TriangleAlert className="mt-0.5 h-5 w-5 flex-none text-amber-600" strokeWidth={2.25} />
            <div>
              <h2 className="font-display text-lg font-semibold text-amber-900">Important disclaimer — please read</h2>
              <p className="mt-2 text-sm leading-7 text-amber-800">
                Badges and profile signals are <strong>limited platform indicators only</strong>. They are not
                professional license verification, background checks, criminal history checks, insurance
                confirmation, endorsements, quality guarantees, or proof that a provider is safe, qualified,
                legal, available, or suitable for any particular client or purpose.
              </p>
              <p className="mt-3 text-sm leading-7 text-amber-800">
                You are solely responsible for independently verifying any provider's credentials, licensing,
                safety, and suitability before contacting, scheduling, or meeting with them.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">What each badge means</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {badgeTypes.map((badge) => (
              <article key={badge.name} className="premium-surface rounded-3xl border border-border-subtle p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                    <badge.icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{badge.name}</h3>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">What it means</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-900">{badge.meaning}</p>
                  </div>
                  <div className="rounded-xl bg-red-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">What it does not mean</p>
                    <p className="mt-1 text-sm leading-6 text-red-900">{badge.notMeaning}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <div className="flex items-start gap-4">
            <Info className="mt-0.5 h-5 w-5 flex-none text-brand-secondary" strokeWidth={2.25} />
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">MasseurMatch does not verify licenses</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-text-secondary">
                <p>
                  MasseurMatch does not independently verify, confirm, or audit professional licenses,
                  certifications, background history, insurance, or any other credential claimed by a provider.
                  Profile content — including credentials — is self-declared by providers.
                </p>
                <p>
                  To verify a provider&apos;s license, contact the relevant licensing authority in the provider&apos;s
                  jurisdiction directly. Most states maintain searchable online license verification databases
                  through their state health department or professional licensing board.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <div className="flex items-start gap-4">
            <ShieldOff className="mt-0.5 h-5 w-5 flex-none text-brand-secondary" strokeWidth={2.25} />
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">No background checks</h2>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                MasseurMatch does not conduct background checks on providers. No badge, profile signal, or
                platform indicator should be interpreted as an indication that a provider has passed a background
                check, criminal history review, or sex offender registry check. Clients are responsible for their
                own safety research and decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border-subtle bg-brand-primary px-6 py-7 text-white shadow-brand sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">Related Policies</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            {[
              { href: "/platform-disclaimer", label: "Platform Disclaimer" },
              { href: "/client-terms", label: "Client Terms" },
              { href: "/provider-terms", label: "Provider Terms" },
              { href: "/report-block-safety", label: "Safety Policy" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/18 bg-white/8 px-4 py-2 text-white transition hover:border-white/32 hover:bg-white/12"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
