import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import FadeUp from "@/components/motion/FadeUp";
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
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-16">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Featured profiles
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight">
              Trust-led profiles with clear session details.
            </h2>
          </div>
          <Link
            href="/safety"
            className="shrink-0 text-sm font-semibold text-primary transition hover:underline"
          >
            Read safety guidance →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredTherapists.map((therapist, i) => {
            const profileHref = `/therapists/${therapist.slug || therapist.id}`;
            const specialties = (therapist.specialties || []).slice(0, 3);
            const isVerified =
              therapist.is_verified_identity || therapist.is_verified_profile;
            const initials = (therapist.display_name || therapist.full_name || "?")
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0] ?? "")
              .join("")
              .toUpperCase();

            return (
              <FadeUp key={profileHref} delay={i * 0.08}>
                <Link
                  href={profileHref}
                  className="group block rounded-2xl overflow-hidden bg-card border border-border"
                >
                  {/* Image — aspect 4/5 editorial portrait ratio */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {therapist.avatar_url ? (
                      <Image
                        src={therapist.avatar_url}
                        alt={
                          therapist.display_name ||
                          therapist.full_name ||
                          "Featured therapist"
                        }
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl font-bold text-muted-foreground/20">
                        {initials}
                      </div>
                    )}

                    {/* Verified badge overlay */}
                    {isVerified && (
                      <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs backdrop-blur-sm">
                        <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-6">
                    <h3 className="font-display text-2xl font-bold leading-tight">
                      {therapist.display_name ||
                        therapist.full_name ||
                        "Featured therapist"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {buildLocationLabel(therapist)}
                    </p>

                    {/* Modality chips */}
                    {specialties.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {specialties.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-border px-3 py-1 text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price + view profile link */}
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        {formatPrice(
                          therapist.incall_price || therapist.outcall_price
                        )}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-[gap] duration-200 group-hover:gap-2">
                        View profile →
                      </span>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
