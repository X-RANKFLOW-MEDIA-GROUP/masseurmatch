import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, ChevronRight, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import { HomeSmartMatchCard } from "@/app/_components/HomeSmartMatchCard";
import { JsonLd } from "@/app/_components/json-ld";
import { BLOG_POSTS } from "@/app/blog/posts";
import { getCities, getPublicTherapists, type PublicTherapist } from "@/app/_lib/directory";
import {
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = createPageMetadata({
  title: "Gay massage therapists near you",
  description:
    "Browse verified male massage therapists in major U.S. cities, compare specialties and rates, and contact providers directly.",
  path: "/",
  keywords: [
    "gay massage therapists near me",
    "male massage therapist",
    "verified massage therapists",
    "massage by city",
    "direct therapist contact",
  ],
});

const HOMEPAGE_CITY_LINKS = [
  { label: "Dallas", href: "/dallas" },
  { label: "Houston", href: "/houston" },
  { label: "Austin", href: "/austin" },
  { label: "New York", href: "/new-york" },
  { label: "Los Angeles", href: "/los-angeles" },
  { label: "Miami", href: "/miami" },
  { label: "Chicago", href: "/chicago" },
  { label: "Atlanta", href: "/atlanta" },
  { label: "Las Vegas", href: "/las-vegas" },
  { label: "San Francisco", href: "/san-francisco" },
  { label: "Denver", href: "/denver" },
];

const HERO_TRUST_POINTS = ["Verified profiles", "Direct contact", "No booking fees"];

const EDITORIAL_LABELS = ["Guide", "Safety", "Beginner"];

type TierVariant = "default" | "secondary" | "premium" | "outline";

function FramedSection({
  step,
  label,
  children,
}: {
  step: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="page-shell py-3 sm:py-4">
      <div className="rounded-[30px] border border-[#efc28d] bg-white/90 p-4 shadow-[0_18px_48px_rgba(11,31,58,0.06)] sm:p-5">
        <div className="mb-4 flex items-center gap-3 border-b border-[#edf1f6] pb-4">
          <span className="inline-flex rounded-md bg-action-primary px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
            {step}
          </span>
          <p className="text-sm font-semibold text-[#10223f]">{label}</p>
        </div>
        {children}
      </div>
    </section>
  );
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
    <div className="max-w-3xl">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5f6f86]">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-[#10223f] sm:text-[2.2rem]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#5f6f86] sm:text-base">{description}</p>
    </div>
  );
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

function getTierPresentation(tier: PublicTherapist["_tier"]): { label: string; variant: TierVariant } {
  switch (tier) {
    case "elite":
      return { label: "Elite", variant: "premium" };
    case "pro":
      return { label: "Pro", variant: "premium" };
    case "standard":
      return { label: "Verified", variant: "default" };
    default:
      return { label: "Directory", variant: "secondary" };
  }
}

function getTherapistInitials(therapist: PublicTherapist) {
  const name = therapist.display_name || therapist.full_name || "Therapist";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("");
}

