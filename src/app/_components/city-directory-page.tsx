import Link from "next/link";
import { ArrowRight, BadgeCheck, LockKeyhole, ShieldCheck } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import { buildFaqJsonLd } from "@/app/_lib/structured-data";
import { JsonLd } from "@/app/_components/json-ld";
import { EmptyState, Surface } from "@/app/_components/primitives";
import { PublicTherapistCard } from "@/app/_components/PublicTherapistCard";

type LinkItem = {
  href: string;
  label: string;
  description?: string;
};

type LinkSection = {
  title: string;
  description?: string;
  layout?: "grid" | "chips";
  items: LinkItem[];
};

type FaqItem = {
  question: string;
  answer: string;
};

export function CityDirectoryPage({
  eyebrow,
  title,
  intro,
  breadcrumbJsonLd,
  collectionJsonLd,
  itemListJsonLd,
  leadLinks = [],
  linkSections = [],
  therapists,
  listingTitle,
  listingDescription,
  emptyTitle,
  emptyDescription,
  faqTitle,
  faqItems = [],
}: {
  eyebrow: string;
  title: string;
  intro: string;
  breadcrumbJsonLd: Record<string, unknown>;
  collectionJsonLd: Record<string, unknown>;
  itemListJsonLd: Record<string, unknown>;
  leadLinks?: LinkItem[];
  linkSections?: LinkSection[];
  therapists: PublicTherapist[];
  listingTitle: string;
  listingDescription: string;
  emptyTitle: string;
  emptyDescription: string;
  faqTitle?: string;
  faqItems?: FaqItem[];
}) {
  const visibleLinkSections = linkSections.filter((section) => section.items.length > 0);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={itemListJsonLd} />
      {faqItems.length > 0 ? <JsonLd data={buildFaqJsonLd(faqItems)} /> : null}

      <div className="page-shell py-10 sm:py-12">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr),minmax(300px,0.85fr)]">
          <Surface className="overflow-hidden p-0">
            <div className="border-b border-border bg-[linear-gradient(135deg,rgb(var(--color-brand-primary-rgb))_0%,rgb(var(--color-brand-secondary-rgb))_100%)] px-6 py-6 text-white sm:px-8">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/62">{eyebrow}</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
                <p className="mt-4 text-base leading-8 text-white/74">{intro}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {leadLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      index === 0
                        ? "inline-flex items-center gap-2 rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-brand-soft"
                        : "inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/12"
                    }
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-px bg-border-subtle sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Trust-first discovery",
                  body: "Verification status is visible where available so users can shortlist faster.",
                },
                {
                  icon: BadgeCheck,
                  title: "Premium local intent",
                  body: "City, segment, and service pages create cleaner long-tail search entry points.",
                },
                {
                  icon: LockKeyhole,
                  title: "Direct connection",
                  body: "Profiles are built for immediate call or message without platform detours.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="bg-background px-6 py-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-brand-primary text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-foreground">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </Surface>

          <div className="rounded-[32px] border border-[#eadfcd] bg-[linear-gradient(135deg,#f7f2e9_0%,#ffffff_100%)] p-6 shadow-[0_16px_36px_rgba(26,26,26,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a56b21]">
              Why this page feels safer
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-brand-primary">
              A clearer trust layer than a generic listing page
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Visible verification and profile-quality signals.",
                "Clearer incall and outcall expectations before contact.",
                "Safety guidance and reporting paths linked from the listing journey.",
                "Editorially cleaner pages built for fast mobile decisions.",
              ].map((point) => (
                <div key={point} className="rounded-[20px] border border-[#ece3d6] bg-white px-4 py-3 text-sm leading-6 text-text-secondary">
                  {point}
                </div>
              ))}
            </div>
            <Link
              href="/safety"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary transition hover:gap-3"
            >
              Read the safety policy
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {visibleLinkSections.map((section) => (
            <section key={section.title} className="mt-8">
              <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
              {section.description ? <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.description}</p> : null}

              {section.layout === "grid" ? (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {section.items.map((item) => (
                    <Surface key={item.href} className="p-0">
                      <Link href={item.href} className="block rounded-3xl p-5 transition-colors hover:bg-accent/5">
                        <h3 className="font-semibold text-foreground">{item.label}</h3>
                        {item.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}
                      </Link>
                    </Surface>
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}

          <section className="mt-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{listingTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{listingDescription}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Trusted directory layout
              </span>
            </div>

            {therapists.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
                {therapists.map((therapist) => (
                  <PublicTherapistCard key={therapist.id} therapist={therapist} />
                ))}
              </div>
            ) : (
              <EmptyState className="mt-6" title={emptyTitle} description={emptyDescription} />
            )}
          </section>

          {faqItems.length > 0 ? (
            <section className="mt-10 rounded-3xl border border-border bg-background p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-foreground">{faqTitle || "Common questions"}</h2>
              <div className="mt-4 space-y-4">
                {faqItems.map((item) => (
                  <article key={item.question} className="rounded-2xl border border-border bg-secondary/20 p-4">
                    <h3 className="font-semibold text-foreground">{item.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
