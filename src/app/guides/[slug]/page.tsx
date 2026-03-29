import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/json-ld";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/app/_lib/seo";
import { createPageMetadata } from "@/app/_lib/metadata";
import { formatSlugLabel } from "@/app/_lib/directory-taxonomy";
import { GUIDES, getGuideBySlug } from "@/app/guides/data";

type Params = { slug: string };

export const revalidate = 60;

function formatGuideLinkLabel(href: string) {
  const cleanHref = href.replace(/\/+$/, "");
  const parts = cleanHref.split("/").filter(Boolean);

  if (parts.length === 0) {
    return "Home";
  }

  if (parts.length === 1) {
    if (parts[0] === "compare") return "Compare";
    if (parts[0] === "safety") return "Safety guidance";
    return formatSlugLabel(parts[0]);
  }

  if (parts[0] === "compare" && parts[1]) {
    return formatSlugLabel(parts[1].replace("masseurmatch-vs-", "vs-"));
  }

  return parts.map((part) => formatSlugLabel(part)).join(" / ");
}

export function generateStaticParams(): Params[] {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const guide = getGuideBySlug(resolved.slug);

  if (!guide) {
    return createPageMetadata({
      title: "Guide",
      description: "Editorial guide page.",
      path: `/guides/${resolved.slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    keywords: ["male massage guide", "local massage guide", guide.h1, guide.description],
  });
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const guide = getGuideBySlug(resolved.slug);

  if (!guide) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.h1, path: `/guides/${guide.slug}` },
        ])}
      />
      <JsonLd
        data={buildArticleJsonLd({
          title: guide.h1,
          description: guide.description,
          path: `/guides/${guide.slug}`,
          publishedAt: `${guide.publishedAt}T00:00:00.000Z`,
          author: "MasseurMatch Editorial Team",
        })}
      />

      <article className="page-shell py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Guide</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{guide.h1}</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{guide.description}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              {guide.readMinutes} min read · Published {guide.publishedAt}
            </p>
          </header>

          <section className="space-y-4 rounded-3xl border border-border bg-background p-6">
            {guide.body.map((paragraph) => (
              <p key={paragraph} className="text-base leading-8 text-foreground">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-xl font-semibold text-foreground">Related City Pages</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {guide.cityLinks.map((href) => (
                <Link key={href} href={href} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {formatGuideLinkLabel(href)}
                </Link>
              ))}
            </div>

            <h2 className="mt-6 text-xl font-semibold text-foreground">Related Internal Links</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {guide.relatedLinks.map((href) => (
                <Link key={href} href={href} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {formatGuideLinkLabel(href)}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
