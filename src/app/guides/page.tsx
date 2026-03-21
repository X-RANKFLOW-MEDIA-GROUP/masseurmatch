import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/app/_lib/metadata";
import { GUIDES } from "@/app/guides/data";

export const metadata: Metadata = createPageMetadata({
  title: "Dallas Male Massage Guides | MasseurMatch",
  description:
    "Editorial guides supporting Dallas and DFW discovery, including incall vs outcall, hotel sessions, and neighborhood-specific routes.",
  path: "/guides",
  keywords: ["dallas massage guides", "male massage dallas guide", "incall vs outcall dallas"],
});

export default function GuidesIndexPage() {
  return (
    <section className="page-shell py-10">
      <div className="space-y-6">
        <header className="rounded-3xl border border-border bg-background p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Guides</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Dallas Cluster Editorial Guides</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            These guides support the Dallas-first cluster with internal links to city, service, session, and neighborhood routes.
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
              <p className="mt-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">{guide.readMinutes} min read</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
