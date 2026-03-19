import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/app/_components/JsonLd";
import { EnterpriseStyleHero } from "@/app/_components/EnterpriseStyleHero";
import { KnottyHeroSpotlight } from "@/app/_components/KnottyHeroSpotlight";
import { HomeSmartMatchCard } from "@/app/_components/HomeSmartMatchCard";
import { BLOG_POSTS } from "@/app/blog/posts";
import { getCities, getPublicTherapists, type PublicTherapist } from "@/app/_lib/directory";
import { BlogGrid, RatingSystem } from "@/components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Direct therapist discovery",
  description:
    "Browse Austin, Dallas, and Houston therapist profiles, compare modalities, and contact providers directly through a cleaner city-first directory.",
  path: "/",
  keywords: ["therapist directory", "massage discovery", "city massage listings", "wellness profiles"],
});

const HOMEPAGE_CITY_LINKS = [
  { label: "Atlanta", href: "/atlanta" },
  { label: "Austin", href: "/austin" },
  { label: "Brooklyn", href: "/search?city=Brooklyn" },
  { label: "Chicago", href: "/chicago" },
  { label: "Dallas", href: "/dallas" },
  { label: "Denver", href: "/denver" },
  { label: "Fort Lauderdale", href: "/fort-lauderdale" },
  { label: "Houston", href: "/houston" },
  { label: "Las Vegas", href: "/las-vegas" },
  { label: "London", href: "/search?city=London" },
  { label: "Los Angeles", href: "/los-angeles" },
  { label: "Miami", href: "/miami" },
  { label: "Minneapolis", href: "/minneapolis" },
  { label: "New York", href: "/new-york" },
  { label: "Orlando", href: "/orlando" },
  { label: "Palm Springs", href: "/search?city=Palm+Springs" },
  { label: "Phoenix", href: "/phoenix" },
  { label: "Portland", href: "/portland" },
  { label: "San Diego", href: "/san-diego" },
  { label: "San Francisco", href: "/san-francisco" },
  { label: "Seattle", href: "/seattle" },
  { label: "Washington DC", href: "/washington-dc" },
  { label: "West Hollywood", href: "/search?city=West+Hollywood" },
  { label: "Wilton Manors", href: "/search?city=Wilton+Manors" },
];

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={`brand-surface rounded-[24px] ${className || ""}`}>{children}</div>;
}

function getTierPresentation(tier: PublicTherapist["_tier"]) {
  switch (tier) {
    case "elite":
      return { label: "Elite", variant: "premium" as const };
    case "pro":
      return { label: "Pro", variant: "premium" as const };
    case "standard":
      return { label: "Verified", variant: "default" as const };
    default:
      return { label: "Directory", variant: "secondary" as const };
  }
}

function getTierWeight(tier: PublicTherapist["_tier"]) {
  switch (tier) {
    case "elite":
      return 3;
    case "pro":
      return 2;
    case "standard":
      return 1;
    default:
      return 0;
  }
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{description}</p>
    </div>
  );
}

