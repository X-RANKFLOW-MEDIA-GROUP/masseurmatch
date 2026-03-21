import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Dumbbell,
  Flower2,
  Gem,
  HandHeart,
  HeartHandshake,
  Leaf,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { JsonLd } from "@/app/_components/json-ld";
import { getCities, getPublicTherapists, type PublicTherapist } from "@/app/_lib/directory";
import { buildCollectionPageJsonLd, buildItemListJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { PremiumIcon as PremiumGlyph } from "@/components/icons/PremiumIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullNumberFormatter = new Intl.NumberFormat("en-US");

type IconGlyph = LucideIcon;

type SpecialtyCardData = {
  label: string;
  count: number;
  href: string;
  icon: IconGlyph;
};

type CityCardData = {
  name: string;
  slug: string;
  stateCode: string;
  count: number;
  icon: IconGlyph;
};

const HERO_TAGS = ["Deep Tissue", "Swedish", "Sports Recovery", "Thai Massage", "Verified Profiles", "Direct Contact"];
const TRUST_BAR_ITEMS: Array<{ icon: IconGlyph; label: string }> = [
  { icon: ShieldCheck, label: "Visible verification and safer first-contact signals" },
  { icon: Star, label: "Reviews, profile quality, and stronger editorial trust" },
  { icon: LockKeyhole, label: "Private discovery without booking-platform friction" },
  { icon: HeartHandshake, label: "Inclusive language with clearer respect and boundaries" },
  { icon: CircleDollarSign, label: "Direct pricing and contact clarity on mobile" },
];

const HOW_IT_WORKS: Array<{ step: string; title: string; body: string; icon: IconGlyph }> = [
  {
    step: "01",
    title: "Search by city and intent",
    body: "Start with modality, location, or verification intent. The homepage routes visitors into real search and local landing pages already wired into the app.",
    icon: Search,
  },
  {
    step: "02",
    title: "Compare trust signals",
    body: "Profiles surface tier, reviews, direct contact context, and verification indicators so the shortlist feels intentional instead of overwhelming.",
    icon: BadgeCheck,
  },
  {
    step: "03",
    title: "Choose the safer fit",
    body: "Scan specialties, pricing, profile voice, and session format to find someone whose style and boundaries match what you need.",
    icon: Users,
  },
  {
    step: "04",
    title: "Reach out directly",
    body: "MasseurMatch handles trusted discovery. Therapists and clients connect directly, with no middleman booking flow getting in the way.",
    icon: ArrowRight,
  },
];

const TESTIMONIALS = [
  {
    initials: "AK",
    name: "Alex Kim",
    meta: "Dallas client",
    quote:
      "The new directory flow feels calm and premium. I could spot verified profiles immediately and message with more confidence.",
  },
  {
    initials: "JR",
    name: "Jordan Rivera",
    meta: "Houston client",
    quote:
      "What stood out most was the clarity. Pricing, profile quality, and contact expectations were visible before I ever reached out.",
  },
  {
    initials: "SM",
    name: "Sam Martinez, LMT",
    meta: "Austin therapist",
    quote:
      "The homepage finally matches the level of care therapists want to project. It feels polished, trusted, and built for quality instead of noise.",
  },
];

const FALLBACK_SPECIALTIES = [
  { label: "Deep Tissue", count: 0, href: "/search?keyword=deep%20tissue", icon: Dumbbell },
  { label: "Swedish", count: 0, href: "/search?keyword=swedish", icon: Waves },
  { label: "Sports Recovery", count: 0, href: "/search?keyword=sports", icon: Sparkles },
  { label: "Prenatal", count: 0, href: "/search?keyword=prenatal", icon: HandHeart },
  { label: "Hot Stone", count: 0, href: "/search?keyword=hot%20stone", icon: Gem },
  { label: "Aromatherapy", count: 0, href: "/search?keyword=aromatherapy", icon: Flower2 },
  { label: "Reflexology", count: 0, href: "/search?keyword=reflexology", icon: Leaf },
  { label: "Lymphatic Drainage", count: 0, href: "/search?keyword=lymphatic", icon: ShieldCheck },
] satisfies SpecialtyCardData[];

const CITY_ICON_ROTATION: IconGlyph[] = [Building2, MapPin, Sparkles, Gem, Waves, Leaf];

export const metadata: Metadata = createPageMetadata({
  title: "The safest and most trusted premium male massage directory",
  description:
    "Discover verified male massage therapists, browse local intent pages, and connect directly through a safer premium directory experience.",
  path: "/",
  keywords: [
    "male massage near me",
    "verified male massage directory",
    "male massage by city",
    "direct therapist contact",
    "trusted premium massage directory",
  ],
});

function formatCompactNumber(value: number) {
  if (value >= 1000) {
    return compactNumberFormatter.format(value);
  }

  return fullNumberFormatter.format(value);
}

function getDisplayName(therapist: PublicTherapist) {
  return therapist.display_name || therapist.full_name || "Therapist";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getTierRank(tier: PublicTherapist["_tier"]) {
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

function getStartingPrice(therapist: PublicTherapist) {
  const values = [therapist.incall_price, therapist.outcall_price].filter(
    (value): value is number => typeof value === "number" && value > 0,
  );

  if (!values.length) {
    return null;
  }

  return Math.min(...values);
}

function trimCopy(value: string | null | undefined, max = 150) {
  if (!value) {
    return "Profile details are being refreshed. Open the full listing to review specialties, availability, and direct contact options.";
  }

  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max).trim()}...`;
}

function normalizeSpecialty(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[_-]+/g, " ");

  if (!normalized) {
    return null;
  }

  if (normalized.includes("deep")) return "Deep Tissue";
  if (normalized.includes("swedish")) return "Swedish";
  if (normalized.includes("sport") || normalized.includes("recovery") || normalized.includes("athletic")) return "Sports Recovery";
  if (normalized.includes("prenatal")) return "Prenatal";
  if (normalized.includes("hot stone")) return "Hot Stone";
  if (normalized.includes("aroma")) return "Aromatherapy";
  if (normalized.includes("reflex")) return "Reflexology";
  if (normalized.includes("lymph")) return "Lymphatic Drainage";
  if (normalized.includes("thai")) return "Thai Massage";
  if (normalized.includes("stretch") || normalized.includes("mobility")) return "Stretch Therapy";
  if (normalized.includes("myofascial")) return "Myofascial Release";
  if (normalized.includes("relax")) return "Relaxation";

  return normalized
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSpecialtyIcon(label: string): IconGlyph {
  const normalized = label.toLowerCase();

  if (normalized.includes("deep") || normalized.includes("sports") || normalized.includes("stretch")) return Dumbbell;
  if (normalized.includes("swedish") || normalized.includes("thai")) return Waves;
  if (normalized.includes("prenatal")) return HandHeart;
  if (normalized.includes("hot stone") || normalized.includes("lymphatic")) return Gem;
  if (normalized.includes("aroma")) return Flower2;
  if (normalized.includes("reflex") || normalized.includes("relax")) return Leaf;

  return Sparkles;
}

function getSpecialtyCards(therapists: PublicTherapist[]): SpecialtyCardData[] {
  const counts = new Map<string, number>();

  for (const therapist of therapists) {
    const values = [therapist.modality, ...(therapist.specialties || [])];

    for (const raw of values) {
      if (!raw) continue;

      const label = normalizeSpecialty(raw);

      if (!label) continue;

      counts.set(label, (counts.get(label) || 0) + 1);
    }
  }

  const ranked = [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([label, count]) => ({
      label,
      count,
      href: `/search?keyword=${encodeURIComponent(label)}`,
      icon: getSpecialtyIcon(label),
    }));

  return ranked.length ? ranked : FALLBACK_SPECIALTIES;
}

function getCityCards(
  cities: Awaited<ReturnType<typeof getCities>>,
  therapists: PublicTherapist[],
): CityCardData[] {
  const counts = new Map<string, number>();

  for (const therapist of therapists) {
    const city = therapist.city?.trim().toLowerCase();

    if (!city) continue;

    counts.set(city, (counts.get(city) || 0) + 1);
  }

  return [...cities]
    .map((city, index) => ({
      name: city.name,
      slug: city.slug,
      stateCode: city.stateCode,
      count: counts.get(city.name.toLowerCase()) || 0,
      icon: CITY_ICON_ROTATION[index % CITY_ICON_ROTATION.length],
    }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 6);
}

function EyebrowChip({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "inverse";
  className?: string;
}) {
  return <div className={cn("eyebrow-chip", tone === "inverse" && "eyebrow-chip-inverse", className)}>{children}</div>;
}

function IconFrame({
  icon,
  tone = "default",
  size = "md",
  className,
  iconClassName,
}: {
  icon: IconGlyph;
  tone?: "default" | "accent" | "inverse" | "soft" | "glass";
  size?: "sm" | "md" | "lg";
  className?: string;
  iconClassName?: string;
}) {
  return (
    <PremiumGlyph
      icon={icon}
      tone={tone}
      size={size}
      className={cn("rounded-[1.15rem]", className)}
      iconClassName={iconClassName}
    />
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  tone = "default",
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  body: string;
  align?: "left" | "center";
  tone?: "default" | "inverse";
  actions?: ReactNode;
}) {
  const alignment = align === "center" ? "mx-auto text-center" : "";
  const inverse = tone === "inverse";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <EyebrowChip tone={inverse ? "inverse" : "default"} className={align === "center" ? "justify-center" : ""}>
        {eyebrow}
      </EyebrowChip>
      <h2 className={cn("font-display mt-6 text-4xl font-light leading-[0.96] sm:text-5xl lg:text-[3.85rem]", inverse ? "text-white" : "text-brand-primary")}>
        {title}
      </h2>
      <p className={cn("mt-5 text-base leading-8 sm:text-lg", inverse ? "text-white/68" : "text-text-secondary")}>{body}</p>
      {actions ? <div className={`mt-6 flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>{actions}</div> : null}
    </div>
  );
}

