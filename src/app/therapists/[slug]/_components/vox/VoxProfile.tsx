import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  BadgeCheck,
  Crown,
  Star,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Clock,
  CalendarDays,
  Car,
  Languages,
  ShieldCheck,
  Sparkles,
  Waves,
  Flame,
  Activity,
  Hand,
  Footprints,
  Dumbbell,
  Leaf,
  Check,
  Heart,
  ChevronRight,
  Users,
  FileCheck,
} from "lucide-react";
import type { ProfileViewModel } from "@/components/profile/profile-utils";
import { contactHref } from "@/components/profile/profile-utils";
import type { ProfileFaqItem } from "@/app/_lib/directory";
import { VoxGallery } from "./VoxGallery";
import { VoxFaqAccordion } from "./VoxFaqAccordion";
import { VoxStickyContact } from "./VoxStickyContact";
import { VoxAiButton } from "./VoxAiButton";

type RelatedProfile = { name: string; slug: string; city: string; profilePhotoUrl?: string };
type Review = { quote: string; author: string; date?: string };

const SERVICE_ICONS: Array<{ test: RegExp; Icon: typeof Sparkles }> = [
  { test: /deep|sport|recovery|trigger|therap/i, Icon: Activity },
  { test: /swed|relax|calm/i, Icon: Leaf },
  { test: /hot.?stone|stone/i, Icon: Flame },
  { test: /thai|stretch|mobility/i, Icon: Footprints },
  { test: /lymph|drain|detox/i, Icon: Waves },
  { test: /athlet|fitness|strength|muscle/i, Icon: Dumbbell },
  { test: /reflex|foot/i, Icon: Footprints },
];

function iconForService(label: string) {
  return SERVICE_ICONS.find((entry) => entry.test.test(label))?.Icon ?? Hand;
}

function hasRate(value: string) {
  return Boolean(value) && value !== "Contact for rates";
}

