import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPinned,
  PhoneCall,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { GuideArticle } from "@/app/guides/data";
import type { PublicTherapist } from "@/app/_lib/directory";
import type { CityData } from "@/data/cities";
import type { Competitor } from "@/lib/competitors";

type HomeStat = {
  label: string;
  value: string;
  helper: string;
};

type LaunchCityCard = {
  href: string;
  city: CityData;
  listingCount: number;
  routeCount: number;
  highlights: string[];
};

type IntentCard = {
  href: string;
  title: string;
  description: string;
  cityLabel: string;
};

type HomeSeoLandingProps = {
  stats: HomeStat[];
  launchCities: LaunchCityCard[];
  intentCards: IntentCard[];
  featuredTherapists: PublicTherapist[];
  comparisonLinks: Competitor[];
  guides: GuideArticle[];
  cityCoverageLine: string;
};

function formatPrice(amount: number | null) {
  if (!amount) {
    return "Contact for pricing";
  }

  return `From $${amount}`;
}

function buildLocationLabel(therapist: PublicTherapist) {
  return therapist.neighborhood_name || therapist.primary_area || therapist.city || "Featured market";
}

function buildProfileBadges(therapist: PublicTherapist) {
  const badges: string[] = [];

  if (therapist.available_now) {
    badges.push("Available now");
  }

  if (therapist.is_verified_identity || therapist.is_verified_profile || therapist.is_verified_photos) {
    badges.push("Verified signals");
  }

  if (therapist.outcall_price) {
    badges.push("Outcall");
  }

  if (therapist.incall_price) {
    badges.push("Incall");
  }

  return badges.slice(0, 3);
}

