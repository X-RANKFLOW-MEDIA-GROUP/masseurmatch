import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Heart, MapPin, Search, Shield, Sparkles, Star, TrendingUp } from "lucide-react";

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
      <section className="relative overflow-hidden border-b border-[#0B1F3A]/10 bg-[#FCFBF8] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(255,138,31,0.16),transparent_32%),radial-gradient(circle_at_84%_20%,rgba(11,31,58,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.04fr_0.96fr]">
          <div>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#0B1F3A]/15 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#0B1F3A]/70">
              <span className="h-2 w-2 rounded-full bg-[#FF8A1F]" />
              LGBTQ friendly directory
            </div>
            <h1 className="font-['Georgia','Times_New_Roman',serif] text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-[#0B1F3A] sm:text-6xl lg:text-7xl">
              Find LGBTQ friendly massage therapists near you.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#0B1F3A]/72 sm:text-xl">
              Discover independent massage therapists by city, specialty, profile details, and direct contact options. Built as a privacy first directory, not a booking marketplace.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/explore" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B1F3A] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(11,31,58,0.22)] transition hover:bg-[#14365F]">
                Browse therapists
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/join" className="inline-flex items-center justify-center rounded-full border border-[#0B1F3A]/18 bg-white/70 px-7 py-4 text-sm font-semibold text-[#0B1F3A] transition hover:bg-white">
                List your profile
              </Link>
            </div>
            <p className="mt-5 text-sm font-medium text-[#0B1F3A]/58">Directory only. No bookings, no payments, no platform managed sessions.</p>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              <div className="rounded-3xl border border-[#0B1F3A]/10 bg-white/70 p-5">
                <p className="font-['Georgia','Times_New_Roman',serif] text-3xl font-semibold">{totalTherapists || 500}+</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#0B1F3A]/55">Profiles</p>
              </div>
              <div className="rounded-3xl border border-[#0B1F3A]/10 bg-white/70 p-5">
                <p className="font-['Georgia','Times_New_Roman',serif] text-3xl font-semibold">{cityCount || 50}+</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#0B1F3A]/55">Cities</p>
              </div>
              <div className="rounded-3xl border border-[#0B1F3A]/10 bg-white/70 p-5">
                <p className="font-['Georgia','Times_New_Roman',serif] text-3xl font-semibold">0</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#0B1F3A]/55">Booking fees</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-[#0B1F3A]/12 bg-[#0B1F3A] p-5 shadow-[0_28px_90px_rgba(11,31,58,0.28)]">
            <div className="rounded-[1.75rem] bg-[#FCFBF8] p-5">
              <div className="rounded-3xl border border-[#0B1F3A]/10 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-[#FF8A1F]" />
                  <span className="text-sm font-semibold text-[#0B1F3A]">Search the directory</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#0B1F3A]/10 bg-[#FCFBF8] px-4 py-3 text-sm text-[#0B1F3A]/65">City</div>
                  <div className="rounded-2xl border border-[#0B1F3A]/10 bg-[#FCFBF8] px-4 py-3 text-sm text-[#0B1F3A]/65">Massage style</div>
                  <div className="rounded-2xl border border-[#0B1F3A]/10 bg-[#FCFBF8] px-4 py-3 text-sm text-[#0B1F3A]/65">Provider type</div>
                  <Link href="/explore" className="rounded-2xl bg-[#FF8A1F] px-4 py-3 text-center text-sm font-bold text-[#0B1F3A] transition hover:bg-[#ff9b42]">Search</Link>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {popularCities.slice(0, 6).map((city) => (
                  <Link key={city} href={cityHref(city)} className="rounded-2xl border border-[#0B1F3A]/10 bg-[#FCFBF8] px-4 py-3 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#FF8A1F]/70 hover:bg-white">
                    Massage therapists in {city}
                  </Link>
                ))}
              </div>
              <div className="mt-6 rounded-3xl bg-[#0B1F3A] p-5 text-white">
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <Shield className="h-5 w-5 text-[#FF8A1F]" />
                  Privacy first browsing
                </div>
                <p className="mt-3 text-sm leading-6 text-white/72">
                  MasseurMatch helps visitors compare profiles and contact therapists directly while keeping the platform focused on discovery, not payment or booking control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-5">
          {["LGBTQ friendly directory", "Direct therapist contact", "City based discovery", "Transparent profile details", "Privacy first browsing"].map((item) => (
            <div key={item} className="rounded-3xl border border-[#0B1F3A]/10 bg-white p-5 text-sm font-semibold text-[#0B1F3A] shadow-sm">
              <CheckCircle2 className="mb-3 h-5 w-5 text-[#FF8A1F]" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF8A1F]">Explore by city</p>
              <h2 className="mt-3 font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A] sm:text-5xl">Explore massage therapists by city.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-[#0B1F3A]/66">Browse independent massage therapists in major cities and discover profiles by location, service style, and availability signals.</p>
            </div>
            <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">Browse all cities <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {popularCities.map((city) => (
              <Link key={city} href={cityHref(city)} className="group rounded-[1.5rem] border border-[#0B1F3A]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#FF8A1F]/60 hover:shadow-xl">
                <MapPin className="h-5 w-5 text-[#FF8A1F]" />
                <h3 className="mt-4 font-['Georgia','Times_New_Roman',serif] text-2xl font-semibold">{city}</h3>
                <p className="mt-2 text-sm leading-6 text-[#0B1F3A]/62">Massage therapists in {city}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B1F3A] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF8A1F]">How MasseurMatch works</p>
          <h2 className="mt-3 max-w-3xl font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Simple discovery. Clear profiles. Direct contact.</h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              [Sparkles, "Search by city", "Find massage therapists based on location, profile details, and service information."],
              [Star, "Compare profiles", "Review photos, descriptions, specialties, incall or outcall options, and contact preferences."],
              [Heart, "Contact directly", "Reach out to the therapist outside the platform using their listed contact method."],
            ].map(([Icon, title, text]) => {
              const Component = Icon as typeof Sparkles;
              return (
                <div key={String(title)} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 transition hover:-translate-y-1 hover:bg-white/[0.07]">
                  <Component className="h-7 w-7 text-[#FF8A1F]" />
                  <h3 className="mt-6 font-['Georgia','Times_New_Roman',serif] text-3xl font-semibold">{title as string}</h3>
                  <p className="mt-4 leading-7 text-white/68">{text as string}</p>
                </div>
              );
            })}
          </div>
          <Link href="/how-it-works" className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#FF8A1F] px-7 py-4 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#ff9b42]">See How It Works <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {visibleProfiles.length > 0 ? (
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF8A1F]">Featured profiles</p>
                <h2 className="mt-3 font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A] sm:text-5xl">Featured massage therapist profiles.</h2>
                <p className="mt-4 max-w-2xl leading-7 text-[#0B1F3A]/66">Explore selected independent therapists with profile details, location, service style, and direct contact options.</p>
              </div>
              <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">View all profiles <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleProfiles.map((therapist) => (
                <Link key={therapist.id} href={`/therapists/${therapist.slug || therapist.id}`} className="group overflow-hidden rounded-[2rem] border border-[#0B1F3A]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-64 bg-[#0B1F3A]/8">
                    <Image src={therapist.avatar_url || therapist.profile_photo || "/images/placeholder-therapist.jpg"} alt={profileName(therapist)} fill className="object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/82 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="font-['Georgia','Times_New_Roman',serif] text-2xl font-semibold">{profileName(therapist)}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-white/78"><MapPin className="h-4 w-4" />{therapist.city || "United States"}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {therapist.verification_status === "verified" && <span className="rounded-full bg-[#0B1F3A]/8 px-3 py-1 text-xs font-semibold text-[#0B1F3A]">Verified</span>}
                      {therapist.lgbtq_affirming && <span className="rounded-full bg-[#FF8A1F]/12 px-3 py-1 text-xs font-semibold text-[#9A4A00]">LGBTQ+ affirming</span>}
                      {therapist.available_now && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Available now</span>}
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-[#0B1F3A]/65">{therapist.headline || therapist.bio || "Review profile details, services, pricing, and contact options directly."}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF8A1F]">Browse by massage style</p>
              <h2 className="mt-3 font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A] sm:text-5xl">Service pages built for discovery.</h2>
              <p className="mt-5 leading-7 text-[#0B1F3A]/66">Category links create a stronger internal SEO map and help visitors discover profiles by actual search intent.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {massageStyles.map((style) => (
                <Link key={style} href={styleHref(style)} className="rounded-3xl border border-[#0B1F3A]/10 bg-white p-5 font-semibold text-[#0B1F3A] shadow-sm transition hover:-translate-y-1 hover:border-[#FF8A1F]/60 hover:shadow-xl">
                  {style}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[2.5rem] border border-[#0B1F3A]/10 bg-white p-8 shadow-sm lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF8A1F]">SEO directory model</p>
            <h2 className="mt-3 font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A]">Find massage therapists in your city.</h2>
            <p className="mt-6 leading-8 text-[#0B1F3A]/68">
              MasseurMatch helps clients discover independent massage therapists through city based directory pages and detailed therapist profiles. Whether visitors are looking for relaxation massage, deep tissue massage, sports massage, mobile massage, incall, or outcall options, the directory makes it easier to compare profile details and contact therapists directly.
            </p>
            <p className="mt-5 leading-8 text-[#0B1F3A]/68">
              Unlike booking platforms, MasseurMatch does not manage appointments, payments, calendars, or therapist schedules. Each profile provides information submitted by the provider, helping clients make informed direct contact outside the platform.
            </p>
          </div>
          <div className="rounded-[2rem] bg-[#0B1F3A] p-8 text-white">
            <TrendingUp className="h-8 w-8 text-[#FF8A1F]" />
            <h3 className="mt-6 font-['Georgia','Times_New_Roman',serif] text-3xl font-semibold">Built for organic growth.</h3>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-white/72">
              <li>City based internal links</li>
              <li>Service category clusters</li>
              <li>Featured profile pathways</li>
              <li>FAQ content for long tail search</li>
              <li>Direct, indexable directory copy</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#FF8A1F]">FAQ</p>
          <h2 className="mt-3 text-center font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A] sm:text-5xl">Frequently asked questions.</h2>
          <div className="mt-10 divide-y divide-[#0B1F3A]/10 rounded-[2rem] border border-[#0B1F3A]/10 bg-white">
            {faqs.map(([question, answer]) => (
              <div key={question} className="p-6">
                <h3 className="font-semibold text-[#0B1F3A]">{question}</h3>
                <p className="mt-3 leading-7 text-[#0B1F3A]/66">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-[#0B1F3A] p-10 text-center text-white lg:p-16">
          <h2 className="font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Start exploring independent massage therapists.</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/68">Browse city pages, compare profiles, or create a therapist profile to grow visibility in a cleaner directory experience.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/explore" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF8A1F] px-7 py-4 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#ff9b42]">Browse therapists <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/join" className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10">List your profile</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
