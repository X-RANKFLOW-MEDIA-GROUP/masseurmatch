"use client";

import Link from "next/link";
import Image from "next/image";
import type { PublicTherapist as Profile } from "@/app/_lib/directory";

interface CinematicHomepageProps {
  featuredTherapists: Profile[];
  totalTherapists: number;
  cityCount: number;
  cityDiscoveryItems: Array<{ href: string; city: string; state: string; blurb: string }>;
}

const featureCards = [
  {
    icon: "01",
    title: "Browse real independent therapists",
    body: "Explore public profiles with specialties, location, pricing signals, photos and direct contact options in one clean directory.",
  },
  {
    icon: "02",
    title: "Contact directly",
    body: "MasseurMatch does not manage bookings or payments. Visitors choose a profile and contact the therapist outside the platform.",
  },
  {
    icon: "03",
    title: "Built for local discovery",
    body: "City, service and profile pages are structured for search visibility, helping visitors find relevant therapists faster.",
  },
  {
    icon: "04",
    title: "Clear trust signals",
    body: "Profiles can show identity checked, profile reviewed and photo checked signals without making license verification claims.",
  },
];

const steps = [
  {
    n: "01",
    title: "Choose your city",
    body: "Start with a local page or search by specialty, service type or therapist name.",
  },
  {
    n: "02",
    title: "Compare profiles",
    body: "Review photos, services, incall or outcall options, pricing signals and profile details.",
  },
  {
    n: "03",
    title: "Contact directly",
    body: "Call, text, WhatsApp, email or visit the therapist website when available.",
  },
];

