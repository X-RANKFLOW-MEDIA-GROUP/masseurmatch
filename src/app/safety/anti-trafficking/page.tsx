import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, Siren, PhoneCall } from "lucide-react";

export const metadata: Metadata = {
  title: "Anti-Trafficking Policy | MasseurMatch Safety",
  description:
    "MasseurMatch anti-trafficking policy: law-enforcement cooperation, reporting channels, and red flags actively blocked by the platform.",
  alternates: { canonical: "https://masseurmatch.com/safety/anti-trafficking" },
};

const RED_FLAGS_BLOCKED = [
  "Any solicitation for prostitution, escort services, or paid sexual acts.",
  "Coded sexual-service language such as “happy ending”, “full service”, “GFE”, or “extras”.",
  "Requests or offers involving minors, age ambiguity, forged age claims, or exploitative travel routing.",
  "Third-party recruiting behavior, handler-managed accounts, or coercive control indicators.",
  "Profile fronting (someone posting as a different person) or impersonation of providers.",
  "Threats, blackmail, debt bondage indicators, or language signaling coercion or restricted movement.",
  "Cross-platform payment pressure intended to conceal illegal activity.",
];

export default function AntiTraffickingPage() {
  return (
    <main className="page-shell py-10">
      <section className="hero-panel px-6 py-8 sm:px-8 sm:py-10">
        <span className="eyebrow-chip eyebrow-chip-inverse">Safety & Compliance</span>
        <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Anti-Trafficking Commitment
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/82">
          MasseurMatch enforces a zero-tolerance policy for trafficking, coercion, and sexual exploitation. We
          actively monitor listings, messaging signals, and reports, and we cooperate with law enforcement whenever
          credible risk or legal process is present.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="premium-surface rounded-[1.8rem] border border-border-subtle p-6 shadow-soft">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">
            Formal cooperation with law enforcement
          </h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            We preserve relevant records, escalate urgent risk indicators, and respond to valid legal requests through
            our legal channel. Safety reports tied to trafficking concerns are routed to internal review immediately
            and may be referred to law enforcement.
          </p>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            For legal process, subpoenas, or agency requests, contact{" "}
            <a href="mailto:legal@masseurmatch.com" className="font-semibold text-brand-secondary underline">
              legal@masseurmatch.com
            </a>
            .
          </p>
        </article>

        <article className="rounded-[1.8rem] border border-red-200/60 bg-red-50/80 p-6 shadow-soft">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <Siren className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">
            Emergency reporting channels
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
            <li>
              <strong>Immediate danger:</strong> call <strong>911</strong>.
            </li>
            <li>
              <strong>National Human Trafficking Hotline:</strong> 1-888-373-7888
            </li>
            <li>
              <strong>ICE HSI Tip Line:</strong> 1-866-347-2423
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-700">
            Every therapist profile now includes a <strong>Report Suspected Trafficking</strong> button that sends
            reports to our internal safety inbox.
          </p>
          <Link
            href="/safety"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <PhoneCall className="h-4 w-4" />
            View full safety hub
          </Link>
        </article>
      </section>

      <section className="mt-8 rounded-[1.8rem] border border-border-subtle bg-white p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 text-brand-secondary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Public enforcement list</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              Red flags we actively block
            </h2>
          </div>
        </div>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {RED_FLAGS_BLOCKED.map((item) => (
            <li key={item} className="rounded-2xl border border-border-subtle bg-[#fbfcfe] px-4 py-4 text-sm leading-7 text-text-secondary">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
