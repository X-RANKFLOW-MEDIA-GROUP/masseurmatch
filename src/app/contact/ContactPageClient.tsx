import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Mail,
  UserRound,
} from "lucide-react";
import { ContactForm } from "@/app/_components/contact-form";

const buildMailto = (email: string, subject: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}`;

const contactCards: Array<{
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  email: string;
  href: string;
}> = [
  {
    icon: UserRound,
    eyebrow: "Visitors",
    title: "General Support",
    description: "Need help finding a therapist or navigating the directory?",
    cta: "Email Support",
    email: "support@masseurmatch.com",
    href: buildMailto("support@masseurmatch.com", "Client Support"),
  },
  {
    icon: BadgeCheck,
    eyebrow: "Professionals",
    title: "Professional Support",
    description: "Questions about your profile, subscriptions, or premium placements?",
    cta: "Provider Support",
    email: "support@masseurmatch.com",
    href: buildMailto("support@masseurmatch.com", "Professional Support"),
  },
  {
    icon: BriefcaseBusiness,
    eyebrow: "Business",
    title: "General Inquiries & Partnerships",
    description: "For business partnerships, press, or general MasseurMatch questions.",
    cta: "Get in Touch",
    email: "support@masseurmatch.com",
    href: buildMailto("support@masseurmatch.com", "General Inquiry & Partnership"),
  },
];

export default function ContactPageClient() {
  return (
    <div className="relative isolate overflow-hidden bg-[#040b16] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_82%_14%,rgba(14,165,233,0.12),transparent_22%),linear-gradient(180deg,#020617_0%,#05101d_42%,#030712_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/25 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-72 bg-[radial-gradient(circle,rgba(56,189,248,0.12),transparent_62%)] blur-3xl" />

      <section className="page-shell relative pb-14 pt-36 sm:pb-16 sm:pt-40 lg:pt-44">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="eyebrow-chip eyebrow-chip-inverse">Support Desk</span>
          <h1 className="mt-8 font-display text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
            Let&apos;s Connect
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Whether you&apos;re a client searching for the right match or a professional
            growing your business, we&apos;re here to help.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm text-slate-200 backdrop-blur-xl">
            <span className="knotty-active-dot h-2.5 w-2.5 rounded-full" aria-hidden="true" />
            Premium support, typically within 24 hours.
          </div>
        </div>
      </section>

      <section className="page-shell relative pb-24 sm:pb-28">
        <div className="grid gap-6 lg:grid-cols-3">
          {contactCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="knotty-glass-card contact-glass-card group flex h-full flex-col p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-sky-200/75">
                      {card.eyebrow}
                    </p>
                    <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-white">
                      {card.title}
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-sky-400/10 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.16)]">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-5 flex-1 text-base leading-7 text-slate-300">
                  {card.description}
                </p>

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-slate-400">
                      Direct Email
                    </p>
                    <p className="mt-2 text-sm text-slate-200">{card.email}</p>
                  </div>
                  <a
                    href={card.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-400/45 hover:bg-white/[0.12]"
                  >
                    {card.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <div className="knotty-glass-card contact-glass-card mt-10 flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-sky-200/75">
              Quick Answers
            </p>
            <p className="mt-3 text-base leading-7 text-slate-200 sm:text-lg">
              Looking for a quick answer? Check out how Knotty works or visit our FAQ
              before reaching out.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white transition hover:border-sky-300/35 hover:bg-white/[0.12]"
            >
              <Mail className="h-4 w-4" />
              How Knotty Works
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white transition hover:border-sky-300/35 hover:bg-white/[0.12]"
            >
              <ArrowRight className="h-4 w-4" />
              Help Center / FAQ
            </Link>
          </div>
        </div>

        <section
          id="contact-form"
          className="knotty-glass-card contact-glass-card mt-10 p-6 sm:p-8 lg:p-10"
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              <Clock3 className="h-4 w-4" />
              We typically respond within 24 hours.
            </div>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Tell us what you need
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Keep it simple. A few details about who you are and what you need helps
              the right team pick this up faster.
            </p>
          </div>

          <div className="mt-10">
            <ContactForm />
          </div>
        </section>
      </section>
    </div>
  );
}
