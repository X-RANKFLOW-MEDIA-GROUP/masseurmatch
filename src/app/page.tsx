import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import type { ComponentType, ReactNode } from "react";
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
} from "lucide-react";
import { JsonLd } from "@/app/_components/json-ld";
import { getCities, getPublicTherapists, type PublicTherapist } from "@/app/_lib/directory";
import { buildCollectionPageJsonLd, buildItemListJsonLd, createPageMetadata } from "@/app/_lib/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const editorialSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullNumberFormatter = new Intl.NumberFormat("en-US");

type PremiumIcon = ComponentType<{ className?: string }>;

type SpecialtyCardData = {
  label: string;
  count: number;
  href: string;
  icon: PremiumIcon;
};

type CityCardData = {
  name: string;
  slug: string;
  stateCode: string;
  count: number;
  icon: PremiumIcon;
};

const HERO_TAGS = ["Deep Tissue", "Swedish", "Sports Recovery", "Thai Massage", "LGBTQ+ Affirming", "Direct Contact"];

const TRUST_BAR_ITEMS: Array<{ icon: PremiumIcon; label: string }> = [
  { icon: ShieldCheck, label: "Verified credentials and profile review" },
  { icon: Star, label: "Visible social proof and stronger trust signals" },
  { icon: LockKeyhole, label: "Private discovery without booking fees" },
  { icon: HeartHandshake, label: "Inclusive language and affirming profiles" },
  { icon: CircleDollarSign, label: "Direct pricing and contact clarity" },
];

const HOW_IT_WORKS: Array<{ step: string; title: string; body: string; icon: PremiumIcon }> = [
  {
    step: "01",
    title: "Search by specialty or city",
    body: "Start with modality, location, or therapist name. The homepage routes visitors into real search and city pages already wired into the app.",
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
    title: "Choose the right fit",
    body: "Scan specialties, pricing, and profile voice to find someone whose session style, boundaries, and pace match what you need.",
    icon: Users,
  },
  {
    step: "04",
    title: "Reach out directly",
    body: "MasseurMatch handles discovery. Therapists and clients connect directly, with no middleman booking flow getting in the way.",
    icon: ArrowRight,
  },
];

