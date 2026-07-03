import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BadgeInfo,
  BriefcaseBusiness,
  FileText,
  HeartHandshake,
  Mail,
  ShieldAlert,
  Stethoscope,
  WalletCards,
} from "lucide-react";

import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";

type DisclaimerCard = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const disclaimers: DisclaimerCard[] = [
  {
    icon: BriefcaseBusiness,
    title: "Visibility platform only",
    body: "MasseurMatch is a visibility platform, not an agency, employer, or service provider. Providers remain fully responsible for their own services, communications, and compliance.",
  },
  {
    icon: BadgeInfo,
    title: "No license verification",
    body: "Credentials, certifications, and licenses shown on profiles are self-declared unless explicitly stated otherwise. Clients should confirm qualifications directly before booking.",
  },
  {
    icon: FileText,
    title: "Provider-owned listings",
    body: "Profile content, including bios, pricing, photos, and service descriptions, is submitted by providers. MasseurMatch does not guarantee that listing content is accurate, professional, or lawful.",
  },
  {
    icon: Stethoscope,
    title: "No medical advice",
    body: "The platform is intended for wellness discovery. Listings may not be used to diagnose, treat, or prescribe unless a provider is properly licensed and operating within applicable law.",
  },
  {
    icon: WalletCards,
    title: "No bookings or payments",
    body: "MasseurMatch does not process bookings, payments, or on-platform messaging. Any interaction, arrangement, or transaction happens directly between provider and client.",
  },
  {
    icon: HeartHandshake,
    title: "No endorsement",
    body: "Promotional placements or featured visibility options are paid opportunities and do not constitute endorsements by MasseurMatch or its owners.",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "Platform Disclaimer",
  description:
    "Read the MasseurMatch platform disclaimer, including the independent-provider model, no-license-verification notice, and direct-contact responsibilities.",
  path: "/platform-disclaimer",
  keywords: ["platform disclaimer", "directory disclaimer", "independent providers", "no license verification"],
});

const platformDisclaimerJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platform Disclaimer",
  url: "https://masseurmatch.com/platform-disclaimer",
  description:
    "MasseurMatch platform disclaimer covering the independent-provider model, listing responsibility, and direct-contact terms.",
};

export default function PlatformDisclaimerPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Platform Disclaimer", path: "/platform-disclaimer" },
        ])}
      />
      <JsonLd data={platformDisclaimerJsonLd} />

      <main className="page-shell py-10">
        <section className="hero-panel px-6 py-8 sm:px-8 sm:py-10">
          <span className="eyebrow-chip eyebrow-chip-inverse">Platform Disclaimer</span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Transparent boundaries around what MasseurMatch does, and does not, do.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/78">
            MasseurMatch exists to make provider visibility and direct connections clearer. It does not replace your
            own due diligence, legal compliance, or independent decision-making.
          </p>
          <div className="mt-6 max-w-3xl rounded-3xl border border-white/14 bg-white/8 px-5 py-4 text-sm leading-7 text-white/76">
            By using or listing on the platform, you acknowledge that providers operate independently and that any
            interaction or transaction is at your own risk and discretion.
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {disclaimers.map((item) => (
            <article
              key={item.title}
              className="premium-surface rounded-3xl border border-border-subtle p-6 shadow-soft"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <article className="premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-brand-soft/12 text-brand-primary">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Important Reminder</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                  The platform does not guarantee outcome, quality, legality, or suitability.
                </h2>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  Clients should confirm credentials, boundaries, location details, pricing, and service scope directly
                  with the provider. Providers remain responsible for ensuring their listings and services comply with
                  local laws and professional standards.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-border-subtle bg-white/90 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Legal Contact</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
              Questions about platform liability or legal process?
            </h2>
            <a
              href="mailto:legal@masseurmatch.com"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary transition hover:text-brand-primary"
            >
              <Mail className="h-4 w-4" />
              legal@masseurmatch.com
            </a>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/terms" className="rounded-full border border-border-subtle px-4 py-2 text-foreground transition hover:border-brand-secondary/30 hover:text-brand-secondary">
                Terms
              </Link>
              <Link href="/privacy" className="rounded-full border border-border-subtle px-4 py-2 text-foreground transition hover:border-brand-secondary/30 hover:text-brand-secondary">
                Privacy
              </Link>
              <Link href="/community-guidelines" className="rounded-full border border-border-subtle px-4 py-2 text-foreground transition hover:border-brand-secondary/30 hover:text-brand-secondary">
                Community Guidelines
              </Link>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