function HeroSection({ totalTherapists, cityCount }: { totalTherapists: number; cityCount: number }) {
  return (
    <section className="relative overflow-hidden bg-[#0B1F3A] px-6 py-28 text-center text-[#FCFBF8] sm:py-32">
      {[420, 580, 740].map((size) => (
        <div
          key={size}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-[#FF8A1F]/10"
          style={{
            width: size,
            height: size,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      <div className="relative mx-auto max-w-5xl">
        <p className="mb-6 font-sans text-[11px] uppercase tracking-[0.22em] text-[#FF8A1F]">
          MasseurMatch Directory
        </p>
        <h1 className="mx-auto mb-7 max-w-4xl font-serif text-[clamp(40px,7vw,76px)] font-normal leading-[1.03] tracking-[-0.04em]">
          Find independent massage therapists with a more premium way to search.
        </h1>
        <p className="mx-auto mb-11 max-w-2xl font-sans text-lg font-light leading-8 text-[#FCFBF8]/70">
          Browse massage therapist profiles by city, specialty and contact preference. No booking system. No client accounts. Just clean discovery and direct contact.
        </p>

        <div className="mx-auto mb-12 grid max-w-3xl gap-3 rounded-none border border-white/10 bg-white/[0.06] p-3 backdrop-blur sm:grid-cols-[1fr_auto]">
          <Link
            href="/search"
            className="flex min-h-14 items-center justify-center bg-[#FCFBF8] px-6 font-sans text-sm text-[#0B1F3A] sm:justify-start"
          >
            Search by city, specialty or therapist name
          </Link>
          <Link
            href="/explore"
            className="flex min-h-14 items-center justify-center bg-[#FF8A1F] px-8 font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#0B1F3A] transition hover:bg-[#FFB347]"
          >
            Explore Profiles
          </Link>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { value: totalTherapists > 0 ? `${totalTherapists}+` : "500+", label: "Therapist profiles" },
            { value: `${cityCount}+`, label: "SEO city pages" },
            { value: "$0", label: "Booking commission" },
            { value: "Direct", label: "Contact model" },
          ].map((stat) => (
            <div key={stat.label} className="border border-white/10 bg-white/[0.04] px-4 py-5">
              <div className="font-sans text-3xl font-bold text-[#FF8A1F]">{stat.value}</div>
              <div className="mt-2 font-sans text-[11px] uppercase tracking-[0.12em] text-white/55">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CityDiscoveryMarquee({ items }: { items: Array<{ href: string; city: string; state: string; blurb: string }> }) {
  if (items.length === 0) return null;

  const loopedItems = [...items, ...items];

  return (
    <section className="bg-[#F5EFE3] px-4 py-14 text-[#0B1F3A] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-[clamp(30px,4vw,46px)] leading-tight tracking-[-0.02em]">Explore Massage Therapists by City</h2>
          <p className="mx-auto mt-3 max-w-2xl font-sans text-sm leading-6 text-[#0B1F3A]/70 sm:text-base">
            Browse trusted massage therapist profiles in major cities and connect directly.
          </p>
        </div>

        <div className="city-marquee-wrap relative overflow-hidden rounded-3xl border border-[#0B1F3A]/10 bg-white/70 p-3 shadow-[0_14px_45px_rgba(11,31,58,0.08)] backdrop-blur-sm sm:p-4">
          <div className="city-marquee-track flex w-max gap-3 sm:gap-4">
            {loopedItems.map((item, index) => (
              <Link
                key={`${item.href}-${index}`}
                href={item.href}
                className="city-marquee-card group min-w-[220px] rounded-2xl border border-white/70 bg-white/85 px-5 py-4 text-left shadow-[0_8px_30px_rgba(11,31,58,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-[#1E4B8F]/20 hover:shadow-[0_14px_35px_rgba(11,31,58,0.14)] sm:min-w-[250px]"
              >
                <p className="font-serif text-xl leading-tight text-[#0B1F3A]">{item.city}, {item.state}</p>
                <p className="mt-2 font-sans text-sm leading-5 text-[#0B1F3A]/65">{item.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedTherapists({ therapists }: { therapists: Profile[] }) {
  if (therapists.length === 0) return null;

  return (
    <section className="bg-[#FCFBF8] px-6 py-24 text-[#0B1F3A]">
      <div className="mx-auto max-w-6xl">
        <p className="mb-5 font-sans text-[11px] uppercase tracking-[0.22em] text-[#FF8A1F]">Featured Profiles</p>
        <div className="mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl font-serif text-[clamp(28px,4vw,46px)] font-normal leading-tight tracking-[-0.03em]">
            Premium profile cards that feel consistent with the therapist landing page.
          </h2>
          <Link href="/explore" className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#1E4B8F]">
            View all profiles
          </Link>
        </div>

        <div className="grid gap-[2px] sm:grid-cols-2 lg:grid-cols-3">
          {therapists.slice(0, 6).map((therapist) => (
            <Link key={therapist.id} href={`/therapists/${therapist.slug || therapist.id}`} className="group bg-white">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#0B1F3A]">
                <Image
                  src={therapist.avatar_url || "/images/placeholder-therapist.jpg"}
                  alt={therapist.display_name || "Massage therapist"}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/20 to-transparent" />
                <div className="absolute left-5 top-5 flex gap-2">
                  {(therapist.is_verified_identity || therapist.is_verified_profile) && (
                    <span className="bg-[#FF8A1F] px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-[#0B1F3A]">
                      Checked
                    </span>
                  )}
                  {therapist.available_now && (
                    <span className="bg-white/90 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-[#0B1F3A]">
                      Available
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-serif text-2xl font-normal leading-tight">{therapist.display_name || "Massage Therapist"}</h3>
                  <p className="mt-2 font-sans text-sm text-white/70">{therapist.neighborhood_name || therapist.city || "Location available"}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  {(therapist.specialties || []).slice(0, 3).map((specialty) => (
                    <span key={specialty} className="bg-[#FCFBF8] px-3 py-1 font-sans text-xs text-[#4A4F5C]">
                      {specialty}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-[#0B1F3A]/10 pt-4 font-sans text-sm">
                  <span className="text-[#4A4F5C]">
                    {therapist.incall_price || therapist.outcall_price ? `From $${therapist.incall_price || therapist.outcall_price}` : "Contact for pricing"}
                  </span>
                  <span className="font-semibold text-[#FF8A1F]">View profile</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="bg-[#FCFBF8] px-6 py-24 text-[#0B1F3A]">
      <div className="mx-auto max-w-6xl">
        <p className="mb-5 font-sans text-[11px] uppercase tracking-[0.22em] text-[#FF8A1F]">Why MasseurMatch</p>
        <h2 className="mb-14 max-w-2xl font-serif text-[clamp(28px,4vw,44px)] font-normal leading-tight tracking-[-0.03em]">
          A directory first experience with the same premium visual language.
        </h2>
        <div className="grid gap-[2px] md:grid-cols-2">
          {featureCards.map((feature) => (
            <div key={feature.title} className="bg-white p-9">
              <div className="mb-5 font-serif text-3xl text-[#FF8A1F]">{feature.icon}</div>
              <h3 className="mb-3 font-serif text-xl font-normal text-[#0B1F3A]">{feature.title}</h3>
              <p className="font-sans text-sm leading-7 text-[#6B7280]">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="bg-[#0B1F3A] px-6 py-24 text-[#FCFBF8]">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-5 font-sans text-[11px] uppercase tracking-[0.22em] text-[#FF8A1F]">How It Works</p>
        <h2 className="mb-14 font-serif text-[clamp(28px,4vw,44px)] font-normal leading-tight tracking-[-0.03em]">
          Discovery stays simple.
        </h2>
        <div className="grid gap-0 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.n} className={`px-7 py-9 text-left ${index > 0 ? "md:border-l md:border-white/10" : ""}`}>
              <div className="mb-5 font-sans text-4xl font-bold text-[#FF8A1F]/30">{step.n}</div>
              <h3 className="mb-3 font-serif text-xl font-normal">{step.title}</h3>
              <p className="font-sans text-sm leading-7 text-white/55">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TherapistCTASection() {
  return (
    <section className="bg-[#FF8A1F] px-6 py-24 text-center text-[#0B1F3A]">
      <h2 className="mx-auto mb-5 max-w-3xl font-serif text-[clamp(30px,4.5vw,52px)] font-normal leading-tight tracking-[-0.03em]">
        Are you a therapist ready to be discovered?
      </h2>
      <p className="mx-auto mb-10 max-w-2xl font-sans text-base leading-7 text-[#0B1F3A]/70">
        Create your listing, manage your profile and let visitors contact you directly.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/for-therapists" className="bg-[#0B1F3A] px-10 py-4 font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#FCFBF8]">
          For Therapists
        </Link>
        <Link href="/register" className="border border-[#0B1F3A]/35 px-10 py-4 font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#0B1F3A]">
          Create Listing
        </Link>
      </div>
    </section>
  );
}

export function CinematicHomepage({
  featuredTherapists,
  totalTherapists,
  cityCount,
  cityDiscoveryItems,
}: CinematicHomepageProps) {
  return (
    <main className="overflow-x-hidden bg-[#FCFBF8]">
      <HeroSection totalTherapists={totalTherapists} cityCount={cityCount} />
      <CityDiscoveryMarquee items={cityDiscoveryItems} />
      <FeaturedTherapists therapists={featuredTherapists} />
      <BenefitsSection />
      <HowItWorksSection />
      <TherapistCTASection />
    </main>
  );
}