const TESTIMONIALS = [
  {
    initials: "AK",
    name: "Alex Kim",
    meta: "Dallas client",
    quote:
      "The new directory flow feels calm and premium. I could compare specialties fast, spot verified profiles immediately, and message with confidence.",
  },
  {
    initials: "JR",
    name: "Jordan Rivera",
    meta: "Houston client",
    quote:
      "What stood out most was the clarity. Pricing, profile quality, and contact expectations were all visible before I ever reached out.",
  },
  {
    initials: "SM",
    name: "Sam Martinez, LMT",
    meta: "Austin therapist",
    quote:
      "The homepage finally matches the level of care therapists want to project. It feels editorial, polished, and built for trust instead of noise.",
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

const CITY_ICON_ROTATION: PremiumIcon[] = [Building2, MapPin, Sparkles, Gem, Waves, Leaf];

export const metadata: Metadata = createPageMetadata({
  title: "Find your perfect massage therapist",
  description:
    "Discover verified massage therapists, browse by city or specialty, and connect directly through a cleaner premium directory experience.",
  path: "/",
  keywords: [
    "massage therapists near me",
    "verified massage therapist directory",
    "massage by city",
    "direct therapist contact",
    "inclusive massage therapists",
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

function getSpecialtyIcon(label: string): PremiumIcon {
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

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  body: string;
  align?: "left" | "center";
  actions?: ReactNode;
}) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <div
        className={`inline-flex items-center gap-3 rounded-full border border-[#efdbc2] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a56b21] ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff8a1f]" />
        {eyebrow}
      </div>
      <h2 className={`${editorialSerif.className} mt-6 text-4xl font-light leading-[0.96] text-brand-primary sm:text-5xl lg:text-[3.85rem]`}>
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-text-secondary sm:text-lg">{body}</p>
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
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] text-white shadow-[0_20px_50px_rgba(3,10,20,0.25)] transition duration-300 hover:-translate-y-1 hover:border-[#ff8a1f]/40 hover:bg-white/[0.075]">
      <div className="relative isolate aspect-[4/3] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,179,71,0.22),transparent_32%),linear-gradient(160deg,rgba(47,111,228,0.32),rgba(11,31,58,0.96))]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,58,0.05),rgba(11,31,58,0.78))]" />
        <div className="absolute left-5 top-5">
          <Badge variant={tier.variant} className="border-0 px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
            {tier.label}
          </Badge>
        </div>
        <div className="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/15 bg-white/10 text-lg font-semibold tracking-[0.08em] text-white">
          {getInitials(name)}
        </div>
        <div className="absolute inset-x-5 bottom-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
            <MapPin className="h-3.5 w-3.5" />
            {city}
          </div>
          <h3 className={`${editorialSerif.className} mt-3 text-[2rem] font-light leading-none`}>
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
            <p className={`${editorialSerif.className} text-3xl font-light text-white`}>
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
            "Discover verified massage therapists, compare specialties, and explore premium city pages built for direct therapist discovery.",
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

      <div className="bg-[#fcfaf6] text-text-primary">
        <section className="relative isolate overflow-hidden bg-brand-primary text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,179,71,0.16),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(47,111,228,0.22),transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_42%,transparent_88%)]" />
          <div className="page-shell relative py-14 sm:py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr),minmax(320px,0.9fr)] lg:items-center">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-3 rounded-full border border-[#ff8a1f]/25 bg-[#ff8a1f]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffb570]">
                  <span className="h-2 w-2 rounded-full bg-[#ff8a1f]" />
                  Verified therapists across live U.S. cities
                </div>

                <h1 className={`${editorialSerif.className} mt-8 max-w-4xl text-5xl font-light leading-[0.9] text-white sm:text-6xl lg:text-[5.5rem]`}>
                  Find your
                  <em className="px-3 font-light italic text-[#ffb570]">perfect</em>
                  massage therapist
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                  A calmer, more premium directory experience for discovering verified massage professionals, comparing specialties, and reaching out on your terms.
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
                      placeholder="Specialty, technique, therapist name"
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
                      className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-medium text-white/64 transition hover:border-[#ff8a1f]/35 hover:bg-[#ff8a1f]/10 hover:text-[#ffb570]"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                    <p className={`${editorialSerif.className} text-4xl font-light text-[#ffb570]`}>{formatCompactNumber(therapistCount)}+</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">Active profiles</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                    <p className={`${editorialSerif.className} text-4xl font-light text-[#ffb570]`}>{formatCompactNumber(liveCityCount)}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">Live cities</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                    <p className={`${editorialSerif.className} text-4xl font-light text-[#ffb570]`}>{formatCompactNumber(verifiedCount)}+</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">Verified signals</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[34px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Curated spotlight</p>
                    <p className={`${editorialSerif.className} mt-2 text-3xl font-light text-white`}>Discovery with trust built in</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[#ff8a1f]/25 bg-[#ff8a1f]/12 text-[#ffb570]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                {heroTherapist ? (
                  <div className="mt-5 rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#ff8a1f]/12 text-lg font-semibold text-[#ffb570]">
                        {getInitials(getDisplayName(heroTherapist))}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/46">Featured profile</p>
                        <h2 className={`${editorialSerif.className} mt-1 text-3xl font-light text-white`}>{getDisplayName(heroTherapist)}</h2>
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
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#ffb570] transition hover:gap-3"
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
                      title: "Hand-checked presentation",
                      body: "Tiered listings and profile review create clearer quality signals up front.",
                    },
                    {
                      icon: Clock3,
                      title: "Faster first decisions",
                      body: "Visitors can compare specialty, city, and price range without hopping across pages.",
                    },
                    {
                      icon: CircleDollarSign,
                      title: "Contact-first flow",
                      body: "No marketplace detour. Discovery happens here, booking stays direct.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#ff8a1f]/25 bg-[#ff8a1f]/10 text-[#ffb570]">
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
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

        <section className="border-y border-[#efe6d8] bg-[#f6f1e8]">
          <div className="page-shell grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-5">
            {TRUST_BAR_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/80 px-4 py-4 shadow-[0_10px_24px_rgba(11,31,58,0.04)]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-brand-primary text-white">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
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
                eyebrow="Browse by specialty"
                title={
                  <>
                    Every technique,
                    <br />
                    one premium directory
                  </>
                }
                body="The homepage now pulls its specialty cards from real therapist data, so the most visible categories track with what the directory actually offers."
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
                    className="group overflow-hidden rounded-[28px] border border-[#eadfcd] bg-white p-6 shadow-[0_18px_40px_rgba(11,31,58,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#ff8a1f]/35 hover:shadow-[0_22px_48px_rgba(11,31,58,0.08)]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-brand-primary/5 text-brand-secondary transition group-hover:bg-[#ff8a1f]/10 group-hover:text-[#a56b21]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-brand-primary">{specialty.label}</h3>
                    <p className="mt-2 text-sm text-text-muted">
                      {specialty.count > 0 ? `${formatCompactNumber(specialty.count)} therapists` : "Live specialty search"}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#a56b21] transition group-hover:gap-3">
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
                  title={
                    <>
                      Meet your next
                      <br />
                      therapist
                    </>
                  }
                  body="Top listings are sorted with tier, reviews, and profile momentum in mind so the strongest pages lead the first impression."
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

        <section className="bg-[#f3ede2] py-20 sm:py-24">
          <div className="page-shell">
            <SectionHeading
              eyebrow="Simple process"
              title={
                <>
                  How MasseurMatch
                  <br />
                  now flows
                </>
              }
              body="The redesign keeps the browsing path simple: search, compare, contact, and move forward without friction."
            />

            <div className="mt-10 grid gap-px overflow-hidden rounded-[32px] border border-[#e7dbc6] bg-[#e7dbc6] lg:grid-cols-4">
              {HOW_IT_WORKS.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.step} className="bg-[#f8f4ec] p-8 sm:p-10">
                    <div className="flex items-start justify-between gap-4">
                      <span className={`${editorialSerif.className} text-6xl font-light leading-none text-brand-primary/10`}>
                        {item.step}
                      </span>
                      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-brand-primary text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className={`${editorialSerif.className} mt-8 text-3xl font-light leading-tight text-brand-primary`}>{item.title}</h3>
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
                    Browse cities with
                    <br />
                    stronger local pages
                  </>
                }
                body="City cards stay tied to the real directory footprint, so the homepage can spotlight where visitors already have inventory to explore."
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
                    className="group rounded-[28px] border border-[#eadfcd] bg-white p-6 shadow-[0_16px_36px_rgba(11,31,58,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#ff8a1f]/35 hover:shadow-[0_22px_48px_rgba(11,31,58,0.08)]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#eff4fb] text-brand-secondary transition group-hover:bg-[#ff8a1f]/10 group-hover:text-[#a56b21]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-brand-primary">{city.name}</h3>
                        <p className="mt-2 text-sm text-text-muted">
                          {city.count > 0 ? `${formatCompactNumber(city.count)} therapists` : `${city.stateCode} city page`}
                        </p>
                      </div>
                      <span className="rounded-full border border-[#ede3d5] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a98aa]">
                        {city.stateCode}
                      </span>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#a56b21] transition group-hover:gap-3">
                      Open city page
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(135deg,#17345d_0%,#0b1f3a_100%)] py-20 text-white sm:py-24">
          <div className="page-shell">
            <div className="mx-auto max-w-4xl rounded-[36px] border border-white/10 bg-white/[0.06] px-6 py-10 text-center shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-10">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[ShieldCheck, HeartHandshake, HandHeart].map((Icon, index) => (
                  <div
                    key={index}
                    className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/12 bg-white/[0.08] text-[#ffb570]"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                ))}
              </div>

              <h2 className={`${editorialSerif.className} mt-8 text-4xl font-light leading-[0.96] text-white sm:text-5xl lg:text-[3.7rem]`}>
                Every body.
                <br />
                Every identity.
                <br />
                Every need.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Inclusivity stays central to the brand. Verified, respectful profiles and stronger trust signals help more clients feel safe, seen, and ready to reach out.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/62">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Check className="h-4 w-4 text-[#ffb570]" />
                  Welcoming profile language
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Check className="h-4 w-4 text-[#ffb570]" />
                  Direct contact expectations
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Check className="h-4 w-4 text-[#ffb570]" />
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
                experience communicates
              </>
            }
            body="The goal of the redesign is simple: make MasseurMatch feel more premium, more trustworthy, and easier to understand at a glance."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((item, index) => (
              <article key={item.name} className="rounded-[28px] border border-[#eadfcd] bg-white p-7 shadow-[0_16px_36px_rgba(11,31,58,0.05)]">
                <div className="flex items-center gap-1 text-[#ff8a1f]">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className={`${editorialSerif.className} mt-6 text-2xl font-light leading-[1.4] text-brand-primary`}>
                  "{item.quote}"
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${
                      index === 0 ? "bg-brand-secondary text-white" : index === 1 ? "bg-[#ffcf9a] text-brand-primary" : "bg-[#ecf2fb] text-brand-primary"
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

        <section className="bg-[#f3ede2] py-20 sm:py-24">
          <div className="page-shell">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#ead9bf] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a56b21]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff8a1f]" />
                Get started
              </div>
              <h2 className={`${editorialSerif.className} mt-8 text-5xl font-light leading-[0.92] text-brand-primary sm:text-6xl lg:text-[4.8rem]`}>
                Your next session
                <br />
                starts here
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
                Browse verified therapists, compare specialties with less friction, and give the brand a first impression that feels as premium as the service.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Button asChild variant="default" size="lg" className="rounded-full px-8">
                  <Link href="/search">
                    Find a therapist
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <Link href="/pro/join">
                    List your practice
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
