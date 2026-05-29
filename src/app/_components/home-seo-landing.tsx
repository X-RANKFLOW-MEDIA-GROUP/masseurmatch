import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  ChevronRight,
  Clock3,
  MapPinned,
  PhoneCall,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";
import type { GuideArticle } from "@/app/guides/data";
import type { PublicTherapist } from "@/app/_lib/directory";
import type { Competitor } from "@/lib/competitors";
import { US_CITIES } from "@/data/cities";
import type { LaunchCityCard } from "@/lib/marketing/home-data";
import { CityCaseStudies } from "@/components/marketing/CityCaseStudies";
import { FeaturedTherapistsEditorial } from "@/components/marketing/FeaturedTherapistsEditorial";

type IntentCard = {
  href: string;
  title: string;
  description: string;
  cityLabel: string;
};

type HomeSeoLandingProps = {
  launchCities: LaunchCityCard[];
  intentCards: IntentCard[];
  featuredTherapists: PublicTherapist[];
  comparisonLinks: Competitor[];
  guides: GuideArticle[];
  cityCoverageLine: string;
};


export function HomeSeoLanding({
  launchCities,
  intentCards,
  featuredTherapists,
  comparisonLinks,
  guides,
  cityCoverageLine,
}: HomeSeoLandingProps) {
  const keywordRibbon = [
    "Deep Tissue Massage",
    "Swedish Massage",
    "Sports Recovery",
    "Incall Session",
    "Outcall Massage",
    "Available Now",
    "Verified Therapist",
    "LGBTQ+ Friendly",
  ];

  return (
    <div className="bg-[#f4f6fa] text-text-primary">
      <section className="overflow-hidden border-b border-white/20 bg-[#06152a] py-2">
        <div className="whitespace-nowrap [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="inline-flex min-w-full animate-[marquee_24s_linear_infinite] gap-6 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#b6d7ff]">
            {[...keywordRibbon, ...keywordRibbon].map((keyword, index) => (
              <span key={`${keyword}-${index}`} className="rounded-full border border-[#2a588f] bg-[#0c2342] px-4 py-1.5">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="relative isolate overflow-hidden border-b border-white/40 bg-[linear-gradient(160deg,#08162b_0%,#0b1f3a_40%,#153e79_100%)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,179,71,0.22),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.12),transparent_24%),linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:auto,auto,72px_72px,72px_72px] opacity-90" />
        <div className="page-shell relative py-12 sm:py-16 lg:py-20">
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

      <CityCaseStudies launchCities={launchCities} />

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

      <FeaturedTherapistsEditorial featuredTherapists={featuredTherapists} />

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
                    "MasseurMatch covers 80+ US cities including Dallas, Miami, New York, Los Angeles, Chicago, Houston, Atlanta, Washington DC, San Francisco, Seattle, Denver, Phoenix, Las Vegas, Boston, New Orleans, and more.",
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
                {
                  question: "Is MasseurMatch a better alternative to MasseurFinder or RentMasseur?",
                  answer:
                    "MasseurMatch is a modern alternative to legacy directories like MasseurFinder and RentMasseur. It offers cleaner profile presentation, stronger local SEO, city-first landing pages, and a professional wellness-forward brand without the mixed-intent marketplace feel.",
                },
                {
                  question: "Is MasseurMatch LGBTQ+ affirming?",
                  answer:
                    "Yes. MasseurMatch is built as an inclusive LGBTQ+-affirming platform. Therapists signal their affirmation and clients can filter for it — creating a safer, more targeted discovery experience.",
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

      {/* City coverage grid — full MasseurFinder market parity, every US city */}
      <section className="page-shell py-10 sm:py-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">City coverage</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-brand-primary sm:text-4xl">
            Find a therapist in your city.
          </h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            MasseurMatch covers every major US market — the same cities served by MasseurFinder and RentMasseur,
            plus growing coverage in hundreds more. Select your city to browse verified therapists, compare
            session types, and contact directly.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[...US_CITIES]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((city) => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="group rounded-[1rem] border border-border-subtle bg-white px-3 py-2.5 text-center shadow-[0_6px_16px_rgba(11,31,58,0.04)] transition hover:-translate-y-0.5 hover:border-brand-accent/40"
              >
                <p className="text-sm font-semibold text-brand-primary group-hover:text-brand-secondary">
                  {city.name}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-text-secondary">{city.stateCode}</p>
              </Link>
            ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/cities"
            className="inline-flex items-center gap-2 text-sm font-semibold text-action-secondary transition hover:gap-3"
          >
            View all cities &amp; service pages
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Why switch section — captures competitor comparison searches */}
      <section className="page-shell py-10 sm:py-12">
        <div className="rounded-[2rem] border border-border-subtle bg-[linear-gradient(160deg,#06152a_0%,#0b1f3a_100%)] p-8 text-white shadow-[0_18px_42px_rgba(11,31,58,0.12)]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-soft">
                Looking for a MasseurFinder or RentMasseur alternative?
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Why therapists and clients choose MasseurMatch.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/75">
                MasseurMatch is the modern alternative to legacy niche directories. Whether you currently use
                MasseurFinder, RentMasseur, MassageFinder, FindAMasseur, or another platform, MasseurMatch offers
                a cleaner experience built for today&rsquo;s search behavior.
              </p>
              <div className="mt-6">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ff8a1f,#ffb347)] px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_rgba(255,138,31,0.32)] transition hover:translate-y-[-1px]"
                >
                  Compare MasseurMatch vs alternatives
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {[
                {
                  icon: Star,
                  title: "Premium profile quality",
                  body: "Cleaner design, trust signals, and richer content than legacy directories like MasseurFinder.",
                },
                {
                  icon: TrendingUp,
                  title: "City-first local SEO",
                  body: "Local landing pages built to rank for city and service intent — not just brand searches.",
                },
                {
                  icon: ShieldCheck,
                  title: "Wellness-forward brand",
                  body: "A professional brand context that sets the right tone vs mixed-intent platforms like RentMasseur.",
                },
                {
                  icon: Users,
                  title: "LGBTQ+-affirming focus",
                  body: "Built around inclusive and affirming discovery that broader directories often lack.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5"
                  >
                    <Icon className="h-5 w-5 text-brand-soft" />
                    <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-xs leading-6 text-white/65">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* For Therapists CTA */}
      <section className="page-shell pb-14 pt-4 sm:pb-16">
        <div className="rounded-[2rem] border border-border-subtle bg-white p-7 shadow-[0_18px_42px_rgba(11,31,58,0.05)]">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-action-secondary">For therapists</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-brand-primary">
                Get your profile in front of local search.
              </h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                MasseurMatch gives independent massage therapists a premium, city-optimized public profile backed by
                a growing SEO ecosystem of city pages, service routes, and comparison content.
                A better alternative to listing on MasseurFinder or RentMasseur alone.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link
                href="/for-therapists"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(11,31,58,0.2)] transition hover:bg-brand-secondary"
              >
                List your practice
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border-strong px-7 py-3.5 text-sm font-semibold text-brand-primary transition hover:border-brand-accent/40"
              >
                View pricing
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