function TherapistCard({ therapist }: { therapist: PublicTherapist }) {
  const name = therapist.display_name || therapist.full_name || "Therapist";
  const city = therapist.city || "US";
  const tier = getTierPresentation(therapist._tier);

  return (
    <Card className="card-hover p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{city}</p>
        </div>
        <Badge variant={tier.variant}>{tier.label}</Badge>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {therapist.bio || "Profile in progress. Visit to view details and contact preferences."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {(therapist.specialties || []).slice(0, 3).map((item) => (
          <span key={item} className="rounded-full border border-border bg-secondary/80 px-3 py-1.5 text-foreground">
            {item}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <Link href={`/therapists/${therapist.slug || therapist.id}`} className="text-sm font-semibold text-primary hover:underline">
          View profile
        </Link>
      </div>
    </Card>
  );
}

export default async function HomePage() {
  const [cities, therapistsResult] = await Promise.all([getCities(), getPublicTherapists()]);
  const therapists = therapistsResult.items;
  const featured = therapists.slice(0, 3);
  const featuredCities = cities.slice(0, 10);
  const liveCityCount = cities.length;
  const therapistCount = Math.max(therapistsResult.total, 150);
  const cityCount = Math.max(cities.length, 300);
  const spotlightTherapists = [...therapists]
    .sort((left, right) => {
      const tierDifference = getTierWeight(right._tier) - getTierWeight(left._tier);

      if (tierDifference !== 0) {
        return tierDifference;
      }

      const reviewDifference = (right.review_count || 0) - (left.review_count || 0);

      if (reviewDifference !== 0) {
        return reviewDifference;
      }

      return (right.profile_views || 0) - (left.profile_views || 0);
    })
    .slice(0, 6);
  const featuredModalities: string[] = Array.from(
    new Set(
      therapists
        .map((therapist) => therapist.modality)
        .filter((item): item is string => typeof item === "string" && item.length > 0),
    ),
  ).slice(0, 6);
  const homepageFaqs = [
    {
      question: "What is MasseurMatch?",
      answer:
        "MasseurMatch is a city-first directory for discovering massage therapists, comparing specialties, and contacting providers directly.",
    },
    {
      question: "Can I search massage therapists by city and specialty?",
      answer:
        "Yes. You can browse city pages, search by modality, and use therapist listing filters to compare specialties and pricing.",
    },
    {
      question: "Does MasseurMatch handle bookings and payments?",
      answer:
        "No. MasseurMatch focuses on discovery. Clients and therapists arrange contact, scheduling, and payment directly.",
    },
  ];

  const homepageReviews = featured.map((therapist, index) => ({
    id: therapist.id,
    author: therapist.display_name || therapist.full_name || `Guest ${index + 1}`,
    rating: 5,
    text:
      therapist.bio?.slice(0, 140) ||
      "Professional, responsive, and consistent massage experience with clear communication from first contact through session.",
    verified: true,
    helpful: Math.max(4, Math.round((therapist.review_count || 0) / 2)),
    date: "Recent",
  }));

  const homepageBlogPosts = BLOG_POSTS.map((post, index) => ({
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    author: post.author,
    publishedAt: post.publishedAt,
    readingTime: Math.max(3, Math.ceil(post.blocks.length * 1.2)),
    category: index % 2 === 0 ? "Guides" : "Trust & Safety",
    image: `https://images.unsplash.com/photo-${index % 2 === 0 ? "1515378791036-0648a3ef77b2" : "1519821172141-b5d8f7a8f9b5"}?auto=format&fit=crop&w=1200&q=80`,
    featured: index === 0,
    tags: ["massage", "discovery", "wellness"],
  }));

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "MasseurMatch homepage",
          description:
            "Discover massage therapists, explore city landing pages, and compare specialties through a city-first directory.",
          path: "/",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Featured therapist profiles",
          path: "/",
          items: featured.map((therapist) => ({
            name: therapist.display_name || therapist.full_name || "Therapist",
            path: `/therapists/${therapist.slug || therapist.id}`,
          })),
        })}
      />
      <JsonLd data={buildFaqJsonLd(homepageFaqs)} />

      <EnterpriseStyleHero therapistCount={therapistCount} cityCount={liveCityCount} />

      <section className="page-shell py-6 lg:py-7">
        <KnottyHeroSpotlight therapists={spotlightTherapists} therapistCount={therapistCount} cityCount={liveCityCount} />
      </section>

      <section className="page-shell pb-10">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.94fr),minmax(360px,1.06fr)]">
          <Card className="grid gap-4 p-5 lg:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-muted-foreground">Gay Massage Directory</p>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {therapists.length} verified profiles
              </span>
            </div>
            <div>
              <h2 className="font-display text-2xl leading-tight text-foreground sm:text-[1.8rem]">
                Explore Male Massage Therapists
              </h2>
              <p className="mt-2.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Find verified, gay-friendly male massage therapists near you. Deep tissue, Swedish, sports recovery and more.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-secondary/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Coverage</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{cities.length} live cities</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Format</p>
                <p className="mt-2 text-sm font-semibold text-foreground">AI cards, list, and city search</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="secondary" className="h-auto rounded-full px-5 py-3">
                <Link href="/therapists">Browse therapists</Link>
              </Button>
              <Link href="/search" className="text-sm font-semibold text-primary hover:underline">
                Search by city or specialty
              </Link>
            </div>
            <div className="hidden flex-wrap gap-2 xl:flex">
              {featuredCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/20 hover:bg-secondary"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </Card>

          <HomeSmartMatchCard cities={cities} featuredModalities={featuredModalities} therapistCount={therapists.length} />
        </div>
      </section>

      <section className="page-shell py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">Directory scale</p>
            <p className="mt-3 font-display text-4xl text-foreground">{therapistCount}+</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Male therapist profiles presented with city context and direct contact paths.</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">Coverage</p>
            <p className="mt-3 font-display text-4xl text-foreground">{cityCount}+</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Cities and metro search terms supported across the directory architecture.</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">Discovery model</p>
            <p className="mt-3 font-display text-4xl text-foreground">Direct</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Visitors compare specialties, pricing, and availability before reaching out to therapists.</p>
          </Card>
        </div>

        <div className="mt-12">
        <SectionHeading
          eyebrow="Featured profiles"
          title="Profiles with direct contact details and strong city context."
          description="Every listing is built around discovery, not marketplace friction. Visitors can compare styles, neighborhoods, and contact preferences before they reach out."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featured.map((therapist) => (
            <TherapistCard key={therapist.id} therapist={therapist} />
          ))}
        </div>
        </div>
      </section>

      <section className="page-shell pb-14">
        <SectionHeading
          eyebrow="Trust signals"
          title="Recent member feedback from featured profiles"
          description="Social proof and transparent reviews help new visitors decide with more confidence."
        />
        <div className="mt-8 rounded-3xl border border-border bg-background p-6">
          <RatingSystem averageRating={4.9} totalReviews={Math.max(120, therapistCount)} reviews={homepageReviews} compact={true} />
        </div>
      </section>

      <section className="page-shell pb-14">
        <SectionHeading
          eyebrow="Browse popular cities"
          title="High-intent city shortcuts for the most searched markets."
          description="These quick links mirror the cities and neighborhoods users reach for most often, including metro aliases that still route into searchable landing pages."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {HOMEPAGE_CITY_LINKS.map((city) => (
            <Link
              key={city.label}
              href={city.href}
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/20 hover:bg-secondary"
            >
              {city.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell pb-16">
        <SectionHeading
          eyebrow="From the blog"
          title="Fresh guides for safer, smarter contact decisions"
          description="Editorial content helps visitors understand session choices and trust fundamentals before they reach out."
        />
        <div className="mt-8">
          <BlogGrid posts={homepageBlogPosts} limit={3} />
        </div>

        <div className="brand-surface grid gap-10 rounded-[28px] px-6 py-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
          <div>
            <SectionHeading
              eyebrow="City-first SEO"
              title="Local landing pages, therapist profiles, and category pages built to rank cleanly."
              description="The directory is organized around cities, therapist detail pages, specialty discovery, and editorial content so search engines can understand intent and users can move deeper into the site."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {featuredCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/20 hover:bg-secondary"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">Common questions</h2>
            <div className="mt-5 space-y-4">
              {homepageFaqs.map((item) => (
                <article key={item.question} className="rounded-2xl border border-border bg-secondary/30 p-4">
                  <h3 className="font-semibold text-foreground">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