export function VoxProfile({
  profile,
  faqItems,
  relatedProfiles,
  availableNow,
  lgbtqAffirming,
  knottyPrompt,
  reviews = [],
  rating,
  reviewCount,
}: {
  profile: ProfileViewModel;
  faqItems: ProfileFaqItem[];
  relatedProfiles: RelatedProfile[];
  availableNow: boolean;
  lgbtqAffirming: boolean;
  knottyPrompt: string;
  // Optional, showcase-only social proof. Real directory profiles never pass
  // these, so no ratings or testimonials are ever fabricated for live listings.
  reviews?: Review[];
  rating?: number;
  reviewCount?: number;
}) {
  const firstName = profile.name.split(" ")[0] || profile.name;
  const phoneHref = contactHref("phone", profile.phone);
  const whatsappHref = contactHref("whatsapp", profile.whatsapp);
  const emailHref = contactHref("email", profile.email);
  const websiteHref = contactHref("website", profile.website);

  const allServices = Array.from(
    new Set([...profile.services, ...profile.massageTypes, ...profile.specialties]),
  ).filter(Boolean);

  const stats = [
    { label: "Experience", value: profile.yearsExperience.replace(/\s*years?/i, "").trim() || "—", suffix: /year/i.test(profile.yearsExperience) ? "yrs" : "" },
    { label: "Response", value: profile.responseTime.length > 18 ? "Fast" : profile.responseTime, suffix: "" },
    { label: "Languages", value: String(profile.languages.length), suffix: profile.languages.length === 1 ? "lang" : "langs" },
  ];

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">

      {/* ── Dark navy hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-[#060E1A] px-4 pb-14 pt-8 sm:px-6 lg:pb-16 lg:pt-10">
        {/* Subtle radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -left-40 -top-20 h-96 w-96 rounded-full bg-[#FF8A1F]/[0.06] blur-3xl" />
          <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-emerald-500/[0.05] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40"
          >
            <Link href={`/${profile.citySlug}`} className="transition-colors hover:text-white/70">
              {profile.city}
            </Link>
            <ChevronRight className="h-3 w-3 text-white/20" strokeWidth={2} />
            <Link href="/therapists" className="transition-colors hover:text-white/70">
              Therapists
            </Link>
            <ChevronRight className="h-3 w-3 text-white/20" strokeWidth={2} />
            <span className="text-white/60">{firstName}</span>
          </nav>

          {/* Grid: photo | info */}
          <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-start lg:gap-14">

            {/* ── Photo ───────────────────────── */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
              <Image
                src={profile.profilePhotoUrl}
                alt={`${profile.name}, massage therapist in ${profile.city}`}
                fill
                priority
                sizes="(min-width: 1024px) 360px, 100vw"
                className="object-cover object-[50%_15%]"
              />
              {/* Gradient fade at bottom for text legibility */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
              {availableNow && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Available now
                </span>
              )}
            </div>

            {/* ── Info ────────────────────────── */}
            <div className="flex flex-col text-white">
              {/* Badges */}
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {profile.isVerified && (
                  <HeroBadge tone="blue" Icon={BadgeCheck}>Verified Pro</HeroBadge>
                )}
                {profile.isPremium && (
                  <HeroBadge tone="amber" Icon={Crown}>Elite Member</HeroBadge>
                )}
                {lgbtqAffirming && (
                  <HeroBadge tone="pink" Icon={Heart}>LGBTQ+ affirming</HeroBadge>
                )}
              </div>

              <h1 className="font-display text-5xl font-extrabold tracking-tight text-white lg:text-6xl">
                {profile.name}
              </h1>

              <p className="mt-3 flex items-center gap-2 font-sans text-white/55">
                <MapPin className="h-4 w-4 text-[#FF8A1F]" strokeWidth={2.25} />
                {profile.neighborhood}, {profile.city}
              </p>

              {typeof rating === "number" && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-[#FF8A1F]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                    ))}
                  </span>
                  <span className="text-sm font-semibold text-white">{rating.toFixed(1)}</span>
                  {reviewCount ? <span className="text-sm text-white/50">({reviewCount} reviews)</span> : null}
                </div>
              )}

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">
                {profile.headline}
              </p>

              {/* Stat chips */}
              <div className="mt-8 grid max-w-sm grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 backdrop-blur-sm"
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">{stat.label}</p>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {stat.value}
                      {stat.suffix && <span className="ml-1 text-sm font-medium text-white/50">{stat.suffix}</span>}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contact CTAs */}
              <div id="contact" className="mt-8 flex flex-wrap items-center gap-3">
                {phoneHref && (
                  <a
                    href={phoneHref}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FF8A1F] px-7 font-semibold text-[#1a0a00] shadow-[0_0_28px_rgba(255,138,31,0.35)] transition-transform hover:-translate-y-0.5"
                  >
                    <Phone className="h-4 w-4" strokeWidth={2.5} />
                    Text {firstName}
                  </a>
                )}
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
                    WhatsApp
                  </a>
                )}
                {profile.phone && !phoneHref && (
                  <span className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.07] px-5 font-semibold text-white">
                    <Phone className="h-4 w-4 text-[#FF8A1F]" strokeWidth={2.5} />
                    {profile.phone}
                  </span>
                )}
                {emailHref && !phoneHref && !whatsappHref && (
                  <a
                    href={emailHref}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FF8A1F] px-7 font-semibold text-[#1a0a00]"
                  >
                    <Mail className="h-4 w-4" strokeWidth={2.5} />
                    Email {firstName}
                  </a>
                )}
                {websiteHref && (
                  <a
                    href={websiteHref}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.07] px-5 font-semibold text-white/80 transition-colors hover:text-white"
                  >
                    <Globe className="h-4 w-4" strokeWidth={2.25} />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Light body ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 lg:pb-16">

        {/* ── Gallery ─────────────────────────────────────────────────────── */}
        {profile.galleryImages.length > 1 && (
          <Section id="gallery" eyebrow="Photos" title="Gallery">
            <VoxGallery images={profile.galleryImages} name={profile.name} />
          </Section>
        )}

        {/* ── Reviews (showcase only) ──────────────────────────────────────── */}
        {reviews.length > 0 && (
          <Section id="reviews" eyebrow="Testimonials" title="Client reviews">
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 6).map((review, index) => (
                <figure
                  key={index}
                  className="flex h-full flex-col rounded-2xl border border-[#e8e0d8] bg-white p-6 shadow-sm"
                >
                  <span className="mb-3 flex items-center gap-0.5 text-[#FF8A1F]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                    ))}
                  </span>
                  <blockquote className="flex-1 text-[15px] leading-7 text-[#3f3a33]">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-[#060E1A]">
                    {review.author}
                    {review.date ? <span className="ml-2 font-normal text-[#8a7d6f]">{review.date}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Section>
        )}

        {/* ── About ───────────────────────────────────────────────────────── */}
        <Section id="about" eyebrow="Profile" title={`About ${firstName}`}>
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="rounded-2xl border border-[#e8e0d8] bg-white p-6 shadow-sm sm:p-8">
              <p className="whitespace-pre-line text-[15px] leading-7 text-[#3f3a33]">{profile.bio}</p>
              {profile.specialties.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {profile.specialties.slice(0, 8).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#FF8A1F]/20 bg-[#FFF4EA] px-3 py-1.5 text-sm font-medium text-[#8a5a2b]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <aside className="space-y-3">
              <DetailRow Icon={MapPin} label="Service area" value={profile.serviceArea} />
              <DetailRow Icon={Languages} label="Languages" value={profile.languages.join(", ")} />
              <DetailRow Icon={Clock} label="Member since" value={profile.memberSince} />
              {profile.isVerified && (
                <DetailRow Icon={ShieldCheck} label="Identity" value="Verified before going live" />
              )}
            </aside>
          </div>
        </Section>

        {/* ── Services ────────────────────────────────────────────────────── */}
        {allServices.length > 0 && (
          <Section id="services" eyebrow="What's offered" title="Services & techniques">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allServices.slice(0, 12).map((service) => {
                const Icon = iconForService(service);
                return (
                  <div
                    key={service}
                    className="flex items-start gap-3 rounded-2xl border border-[#e8e0d8] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFF4EA] text-[#FF8A1F]">
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </span>
                    <span className="pt-1.5 text-sm font-semibold text-[#1a1a1a]">{service}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Pricing ─────────────────────────────────────────────────────── */}
        {(profile.pricing.length > 0 || hasRate(profile.incallPrice) || hasRate(profile.outcallPrice)) && (
          <Section id="rates" eyebrow="Transparent pricing" title="Session rates">
            <div className="overflow-hidden rounded-2xl border border-[#e8e0d8] shadow-sm">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 bg-[#060E1A] px-5 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-white/60 sm:px-7">
                <span>Session</span>
                <span className="text-right">Incall</span>
                <span className="text-right">Outcall</span>
              </div>
              {profile.pricing.length > 0 ? (
                profile.pricing.map((row, i) => (
                  <div
                    key={`${row.name}-${i}`}
                    className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 border-t border-[#f0e8e0] bg-white px-5 py-4 sm:px-7"
                  >
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">{row.name}</p>
                      <p className="text-sm text-[#8a7d6f]">{row.duration}</p>
                    </div>
                    <span className="text-right font-semibold text-[#060E1A]">{row.incall}</span>
                    <span className="text-right font-semibold text-[#060E1A]">{row.outcall}</span>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 bg-white px-5 py-4 sm:px-7">
                  <p className="font-semibold text-[#1a1a1a]">Custom session</p>
                  <span className="text-right font-semibold text-[#060E1A]">{profile.incallPrice}</span>
                  <span className="text-right font-semibold text-[#060E1A]">{profile.outcallPrice}</span>
                </div>
              )}
            </div>
            <p className="mt-3 text-sm text-[#8a7d6f]">
              {hasRate(profile.startingPrice) ? `Sessions from ${profile.startingPrice}. ` : ""}
              Message {firstName} to confirm the right session length and location for you.
            </p>
          </Section>
        )}

        {/* ── Availability & Travel ────────────────────────────────────────── */}
        <Section id="availability" eyebrow="Planning" title="Availability & travel">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#e8e0d8] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#FF8A1F]" strokeWidth={2.25} />
                <h3 className="font-display text-lg font-bold text-[#060E1A]">Availability</h3>
              </div>
              {profile.availabilityDays.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                    const open = profile.availabilityDays.some((d) => d.toLowerCase().startsWith(day.toLowerCase()));
                    return (
                      <span
                        key={day}
                        className={`flex h-9 w-12 items-center justify-center rounded-lg text-sm font-semibold ${
                          open
                            ? "bg-[#FFF4EA] text-[#8a5a2b]"
                            : "bg-slate-50 text-slate-300 line-through"
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              ) : null}
              <p className="mt-4 text-sm text-[#5a5147]">{profile.availabilityHours}</p>
            </div>
            <div className="rounded-2xl border border-[#e8e0d8] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Car className="h-5 w-5 text-[#FF8A1F]" strokeWidth={2.25} />
                <h3 className="font-display text-lg font-bold text-[#060E1A]">Incall & outcall</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-[#3f3a33]">
                <li className="flex items-center gap-2">
                  {profile.incallAvailable ? <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} /> : <span className="h-4 w-4" />}
                  Incall {profile.incallAvailable ? "available" : "on request"}
                  {hasRate(profile.incallPrice) ? ` · from ${profile.incallPrice}` : ""}
                </li>
                <li className="flex items-center gap-2">
                  {profile.outcallAvailable ? <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} /> : <span className="h-4 w-4" />}
                  Outcall {profile.outcallAvailable ? "available" : "on request"}
                  {hasRate(profile.outcallPrice) ? ` · from ${profile.outcallPrice}` : ""}
                </li>
                <li className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-[#FF8A1F]" strokeWidth={2.25} />
                  {profile.travelRadius}
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* ── Location ────────────────────────────────────────────────────── */}
        <Section id="location" eyebrow="Where" title="Location">
          <div className="overflow-hidden rounded-2xl border border-[#e8e0d8] shadow-sm">
            {profile.mapLat !== null && profile.mapLng !== null ? (
              <iframe
                title={`Map of ${profile.neighborhood}, ${profile.city}`}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${profile.mapLat},${profile.mapLng}&z=12&output=embed`}
              />
            ) : (
              <div className="flex h-56 items-center justify-center bg-slate-50">
                <span className="flex items-center gap-2 text-[#5a5147]">
                  <MapPin className="h-5 w-5 text-[#FF8A1F]" strokeWidth={2.25} />
                  {profile.neighborhood}, {profile.city}, {profile.state}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white px-6 py-4 text-sm text-[#5a5147]">
              <MapPin className="h-4 w-4 text-[#FF8A1F]" strokeWidth={2.25} />
              Serving {profile.serviceArea}
            </div>
          </div>
        </Section>

        {/* ── Trust strip ─────────────────────────────────────────────────── */}
        <Section id="trust" eyebrow="Why book with confidence" title="Trust & safety">
          <div className="grid gap-3 sm:grid-cols-3">
            <TrustCard
              Icon={ShieldCheck}
              title="Reviewed before going live"
              body="Every profile is checked by our team before it appears in the directory."
            />
            <TrustCard
              Icon={Users}
              title="Real, independent pros"
              body="You message the therapist directly — no middlemen, no booking fees."
            />
            <TrustCard
              Icon={FileCheck}
              title="Clear, upfront details"
              body="Services, areas, and rates are listed on the profile so you know before you reach out."
            />
          </div>
        </Section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        {faqItems.length > 0 && (
          <Section id="faq" eyebrow="Good to know" title="Frequently asked questions">
            <div itemScope itemType="https://schema.org/FAQPage">
              <VoxFaqAccordion items={faqItems} />
            </div>
          </Section>
        )}

        {/* ── Related ─────────────────────────────────────────────────────── */}
        {relatedProfiles.length > 0 && (
          <Section id="related" eyebrow="Explore more" title={`More therapists in ${profile.city}`}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProfiles.slice(0, 6).map((related) => (
                <Link
                  key={related.slug}
                  href={`/therapists/${related.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#e8e0d8] bg-white p-3 shadow-sm transition-all hover:border-[#FF8A1F]/40 hover:shadow-md"
                >
                  <span className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {related.profilePhotoUrl ? (
                      <Image
                        src={related.profilePhotoUrl}
                        alt={related.name}
                        fill
                        sizes="56px"
                        className="object-cover object-[50%_15%]"
                      />
                    ) : null}
                  </span>
                  <span>
                    <p className="font-semibold text-[#1a1a1a]">{related.name}</p>
                    <p className="text-sm text-[#8a7d6f]">{related.city}</p>
                  </span>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ── Final CTA band ──────────────────────────────────────────────────── */}
      <section className="bg-[#060E1A] px-4 py-14 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0a1628] to-[#060E1A] px-6 py-14 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Ready when you are</p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Book your tailored session with {firstName}.
          </h2>
          <p className="max-w-xl text-white/55">
            Message {firstName} directly to confirm fit, availability, and location. No signup, no middlemen.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {(phoneHref || whatsappHref || emailHref) && (
              <a
                href={phoneHref || whatsappHref || emailHref || "#contact"}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FF8A1F] px-7 font-semibold text-[#1a0a00] shadow-[0_0_28px_rgba(255,138,31,0.3)] transition-transform hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                Contact {firstName}
              </a>
            )}
            {websiteHref && (
              <a
                href={websiteHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:border-white/40"
              >
                <Globe className="h-4 w-4" strokeWidth={2.25} />
                Website
              </a>
            )}
          </div>
        </div>
      </section>

      <VoxAiButton firstName={firstName} prompt={knottyPrompt} />
      <VoxStickyContact
        name={profile.name}
        startingPrice={profile.startingPrice}
        phoneHref={phoneHref}
        whatsappHref={whatsappHref}
      />
    </main>
  );
}

// ── Small presentational helpers ───────────────────────────────────────────

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24 sm:mt-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8A1F]">{eyebrow}</p>
      <h2 className="mb-6 mt-1.5 font-display text-2xl font-extrabold tracking-tight text-[#060E1A] sm:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function HeroBadge({
  tone,
  Icon,
  children,
}: {
  tone: "blue" | "amber" | "pink";
  Icon: typeof BadgeCheck;
  children: React.ReactNode;
}) {
  const styles = {
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    pink: "bg-pink-500/15 text-pink-300 border-pink-500/20",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {children}
    </span>
  );
}

function DetailRow({ Icon, label, value }: { Icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#e8e0d8] bg-white p-4 shadow-sm">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFF4EA] text-[#FF8A1F]">
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <span>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#a1927f]">{label}</p>
        <p className="text-sm font-semibold text-[#1a1a1a]">{value}</p>
      </span>
    </div>
  );
}

function TrustCard({ Icon, title, body }: { Icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d8] bg-white p-6 shadow-sm">
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF4EA] text-[#FF8A1F]">
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <h3 className="font-display text-base font-bold text-[#060E1A]">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-[#5a5147]">{body}</p>
    </div>
  );
}
