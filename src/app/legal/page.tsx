import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, Scale } from "lucide-react";

import { IconArrowRight, IconClock, IconShield } from "@/components/icons";

import { JsonLd } from "@/app/_components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import { LegalContactForm } from "@/app/legal/_components/legal-contact-form";
import {
  LEGAL_CONTACT_MATRIX,
  LEGAL_LAST_UPDATED,
  LEGAL_QUICK_ANSWERS,
  LEGAL_QUICK_FACTS,
  LEGAL_SUPPLEMENTAL_NOTICES,
  LEGAL_TOPICS,
} from "@/app/legal/_data/legal-center-data";

export const metadata: Metadata = createPageMetadata({
  title: "Legal Center",
  description:
    "The MasseurMatch Legal Center — your reference for terms of service, privacy, cookies, billing, DMCA, content standards, and legal contact channels.",
  path: "/legal",
  keywords: ["legal center", "privacy", "terms", "dmca", "billing", "compliance"],
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Legal Center", path: "/legal" },
]);

const collectionJsonLd = buildCollectionPageJsonLd({
  name: "MasseurMatch Legal Center",
  description:
    "Clear legal overview covering terms, privacy, cookies, billing, content standards, DMCA, accessibility, disputes, and contact channels.",
  path: "/legal",
});