function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function TherapistSpotlightCard({ therapist }: { therapist: PublicTherapist }) {
  const name = therapist.display_name || therapist.full_name || "Therapist";
  const city = therapist.city || "United States";
  const tier = getTierPresentation(therapist._tier);
  const specialties = (therapist.specialties || []).slice(0, 2);
  const profilePath = `/therapists/${therapist.slug || therapist.id}`;

  return (
    <article className="rounded-[24px] border border-[#dde4ef] bg-white p-5 shadow-[0_14px_34px_rgba(11,31,58,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#18345f] text-base font-semibold text-white">
            {getTherapistInitials(therapist)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#10223f]">
              <Link href={profilePath} className="hover:text-primary">
                {name}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-[#6b7a90]">{city}</p>
          </div>
        </div>
        <Badge variant={tier.variant}>{tier.label}</Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {therapist.modality ? (
          <span className="rounded-full bg-[#eef3fb] px-3 py-1 text-xs font-medium text-[#35527d]">{therapist.modality}</span>
        ) : null}
        {specialties.map((item) => (
          <span key={item} className="rounded-full border border-[#d8e2ee] bg-white px-3 py-1 text-xs font-medium text-[#52627a]">
            {item}
          </span>
        ))}
      </div>

      <p className="mt-4 min-h-[72px] text-sm leading-6 text-[#5f6f86]">
        {therapist.bio || "Profile details are being refreshed. Open the full profile to see specialties, pricing, and direct contact options."}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#edf1f6] pt-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#6b7a90]">
          {therapist.review_count ? <span>{therapist.review_count} reviews</span> : null}
          {therapist.available_now ? <span className="text-[#1f9758]">Available now</span> : null}
        </div>
        <Link href={profilePath} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
          View profile
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function EditorialCard({
  slug,
  title,
  excerpt,
  publishedAt,
  readingTime,
  label,
}: {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: number;
  label: string;
}) {
  return (
    <article className="rounded-[24px] border border-[#dde4ef] bg-white p-5 shadow-[0_14px_34px_rgba(11,31,58,0.05)]">
      <span className="inline-flex rounded-full bg-[#f4f7fb] px-3 py-1 text-xs font-semibold text-[#52627a]">{label}</span>
      <h3 className="mt-4 text-lg font-semibold leading-snug text-[#10223f]">
        <Link href={`/blog/${slug}`} className="hover:text-primary">
          {title}
        </Link>
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#5f6f86]">{excerpt}</p>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#edf1f6] pt-4 text-xs font-medium text-[#6b7a90]">
        <span>
          {readingTime} min read
        </span>
        <span>{formatBlogDate(publishedAt)}</span>
      </div>
    </article>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-[22px] border border-[#dde4ef] bg-white px-5 py-4 shadow-[0_12px_28px_rgba(11,31,58,0.04)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[#10223f]">
        <span>{question}</span>
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d7e0ec] text-[#6b7a90]">
          +
        </span>
      </summary>
      <p className="pt-3 text-sm leading-7 text-[#5f6f86]">{answer}</p>
    </details>
  );
}

export default async function HomePage() {
  const [cities, therapistsResult] = await Promise.all([getCities(), getPublicTherapists()]);
  const therapists = therapistsResult.items;
  const therapistCount = Math.max(therapistsResult.total, 150);
  const liveCityCount = cities.length;
  const featuredModalities: string[] = Array.from(
    new Set(
      therapists
        .map((therapist) => therapist.modality)
        .filter((item): item is string => typeof item === "string" && item.length > 0),
    ),
  ).slice(0, 6);

  const featuredTherapists = [...therapists]
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
    .slice(0, 3);

  const homepageFaqs = [
    {
      question: "What is MasseurMatch?",
      answer:
        "MasseurMatch is a discovery directory for finding and contacting verified male massage therapists directly in major U.S. cities.",
    },
    {
      question: "How do I find a gay massage therapist near me?",
      answer:
        "Start with Smart Match or browse by city. You can narrow by massage type, session style, and goals before opening therapist profiles.",
    },
    {
      question: "Does MasseurMatch charge booking fees?",
      answer:
        "No. MasseurMatch focuses on discovery only. Contact, scheduling, and payment happen directly between you and the therapist.",
    },
    {
      question: "Are therapist profiles verified?",
      answer:
        "Yes. Verified and premium profiles go through stronger review signals, and each public listing shows its tier clearly so visitors can compare with confidence.",
    },
  ];

  const editorialCards = BLOG_POSTS.slice(0, 3).map((post, index) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    readingTime: Math.max(3, Math.ceil(post.blocks.length * 1.2)),
    label: EDITORIAL_LABELS[index] || "Guide",
  }));

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "MasseurMatch homepage",
          description:
            "Discover verified massage therapists, explore city pages, and compare specialties through a city-first directory.",
          path: "/",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Featured therapist profiles",
          path: "/",
          items: featuredTherapists.map((therapist) => ({
            name: therapist.display_name || therapist.full_name || "Therapist",
            path: `/therapists/${therapist.slug || therapist.id}`,
          })),
        })}
      />
      <JsonLd data={buildFaqJsonLd(homepageFaqs)} />

      <FramedSection step="01" label="Hero">
        <div className="rounded-[28px] bg-[#10223f] px-6 py-10 text-center text-white shadow-[0_30px_70px_rgba(11,31,58,0.22)] sm:px-10 sm:py-14">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2">
            {HERO_TRUST_POINTS.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/[0.14] bg-white/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80"
              >
                {item}
              </span>
            ))}
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl leading-[0.94] text-white sm:text-5xl lg:text-[4rem]">
            Gay Massage Therapists Near You
            <span className="mt-2 block text-[#ff9a2b]">Verified. Direct. No Middleman.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/[0.72] sm:text-lg">
            Browse verified male massage therapists in {liveCityCount}+ cities. Compare specialties, pricing, and contact
            providers directly.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="hero" size="lg" className="rounded-full px-8">
              <Link href="#smart-match-form">
                Find My Therapist
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg" className="rounded-full px-8">
              <Link href="/explore">Browse All Cities</Link>
            </Button>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.08] px-4 py-4">
              <p className="text-3xl font-semibold text-[#ff9a2b]">{therapistCount}+</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/[0.68]">Active profiles</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.08] px-4 py-4">
              <p className="text-3xl font-semibold text-[#ff9a2b]">{liveCityCount}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/[0.68]">Live cities</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.08] px-4 py-4">
              <p className="text-3xl font-semibold text-[#ff9a2b]">Direct</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/[0.68]">No booking fees</p>
            </div>
          </div>
        </div>
      </FramedSection>

      <FramedSection step="02" label="Smart Match Quiz">
        <HomeSmartMatchCard cities={cities} featuredModalities={featuredModalities} therapistCount={therapistCount} />
      </FramedSection>

      <FramedSection step="03" label="Featured Therapist Profiles">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Verified profiles"
            title="Verified male massage therapists with clear specialties and direct contact."
            description="Featured listings surface the strongest profiles first so visitors can compare location, session style, and fit without marketplace friction."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {featuredTherapists.map((therapist) => (
              <TherapistSpotlightCard key={therapist.id} therapist={therapist} />
            ))}
          </div>

          <div className="flex justify-center">
            <Link href="/therapists" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3">
              View all verified therapists
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </FramedSection>

      <FramedSection step="04" label="City Directory">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Browse by city"
            title="Gay massage therapists by city."
            description={`Jump into the cities visitors search most often, then go deeper into therapist profiles and specialty pages from there.`}
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HOMEPAGE_CITY_LINKS.map((city) => (
              <Link
                key={city.label}
                href={city.href}
                className="flex items-center justify-between rounded-[18px] border border-[#d9e2ee] bg-white px-4 py-3 text-sm font-semibold text-[#1a365d] transition hover:border-primary/20 hover:bg-[#f7f9fc]"
              >
                <span>{city.label}</span>
                <MapPin className="h-4 w-4 text-[#8aa0bc]" />
              </Link>
            ))}
            <Link
              href="/explore"
              className="flex items-center justify-between rounded-[18px] border border-[#d9e2ee] bg-[#f7f9fc] px-4 py-3 text-sm font-semibold text-[#1a365d] transition hover:border-primary/20 hover:bg-white"
            >
              <span>Explore all cities</span>
              <ChevronRight className="h-4 w-4 text-[#8aa0bc]" />
            </Link>
          </div>

          <div className="rounded-[22px] border border-[#e6edf5] bg-[#f7f9fc] px-5 py-4 text-sm leading-7 text-[#5f6f86]">
            Browse {liveCityCount} live city pages with internal links into therapist profiles, specialties, and direct discovery flows.
          </div>
        </div>
      </FramedSection>

      <FramedSection step="05" label="Editorial Preview">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Editorial"
            title="Guides for safer, smarter massage discovery."
            description="Short editorial content helps visitors understand etiquette, session options, and how to choose the right therapist before making contact."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {editorialCards.map((post) => (
              <EditorialCard key={post.slug} {...post} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[24px] border border-[#e6edf5] bg-[#f7f9fc] px-5 py-5">
            <div>
              <p className="font-semibold text-[#10223f]">Build trust before the first message.</p>
              <p className="mt-1 text-sm text-[#5f6f86]">Editorial content adds topical depth and gives new visitors better decision support.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/blog">
                Visit the blog
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </FramedSection>

      <FramedSection step="06" label="FAQ">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Frequently asked questions"
              title="Answers that remove friction before contact."
              description="This section covers how the directory works, what verification means, and what to expect when you use MasseurMatch."
            />

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-2 text-xs font-semibold text-[#35527d]">
                <Search className="h-3.5 w-3.5" />
                Search-first discovery
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fdf0df] px-3 py-2 text-xs font-semibold text-[#925814]">
                <Sparkles className="h-3.5 w-3.5" />
                Direct contact flow
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf8ef] px-3 py-2 text-xs font-semibold text-[#206c47]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Clear trust signals
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            {homepageFaqs.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </FramedSection>

      <section className="page-shell pb-8 pt-2">
        <div className="rounded-[30px] bg-[#10223f] px-6 py-8 text-white shadow-[0_24px_60px_rgba(11,31,58,0.18)] sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Ready to browse?</p>
              <h2 className="mt-2 font-display text-3xl text-white">Start with verified listings, then contact therapists directly.</h2>
              <p className="mt-3 text-sm leading-7 text-white/[0.72]">
                MasseurMatch helps visitors move from search intent to real therapist profiles without booking fees or marketplace detours.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" className="rounded-full px-6">
                <Link href="/search">
                  Search therapists
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="glass" className="rounded-full px-6">
                <Link href="/pro/join">
                  <BadgeCheck className="h-4 w-4" />
                  Claim your profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
