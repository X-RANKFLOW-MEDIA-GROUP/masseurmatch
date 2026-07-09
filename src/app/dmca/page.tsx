import type { Metadata } from "next";
import Link from "next/link";
import { Copyright, FileText, Mail, RotateCcw } from "lucide-react";

import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "DMCA Copyright Policy",
  description:
    "MasseurMatch DMCA copyright takedown process — how to submit a copyright complaint, what information is required, and the counter-notice process.",
  path: "/dmca",
  keywords: ["DMCA", "copyright takedown", "copyright policy", "copyright complaint"],
});

const noticeRequirements = [
  "Your full name, mailing address, phone number, and email address.",
  "A description of the copyrighted work you claim has been infringed.",
  "A description of the infringing material and its location on the platform (including the URL of the specific page).",
  "A statement that you have a good-faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.",
  "A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or are authorized to act on the copyright owner&apos;s behalf.",
  "Your physical or electronic signature.",
];

const counterNoticeRequirements = [
  "Your full name, mailing address, phone number, and email address.",
  "Identification of the material that was removed and the location where it appeared before removal.",
  "A statement, made under penalty of perjury, that you have a good-faith belief that the material was removed or disabled as a result of mistake or misidentification.",
  "A statement that you consent to the jurisdiction of the federal district court for the judicial district where your address is located (or, if outside the US, that you consent to jurisdiction in Delaware).",
  "A statement that you will accept service of process from the person who submitted the original DMCA notice.",
  "Your physical or electronic signature.",
];

export default function DmcaPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "DMCA Copyright Policy", path: "/dmca" },
        ])}
      />

      <div className="page-shell py-10">
        <section className="rounded-3xl border border-border-subtle bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,246,250,0.96))] p-6 shadow-brand sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Intellectual Property</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            DMCA Copyright Policy
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-text-secondary">
            MasseurMatch respects the intellectual property rights of others and complies with the Digital
            Millennium Copyright Act (DMCA). This page describes how to submit a copyright infringement notice
            and the process for counter-notices.
          </p>
          <p className="mt-3 text-xs text-text-muted">Last updated: June 29, 2026</p>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
              <Copyright className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">DMCA Designated Agent</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-text-secondary">
                <p>
                  MasseurMatch has designated an agent to receive DMCA copyright infringement notices. All
                  notices must be submitted to our designated DMCA contact:
                </p>
                <div className="mt-4 rounded-xl border border-border-subtle bg-[#FAFAFA] p-4">
                  <p className="font-semibold text-foreground">DMCA Agent — MasseurMatch</p>
                  <p className="mt-1">XRankFlow Media Group LLC</p>
                  <p>Dover, Delaware, USA</p>
                  <p className="mt-2">
                    <strong>Email:</strong>{" "}
                    <a href="mailto:dmca@masseurmatch.com" className="text-brand-secondary underline">
                      dmca@masseurmatch.com
                    </a>
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Response window: 2 business days for acknowledgment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
              <FileText className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <div className="w-full">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">How to Submit a Copyright Notice</h2>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                To report content you believe infringes your copyright, submit a written notice to
                dmca@masseurmatch.com containing all of the following:
              </p>
              <ol className="mt-5 space-y-3">
                {noticeRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-secondary/10 text-xs font-bold text-brand-secondary">
                      {i + 1}
                    </span>
                    <span dangerouslySetInnerHTML={{ __html: req }} />
                  </li>
                ))}
              </ol>
              <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                <strong>Note:</strong> Submitting a false DMCA notice may expose you to liability for damages,
                including costs and attorney fees. Only submit a notice if you have a genuine, good-faith belief
                that your copyright has been infringed.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
              <RotateCcw className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <div className="w-full">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Counter-Notice Process</h2>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                If you believe content was removed from your profile in error as a result of a mistaken or
                wrongful DMCA notice, you may submit a counter-notice. A valid counter-notice must include:
              </p>
              <ol className="mt-5 space-y-3">
                {counterNoticeRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-secondary/10 text-xs font-bold text-brand-secondary">
                      {i + 1}
                    </span>
                    <span dangerouslySetInnerHTML={{ __html: req }} />
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-sm leading-7 text-text-secondary">
                Upon receipt of a valid counter-notice, we will forward it to the original complainant. If the
                complainant does not notify us of a court action within 10–14 business days, we may restore the
                removed content at our discretion.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">Repeat Infringer Policy</h2>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            MasseurMatch will terminate the accounts of users who are found to be repeat infringers of intellectual
            property rights. An account may be considered a repeat infringer if it receives multiple substantiated
            DMCA notices within a rolling 12-month window. MasseurMatch reserves the right to make this
            determination at its sole discretion.
          </p>
        </section>

        <section className="mt-8 premium-surface rounded-3xl border border-border-subtle p-6 shadow-brand sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">Trademark and Other IP Complaints</h2>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            This policy covers copyright complaints under the DMCA. For trademark infringement complaints or other
            intellectual property concerns, contact{" "}
            <a href="mailto:legal@masseurmatch.com" className="text-brand-secondary underline hover:text-brand-primary">
              legal@masseurmatch.com
            </a>.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-border-subtle bg-brand-primary px-6 py-7 text-white shadow-brand sm:px-8">
          <div className="flex items-start gap-4">
            <Mail className="mt-0.5 h-5 w-5 flex-none text-brand-soft" strokeWidth={2.25} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">Submit a DMCA Notice</p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Send copyright notices, counter-notices, and IP questions to:
              </p>
              <a
                href="mailto:dmca@masseurmatch.com"
                className="mt-3 inline-block font-display text-lg font-semibold text-white underline hover:text-brand-soft"
              >
                dmca@masseurmatch.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
