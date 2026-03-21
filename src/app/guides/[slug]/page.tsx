import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/app/_lib/metadata";
import { GUIDES, getGuideBySlug } from "@/app/guides/data";

type Params = { slug: string };

export const revalidate = 60;

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
    keywords: ["dallas guide", "male massage guide", "dfw massage guide"],
  });
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const guide = getGuideBySlug(resolved.slug);

  if (!guide) {
    notFound();
  }

  return (
    <article className="page-shell py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-3xl border border-border bg-background p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Guide</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">{guide.h1}</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{guide.description}</p>
        </header>

        <section className="space-y-4 rounded-3xl border border-border bg-background p-6">
          {guide.body.map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-foreground">
              {paragraph}
            </p>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-background p-6">
          <h2 className="text-xl font-semibold text-foreground">Related Cities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {guide.cityLinks.map((href) => (
              <Link key={href} href={href} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                {href.replace("/cities/", "").replace(/-/g, " ")}
              </Link>
            ))}
          </div>

          <h2 className="mt-6 text-xl font-semibold text-foreground">Related Session Pages</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {guide.sessionLinks.map((href) => (
              <Link key={href} href={href} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                {href.split("/").slice(-1)[0].replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
