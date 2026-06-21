import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/json-ld";
import { getModalityGuide } from "@/app/_lib/modality-guides";
import { getServiceMetadata } from "@/app/_lib/service-data";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildArticleJsonLd } from "@/app/_lib/structured-data";
import { siteUrl } from "@/lib/site";
import { ArrowRight } from "lucide-react";

type Params = { slug: string };

export const revalidate = 86400; // 24 hours

export function generateStaticParams(): Params[] {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const guide = getModalityGuide(resolved.slug);

  if (!guide) {
    return createPageMetadata({
      title: "Guide not found",
      description: "This guide was not found.",
      path: `/guides/modality/${resolved.slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: `/guides/modality/${guide.slug}`,
    keywords: guide.keywords,
  });
}

export default async function ModalityGuidePage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const guide = getModalityGuide(resolved.slug);
  const service = guide ? getServiceMetadata(guide.serviceSlug) : null;

  if (!guide || !service) {
    notFound();
  }

  const guidePath = `/guides/modality/${guide.slug}`;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.h1, path: guidePath },
        ])}
      />

      <JsonLd
        data={buildArticleJsonLd({
          title: guide.title,
          description: guide.excerpt,
          path: guidePath,
          publishedAt: new Date().toISOString(),
          author: guide.author,
        })}
      />

      <section className="page-shell py-10">
        <article className="max-w-4xl space-y-8">
          <header className="space-y-4 border-b border-border pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {service.label} Guide
            </p>
            <h1 className="text-4xl font-bold leading-tight text-foreground">{guide.h1}</h1>
            <p className="text-lg leading-8 text-muted-foreground">{guide.excerpt}</p>
            <div className="flex items-center gap-4 pt-4 text-sm text-muted-foreground">
              <span>{guide.author}</span>
              <span>•</span>
              <span>{guide.readTime} min read</span>
            </div>
          </header>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            {guide.content.split("\n\n").map((paragraph, idx) => {
              // Simple markdown-like parsing
              if (paragraph.startsWith("# ")) {
                return (
                  <h2 key={idx} className="text-2xl font-bold text-foreground">
                    {paragraph.replace("# ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("## ")) {
                return (
                  <h3 key={idx} className="text-xl font-semibold text-foreground">
                    {paragraph.replace("## ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("### ")) {
                return (
                  <h4 key={idx} className="text-lg font-semibold text-foreground">
                    {paragraph.replace("### ", "")}
                  </h4>
                );
              }
              if (paragraph.startsWith("- ")) {
                return (
                  <ul key={idx} className="list-inside list-disc space-y-2 pl-4">
                    {paragraph.split("\n").map((item, i) => (
                      <li key={i} className="text-muted-foreground">
                        {item.replace("- ", "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="leading-8">
                  {paragraph}
                </p>
              );
            })}
          </div>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h3 className="text-2xl font-semibold text-foreground">
              Find {service.label} Therapists
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Ready to experience {service.label.toLowerCase()} massage? Browse verified therapists in your city and
              connect directly.
            </p>
            <Link
              href={`/services/${service.slug}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Browse {service.label} Therapists
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h3 className="text-2xl font-semibold text-foreground">Related Guides</h3>
            <div className="mt-4 space-y-3">
              <Link href="/guides" className="block rounded-lg border border-border p-3 transition hover:bg-accent">
                <p className="font-semibold text-foreground">View All Guides</p>
                <p className="text-sm text-muted-foreground">Browse all massage therapy guides and resources</p>
              </Link>
              <Link href="/services" className="block rounded-lg border border-border p-3 transition hover:bg-accent">
                <p className="font-semibold text-foreground">Browse All Services</p>
                <p className="text-sm text-muted-foreground">Find {service.label} therapists and other massage types</p>
              </Link>
            </div>
          </section>
        </article>
      </section>
    </>
  );
}
