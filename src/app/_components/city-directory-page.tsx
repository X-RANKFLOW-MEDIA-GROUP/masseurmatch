import Link from "next/link";
import type { PublicTherapist } from "@/app/_lib/directory";
import { JsonLd } from "@/app/_components/json-ld";
import { EmptyState, PageSection, Surface } from "@/app/_components/primitives";
import { TherapistCard } from "@/app/_components/therapist-card";

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
}) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={itemListJsonLd} />

      <div className="container mx-auto px-4 py-10">
        <PageSection
          eyebrow={eyebrow}
          title={title}
          description={intro}
          actions={
            <>
              {leadLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-primary hover:underline">
                  {link.label}
                </Link>
              ))}
            </>
          }
        />

        <div className="space-y-8">
          {linkSections.map((section) => (
            <section key={section.title} className="mt-8">
              <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
              {section.description ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.description}</p> : null}

              {section.layout === "grid" ? (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {section.items.map((item) => (
                    <Surface key={item.href} className="p-0">
                      <Link href={item.href} className="block rounded-3xl p-5 transition-colors hover:bg-accent">
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
                      className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}

          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-foreground">{listingTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{listingDescription}</p>

            {therapists.length > 0 ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {therapists.map((therapist) => (
                  <TherapistCard key={therapist.id} therapist={therapist} />
                ))}
              </div>
            ) : (
              <EmptyState className="mt-6" title={emptyTitle} description={emptyDescription} />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
