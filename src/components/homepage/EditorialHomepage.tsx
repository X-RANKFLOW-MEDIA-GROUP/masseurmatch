import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, MapPin, Search, Shield, Sparkles, Star } from "lucide-react";

import type { PublicTherapist as Profile } from "@/app/_lib/directory";

interface EditorialHomepageProps {
  featuredTherapists: Profile[];
  totalTherapists: number;
  cityCount: number;
}

const cities = ["Dallas", "Houston", "Austin", "Miami", "Los Angeles", "New York", "Chicago", "San Francisco"];

function profileName(profile: Profile) {
  return profile.display_name || profile.full_name || "Massage Therapist";
}

export function EditorialHomepage({ featuredTherapists, totalTherapists, cityCount }: EditorialHomepageProps) {
  return (
    <main className="min-h-screen bg-[#F7F1E8] text-[#0B1F3A]">
      <section className="relative overflow-hidden border-b border-[#0B1F3A]/10 bg-[#F7F1E8] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,31,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(11,31,58,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#0B1F3A]/15 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#0B1F3A]/70">
              <span className="h-2 w-2 rounded-full bg-[#FF8A1F]" />
              Premium therapist directory
            </div>
            <h1 className="font-['Georgia','Times_New_Roman',serif] text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[#0B1F3A] sm:text-6xl lg:text-7xl">
              Find verified massage therapists without the noise.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#0B1F3A]/72 sm:text-xl">
              Browse trusted independent therapists, compare real profile details, and contact providers directly. No booking fees, no exposed private contact details, no confusing marketplace layers.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/explore" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B1F3A] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(11,31,58,0.22)] transition hover:bg-[#14365F]">
                Explore therapists
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center rounded-full border border-[#0B1F3A]/18 bg-white/65 px-7 py-4 text-sm font-semibold text-[#0B1F3A] transition hover:bg-white">
                How it works
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              <div className="rounded-3xl border border-[#0B1F3A]/10 bg-white/55 p-5">
                <p className="font-['Georgia','Times_New_Roman',serif] text-3xl font-semibold">{totalTherapists || 500}+</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#0B1F3A]/55">Profiles</p>
              </div>
              <div className="rounded-3xl border border-[#0B1F3A]/10 bg-white/55 p-5">
                <p className="font-['Georgia','Times_New_Roman',serif] text-3xl font-semibold">{cityCount || 50}+</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#0B1F3A]/55">Cities</p>
              </div>
              <div className="rounded-3xl border border-[#0B1F3A]/10 bg-white/55 p-5">
                <p className="font-['Georgia','Times_New_Roman',serif] text-3xl font-semibold">0</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#0B1F3A]/55">Booking fees</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-[#0B1F3A]/12 bg-[#0B1F3A] p-5 shadow-[0_28px_90px_rgba(11,31,58,0.28)]">
            <div className="rounded-[1.75rem] bg-[#FBF7EF] p-5">
              <div className="flex items-center gap-3 rounded-2xl border border-[#0B1F3A]/10 bg-white p-4">
                <Search className="h-5 w-5 text-[#FF8A1F]" />
                <span className="text-sm text-[#0B1F3A]/60">Search by city, specialty, or provider</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {cities.map((city) => (
                  <Link key={city} href={`/${city.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-2xl border border-[#0B1F3A]/10 bg-[#F7F1E8] px-4 py-3 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#FF8A1F]/70 hover:bg-white">
                    {city}
                  </Link>
                ))}
              </div>
              <div className="mt-6 rounded-3xl bg-[#0B1F3A] p-5 text-white">
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <Shield className="h-5 w-5 text-[#FF8A1F]" />
                  Reviewed profiles. Private contact flow.
                </div>
                <p className="mt-3 text-sm leading-6 text-white/72">
                  Phone numbers are no longer exposed in public HTML. Visitors use protected contact actions after reviewing profile details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF8A1F]">Featured providers</p>
              <h2 className="mt-3 font-['Georgia','Times_New_Roman',serif] text-4xl font-semibold tracking-[-0.03em] text-[#0B1F3A] sm:text-5xl">
                A calmer way to compare therapists.
              </h2>
            </div>
            <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">
              View all profiles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredTherapists.slice(0, 6).map((therapist) => (
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

      <section className="bg-[#0B1F3A] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          {[
            [Sparkles, "Discover", "Search by location, specialty, availability, and trust signals."],
            [Star, "Compare", "Review profile details without marketplace pressure or booking fees."],
            [Heart, "Contact", "Use protected contact actions. Private numbers stay out of public HTML."],
          ].map(([Icon, title, text]) => {
            const Component = Icon as typeof Sparkles;
            return (
              <div key={String(title)} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
                <Component className="h-7 w-7 text-[#FF8A1F]" />
                <h3 className="mt-6 font-['Georgia','Times_New_Roman',serif] text-3xl font-semibold">{title as string}</h3>
                <p className="mt-4 leading-7 text-white/68">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
