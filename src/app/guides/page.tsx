import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/json-ld";
import { buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/seo";
import { createPageMetadata } from "@/app/_lib/metadata";
import { GUIDES } from "@/app/guides/data";

export const metadata: Metadata = createPageMetadata({
  title: "Local Male Massage Guides | MasseurMatch",
  description:
    "Editorial guides supporting Dallas, Houston, Austin, Chicago, Miami, and other local discovery routes with stronger internal linking and search intent coverage.",
  path: "/guides",
  keywords: ["male massage guides", "local massage guides", "incall vs outcall dallas", "hotel massage miami", "deep tissue chicago"],
});

export default function GuidesIndexPage() {
  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "MasseurMatch local massage guides",
          description:
            "Editorial guides that support city-first discovery across Dallas, Houston, Austin, Chicago, Miami, and related intent clusters.",
          path: "/guides",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "MasseurMatch guide library",
          path: "/guides",
          items: GUIDES.map((guide) => ({
            name: guide.h1,
            path: `/guides/${guide.slug}`,
          })),
        })}
      />

      <section className="page-shell py-10">
        <div className="space-y-6">
          <header className="rounded-3xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Guides</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Local Editorial Guides for Search and Discovery</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              These guides support city-first SEO across Dallas, Houston, Austin, Chicago, Miami, and related local intent clusters, while routing readers back into canonical city pages and trust content.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {GUIDES.map((guide) => (
              <article key={guide.slug} className="rounded-2xl border border-border bg-background p-5">
                <h2 className="text-xl font-semibold text-foreground">
                  <Link href={`/guides/${guide.slug}`} className="transition hover:text-primary">
                    {guide.h1}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{guide.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {guide.readMinutes} min read
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
