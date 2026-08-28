import Link from "next/link";
import { IconArrowRight, IconShield } from "@/components/icons";
import type { PublicTherapist } from "@/app/_lib/directory";
import { buildFaqJsonLd } from "@/app/_lib/seo";
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
  quickLinks = [],
  linkSections = [],
  therapists,
  listingTitle,
  listingDescription,
  listingCount,
  visitingTherapists = [],
  visitingTitle,
  visitingDescription,
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
  quickLinks?: LinkItem[];
  linkSections?: LinkSection[];
  therapists: PublicTherapist[];
  listingTitle: string;
  listingDescription: string;
  listingCount?: number;
  visitingTherapists?: PublicTherapist[];
  visitingTitle?: string;
  visitingDescription?: string;
  emptyTitle: string;
  emptyDescription: string;
  faqTitle?: string;
  faqItems?: FaqItem[];
}) {
  const visibleLinkSections = linkSections.filter((section) => section.items.length > 0);
  const localCount = listingCount ?? therapists.length;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={itemListJsonLd} />
      {faqItems.length > 0 ? <JsonLd data={buildFaqJsonLd(faqItems)} /> : null}

      <div className="page-shell py-8 sm:py-10">
        <Surface className="overflow-hidden p-0">
          <div className="bg-[linear-gradient(135deg,rgb(var(--color-brand-primary-rgb))_0%,rgb(var(--color-brand-secondary-rgb))_100%)] px-6 py-7 text-white sm:px-8 sm:py-8">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/62">{eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/78">{intro}</p>
            </div>

            {leadLinks.length > 0 ? (
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
                    <IconArrowRight size={16} />
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </Surface>

        {quickLinks.length > 0 ? (
          <nav className="mt-4 flex flex-wrap gap-2" aria-label="Directory filters">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <section className="mt-7" id="local-profiles">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{listingTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{listingDescription}</p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground">
              {localCount} local {localCount === 1 ? "profile" : "profiles"}
            </span>
          </div>

          {therapists.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {therapists.map((therapist) => (
                <PublicTherapistCard key={therapist.id} therapist={therapist} />
              ))}
            </div>
          ) : (
            <EmptyState className="mt-5" title={emptyTitle} description={emptyDescription} />
          )}
        </section>

        {visitingTherapists.length > 0 ? (
          <section className="mt-10 border-t border-border pt-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">Temporary location</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">{visitingTitle || "Visiting providers"}</h2>
              {visitingDescription ? (
                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{visitingDescription}</p>
              ) : null}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {visitingTherapists.map((therapist) => (
                <PublicTherapistCard key={therapist.id} therapist={therapist} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10 rounded-3xl border border-border bg-secondary/20 p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white">
              <IconShield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Compare profiles first, then explore local guidance</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Public listings stay at the top of the city experience. Local service pages, neighborhoods, nearby cities, guides, safety information, and FAQs remain below for useful context and crawlable internal linking.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-8">
          {visibleLinkSections.map((section) => (
            <section key={section.title}>
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

          {faqItems.length > 0 ? (
            <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
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