export function HomeSeoLanding({
  stats,
  launchCities,
  intentCards,
  featuredTherapists,
  comparisonLinks,
  guides,
  cityCoverageLine,
}: HomeSeoLandingProps) {
  return (
    <div className="bg-[#f4f6fa] text-text-primary">
      <section className="relative isolate overflow-hidden border-b border-white/40 bg-[linear-gradient(160deg,#08162b_0%,#0b1f3a_40%,#153e79_100%)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,179,71,0.22),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.12),transparent_24%),linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:auto,auto,72px_72px,72px_72px] opacity-90" />
        <div className="page-shell relative py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,430px)] lg:items-start">
            <div>
              <span className="eyebrow-chip eyebrow-chip-inverse">
                Structured for trust, speed, and local discovery
              </span>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-7xl">
                Verified male massage therapists in Dallas, Miami, Chicago, Houston, and top US cities.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/78 sm:text-lg">
                Search premium profiles, compare deep tissue, Swedish, sports recovery, incall, and outcall options,
                and contact providers directly through a city-first directory built to feel safer, cleaner, and faster.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
                {cityCoverageLine}
              </p>

              <form
                action="/search"
                className="mt-8 rounded-[2rem] border border-white/12 bg-white/[0.08] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.2)] backdrop-blur-xl"
              >
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                  <label className="flex min-h-14 items-center rounded-[1.4rem] border border-white/8 bg-white/[0.06] px-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/54">
                      Service or specialty
                    </span>
                    <input
                      name="keyword"
                      type="text"
                      placeholder="Deep tissue, outcall, Swedish, sports recovery"
                      className="ml-4 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/38"
                    />
                  </label>

                  <label className="flex min-h-14 items-center rounded-[1.4rem] border border-white/8 bg-white/[0.06] px-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/54">
                      City
                    </span>
                    <input
                      name="city"
                      type="text"
                      placeholder="Dallas"
                      className="ml-4 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/38"
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.4rem] bg-[linear-gradient(135deg,#ff8a1f,#ffb347)] px-6 text-sm font-semibold text-slate-950 shadow-[0_18px_48px_rgba(255,138,31,0.36)] transition hover:translate-y-[-1px]"
                  >
                    Search directory
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {[
                  { href: "/dallas", label: "Dallas city page" },
                  { href: "/dallas/wellness/deep-tissue", label: "Deep tissue in Dallas" },
                  { href: "/dallas/wellness/outcall", label: "Outcall massage" },
                  { href: "/safety", label: "Safety guidance" },
                  { href: "/compare", label: "Compare alternatives" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/74 transition hover:border-white/22 hover:bg-white/[0.12] hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <aside className="rounded-[2rem] border border-white/12 bg-white/[0.08] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-soft">
                Directory signals
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-4"
                  >
                    <p className="text-3xl font-semibold tracking-[-0.05em] text-white">{stat.value}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{stat.label}</p>
                    <p className="mt-1 text-xs leading-6 text-white/62">{stat.helper}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))] p-5">
                <p className="text-sm font-semibold text-white">Why this homepage is easier to trust</p>
                <ul className="mt-4 space-y-3 text-sm text-white/74">
                  {[
                    "Verified signals and visible session types are surfaced early.",
                    "City pages, service pages, guides, and comparison pages reinforce internal linking.",
                    "Users can move from broad discovery to high-intent local pages in one hop.",
                    "Direct contact remains clear without forcing a booking workflow.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-soft" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="page-shell py-8 sm:py-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "Verification-first discovery",
              body: "Profiles highlight identity, profile, and photo review signals so trust shows up before the click.",
            },
            {
              icon: PhoneCall,
              title: "Direct contact clarity",
              body: "Users compare pricing, session type, and availability first, then contact therapists directly to confirm fit.",
            },
            {
              icon: MapPinned,
              title: "City-first landing pages",
              body: "Local routes for Dallas, Plano, Irving, Highland Park, and expansion markets support real search intent.",
            },
            {
              icon: Clock3,
              title: "High-intent service paths",
              body: "Deep tissue, Swedish, sports recovery, incall, and outcall routes capture searches closer to conversion.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[1.75rem] border border-border-subtle bg-white p-6 shadow-[0_18px_42px_rgba(11,31,58,0.05)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-brand-primary/8 text-brand-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-brand-primary">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-shell py-10 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">City cluster</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-brand-primary sm:text-4xl">
              Start with the strongest local pages.
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              These city pages are built to rank for local massage discovery while still routing users deeper into verified profiles, service intent pages, trust guidance, and comparison content.
            </p>
          </div>

          <Link
            href="/therapists"
            className="inline-flex items-center gap-2 text-sm font-semibold text-action-secondary transition hover:gap-3"
          >
            Browse all listings
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {launchCities.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group rounded-[1.9rem] border border-border-subtle bg-white p-6 shadow-[0_18px_42px_rgba(11,31,58,0.05)] transition hover:-translate-y-1 hover:border-brand-accent/40"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-brand-primary/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                  {entry.city.stateCode}
                </span>
                <span className="rounded-full bg-brand-soft/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary">
                  {entry.routeCount} live routes
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.04em] text-brand-primary">
                    {entry.city.name}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {entry.listingCount > 0
                      ? `${entry.listingCount} visible profiles in the current directory snapshot`
                      : "Launch market with canonical local landing pages already live"}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-action-secondary transition group-hover:translate-x-1" />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {entry.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-border-subtle bg-[#f8fafc] px-3 py-1 text-xs font-medium text-text-secondary"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell py-10 sm:py-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">High-intent searches</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-brand-primary sm:text-4xl">
            Service pages that meet people closer to booking.
          </h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            The strongest SEO pages are not generic directories. They match city plus service intent, then connect users to safer profile discovery, direct contact, and adjacent routes without forcing faceted search pages to rank.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {intentCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-[1.8rem] border border-border-subtle bg-white p-6 shadow-[0_18px_42px_rgba(11,31,58,0.05)] transition hover:-translate-y-1 hover:border-brand-accent/40"
            >
              <div className="inline-flex rounded-full border border-border-subtle bg-[#f8fafc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-action-secondary">
                {card.cityLabel}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-brand-primary">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{card.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-action-secondary transition group-hover:gap-3">
                Open landing page
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell py-10 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">Featured profiles</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-brand-primary sm:text-4xl">
              Trust-led profiles with clear session details.
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Instead of forcing users through a marketplace wall, the directory keeps the most useful trust signals visible: location context, availability, session type, and straightforward price anchors.
            </p>
          </div>
          <Link
            href="/safety"
            className="inline-flex items-center gap-2 text-sm font-semibold text-action-secondary transition hover:gap-3"
          >
            Read safety guidance
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredTherapists.map((therapist, index) => {
            const profileHref = `/therapists/${therapist.slug || therapist.id}`;
            const badges = buildProfileBadges(therapist);
            const specialties = (therapist.specialties || []).slice(0, 3);

            return (
              <Link
                key={profileHref}
                href={profileHref}
                className="group overflow-hidden rounded-[1.9rem] border border-border-subtle bg-white shadow-[0_18px_42px_rgba(11,31,58,0.06)] transition hover:-translate-y-1 hover:border-brand-accent/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(160deg,#dce6f7_0%,#f6ede1_100%)]">
                  {therapist.avatar_url ? (
                    <Image
                      src={therapist.avatar_url}
                      alt={therapist.display_name || therapist.full_name || "Featured therapist"}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl font-semibold text-brand-primary/30">
                      {(therapist.display_name || therapist.full_name || `T${index + 1}`)
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {therapist._tier ? (
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary">
                        {therapist._tier}
                      </span>
                    ) : null}
                    {(therapist.is_verified_identity || therapist.is_verified_profile) ? (
                      <span className="rounded-full bg-[rgba(15,118,110,0.88)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                        Verified
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-brand-primary">
                        {therapist.display_name || therapist.full_name || "Featured therapist"}
                      </h3>
                      <p className="mt-2 text-sm text-text-secondary">
                        {buildLocationLabel(therapist)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/6 px-3 py-1 text-xs font-semibold text-brand-secondary">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {therapist.review_count || 0} reviews
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-text-secondary">
                    {therapist.bio || "Premium profile with direct contact and service details."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full border border-border-subtle bg-[#f8fafc] px-3 py-1 text-xs font-medium text-text-secondary"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full bg-brand-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-secondary"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
                    <p className="text-sm font-semibold text-brand-primary">
                      {formatPrice(therapist.incall_price || therapist.outcall_price)}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-action-secondary transition group-hover:gap-3">
                      View profile
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="page-shell py-10 sm:py-12">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-[2rem] border border-border-subtle bg-white p-7 shadow-[0_18px_42px_rgba(11,31,58,0.05)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-brand-primary/8 text-brand-secondary">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">Comparison hub</p>
                <h2 className="mt-1 text-2xl font-semibold text-brand-primary">
                  Capture competitor searches before users leave.
                </h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-text-secondary">
              Comparison pages are one of the fastest ways to win high-intent traffic from users already evaluating alternatives. Each page links back into city, safety, pricing, and registration flows so search intent becomes a full-site entry point.
            </p>
            <div className="mt-6 space-y-3">
              {comparisonLinks.map((competitor) => (
                <Link
                  key={competitor.slug}
                  href={`/compare/${competitor.slug}`}
                  className="group flex items-start justify-between gap-4 rounded-[1.4rem] border border-border-subtle bg-[#fafcff] px-4 py-4 transition hover:border-brand-accent/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-primary">
                      MasseurMatch vs {competitor.name}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      {competitor.hubHeadline}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-action-secondary transition group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border-subtle bg-white p-7 shadow-[0_18px_42px_rgba(11,31,58,0.05)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-brand-primary/8 text-brand-secondary">
                <BookOpenText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">Guides</p>
                <h2 className="mt-1 text-2xl font-semibold text-brand-primary">
                  Helpful content that feeds city and service pages.
                </h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-text-secondary">
              Guides help capture earlier research queries while still routing visitors back into city pages, session-type pages, and trust content. That gives Google and Bing more topical context without turning the site into thin SEO filler.
            </p>
            <div className="mt-6 space-y-3">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group flex items-start justify-between gap-4 rounded-[1.4rem] border border-border-subtle bg-[#fafcff] px-4 py-4 transition hover:border-brand-accent/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-primary">{guide.h1}</p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">{guide.description}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-action-secondary transition group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-10 sm:py-12">
        <div className="rounded-[2rem] border border-border-subtle bg-[linear-gradient(135deg,#ffffff_0%,#eef3fb_100%)] p-7 shadow-[0_18px_42px_rgba(11,31,58,0.05)]">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">FAQ</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-brand-primary">
                Common questions about the directory.
              </h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                Clear answers reduce bounce, make trust signals easier to understand, and help search engines match the page to real user questions.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/safety"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-secondary"
                >
                  Trust and safety
                  <ShieldCheck className="h-4 w-4" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-white px-5 py-3 text-sm font-semibold text-brand-primary transition hover:border-brand-accent/40"
                >
                  Get listed
                  <Sparkles className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "How do I find verified male massage therapists near me?",
                  answer:
                    "Start with a city page, then compare specialties, incall or outcall options, visible pricing, reviews, and profile quality before contacting a therapist directly.",
                },
                {
                  question: "Which cities have live MasseurMatch landing pages?",
                  answer:
                    "Current launch pages include Dallas, Plano, Irving, and Highland Park, with profile coverage already expanding into Austin, Houston, Miami, Chicago, and other major US markets.",
                },
                {
                  question: "Can I compare deep tissue, Swedish, hotel, and outcall options?",
                  answer:
                    "Yes. The directory includes city-plus-service routes for deep tissue, Swedish, sports recovery, hotel massage, mobile massage, incall, and outcall discovery.",
                },
                {
                  question: "Does MasseurMatch handle booking or payments?",
                  answer:
                    "No. MasseurMatch is a discovery directory. Users review profiles and contact therapists directly to confirm rates, boundaries, timing, location, and availability.",
                },
              ].map((item) => (
                <article
                  key={item.question}
                  className="rounded-[1.5rem] border border-border-subtle bg-white px-5 py-5 shadow-[0_10px_24px_rgba(11,31,58,0.04)]"
                >
                  <h3 className="text-lg font-semibold text-brand-primary">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
