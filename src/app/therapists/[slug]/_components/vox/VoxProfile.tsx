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
    { label: "Experience", value: profile.yearsExperience.replace(/\s*years?/i, "").trim() || "—", suffix: /year/i.test(profile.yearsExperience) ? "years" : "" },
    { label: "Response", value: profile.responseTime.length > 18 ? "Fast" : profile.responseTime, suffix: "" },
    { label: "Languages", value: String(profile.languages.length), suffix: profile.languages.length === 1 ? "language" : "languages" },
  ];

  return (
    <main className="min-h-screen bg-[#FBF6F0] text-[#1a1a1a]">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-[#8a7d6f]">
          <Link href={`/${profile.citySlug}`} className="hover:text-[#1A1A1A]">{profile.city}</Link>
          <span aria-hidden>/</span>
          <Link href="/therapists" className="hover:text-[#1A1A1A]">Massage Therapists</Link>
          <span aria-hidden>/</span>
          <span className="font-medium text-[#5a5147]">{firstName}</span>
        </nav>

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <section className="overflow-hidden rounded-[2rem] border border-[#E5E5E5] bg-gradient-to-br from-white to-[#FDE8EC] p-4 shadow-[0_24px_60px_rgba(214,160,110,0.12)] sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-10">
            {/* Photo */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-[#E5E5E5] bg-[#f3e9df]">
              <Image
                src={profile.profilePhotoUrl}
                alt={`${profile.name}, massage therapist in ${profile.city}`}
                fill
                priority
                sizes="(min-width: 1024px) 360px, 100vw"
                className="object-cover"
              />
              {availableNow && (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Available now
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {profile.isVerified && (
                  <Badge tone="blue" Icon={BadgeCheck}>Verified Pro</Badge>
                )}
                {profile.isPremium && (
                  <Badge tone="amber" Icon={Crown}>Elite Member</Badge>
                )}
                {lgbtqAffirming && (
                  <Badge tone="pink" Icon={Heart}>LGBTQ+ affirming</Badge>
                )}
              </div>

              <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#1A1A1A] sm:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-[#5a5147]">
                <MapPin className="h-4 w-4 text-[#C8102E]" strokeWidth={2.25} />
                {profile.neighborhood}, {profile.city}
              </p>
              {typeof rating === "number" && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-[#C8102E]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                    ))}
                  </span>
                  <span className="text-sm font-semibold text-[#1a1a1a]">{rating.toFixed(1)}</span>
                  {reviewCount ? <span className="text-sm text-[#8a7d6f]">({reviewCount} reviews)</span> : null}
                </div>
              )}
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#3f3a33]">{profile.headline}</p>

              {/* Stat chips */}
              <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[#E5E5E5] bg-white/70 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a1927f]">{stat.label}</p>
                    <p className="mt-1 text-lg font-bold text-[#1A1A1A]">
                      {stat.value}
                      {stat.suffix ? <span className="ml-1 text-sm font-medium text-[#8a7d6f]">{stat.suffix}</span> : null}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contact CTAs */}
              <div id="contact" className="mt-6 flex flex-wrap items-center gap-3">
                {phoneHref && (
                  <a
                    href={phoneHref}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#C8102E] px-6 font-semibold text-[#FFFFFF] shadow-[0_10px_24px_rgba(200,16,46,0.3)] transition-transform hover:-translate-y-0.5"
                  >
                    <Phone className="h-4 w-4" strokeWidth={2.5} />
                    Text {firstName}
                  </a>
                )}
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1A1A1A] px-6 font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
                    WhatsApp
                  </a>
                )}
                {profile.phone && (
                  <span className="inline-flex h-12 items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-5 font-semibold text-[#1A1A1A]">
                    <Phone className="h-4 w-4 text-[#C8102E]" strokeWidth={2.5} />
                    {profile.phone}
                  </span>
                )}
                {emailHref && !phoneHref && !whatsappHref && (
                  <a
                    href={emailHref}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#C8102E] px-6 font-semibold text-[#FFFFFF]"
                  >
                    <Mail className="h-4 w-4" strokeWidth={2.5} />
                    Email {firstName}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Gallery ───────────────────────────────────────────────────── */}
        {profile.galleryImages.length > 1 && (
          <Section id="gallery" eyebrow="Photos" title="Gallery">
            <VoxGallery images={profile.galleryImages} name={profile.name} />
          </Section>
        )}

        {/* ── Reviews (showcase only) ───────────────────────────────────── */}
        {reviews.length > 0 && (
          <Section id="reviews" eyebrow="Testimonials" title="Client reviews">
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 6).map((review, index) => (
                <figure key={index} className="flex h-full flex-col rounded-3xl border border-[#E5E5E5] bg-white p-6">
                  <span className="mb-3 flex items-center gap-0.5 text-[#C8102E]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                    ))}
                  </span>
                  <blockquote className="flex-1 text-[15px] leading-7 text-[#3f3a33]">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-[#1A1A1A]">
                    {review.author}
                    {review.date ? <span className="ml-2 font-normal text-[#8a7d6f]">{review.date}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Section>
        )}

        {/* ── About ─────────────────────────────────────────────────────── */}
        <Section id="about" eyebrow="Profile" title={`About ${firstName}`}>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8">
              <p className="whitespace-pre-line text-[15px] leading-7 text-[#3f3a33]">{profile.bio}</p>
              {profile.specialties.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {profile.specialties.slice(0, 8).map((item) => (
                    <span key={item} className="rounded-full bg-[#FDE8EC] px-3 py-1.5 text-sm font-medium text-[#8a5a2b]">
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
                <DetailRow Icon={ShieldCheck} label="Identity" value="Profile reviewed" />
              )}
            </aside>
          </div>
        </Section>

        {/* ── Services ──────────────────────────────────────────────────── */}
        {allServices.length > 0 && (
          <Section id="services" eyebrow="What's offered" title="Services & techniques">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allServices.slice(0, 12).map((service) => {
                const Icon = iconForService(service);
                return (
                  <div key={service} className="flex items-start gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-4">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FDE8EC] text-[#C8102E]">
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </span>
                    <span className="pt-1.5 text-sm font-semibold text-[#1a1a1a]">{service}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Pricing ───────────────────────────────────────────────────── */}
        {(profile.pricing.length > 0 || hasRate(profile.incallPrice) || hasRate(profile.outcallPrice)) && (
          <Section id="rates" eyebrow="Transparent pricing" title="Session rates">
            <div className="overflow-hidden rounded-3xl border border-[#E5E5E5] bg-white">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 bg-[#1A1A1A] px-5 py-3.5 text-xs font-mono uppercase tracking-[0.14em] text-white/70 sm:px-7">
                <span>Session</span>
                <span className="text-right">Incall</span>
                <span className="text-right">Outcall</span>
              </div>
              {profile.pricing.length > 0 ? (
                profile.pricing.map((row, i) => (
                  <div
                    key={`${row.name}-${i}`}
                    className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 border-t border-[#f1e8de] px-5 py-4 sm:px-7"
                  >
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">{row.name}</p>
                      <p className="text-sm text-[#8a7d6f]">{row.duration}</p>
                    </div>
                    <span className="text-right font-semibold text-[#1A1A1A]">{row.incall}</span>
                    <span className="text-right font-semibold text-[#1A1A1A]">{row.outcall}</span>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 px-5 py-4 sm:px-7">
                  <p className="font-semibold text-[#1a1a1a]">Custom session</p>
                  <span className="text-right font-semibold text-[#1A1A1A]">{profile.incallPrice}</span>
                  <span className="text-right font-semibold text-[#1A1A1A]">{profile.outcallPrice}</span>
                </div>
              )}
            </div>
            <p className="mt-3 text-sm text-[#8a7d6f]">
              {hasRate(profile.startingPrice) ? `Sessions from ${profile.startingPrice}. ` : ""}
              Message {firstName} to confirm the right session length and location for you.
            </p>
          </Section>
        )}

        {/* ── Availability & Travel ─────────────────────────────────────── */}
        <Section id="availability" eyebrow="Planning" title="Availability & travel">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#C8102E]" strokeWidth={2.25} />
                <h3 className="font-display text-lg font-bold text-[#1A1A1A]">Availability</h3>
              </div>
              {profile.availabilityDays.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                    const open = profile.availabilityDays.some((d) => d.toLowerCase().startsWith(day.toLowerCase()));
                    return (
                      <span
                        key={day}
                        className={`flex h-9 w-12 items-center justify-center rounded-xl text-sm font-semibold ${
                          open ? "bg-[#FDE8EC] text-[#8a5a2b]" : "bg-[#f4ede4] text-[#bcae9d] line-through"
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
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <Car className="h-5 w-5 text-[#C8102E]" strokeWidth={2.25} />
                <h3 className="font-display text-lg font-bold text-[#1A1A1A]">Incall & outcall</h3>
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
                  <Car className="h-4 w-4 text-[#C8102E]" strokeWidth={2.25} />
                  {profile.travelRadius}
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* ── Location ──────────────────────────────────────────────────── */}
        <Section id="location" eyebrow="Where" title="Location">
          <div className="overflow-hidden rounded-3xl border border-[#E5E5E5] bg-white">
            {profile.mapLat !== null && profile.mapLng !== null ? (
              <iframe
                title={`Map of ${profile.neighborhood}, ${profile.city}`}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${profile.mapLat},${profile.mapLng}&z=12&output=embed`}
              />
            ) : (
              <div className="flex h-56 items-center justify-center bg-[#FDE8EC]">
                <span className="flex items-center gap-2 text-[#8a5a2b]">
                  <MapPin className="h-5 w-5" strokeWidth={2.25} />
                  {profile.neighborhood}, {profile.city}, {profile.state}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-6 py-4 text-sm text-[#5a5147]">
              <MapPin className="h-4 w-4 text-[#C8102E]" strokeWidth={2.25} />
              Serving {profile.serviceArea}
            </div>
          </div>
        </Section>

        {/* ── Trust strip (truthful — replaces fabricated reviews) ──────── */}
        <Section id="trust" eyebrow="Why book with confidence" title="Trust & safety">
          <div className="grid gap-3 sm:grid-cols-3">
            <TrustCard Icon={ShieldCheck} title="Reviewed before going live" body="Every profile is checked by our team before it appears in the directory." />
            <TrustCard Icon={Star} title="Real, independent pros" body="You message the therapist directly — no middlemen, no booking fees." />
            <TrustCard Icon={BadgeCheck} title="Clear, upfront details" body="Services, areas, and rates are listed on the profile so you know before you reach out." />
          </div>
        </Section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        {faqItems.length > 0 && (
          <Section id="faq" eyebrow="Good to know" title="Frequently asked questions">
            <div itemScope itemType="https://schema.org/FAQPage">
              <VoxFaqAccordion items={faqItems} />
            </div>
          </Section>
        )}

        {/* ── Related ───────────────────────────────────────────────────── */}
        {relatedProfiles.length > 0 && (
          <Section id="related" eyebrow="Explore more" title={`More therapists in ${profile.city}`}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProfiles.slice(0, 6).map((related) => (
                <Link
                  key={related.slug}
                  href={`/therapists/${related.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-3 transition-colors hover:border-[#C8102E]/40"
                >
                  <span className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#f3e9df]">
                    {related.profilePhotoUrl ? (
                      <Image src={related.profilePhotoUrl} alt={related.name} fill sizes="56px" className="object-cover" />
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

      {/* ── Final CTA band ──────────────────────────────────────────────── */}
      <section className="bg-[#1A1A1A] px-4 py-14 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1A1A1A] to-[#1A1A1A] px-6 py-12 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">Ready when you are</p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Book your tailored session with {firstName}.
          </h2>
          <p className="max-w-xl text-white/65">
            Message {firstName} directly to confirm fit, availability, and location. No signup, no middlemen.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {(phoneHref || whatsappHref || emailHref) && (
              <a
                href={phoneHref || whatsappHref || emailHref || "#contact"}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#C8102E] px-7 font-semibold text-[#FFFFFF] transition-transform hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                Contact {firstName}
              </a>
            )}
            {websiteHref && (
              <a
                href={websiteHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold text-white"
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
    <section id={id} className="mt-10 scroll-mt-24 sm:mt-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C8102E]">{eyebrow}</p>
      <h2 className="mb-5 mt-1.5 font-display text-2xl font-extrabold tracking-tight text-[#1A1A1A] sm:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Badge({
  tone,
  Icon,
  children,
}: {
  tone: "blue" | "amber" | "pink";
  Icon: typeof BadgeCheck;
  children: React.ReactNode;
}) {
  const styles = {
    blue: "bg-[#e8f0fe] text-[#1d4ed8]",
    amber: "bg-[#fdf0d8] text-[#b45309]",
    pink: "bg-[#fde8f0] text-[#be1f6f]",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {children}
    </span>
  );
}

function DetailRow({ Icon, label, value }: { Icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-4">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#FDE8EC] text-[#C8102E]">
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
    <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6">
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FDE8EC] text-[#C8102E]">
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <h3 className="font-display text-base font-bold text-[#1A1A1A]">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-[#5a5147]">{body}</p>
    </div>
  );
}