export default function LegalPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <main className="bg-white pb-16 pt-8 md:pb-20 md:pt-10">
        <section className="page-shell">
          <div className="rounded-[2rem] border border-border-subtle bg-white px-6 py-8 shadow-soft sm:px-8 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start">
              <div className="max-w-4xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Legal Center</p>
                <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  Updated legal guidance, organized to be easier to read.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-text-secondary">
                  This Legal Center organizes MasseurMatch's current policies, user rights, platform boundaries, and
                  contact channels in one place. Everything you need to understand the rules and how to reach the
                  right team is here.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#legal-topics"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-secondary"
                  >
                    Explore the policies
                  </a>
                  <a
                    href="#legal-contact"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-subtle px-6 py-3 text-sm font-semibold text-foreground transition hover:border-brand-secondary/30 hover:text-brand-secondary"
                  >
                    Contact the legal team
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-border-subtle bg-[#fbfcfe] p-5">
                <div className="flex items-center gap-3 text-brand-secondary">
                  <Scale className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.22em]">Last reviewed</p>
                </div>
                <p className="mt-4 font-display text-3xl font-semibold text-foreground">{LEGAL_LAST_UPDATED}</p>
                <p className="mt-3 text-sm leading-7 text-text-secondary">
                  Policies are reviewed and updated periodically to reflect platform changes and applicable legal
                  requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {LEGAL_QUICK_FACTS.map((fact) => (
              <article
                key={fact.label}
                className="rounded-3xl border border-border-subtle bg-white px-5 py-5 shadow-[0_16px_40px_rgba(11,31,58,0.05)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">{fact.label}</p>
                <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">{fact.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-shell mt-10">
          <div className="rounded-[2rem] border border-border-subtle bg-[#fbfcfe] p-6 shadow-soft sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Quick answers</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                The fastest way to understand what the legal package says.
              </h2>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {LEGAL_QUICK_ANSWERS.map((item) => (
                <article
                  key={item.question}
                  className="rounded-3xl border border-border-subtle bg-white px-5 py-5"
                >
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                    {item.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="legal-topics" className="page-shell mt-10 scroll-mt-28">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Policy topics</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
              Updated legal topics, grouped by what people usually need.
            </h2>
            <p className="mt-4 text-sm leading-7 text-text-secondary">
              Each topic below summarizes the current MasseurMatch policy for that area. Where a standalone page
              exists, you can jump directly to it.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {LEGAL_TOPICS.map((topic) => (
              <article
                key={topic.id}
                className="rounded-[2rem] border border-border-subtle bg-white p-6 shadow-[0_18px_46px_rgba(11,31,58,0.06)] sm:p-8"
              >
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Policy topic</p>
                    <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                      {topic.title}
                    </h3>
                    <p className="mt-4 text-sm leading-8 text-text-secondary">{topic.summary}</p>

                    {topic.links?.length ? (
                      <div className="mt-5 flex flex-wrap gap-3">
                        {topic.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand-secondary/30 hover:text-brand-secondary"
                          >
                            {link.label}
                            <IconArrowRight size={16} />
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-3xl border border-border-subtle bg-[#fbfcfe] p-5">
                    <div className="flex items-center gap-2 text-brand-secondary">
                      <IconShield size={20} />
                      <p className="text-sm font-semibold uppercase tracking-[0.22em]">Key points</p>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {topic.highlights.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-7 text-text-secondary">
                          <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-brand-secondary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </article>
            ))}
          </div>
        </section>

        <section className="page-shell mt-10">
          <div className="rounded-[2rem] border border-border-subtle bg-[#fbfcfe] p-6 shadow-soft sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Supplemental notices</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                Additional notices covering platform-specific policies and user rights.
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {LEGAL_SUPPLEMENTAL_NOTICES.map((notice) => (
                <article
                  key={notice.title}
                  className="rounded-3xl border border-border-subtle bg-white px-5 py-5"
                >
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">{notice.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{notice.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="page-shell mt-10">
          <div className="rounded-[2rem] border border-border-subtle bg-white p-6 shadow-[0_18px_46px_rgba(11,31,58,0.06)] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Contact matrix</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                  Choose the right channel before you send a request.
                </h2>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  Formal legal process should still be directed through the legal channel. This overview simply makes
                  the routing clearer and easier to understand.
                </p>
              </div>

              <div className="rounded-3xl border border-border-subtle bg-[#fbfcfe] px-5 py-5">
                <div className="flex items-center gap-3 text-brand-secondary">
                  <IconClock size={20} />
                  <p className="text-sm font-semibold uppercase tracking-[0.22em]">Mailing location</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  XRankFlow Media Group LLC
                  <br />
                  Dover, DE, United States
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-border-subtle">
              <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(220px,0.8fr)_minmax(180px,0.7fr)] bg-[#f7f9fc] px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted md:grid">
                <p>Matter</p>
                <p>Email</p>
                <p>Response window</p>
              </div>

              <div className="divide-y divide-border-subtle">
                {LEGAL_CONTACT_MATRIX.map((row) => (
                  <article
                    key={row.email + row.matter}
                    className="grid gap-3 bg-white px-5 py-5 md:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.8fr)_minmax(180px,0.7fr)] md:items-center"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted md:hidden">Matter</p>
                      <p className="text-sm leading-7 text-foreground">{row.matter}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted md:hidden">Email</p>
                      <a
                        href={`mailto:${row.email}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary transition hover:text-brand-primary"
                      >
                        <Mail className="h-4 w-4" />
                        {row.email}
                      </a>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted md:hidden">
                        Response window
                      </p>
                      <p className="text-sm leading-7 text-text-secondary">{row.responseWindow}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="legal-contact" className="page-shell mt-10 scroll-mt-28">
          <div className="rounded-[2rem] border border-border-subtle bg-white p-6 shadow-[0_18px_46px_rgba(11,31,58,0.06)] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Contact the team</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                  Send a legal, privacy, billing, DMCA, or compliance request.
                </h2>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  Choose the subject, tell us what you need, and include enough detail for a faster review. The form
                  below asks for your name, email, phone, subject, and message exactly so the request can be routed
                  correctly.
                </p>
                <div className="mt-6 rounded-3xl border border-brand-soft/40 bg-brand-soft/10 px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Helpful details to include</p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-text-secondary">
                    <li>Account email or listing URL if the request is tied to a profile.</li>
                    <li>Relevant screenshots, dates, or charge details for billing and content issues.</li>
                    <li>The original work URL and the allegedly infringing URL for DMCA-related requests.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-3xl border border-border-subtle bg-[#fbfcfe] p-5 sm:p-6">
                <LegalContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
