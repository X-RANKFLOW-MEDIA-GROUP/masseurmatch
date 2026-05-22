import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, MapPin, Search, Shield, Sparkles, Star, Heart, TrendingUp } from "lucide-react";

import type { PublicTherapist as Profile } from "@/app/_lib/directory";

interface EditorialHomepageProps {
  featuredTherapists: Profile[];
  totalTherapists: number;
  cityCount: number;
}

const popularCities = ["New York", "Los Angeles", "Miami", "Chicago", "San Francisco", "Houston", "Atlanta", "Las Vegas", "Seattle", "Washington DC"];

const massageStyles = ["Deep tissue massage", "Swedish massage", "Sports massage", "Relaxation massage", "Therapeutic massage", "Mobile massage", "Incall massage", "Outcall massage"];

const faqs = [
  ["What is MasseurMatch?", "MasseurMatch is a premium directory where independent massage therapists can publish profiles and clients can browse by city, service style, and profile details."],
  ["Does MasseurMatch book appointments?", "No. MasseurMatch does not manage bookings, appointments, calendars, payments, or sessions. Visitors contact therapists directly outside the platform."],
  ["How do I find a massage therapist near me?", "Start by choosing a city, compare profile details, review specialties and contact options, then contact the therapist directly."],
  ["Can therapists create a profile?", "Yes. Independent therapists can create a profile to improve visibility in city based directory pages and search results."],
];

function profileName(profile: Profile) {
  return profile.display_name || profile.full_name || "Massage Therapist";
}

function cityHref(city: string) {
  return `/${city.toLowerCase().replace(/\s+/g, "-")}`;
}

function styleHref(style: string) {
  return `/massage-styles/${style.toLowerCase().replace(/\s+/g, "-")}`;
}

