import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { AlertTriangle, Flag, Phone, Shield, ShieldAlert, UserMinus } from "lucide-react";

import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Report, Block, and Safety Policy",
  description:
    "How to report profiles, content, and behavior on MasseurMatch, how blocking works, safety tips, and emergency resources.",
  path: "/report-block-safety",
  keywords: ["report a user", "block user", "safety policy", "trust and safety", "how to report"],
});

const safetyTips = [
  "Research the provider independently before making contact. Look for a consistent professional presence beyond their MasseurMatch listing.",
  "Communicate through the platform's contact features before sharing personal contact details.",
  "Trust your instincts. If a communication feels uncomfortable or pressuring, do not proceed.",
  "Never transfer money, gift cards, or cryptocurrency to a provider in advance of a session.",
  "Share your session plans with a trusted person — where you are going and when you expect to be back.",
  "Know that MasseurMatch does not employ providers and is not present at sessions. Your safety is your responsibility.",
  "If a provider requests or implies sexual services, do not proceed — report the profile immediately.",
];

const reportTypes: { icon: React.ElementType; title: string; body: string; action: string }[] = [
  {
    icon: Flag,
    title: "Report a profile",
    body: "Report providers whose profiles contain false information, stolen photos, prohibited content, or implied illegal services.",
    action: "trust@masseurmatch.com",
  },
  {
    icon: ShieldAlert,
    title: "Report a safety concern",
    body: "Report conduct, communication, or behavior that creates a safety concern — including threats, coercion, or suspicious activity.",
    action: "trust@masseurmatch.com",
  },
  {
    icon: AlertTriangle,
    title: "Report suspected trafficking",
    body: "If you suspect human trafficking or exploitation, report it to us and to the National Human Trafficking Hotline.",
    action: "trust@masseurmatch.com",
  },
  {
    icon: UserMinus,
    title: "Report harassment",
    body: "Report any user who is harassing, threatening, or discriminating against you through the platform.",
    action: "trust@masseurmatch.com",
  },
  {
    icon: ShieldAlert,
    title: "Report child exploitation",
    body: "Any content that sexualizes or involves a minor is reported to NCMEC and law enforcement. Report it to us and to the NCMEC CyberTipline at 1-800-843-5678.",
    action: "trust@masseurmatch.com",
  },
];

export default function ReportBlockSafetyPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Report, Block, and Safety Policy", path: "/report-block-safety" },
        ])}
      />

      <div className="page-shell py-10">
        <section className="rounded-3xl border border-border-subtle bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,246,250,0.96))] p-6 shadow-brand sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Trust and Safety</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Report, Block, and Safety Policy
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
            Your safety matters. This page explains how to report profiles or conduct that violates platform
            standards, how to block other users, and important safety resources.
          </p>
          <p className="mt-3 text-xs text-text-muted">Last updated: June 29, 2026</p>
        </section>

        <section className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <Phone className="mt-0.5 h-5 w-5 flex-none text-red-600" strokeWidth={2.25} />
            <div>
              <h2 className="font-display text-lg font-semibold text-red-900">Emergency resources</h2>
              <p className="mt-2 text-sm leading-6 text-red-800">
                If you are in immediate danger, <strong>call 911</strong> (US) or your local emergency number.
                MasseurMatch is not an emergency service and cannot respond in real time to safety emergencies.
              </p>
              <div className="mt-3 space-y-2 text-sm text-red-800">
                <p><strong>National Human Trafficking Hotline:</strong> 1-888-373-7888 or text &quot;HELP&quot; to 233733</p>
                <p>
                  <strong>NCMEC CyberTipline (child exploitation):</strong> 1-800-843-5678 or{" "}
                  <a href="https://report.cybertip.org" target="_blank" rel="noopener noreferrer" className="underline">report.cybertip.org</a>
                </p>
                <p><strong>National Sexual Assault Hotline:</strong> 1-800-656-4673</p>
                <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {reportTypes.map((item) => (
            <article key={item.title} className="premium-surface rounded-3xl border border-border-subtle p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                  <item.icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground">{item.title}</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-text-secondary">{item.body}</p>
              <a
                href={`mailto:${item.action}?subject=${encodeURIComponent(item.title)}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary"
              >
                Email {item.action}
              </a>
            </article>
          ))}
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <div className="flex items-start gap-4">
            <Shield className="mt-0.5 h-5 w-5 flex-none text-brand-secondary" strokeWidth={2.25} />
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">How to report</h2>
              <div className="mt-5 space-y-3 text-sm leading-7 text-text-secondary">
                <p>
                  The fastest way to flag a listing is the{" "}
                  <strong>&ldquo;Report this profile&rdquo;</strong> link at the bottom of any therapist
                  profile — no account required. You can also email{" "}
                  <a href="mailto:trust@masseurmatch.com" className="text-brand-secondary underline">trust@masseurmatch.com</a>{" "}
                  with:
                </p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>The URL of the profile or page involved.</li>
                  <li>A description of the issue — what you saw and why it concerns you.</li>
                  <li>Screenshots or other evidence if available.</li>
                  <li>Your contact information if you are willing to be contacted for follow-up.</li>
                </ul>
                <p>
                  All reports are reviewed by our trust and safety team. We acknowledge reports within 48 hours
                  during business hours. Not every report will result in removal or suspension — our team reviews
                  each situation individually and applies our policies accordingly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Blocking</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-text-secondary">
            <p>
              If you need to block another user to prevent further contact, contact{" "}
              <a href="mailto:support@masseurmatch.com" className="text-brand-secondary underline">support@masseurmatch.com</a>.
              Include the profile URL of the user you need blocked and a brief explanation.
            </p>
            <p>
              Blocking prevents that user from viewing your profile or contacting you through the platform.
              Blocking a user does not automatically result in moderation action against them — if the user has
              violated platform policies, please also submit a report.
            </p>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight text-foreground">Safety tips</h2>
          <ul className="space-y-3">
            {safetyTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-secondary/10 text-xs font-bold text-brand-secondary">
                  {i + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">Platform limits</h2>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            MasseurMatch is a directory platform. We do not accompany users to sessions, cannot verify what
            happens outside the platform, and cannot guarantee provider safety, conduct, or credentials. We
            enforce platform policies but are not a substitute for personal due diligence, law enforcement, or
            emergency services.
          </p>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            Submitting a report does not guarantee removal, suspension, or any specific enforcement outcome.
            We review every report but we do not share details of enforcement decisions with reporters.
          </p>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            In line with FOSTA-SESTA (18 U.S.C. &sect;&nbsp;2421A) and our obligations under 18 U.S.C.
            &sect;&nbsp;2258A, MasseurMatch prohibits any use of the platform to facilitate prostitution or sex
            trafficking, preserves relevant records, cooperates with valid legal process, and reports apparent
            child sexual abuse material to NCMEC. See our{" "}
            <Link href="/prohibited-conduct" className="text-brand-secondary underline">Prohibited Conduct</Link>{" "}
            policy for details.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-border-subtle bg-brand-primary px-6 py-7 text-white shadow-brand sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">Related Policies</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            {[
              { href: "/moderation-policy", label: "Moderation Policy" },
              { href: "/community-guidelines", label: "Community Guidelines" },
              { href: "/prohibited-conduct", label: "Prohibited Conduct" },
              { href: "/platform-disclaimer", label: "Platform Disclaimer" },
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
