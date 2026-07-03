"use client";

import Image from "next/image";
import {
  Check,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import { Pill } from "@/components/ui/pill";
import {
  getPublicContactLinks,
  getPublicProfileName,
  isVerifiedDirectoryProfile,
  isIdentityVerified,
} from "@/app/_lib/public-profile";
import { useKnottyProfileAttribution } from "./useKnottyProfileAttribution";

interface Props {
  profile: PublicTherapist;
}

export function ProfileHero({ profile }: Props) {
  const name = getPublicProfileName(profile);
  const { callHref, smsHref } = getPublicContactLinks(profile.phone, profile.whatsapp_number, profile.id);
  const neighborhood = profile.neighborhood_name || profile.primary_area || null;
  const { trackContact } = useKnottyProfileAttribution({ therapistId: profile.id, city: profile.city, neighborhood: neighborhood ?? null });
  const city = profile.city || "United States";
  const state = profile.state || null;
  const locationLabel = [neighborhood, city, state].filter(Boolean).join(", ");

  const yearsExp = profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
  const startingPrice = profile.incall_price ?? profile.outcall_price;
  const services = (profile.massage_techniques || []).slice(0, 3);
  const languages = (profile.languages || []).slice(0, 3);
  const isDirectoryListed = isVerifiedDirectoryProfile(profile);
  const lgbtqAffirming = profile.lgbtq_affirming === true;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-primary via-brand-deep to-brand-secondary shadow-brand">
      <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
        {/* Left: Profile photo */}
        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 translate-y-8 bg-brand-soft/5 blur-3xl" />
          <Image
            src={profile.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1120&fit=crop"}
            alt={`${name} – massage therapist in ${city}`}
            width={720}
            height={900}
            priority
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-primary/80 via-brand-primary/40 to-transparent" />
        </div>

        {/* Right: Info section */}
        <div className="space-y-6 p-7 text-white md:p-10 lg:flex lg:flex-col lg:justify-between">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            {profile.available_now && (
              <Pill
                variant="available"
                size="sm"
                icon={<span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                label="Available Now"
                className="text-white"
              />
            )}
            {isDirectoryListed && (
              <Pill
                variant="verified"
                size="sm"
                icon={<Check size={11} />}
                label="Verified Photo"
                className="text-white"
              />
            )}
            {lgbtqAffirming && (
              <Pill
                variant="lgbtq"
                size="sm"
                label="LGBTQ+ Safe Space"
                className="text-white"
              />
            )}
          </div>

          {/* Name and headline */}
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
              {name}
            </h1>
            <div className="flex items-center gap-2 text-lg text-white/90">
              <MapPin className="h-5 w-5 flex-shrink-0 text-brand-soft" />
              <span>{locationLabel}</span>
            </div>
            {profile.headline && (
              <p className="text-base text-white/80 md:text-lg">
                {profile.headline}
              </p>
            )}
          </div>

          {/* Quick facts */}
          <div className="space-y-3 border-t border-white/20 pt-4">
            {/* Services */}
            {services.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Services</p>
                <p className="mt-1 text-sm text-white/90">
                  {services.join(" · ")}
                </p>
              </div>
            )}

            {/* Session types */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Session Types</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {profile.offers_incall && (
                  <span className="text-sm text-white/90">Incall</span>
                )}
                {profile.offers_outcall && (
                  <span className="text-sm text-white/90">Outcall</span>
                )}
                {!profile.offers_incall && !profile.offers_outcall && (
                  <span className="text-sm text-white/90">Direct inquiry</span>
                )}
              </div>
            </div>

            {/* Price */}
            {startingPrice && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Starting Price</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  ${startingPrice} per session
                </p>
              </div>
            )}

            {/* Experience */}
            {yearsExp && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Experience</p>
                <p className="mt-1 text-sm text-white/90">
                  {yearsExp}+ years
                </p>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Languages</p>
                <p className="mt-1 text-sm text-white/90">
                  {languages.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2 sm:flex-row">
            {smsHref && (
              <a
                href={smsHref}
                onClick={() => trackContact("knotty_text_clicked")}
                className="profile-card-cta flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
              >
                <MessageSquare className="h-4 w-4" />
                Ask Availability
              </a>
            )}
            {callHref && (
              <a
                href={callHref}
                onClick={() => trackContact("knotty_call_clicked")}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            )}
            {!smsHref && !callHref && (
              <a
                href="#contact"
                className="flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                View Contact Options
              </a>
            )}
          </div>

          {/* Directory disclaimer */}
          <div className="border-t border-white/20 pt-4 text-xs text-white/60">
            <p>MasseurMatch is a directory. Confirm availability, rates, location, and session details directly with the therapist.</p>
          </div>
        </div>
      </div>

      {/* Mobile photo */}
      <div className="overflow-hidden lg:hidden">
        <Image
          src={profile.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1120&fit=crop"}
          alt={`${name} – massage therapist`}
          width={720}
          height={600}
          priority
          className="h-64 w-full object-cover sm:h-80"
        />
      </div>
    </section>
  );
}