export function EditorialHomepage({ featuredTherapists, totalTherapists, cityCount }: EditorialHomepageProps) {
  const visibleProfiles = featuredTherapists.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#FCFBF8] text-[#0B1F3A]">

      {/* ── HERO ── dark navy, bold, masculine */}
      <section className="relative overflow-hidden bg-[#0B1F3A] px-4 py-28 sm:px-6 lg:px-8 lg:py-36">
        {/* Atmospheric glows */}
        <div className="pointer-events-none absolute -right-48 -top-48 h-[640px] w-[640px] rounded-full bg-[#FF8A1F]/[0.07] blur-[120px]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[480px] w-[480px] rounded-full bg-[#1E4B8F]/50 blur-[90px]" />
        {/* Subtle diagonal grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: copy */}
          <div>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              <span className="h-2 w-2 rounded-full bg-[#FF8A1F]" />
              LGBTQ+ affirming directory
            </div>

            <h1 className="font-['Georgia','Times_New_Roman',serif] text-5xl font-semibold leading-[1.0] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.25rem]">
              Find LGBTQ+&nbsp;affirming massage therapists near&nbsp;you.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-white/60 sm:text-xl">
              Discover independent massage therapists by city, specialty, and direct contact. A privacy-first directory — not a booking platform.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF8A1F] px-7 py-4 text-sm font-bold text-[#0B1F3A] shadow-[0_8px_32px_rgba(255,138,31,0.38)] transition-all duration-300 hover:bg-[#ff9b42] hover:shadow-[0_14px_40px_rgba(255,138,31,0.50)] hover:scale-[1.02]"
              >
                Browse therapists
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/for-therapists"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/30"
              >
                List your profile
              </Link>
            </div>

            <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-white/30">
              No bookings · No payments · No platform fees
            </p>

            {/* Stats */}
            <div className="mt-12 grid max-w-sm grid-cols-3 gap-3">
              {[
                [totalTherapists || 500, "Profiles"],
                [cityCount || 50, "Cities"],
                ["$0", "Booking fees"],
              ].map(([value, label]) => (
                <div
                  key={String(label)}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm"
                >
                  <p className="font-['Georgia','Times_New_Roman',serif] text-3xl font-semibold text-white">
                    {value}+
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">{String(label)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: search card */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_32px_80px_rgba(0,0,0,0.50)] backdrop-blur-sm">
            <div className="rounded-[1.5rem] bg-[#FCFBF8] p-4">
              <div className="rounded-2xl border border-[#0B1F3A]/10 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-[#FF8A1F]" />
                  <span className="text-sm font-semibold text-[#0B1F3A]">Search the directory</span>
                </div>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#0B1F3A]/10 bg-[#FCFBF8] px-4 py-3 text-sm text-[#0B1F3A]/50">City</div>
                  <div className="rounded-xl border border-[#0B1F3A]/10 bg-[#FCFBF8] px-4 py-3 text-sm text-[#0B1F3A]/50">Massage style</div>
                  <div className="rounded-xl border border-[#0B1F3A]/10 bg-[#FCFBF8] px-4 py-3 text-sm text-[#0B1F3A]/50">Provider type</div>
                  <Link
                    href="/explore"
                    className="rounded-xl bg-[#FF8A1F] px-4 py-3 text-center text-sm font-bold text-[#0B1F3A] transition hover:bg-[#ff9b42]"
                  >
                    Search
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {popularCities.slice(0, 6).map((city) => (
                  <Link
                    key={city}
                    href={cityHref(city)}
                    className="rounded-xl border border-[#0B1F3A]/10 bg-white px-3 py-2.5 text-xs font-semibold text-[#0B1F3A] transition hover:border-[#FF8A1F]/60 hover:bg-[#FCFBF8]"
                  >
                    {city}
                  </Link>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-[#0B1F3A] p-4 text-white">
                <div className="flex items-center gap-2.5 text-sm font-semibold">
                  <Shield className="h-4 w-4 text-[#FF8A1F]" />
                  Privacy-first browsing
                </div>
                <p className="mt-2 text-xs leading-5 text-white/60">
                  Browse profiles and contact therapists directly. No booking management, no payment control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST PILLARS ── */}
      <section className="border-b border-[#0B1F3A]/8 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-5">
          {[
            "LGBTQ+ affirming",
            "Direct therapist contact",
            "City-based discovery",
            "Transparent profiles",
            "Privacy-first browsing",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-[#0B1F3A]/8 bg-[#FCFBF8] p-5 text-sm font-semibold text-[#0B1F3A]">
              <CheckCircle2 className="mb-3 h-5 w-5 text-[#FF8A1F]" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ── CITIES ── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FF8A1F]">Explore by city</p>
              <h2 className="mt-3 font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A] sm:text-5xl">
                Massage therapists by city.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-[#0B1F3A]/60">
                Browse independent massage therapists in major U.S. cities by location, service style, and availability.
              </p>
            </div>
            <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A] hover:text-[#FF8A1F] transition-colors">
              Browse all cities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {popularCities.map((city) => (
              <Link
                key={city}
                href={cityHref(city)}
                className="group rounded-2xl border border-[#0B1F3A]/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FF8A1F]/50 hover:shadow-[0_12px_40px_rgba(11,31,58,0.12)]"
              >
                <MapPin className="h-5 w-5 text-[#FF8A1F]" />
                <h3 className="mt-4 font-['Georgia','Times_New_Roman',serif] text-2xl font-semibold text-[#0B1F3A]">{city}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#0B1F3A]/45">View therapists</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── dark navy */}
      <section className="bg-[#0B1F3A] px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FF8A1F]">How MasseurMatch works</p>
          <h2 className="mt-3 max-w-3xl font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Simple discovery. Clear profiles. Direct contact.
          </h2>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {[
              [Sparkles, "Search by city", "Find massage therapists by location, profile details, and service information."],
              [Star, "Compare profiles", "Review photos, descriptions, specialties, incall or outcall options, and contact preferences."],
              [Heart, "Contact directly", "Reach the therapist using their listed contact method — no middleman, no booking fees."],
            ].map(([Icon, title, text]) => {
              const Component = Icon as typeof Sparkles;
              return (
                <div
                  key={String(title)}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08] hover:border-white/20"
                >
                  <Component className="h-7 w-7 text-[#FF8A1F]" />
                  <h3 className="mt-6 font-['Georgia','Times_New_Roman',serif] text-2xl font-semibold">{title as string}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/60">{text as string}</p>
                </div>
              );
            })}
          </div>
          <Link
            href="/how-it-works"
            className="mt-12 inline-flex items-center gap-2 rounded-full bg-[#FF8A1F] px-7 py-4 text-sm font-bold text-[#0B1F3A] transition-all duration-300 hover:bg-[#ff9b42] hover:shadow-[0_8px_28px_rgba(255,138,31,0.40)]"
          >
            See how it works <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── FEATURED PROFILES ── */}
      {visibleProfiles.length > 0 && (
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FF8A1F]">Featured profiles</p>
                <h2 className="mt-3 font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A] sm:text-5xl">
                  Featured massage therapist profiles.
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-[#0B1F3A]/60">
                  Selected independent therapists with profile details, location, service style, and direct contact options.
                </p>
              </div>
              <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A] hover:text-[#FF8A1F] transition-colors">
                View all profiles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleProfiles.map((therapist) => (
                <Link
                  key={therapist.id}
                  href={`/therapists/${therapist.slug || therapist.id}`}
                  className="group overflow-hidden rounded-2xl border border-[#0B1F3A]/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(11,31,58,0.14)] hover:border-[#0B1F3A]/20"
                >
                  <div className="relative h-64 bg-[#0B1F3A]/8">
                    <Image
                      src={therapist.avatar_url || therapist.profile_photo || "/images/placeholder-therapist.jpg"}
                      alt={profileName(therapist)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/85 via-[#0B1F3A]/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="font-['Georgia','Times_New_Roman',serif] text-xl font-semibold">{profileName(therapist)}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
                        <MapPin className="h-3.5 w-3.5" />
                        {therapist.city || "United States"}
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {therapist.verification_status === "verified" && (
                        <span className="rounded-full bg-[#0B1F3A]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F3A]">
                          Verified
                        </span>
                      )}
                      {therapist.lgbtq_affirming && (
                        <span className="rounded-full bg-[#FF8A1F]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A4A00]">
                          LGBTQ+ affirming
                        </span>
                      )}
                      {therapist.available_now && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                          Available
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-[#0B1F3A]/60">
                      {therapist.headline || therapist.bio || "Review profile details, services, pricing, and contact options directly."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SERVICE STYLES ── */}
      <section className="border-t border-[#0B1F3A]/8 bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FF8A1F]">Browse by service</p>
              <h2 className="mt-3 font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A] sm:text-5xl">
                Discover by massage style.
              </h2>
              <p className="mt-5 leading-7 text-[#0B1F3A]/60">
                Service category pages help visitors discover profiles by actual search intent — deep tissue, Swedish, sports, mobile, and more.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {massageStyles.map((style) => (
                <Link
                  key={style}
                  href={styleHref(style)}
                  className="group flex items-center justify-between rounded-xl border border-[#0B1F3A]/10 bg-[#FCFBF8] px-5 py-4 font-semibold text-[#0B1F3A] transition-all duration-200 hover:border-[#FF8A1F]/50 hover:bg-white hover:shadow-md"
                >
                  {style}
                  <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 text-[#FF8A1F]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO / EDITORIAL BLOCK ── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-[#0B1F3A]/10 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FF8A1F]">About MasseurMatch</p>
            <h2 className="mt-3 font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A]">
              Find massage therapists in your city.
            </h2>
            <p className="mt-6 leading-8 text-[#0B1F3A]/65">
              MasseurMatch helps clients discover independent massage therapists through city-based directory pages and detailed therapist profiles. Whether visitors are looking for deep tissue, Swedish, sports, mobile, incall, or outcall options, the directory makes it easier to compare profiles and contact therapists directly.
            </p>
            <p className="mt-5 leading-8 text-[#0B1F3A]/65">
              Unlike booking platforms, MasseurMatch does not manage appointments, payments, calendars, or therapist schedules. Each profile provides information submitted by the provider, helping clients make informed direct contact outside the platform.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0B1F3A] p-8 text-white">
            <TrendingUp className="h-8 w-8 text-[#FF8A1F]" />
            <h3 className="mt-6 font-['Georgia','Times_New_Roman',serif] text-2xl font-semibold">Built for organic growth.</h3>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-white/65">
              {["City-based internal links", "Service category clusters", "Featured profile pathways", "FAQ content for long-tail search", "Direct, indexable directory copy"].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A1F] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-[#0B1F3A]/8 bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-[#FF8A1F]">FAQ</p>
          <h2 className="mt-3 text-center font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A] sm:text-5xl">
            Frequently asked questions.
          </h2>
          <div className="mt-10 divide-y divide-[#0B1F3A]/8 rounded-2xl border border-[#0B1F3A]/10 bg-[#FCFBF8] overflow-hidden">
            {faqs.map(([question, answer]) => (
              <div key={question} className="p-6 sm:p-8">
                <h3 className="font-semibold text-[#0B1F3A]">{question}</h3>
                <p className="mt-3 leading-7 text-[#0B1F3A]/60">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#0B1F3A] p-10 text-center text-white lg:p-16">
          <div className="pointer-events-none absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-[#FF8A1F]/[0.08] blur-[80px]" />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-[300px] w-[300px] rounded-full bg-[#1E4B8F]/40 blur-[60px]" />
          <div className="relative">
            <h2 className="font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Start exploring independent massage therapists.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/55">
              Browse city pages, compare profiles, or create a therapist profile to grow visibility in a premium directory experience.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF8A1F] px-7 py-4 text-sm font-bold text-[#0B1F3A] shadow-[0_8px_28px_rgba(255,138,31,0.40)] transition-all duration-300 hover:bg-[#ff9b42] hover:shadow-[0_14px_40px_rgba(255,138,31,0.55)]"
              >
                Browse therapists <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/for-therapists"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-white"
              >
                List your profile
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
