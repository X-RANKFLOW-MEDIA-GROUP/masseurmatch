import type { Metadata } from "next";
import Link from "next/link";
import { Bot, CircleCheckBig, FileText, Gavel, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Knotty AI | MasseurMatch",
  description:
    "How Knotty AI helps users discover therapists, with legal guardrails, safety boundaries, and transparent limitations.",
  alternates: { canonical: "https://masseurmatch.com/knotty" },
};

const safeguards = [
  "Knotty is an informational discovery assistant. It does not provide medical, legal, or emergency advice.",
  "Knotty does not book sessions, process payments, or guarantee therapist outcomes.",
  "Recommendations use profile data and trust signals. Users must verify scope, credentials, pricing, and boundaries directly with providers.",
  "MasseurMatch may log assistant interactions for abuse detection, quality improvement, and audit purposes.",
  "If a conversation appears unsafe, illegal, or explicit, Knotty is designed to decline and redirect to allowed topics.",
];

export default function KnottyPage() {
  return (
    <main className="page-shell py-12 md:py-16">
      <section className="rounded-3xl border border-border bg-gradient-to-b from-slate-950 to-slate-900 p-8 text-white md:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">
          <Bot className="h-3.5 w-3.5" />
          Knotty AI
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">How Knotty Works</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
          Knotty helps users narrow therapist options based on city, intent, availability, and trust signals. It is a
          search assistant only — not a booking intermediary.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { title: "Interprets intent", body: "Understands requests like nearby, outcall, verified, and budget." },
          { title: "Ranks candidates", body: "Prioritizes fit using profile data, trust cues, and visible pricing." },
          { title: "Routes to contact", body: "Sends users to profile pages for direct provider communication." },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl border border-border bg-background p-5">
            <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 md:p-8">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-amber-900">
          <ShieldAlert className="h-5 w-5" /> Legal and liability boundaries
        </h2>
        <ul className="mt-5 space-y-3 text-sm leading-7 text-amber-900/90">
          {safeguards.map((rule) => (
            <li key={rule} className="flex gap-2">
              <CircleCheckBig className="mt-1 h-4 w-4 shrink-0" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-3xl border border-border bg-background p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Policy references</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/trust" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 hover:border-primary/30 hover:text-primary">
            <Gavel className="h-4 w-4" /> Trust & Safety
          </Link>
          <Link href="/terms" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 hover:border-primary/30 hover:text-primary">
            <FileText className="h-4 w-4" /> Terms of Service
          </Link>
          <Link href="/privacy" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 hover:border-primary/30 hover:text-primary">
            <FileText className="h-4 w-4" /> Privacy Policy
          </Link>
        </div>
      </section>
    </main>
  );
}