function TherapistSpotlightCard({ therapist }: { therapist: PublicTherapist }) {
  const name = getDisplayName(therapist);
  const tier = getTierPresentation(therapist._tier);
  const price = getStartingPrice(therapist);
  const profileHref = `/therapists/${therapist.slug || therapist.id}`;
  const city = therapist.city || "United States";
  const tags = [therapist.modality, ...(therapist.specialties || [])]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => normalizeSpecialty(value) || value)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 3);
  const signals = [
    therapist.is_verified_profile ? "Profile reviewed" : null,
    therapist.is_verified_identity ? "Identity checked" : null,
    therapist.is_verified_photos ? "Photos verified" : null,
    therapist.available_now ? "Available now" : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] text-white shadow-[0_20px_50px_rgb(3_10_20_/_0.25)] transition duration-300 hover:-translate-y-1 hover:border-brand-accent/40 hover:bg-white/[0.075]">
      <div className="relative isolate aspect-[4/3] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgb(var(--color-brand-soft-accent-rgb)/0.22),transparent_32%),linear-gradient(160deg,rgb(var(--color-brand-secondary-rgb)/0.32),rgb(var(--color-brand-primary-rgb)/0.96))]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--color-brand-primary-rgb)/0.05),rgb(var(--color-brand-primary-rgb)/0.82))]" />
        <div className="absolute left-5 top-5">
          <Badge variant={tier.variant} className="border-0 px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
            {tier.label}
          </Badge>
        </div>
        <div className="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/15 bg-white/10 text-lg font-semibold tracking-[0.08em] text-white backdrop-blur-xl">
          {getInitials(name)}
        </div>
        <div className="absolute inset-x-5 bottom-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
            <MapPin className="h-3.5 w-3.5" />
            {city}
          </div>
          <h3 className={`font-display mt-3 text-[2rem] font-light leading-none`}>
            <Link href={profileHref} className="transition hover:text-brand-soft">
              {name}
            </Link>
          </h3>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/72">
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-5 min-h-[88px] text-sm leading-7 text-white/70">{trimCopy(therapist.bio)}</p>

        <div className="mt-5 flex flex-wrap gap-3 text-xs font-medium text-white/58">
          <span className="inline-flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-brand-soft" />
            {therapist.review_count ? `${therapist.review_count} reviews` : "New listing"}
          </span>
          {signals.slice(0, 2).map((signal) => (
            <span key={signal} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-brand-soft" />
              {signal}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
          <div>
            <p className={`font-display text-3xl font-light text-white`}>
              {price ? `$${fullNumberFormatter.format(price)}` : "Direct"}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/46">
              {price ? "Starting rate" : "Contact profile"}
            </p>
          </div>

          <Link href={profileHref} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-soft transition hover:gap-3">
            View profile
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const [cities, therapistsResult] = await Promise.all([
    getCities(),
    getPublicTherapists({
      pageSize: 150,
    }),
  ]);

  const therapists = therapistsResult.items;
  const therapistCount = Math.max(therapistsResult.total, therapists.length);
  const liveCityCount = cities.length;
  const verifiedCount = therapists.filter(
    (therapist) =>
      therapist._tier === "standard" ||
      therapist._tier === "pro" ||
      therapist._tier === "elite" ||
      therapist.is_verified_identity ||
      therapist.is_verified_profile,
  ).length;
  const specialtyCards = getSpecialtyCards(therapists);
  const cityCards = getCityCards(cities, therapists);
  const featuredTherapists = [...therapists]
    .sort((left, right) => {
      const tierDifference = getTierRank(right._tier) - getTierRank(left._tier);

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
  const heroTherapist = featuredTherapists[0] || therapists[0] || null;

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "MasseurMatch homepage",
          description:
            "Discover verified male massage therapists, compare trust signals, and explore premium city pages built for direct therapist discovery.",
          path: "/",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Featured MasseurMatch therapists",
          path: "/",
          items: featuredTherapists.map((therapist) => ({
            name: getDisplayName(therapist),
            path: `/therapists/${therapist.slug || therapist.id}`,
          })),
        })}
      />

      <div className="bg-bg-body text-text-primary">
        <section className="relative isolate overflow-hidden bg-brand-primary text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--color-brand-soft-accent-rgb)/0.16),transparent_24%),radial-gradient(circle_at_80%_20%,rgb(var(--color-brand-secondary-rgb)/0.22),transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_42%,transparent_88%)]" />
          <div className="page-shell relative py-14 sm:py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr),minmax(320px,0.9fr)] lg:items-center">
              <div className="max-w-3xl">
                <EyebrowChip tone="inverse">
                  Trusted premium male massage directory
                </EyebrowChip>

                <h1 className={`font-display mt-8 max-w-4xl text-5xl font-light leading-[0.9] text-white sm:text-6xl lg:text-[5.5rem]`}>
                  The safest and most trusted
                  <em className="px-3 font-light italic text-brand-soft">premium</em>
                  directory for direct connection
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                  MasseurMatch is built to win on trust before scale: verified signals, cleaner local intent pages, and a faster mobile contact flow for discovering male massage therapists.
                </p>

                <form
                  action="/search"
                  className="mt-8 flex flex-col gap-3 rounded-[30px] border border-white/12 bg-white/[0.06] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:flex-row lg:items-center"
                >
                  <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[24px] px-3 py-2">
                    <Search className="h-5 w-5 shrink-0 text-white/45" />
                    <input
                      name="keyword"
                      type="text"
                      placeholder="Specialty, trust signal, therapist name"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/38"
                    />
                  </label>
                  <div className="hidden h-8 w-px bg-white/10 lg:block" />
                  <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[24px] px-3 py-2">
                    <MapPin className="h-5 w-5 shrink-0 text-white/45" />
                    <input
                      name="city"
                      type="text"
                      defaultValue={cityCards[0]?.name}
                      placeholder="City"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/38"
                    />
                  </label>
                  <Button type="submit" variant="premium" size="lg" className="h-14 rounded-full px-8 text-sm font-semibold">
                    Search directory
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {HERO_TAGS.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?keyword=${encodeURIComponent(tag)}`}
                      className="motion-premium rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-medium text-white/64 transition hover:border-brand-accent/35 hover:bg-brand-accent/10 hover:text-brand-soft"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  <div className="premium-stat rounded-[24px] p-5">
                    <p className={`font-display text-4xl font-light text-brand-soft`}>{formatCompactNumber(therapistCount)}+</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">Profiles live</p>
                  </div>
                  <div className="premium-stat rounded-[24px] p-5">
                    <p className={`font-display text-4xl font-light text-brand-soft`}>{formatCompactNumber(liveCityCount)}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">Cities indexed</p>
                  </div>
                  <div className="premium-stat rounded-[24px] p-5">
                    <p className={`font-display text-4xl font-light text-brand-soft`}>{formatCompactNumber(verifiedCount)}+</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">Trust signals visible</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[34px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Curated spotlight</p>
                    <p className={`font-display mt-2 text-3xl font-light text-white`}>Search first. Trust first.</p>
                  </div>
                  <IconFrame icon={Sparkles} tone="glass" />
                </div>

                {heroTherapist ? (
                  <div className="mt-5 rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-brand-accent/12 text-lg font-semibold text-brand-soft">
                        {getInitials(getDisplayName(heroTherapist))}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/46">Featured profile</p>
                        <h2 className={`font-display mt-1 text-3xl font-light text-white`}>{getDisplayName(heroTherapist)}</h2>
                        <p className="mt-1 flex items-center gap-2 text-sm text-white/62">
                          <MapPin className="h-4 w-4" />
                          {heroTherapist.city || "United States"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {[heroTherapist.modality, ...(heroTherapist.specialties || [])]
                        .filter((value): value is string => Boolean(value))
                        .map((value) => normalizeSpecialty(value) || value)
                        .filter((value, index, array) => array.indexOf(value) === index)
                        .slice(0, 3)
                        .map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                            {tag}
                          </span>
                        ))}
                    </div>

                    <p className="mt-5 text-sm leading-7 text-white/68">{trimCopy(heroTherapist.bio, 130)}</p>

                    <Link
                      href={`/therapists/${heroTherapist.slug || heroTherapist.id}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-soft transition hover:gap-3"
                    >
                      Open spotlight profile
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.045] p-5 text-sm leading-7 text-white/66">
                    Directory highlights and featured therapists will appear here as soon as public profiles are available.
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    {
                      icon: BadgeCheck,
                      title: "Verification you can see",
                      body: "Tiered listings and profile review create clearer quality signals before contact happens.",
                    },
                    {
                      icon: Clock3,
                      title: "Faster mobile decisions",
                      body: "Visitors can compare specialty, city, session format, and price range without hopping across pages.",
                    },
                    {
                      icon: CircleDollarSign,
                      title: "Contact-first flow",
                      body: "No marketplace detour. Discovery happens here and contact stays direct.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
                        <IconFrame icon={Icon} tone="glass" size="sm" />
                        <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/58">{item.body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border-subtle bg-[rgb(var(--color-bg-subtle-rgb)/0.78)]">
          <div className="page-shell grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-5">
            {TRUST_BAR_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="premium-surface motion-premium flex items-center gap-3 rounded-[22px] border border-white/70 px-4 py-4 shadow-[0_10px_24px_rgb(var(--color-brand-primary-rgb)/0.04)]">
                  <IconFrame icon={Icon} tone="inverse" size="sm" className="shrink-0" />
                  <p className="text-sm leading-6 text-text-secondary">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="page-shell py-20 sm:py-24">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Search by intent"
                title={
                  <>
                    Local intent pages,
                    <br />
                    one trusted directory
                  </>
                }
                body="The homepage pulls these cards from real therapist data, giving MasseurMatch stronger search-first entry points instead of a generic browse-only experience."
              />
              <Button asChild variant="outline" className="h-12 rounded-full px-6">
                <Link href="/search">
                  View all specialties
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {specialtyCards.map((specialty) => {
                const Icon = specialty.icon;

                return (
                  <Link
                    key={specialty.label}
                    href={specialty.href}
                    className="premium-surface premium-shimmer group overflow-hidden rounded-[28px] border border-border-subtle p-6 shadow-[0_18px_40px_rgb(var(--color-brand-primary-rgb)/0.05)] transition duration-300 hover:border-brand-accent/35 hover:shadow-[0_22px_48px_rgb(var(--color-brand-primary-rgb)/0.08)]"
                  >
                    <IconFrame icon={Icon} tone="soft" />
                    <h3 className="mt-5 text-lg font-semibold text-brand-primary">{specialty.label}</h3>
                    <p className="mt-2 text-sm text-text-muted">
                      {specialty.count > 0 ? `${formatCompactNumber(specialty.count)} therapists` : "Live specialty search"}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-action-secondary transition group-hover:gap-3">
                      Explore specialty
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-brand-primary py-20 text-white sm:py-24">
          <div className="page-shell">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeading
                  eyebrow="Featured professionals"
                  tone="inverse"
                  title={
                    <>
                      Profiles built to win
                      <br />
                      the first second
                    </>
                  }
                  body="Top listings are sorted with tier, reviews, and profile momentum in mind so the strongest trust-led pages shape the first impression."
                />
                <Button asChild variant="glass" className="h-12 rounded-full px-6">
                  <Link href="/therapists">
                    Browse all therapists
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {featuredTherapists.map((therapist) => (
                  <TherapistSpotlightCard key={therapist.id} therapist={therapist} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[rgb(var(--color-bg-subtle-rgb)/0.72)] py-20 sm:py-24">
          <div className="page-shell">
            <SectionHeading
              eyebrow="Simple process"
              title={
                <>
                  How MasseurMatch
                  <br />
                  now earns trust
                </>
              }
              body="The flow stays simple: search, compare, contact, and move forward without friction or marketplace confusion."
            />

            <div className="mt-10 grid gap-px overflow-hidden rounded-[32px] border border-border-subtle bg-border-subtle lg:grid-cols-4">
              {HOW_IT_WORKS.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.step} className="premium-surface p-8 sm:p-10">
                    <div className="flex items-start justify-between gap-4">
                      <span className={`font-display text-6xl font-light leading-none text-brand-primary/10`}>
                        {item.step}
                      </span>
                      <IconFrame icon={Icon} tone="inverse" />
                    </div>
                    <h3 className={`font-display mt-8 text-3xl font-light leading-tight text-brand-primary`}>{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-text-secondary">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="page-shell py-20 sm:py-24">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Coverage area"
                title={
                  <>
                    City pages built for
                    <br />
                    local intent
                  </>
                }
                body="City cards stay tied to the real directory footprint so the homepage can spotlight where users already have inventory, trust signals, and long-tail entry pages to explore."
              />
              <Button asChild variant="outline" className="h-12 rounded-full px-6">
                <Link href="/explore">
                  Explore all cities
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cityCards.map((city) => {
                const Icon = city.icon;

                return (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}`}
                    className="premium-surface premium-shimmer group rounded-[28px] border border-border-subtle p-6 shadow-[0_16px_36px_rgb(var(--color-brand-primary-rgb)/0.04)] transition duration-300 hover:border-brand-accent/35 hover:shadow-[0_22px_48px_rgb(var(--color-brand-primary-rgb)/0.08)]"
                  >
                    <IconFrame icon={Icon} tone="soft" />
                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-brand-primary">{city.name}</h3>
                        <p className="mt-2 text-sm text-text-muted">
                          {city.count > 0 ? `${formatCompactNumber(city.count)} therapists` : `${city.stateCode} city page`}
                        </p>
                      </div>
                      <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                        {city.stateCode}
                      </span>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-action-secondary transition group-hover:gap-3">
                      Open city page
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(135deg,rgb(var(--color-brand-deep-navy-rgb))_0%,rgb(var(--color-brand-primary-rgb))_100%)] py-20 text-white sm:py-24">
          <div className="page-shell">
            <div className="mx-auto max-w-4xl rounded-[36px] border border-white/10 bg-white/[0.06] px-6 py-10 text-center shadow-[0_24px_70px_rgb(0_0_0_/_0.22)] backdrop-blur-xl sm:px-10">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[ShieldCheck, HeartHandshake, HandHeart].map((Icon, index) => (
                  <IconFrame key={index} icon={Icon} tone="glass" size="lg" className="rounded-[1.35rem]" />
                ))}
              </div>

              <h2 className={`font-display mt-8 text-4xl font-light leading-[0.96] text-white sm:text-5xl lg:text-[3.7rem]`}>
                Safe.
                <br />
                Respectful.
                <br />
                Direct.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Inclusivity stays central to the brand. Verified, respectful profiles and stronger trust signals help more clients feel safe, seen, and ready to reach out.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/62">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Check className="h-4 w-4 text-brand-soft" />
                  Welcoming profile language
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Check className="h-4 w-4 text-brand-soft" />
                  Direct contact expectations
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Check className="h-4 w-4 text-brand-soft" />
                  Verification where available
                </span>
              </div>
              <Button asChild variant="premium" size="lg" className="mt-8 rounded-full px-8">
                <Link href="/search?verified=1">
                  Browse verified therapists
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="page-shell py-20 sm:py-24">
          <SectionHeading
            eyebrow="Client voices"
            title={
              <>
                What the new
                <br />
                position communicates
              </>
            }
            body="The goal of the redesign is simple: make MasseurMatch feel more premium, more trustworthy, and easier to trust at a glance."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((item, index) => (
              <article key={item.name} className="premium-surface rounded-[28px] border border-border-subtle p-7 shadow-[0_16px_36px_rgb(var(--color-brand-primary-rgb)/0.05)]">
                <div className="flex items-center gap-1 text-brand-accent">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className={`font-display mt-6 text-2xl font-light leading-[1.4] text-brand-primary`}>
                  "{item.quote}"
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${
                      index === 0 ? "bg-brand-secondary text-white" : index === 1 ? "bg-brand-soft/55 text-brand-primary" : "bg-bg-subtle text-brand-primary"
                    }`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-primary">{item.name}</p>
                    <p className="text-sm text-text-muted">{item.meta}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[rgb(var(--color-bg-subtle-rgb)/0.72)] py-20 sm:py-24">
          <div className="page-shell">
            <div className="mx-auto max-w-4xl text-center">
              <EyebrowChip className="justify-center">
                Get started
              </EyebrowChip>
              <h2 className={`font-display mt-8 text-5xl font-light leading-[0.92] text-brand-primary sm:text-6xl lg:text-[4.8rem]`}>
                Start with the
                <br />
                directory you trust
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
                Browse verified therapists, compare trust signals with less friction, and use local intent pages that feel premium from the very first click.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Button asChild variant="default" size="lg" className="rounded-full px-8">
                  <Link href="/search">
                    Find a therapist
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <Link href="/compare">
                    Compare the market
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

