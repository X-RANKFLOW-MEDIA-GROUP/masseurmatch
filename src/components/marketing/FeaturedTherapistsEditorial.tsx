import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { InkReveal } from "@/components/motion/InkReveal";
import { SplitTextReveal } from "@/components/motion/SplitTextReveal";
import { StaggerReveal } from "@/components/motion/StaggerReveal";
import type { PublicTherapist } from "@/app/_lib/directory";

type Props = {
  featuredTherapists: PublicTherapist[];
};

function formatPrice(amount: number | null) {
  if (!amount) return "Contact for pricing";
  return `From $${amount}`;
}

function buildLocationLabel(therapist: PublicTherapist) {
  return (
    therapist.neighborhood_name ||
    therapist.primary_area ||
    therapist.city ||
    "Featured market"
  );
}

export function FeaturedTherapistsEditorial({ featuredTherapists }: Props) {
  if (!featuredTherapists.length) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <InkReveal origin="left" duration={0.7}>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Featured profiles
              </p>
            </InkReveal>
            <SplitTextReveal
              text="Trusted. Rated. Ready."
              tag="h2"
              wordMode
              charDelay={0.08}
              className="mt-2 font-display text-[clamp(1.75rem,3.5vw,3rem)] font-extrabold leading-[0.95] tracking-tight"
            />
          </div>
          <Link
            href="/search"
            className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary transition hover:opacity-70 sm:inline-flex"
          >
            Browse all
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </Link>
        </div>

        <StaggerReveal
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
          stagger={0.09}
          blur
        >
          {featuredTherapists.map((therapist) => {
            const profileHref = `/therapists/${therapist.slug || therapist.id}`;
            const specialties = (therapist.specialties || []).slice(0, 2);
            const isVerified =
              therapist.is_verified_identity || therapist.is_verified_profile;
            const initials = (therapist.display_name || therapist.full_name || "?")
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0] ?? "")
              .join("")
              .toUpperCase();

            return (
              <Link
                key={profileHref}
                href={profileHref}
                className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_12px_rgba(17,17,17,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_50px_-12px_rgba(17,17,17,0.18)]"
              >
                {/* Portrait image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  {(therapist.profile_photo || therapist.avatar_url) ? (
                    <Image
                      src={(therapist.profile_photo || therapist.avatar_url) as string}
                      alt={therapist.display_name || therapist.full_name || "Therapist"}
                      fill
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-6xl font-extrabold text-muted-foreground/10">
                      {initials}
                    </div>
                  )}
                  {isVerified && (
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full glass-dark px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      <BadgeCheck className="h-3 w-3 text-primary" />
                      Pro
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold leading-tight">
                    {therapist.display_name || therapist.full_name || "Therapist"}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {buildLocationLabel(therapist)}
                  </p>
                  {specialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {specialties.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-border/60 px-2.5 py-0.5 text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {formatPrice(therapist.incall_price || therapist.outcall_price)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                      View
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </StaggerReveal>
      </div>
    </section>
  );
}
