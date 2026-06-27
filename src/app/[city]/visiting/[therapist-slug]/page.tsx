import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { getPublicTherapistBySlug, getCities } from "@/app/_lib/directory";
import { resolveCitySlug } from "@/app/_lib/city-routing";
import { getPublicProfileName } from "@/app/_lib/public-profile";
import type { ProfileTravelEntry } from "@/app/_lib/directory";
import { TOUR_PAGE_TIERS } from "@/lib/pricing";

type Params = { city: string; "therapist-slug": string };

// Force Vercel cache invalidation
function formatDateRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.toLocaleDateString("en-US", opts)}–${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

function isUpcomingOrCurrent(entry: ProfileTravelEntry) {
  const end = new Date(entry.end_date);
  return end >= new Date();
}

async function getPageData(city: string, therapistSlug: string) {
  const resolvedCity = resolveCitySlug(city);
  if (!resolvedCity) return null;

  const cityMeta = getCities().find((c) => c.slug === resolvedCity);
  if (!cityMeta) return null;

  const profile = await getPublicTherapistBySlug(therapistSlug);
  if (!profile) return null;

  if (!TOUR_PAGE_TIERS.has(profile.subscription_tier ?? "free")) return null;

  const schedule: ProfileTravelEntry[] = Array.isArray(profile.travel_schedule)
    ? (profile.travel_schedule as ProfileTravelEntry[])
    : [];

  const cityVisits = schedule.filter(
    (entry) =>
      isUpcomingOrCurrent(entry) &&
      entry.city.toLowerCase().replace(/\s+/g, "-") === resolvedCity,
  );

  if (cityVisits.length === 0) return null;

  return { cityMeta, profile, cityVisits };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { city, "therapist-slug": slug } = await params;
  const data = await getPageData(city, slug);
  if (!data) return { title: "Visiting Therapist | MasseurMatch" };

  const { cityMeta, profile, cityVisits } = data;
  const name = getPublicProfileName(profile);
  const nextVisit = cityVisits[0];
  const dateLabel = formatDateRange(nextVisit.start_date, nextVisit.end_date);

  return {
    title: `${name} Visiting ${cityMeta.name} | MasseurMatch`,
    description: `${name} is visiting ${cityMeta.name} ${dateLabel}. Book a session with this LGBTQ+-affirming massage therapist during their travel stay.`,
    alternates: { canonical: `https://masseurmatch.com/${city}/visiting/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function TourPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { city, "therapist-slug": slug } = await params;
  const data = await getPageData(city, slug);
  if (!data) notFound();

  const { cityMeta, profile, cityVisits } = data;
  const name = getPublicProfileName(profile);
  const nextVisit = cityVisits[0];

  return (
    <main className="min-h-screen bg-[#FFFFFF]" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Hero */}
      <section
        style={{
          background: "#1A1A1A",
          color: "#FFFFFF",
          padding: "clamp(48px, 7vw, 72px) 20px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(139,30,45,0.12)",
              border: "1px solid rgba(139,30,45,0.3)",
              borderRadius: 99,
              padding: "4px 12px",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#8B1E2D",
              marginBottom: 20,
            }}
          >
            <MapPin style={{ width: 11, height: 11 }} strokeWidth={2.25} />
            Visiting {cityMeta.name}
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 46px)",
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: 16,
              fontFamily: "'Georgia', serif",
            }}
          >
            {name}
          </h1>
          {profile.headline && (
            <p style={{ fontSize: 16, opacity: 0.65, lineHeight: 1.65, maxWidth: 520 }}>
              {profile.headline}
            </p>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Visit schedule */}
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#6B7280",
              marginBottom: 14,
            }}
          >
            {cityVisits.length === 1 ? "Upcoming visit" : "Upcoming visits"}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {cityVisits.map((visit) => (
              <li
                key={`${visit.start_date}-${visit.end_date}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: "1px solid rgba(26,26,26,0.1)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  background: "#fff",
                }}
              >
                <CalendarDays
                  style={{ width: 16, height: 16, color: "#8B1E2D", flexShrink: 0 }}
                  strokeWidth={2}
                />
                <span style={{ fontSize: 15, color: "#1A1A1A" }}>
                  {formatDateRange(visit.start_date, visit.end_date)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Bio snippet */}
        {profile.bio && (
          <section style={{ marginBottom: 36 }}>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "#374151",
                fontFamily: "'Georgia', serif",
              }}
            >
              {profile.bio.slice(0, 300)}
              {profile.bio.length > 300 ? "…" : ""}
            </p>
          </section>
        )}

        {/* Service categories */}
        {Array.isArray(profile.service_categories) && profile.service_categories.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h3
              style={{
                fontSize: 13,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#6B7280",
                marginBottom: 10,
              }}
            >
              Services offered
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(profile.service_categories as string[]).map((cat) => (
                <span
                  key={cat}
                  style={{
                    border: "1px solid rgba(26,26,26,0.12)",
                    borderRadius: 99,
                    padding: "4px 12px",
                    fontSize: 13,
                    color: "#374151",
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link
            href={`/therapists/${profile.slug ?? profile.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#1A1A1A",
              color: "#FFFFFF",
              borderRadius: 99,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View full profile
            <ArrowRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
          </Link>
          <Link
            href={`/${city}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              color: "#374151",
              border: "1px solid rgba(26,26,26,0.15)",
              borderRadius: 99,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            All therapists in {cityMeta.name}
          </Link>
        </div>

        {/* Next visit teaser */}
        {cityVisits.length > 0 && (
          <p
            style={{
              marginTop: 28,
              fontSize: 13,
              color: "#9CA3AF",
              lineHeight: 1.6,
            }}
          >
            {name} will be in {cityMeta.name}{" "}
            {formatDateRange(nextVisit.start_date, nextVisit.end_date)}.
            Contact them early — availability during travel visits fills quickly.
          </p>
        )}
      </div>
    </main>
  );
}
