import type { Metadata } from "next";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About MasseurMatch",
  description:
    "Learn how MasseurMatch uses city pages, therapist profiles, and specialty content to improve discovery and trust.",
  path: "/about",
  keywords: ["about masseurmatch", "city first seo", "therapist discovery", "wellness directory"],
});

export default function AboutPage() {
  const cards = [
    {
      title: "Directory only",
      text: "MasseurMatch focuses on direct discovery with clear profiles, faster comparison, and lower friction between visitors and providers.",
    },
    {
      title: "City-first SEO",
      text: "The information architecture is organized around cities, therapist profiles, editorial content, and specialty landing pages with clear search intent.",
    },
    {
      title: "Therapist growth",
      text: "Public listings are designed to improve visibility, profile quality, and direct response for independent massage therapists.",
    },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "About MasseurMatch",
          description:
            "Learn how MasseurMatch approaches search, trust, and therapist discovery through a city-first directory.",
          path: "/about",
        })}
      />

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">About MasseurMatch</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          MasseurMatch is a public directory built for local discovery, trust signals, and sustainable therapist
          growth. Instead of hiding content behind heavy client-side flows, the site is moving toward crawlable city
          pages, therapist pages, specialty pages, and editorial support content.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="rounded-3xl border border-border p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
