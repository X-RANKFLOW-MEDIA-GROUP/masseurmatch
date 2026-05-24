import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, MapPin, Sparkles, Star, Heart, TrendingUp } from "lucide-react";

import type { PublicTherapist as Profile } from "@/app/_lib/directory";

interface EditorialHomepageProps {
  featuredTherapists: Profile[];
  totalTherapists: number;
  cityCount: number;
}

const popularCities = [
  { name: "New York",      state: "NY" },
  { name: "Los Angeles",   state: "CA" },
  { name: "Miami",         state: "FL" },
  { name: "Chicago",       state: "IL" },
  { name: "San Francisco", state: "CA" },
  { name: "Houston",       state: "TX" },
  { name: "Atlanta",       state: "GA" },
  { name: "Las Vegas",     state: "NV" },
  { name: "Seattle",       state: "WA" },
  { name: "Washington DC", state: "DC" },
];

const marqueeKeywords = [
  "Deep Tissue Massage",
  "Swedish Massage",
  "Sports Recovery",
  "LGBTQ+ Affirming",
  "Outcall Massage",
  "Incall Massage",
  "Mobile Massage",
  "Hotel Massage",
  "Verified Therapists",
  "Direct Contact",
  "Privacy First",
  "Zero Platform Fees",
  "New York",
  "Los Angeles",
  "Miami",
  "Chicago",
  "San Francisco",
  "Atlanta",
];

const massageStyles = [
  "Deep tissue massage",
  "Swedish massage",
  "Sports massage",
  "Relaxation massage",
  "Therapeutic massage",
  "Mobile massage",
  "Incall massage",
  "Outcall massage",
];

const faqs = [
  ["What is MasseurMatch?", "MasseurMatch is a premium directory where independent massage therapists can publish profiles and clients can browse by city, service style, and profile details."],
  ["Does MasseurMatch book appointments?", "No. MasseurMatch does not manage bookings, appointments, calendars, payments, or sessions. Visitors contact therapists directly outside the platform."],
  ["How do I find a massage therapist near me?", "Start by choosing a city, compare profile details, review specialties and contact options, then contact the therapist directly."],
  ["Can therapists create a profile?", "Yes. Independent therapists can create a profile to improve visibility in city based directory pages and search results."],
];

const S = {
  serif: "'Georgia', 'Times New Roman', serif" as const,
  sans:  "system-ui, -apple-system, sans-serif" as const,
  dark:  "#0B1F3A",
  cream: "#FCFBF8",
  orange:"#FF8A1F",
  muted: "#6B7280",
  white: "#ffffff",
};

function profileName(p: Profile) {
  return p.display_name || p.full_name || "Massage Therapist";
}
function cityHref(name: string) {
  return `/${name.toLowerCase().replace(/\s+/g, "-")}`;
}
function styleHref(s: string) {
  return `/massage-styles/${s.toLowerCase().replace(/\s+/g, "-")}`;
}

export function EditorialHomepage({ featuredTherapists, totalTherapists, cityCount }: EditorialHomepageProps) {
  const visibleProfiles = featuredTherapists.slice(0, 6);
  const marqueeItems = [...marqueeKeywords, ...marqueeKeywords];

  return (
    <main style={{ background: S.cream, color: S.dark }}>

      {/* ═══════════════════════════════════════════
          HERO  — SEO-first fold, editorial premium
          ═══════════════════════════════════════════ */}
      <section
        style={{
          background: S.dark,
          color: S.cream,
          padding: "clamp(88px, 13vw, 140px) 20px clamp(80px, 11vw, 120px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Atmospheric glows */}
        <div style={{ position: "absolute", right: "-160px", top: "-160px", width: 640, height: 640, borderRadius: "50%", background: "rgba(255,138,31,0.07)", filter: "blur(110px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "-120px", bottom: 0,    width: 500, height: 500, borderRadius: "50%", background: "rgba(30,75,143,0.40)",  filter: "blur(90px)",  pointerEvents: "none" }} />
        {/* Subtle grid overlay */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 860, margin: "0 auto" }}>

          {/* Eyebrow */}
          <p style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: S.orange, marginBottom: 28 }}>
            LGBTQ+ affirming directory · United States
          </p>

          {/* H1 – keyword-rich, editorial serif at weight 400 */}
          <h1 style={{ fontFamily: S.serif, fontSize: "clamp(44px, 8vw, 82px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 auto 30px", color: S.cream }}>
            Verified massage therapists{" "}
            <br className="hidden sm:block" />
            <em style={{ color: S.orange, fontStyle: "italic" }}>across the United States.</em>
          </h1>

          {/* Sub-headline */}
          <p style={{ fontFamily: S.sans, fontSize: "clamp(15px, 2.4vw, 18px)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 56px", opacity: 0.60, fontWeight: 300 }}>
            Discover independent LGBTQ+ affirming massage therapists by city,
            specialty, and availability. Direct contact — no bookings, no platform fees.
          </p>

          {/* CTAs — square, editorial buttons matching how-it-works */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
            <Link
              href="/explore"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", fontFamily: S.sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", background: S.orange, color: S.dark, textDecoration: "none" }}
            >
              Browse Therapists
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
            <Link
              href="/for-therapists"
              style={{ display: "inline-flex", alignItems: "center", padding: "16px 32px", fontFamily: S.sans, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", background: "transparent", color: S.cream, textDecoration: "none", border: "1px solid rgba(252,251,248,0.22)" }}
            >
              List Your Profile
            </Link>
          </div>

          {/* Stats — magazine-column style */}
          <div style={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap", maxWidth: 540, margin: "0 auto" }}>
            {([
              [String(totalTherapists > 0 ? totalTherapists : 500) + "+", "Verified Profiles"],
              [String(cityCount > 0 ? cityCount : 50) + "+", "Cities"],
              ["$0", "Platform Fees"],
            ] as [string, string][]).map(([value, label]) => (
              <div key={label} style={{ flex: "1 1 160px", textAlign: "center", padding: "24px 12px", background: "rgba(255,255,255,0.04)", borderTop: "1px solid rgba(252,251,248,0.08)", borderBottom: "1px solid rgba(252,251,248,0.08)" }}>
                <p style={{ fontFamily: S.serif, fontSize: "clamp(32px, 4.5vw, 50px)", fontWeight: 400, color: S.cream, lineHeight: 1 }}>{value}</p>
                <p style={{ fontFamily: S.sans, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(252,251,248,0.38)", marginTop: 10 }}>{label}</p>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 44, fontFamily: S.sans, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(252,251,248,0.22)" }}>
            No bookings · No payments · No platform fees
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          KEYWORD TICKER — scrolling right-to-left
          ═══════════════════════════════════════════ */}
      <div style={{ background: S.orange, overflow: "hidden", padding: "14px 0" }}>
        <div className="mm-marquee-track">
          {marqueeItems.map((kw, i) => (
            <span
              key={i}
              style={{ fontFamily: S.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: S.dark, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", padding: "0 22px", gap: 22 }}
            >
              {kw}
              <span style={{ color: "rgba(11,31,58,0.28)", fontSize: 8, lineHeight: 1 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          TRUST PILLARS
          ═══════════════════════════════════════════ */}
      <section style={{ background: S.white, borderBottom: "1px solid rgba(11,31,58,0.08)", padding: "clamp(32px, 5vw, 48px) 20px" }}>
        <div className="mx-auto max-w-[1060px] grid gap-0.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            "LGBTQ+ affirming",
            "Direct therapist contact",
            "City-based discovery",
            "Transparent profiles",
            "Privacy-first browsing",
          ].map((item) => (
            <div key={item} style={{ background: S.cream, padding: "20px 18px" }}>
              <CheckCircle2 style={{ width: 18, height: 18, color: S.orange, marginBottom: 12 }} />
              <p style={{ fontFamily: S.sans, fontSize: 13, fontWeight: 600, color: S.dark, lineHeight: 1.4 }}>{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CITIES — premium editorial grid
          ═══════════════════════════════════════════ */}
      <section style={{ padding: "clamp(64px, 10vw, 100px) 20px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52, gap: 20, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: S.orange, marginBottom: 16 }}>
                Explore by city
              </p>
              <h2 style={{ fontFamily: S.serif, fontSize: "clamp(28px, 4.5vw, 44px)", fontWeight: 400, lineHeight: 1.12, color: S.dark }}>
                Massage therapists by city.
              </h2>
              <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.75, color: S.muted, marginTop: 14, maxWidth: 440 }}>
                Browse independent therapists in major U.S. cities by location, specialty, and direct contact options.
              </p>
            </div>
            <Link
              href="/explore"
              style={{ fontFamily: S.sans, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: S.dark, textDecoration: "none", borderBottom: "1px solid " + S.dark, paddingBottom: 3, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              All Cities <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>

          {/* City cards — 2 col mobile → 3 tablet → 5 desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ gap: 2 }}>
            {popularCities.map((city) => (
              <Link key={city.name} href={cityHref(city.name)} className="mm-city-card" style={{ padding: "28px 22px" }}>
                {/* State abbreviation label */}
                <p style={{ fontFamily: S.sans, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: S.orange, marginBottom: 10 }}>
                  {city.state}
                </p>
                {/* City name — editorial serif */}
                <h3 style={{ fontFamily: S.serif, fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 400, color: S.dark, lineHeight: 1.2, marginBottom: 16 }}>
                  {city.name}
                </h3>
                {/* CTA hint */}
                <p style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(11,31,58,0.38)", display: "flex", alignItems: "center", gap: 6 }}>
                  View therapists
                  <ArrowRight style={{ width: 10, height: 10 }} />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — dark navy
          ═══════════════════════════════════════════ */}
      <section style={{ background: S.dark, color: S.cream, padding: "clamp(64px, 10vw, 100px) 20px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <p style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: S.orange, marginBottom: 20 }}>
            How MasseurMatch works
          </p>
          <h2 style={{ fontFamily: S.serif, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 400, maxWidth: 540, lineHeight: 1.25, marginBottom: 56 }}>
            Simple discovery. Clear profiles. Direct contact.
          </h2>
          <div className="grid gap-[2px] sm:grid-cols-3">
            {([
              [Sparkles, "Search by city",    "Find massage therapists by location, profile details, and service information."],
              [Star,     "Compare profiles",  "Review photos, descriptions, specialties, incall or outcall options, and contact preferences."],
              [Heart,    "Contact directly",  "Reach the therapist using their listed contact method — no middleman, no booking fees."],
            ] as [typeof Sparkles, string, string][]).map(([Icon, title, text]) => (
              <div key={title} style={{ background: "rgba(255,255,255,0.04)", padding: "36px 32px", borderTop: "1px solid rgba(252,251,248,0.07)" }}>
                <Icon style={{ width: 24, height: 24, color: S.orange }} />
                <h3 style={{ fontFamily: S.serif, fontSize: 20, fontWeight: 400, color: S.cream, marginTop: 24, marginBottom: 14 }}>{title}</h3>
                <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.75, color: "rgba(252,251,248,0.60)" }}>{text}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36 }}>
            <Link
              href="/how-it-works"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 36px", fontFamily: S.sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", background: S.orange, color: S.dark, textDecoration: "none" }}
            >
              See how it works <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED PROFILES
          ═══════════════════════════════════════════ */}
      {visibleProfiles.length > 0 && (
        <section style={{ padding: "clamp(64px, 10vw, 100px) 20px" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 20, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: S.orange, marginBottom: 16 }}>Featured profiles</p>
                <h2 style={{ fontFamily: S.serif, fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 400, lineHeight: 1.15, color: S.dark }}>
                  Featured massage therapist profiles.
                </h2>
                <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.75, color: S.muted, marginTop: 12, maxWidth: 480 }}>
                  Selected independent therapists with profile details, location, service style, and direct contact options.
                </p>
              </div>
              <Link href="/explore" style={{ fontFamily: S.sans, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: S.dark, textDecoration: "none", borderBottom: "1px solid " + S.dark, paddingBottom: 3, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
                All Profiles <ArrowRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
            <div className="grid gap-[2px] md:grid-cols-2 lg:grid-cols-3">
              {visibleProfiles.map((therapist) => (
                <Link
                  key={therapist.id}
                  href={`/therapists/${therapist.slug || therapist.id}`}
                  style={{ background: S.white, overflow: "hidden", textDecoration: "none", display: "block" }}
                >
                  <div style={{ position: "relative", height: 260, background: "rgba(11,31,58,0.08)" }}>
                    <Image
                      src={therapist.avatar_url || therapist.profile_photo || "/images/placeholder-therapist.jpg"}
                      alt={profileName(therapist)}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,31,58,0.85) 0%, rgba(11,31,58,0.20) 50%, transparent 100%)" }} />
                    <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, color: "#fff" }}>
                      <p style={{ fontFamily: S.serif, fontSize: 20, fontWeight: 400 }}>{profileName(therapist)}</p>
                      <p style={{ fontFamily: S.sans, fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin style={{ width: 12, height: 12 }} />
                        {therapist.city || "United States"}
                      </p>
                    </div>
                  </div>
                  <div style={{ padding: "20px 24px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                      {therapist.verification_status === "verified" && (
                        <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(11,31,58,0.07)", color: S.dark, padding: "4px 10px" }}>Verified</span>
                      )}
                      {therapist.lgbtq_affirming && (
                        <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(255,138,31,0.1)", color: "#9A4A00", padding: "4px 10px" }}>LGBTQ+ affirming</span>
                      )}
                      {therapist.available_now && (
                        <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(16,185,129,0.1)", color: "#065f46", padding: "4px 10px" }}>Available</span>
                      )}
                    </div>
                    <p style={{ fontFamily: S.sans, fontSize: 13, lineHeight: 1.7, color: S.muted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {therapist.headline || therapist.bio || "Review profile details, services, pricing, and contact options directly."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SERVICE STYLES
          ═══════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid rgba(11,31,58,0.08)", background: S.white, padding: "clamp(64px, 10vw, 100px) 20px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: S.orange, marginBottom: 16 }}>Browse by service</p>
              <h2 style={{ fontFamily: S.serif, fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 400, lineHeight: 1.15, color: S.dark }}>
                Discover by massage style.
              </h2>
              <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.75, color: S.muted, marginTop: 16, maxWidth: 340 }}>
                Service category pages help visitors discover profiles by search intent — deep tissue, Swedish, sports, mobile, and more.
              </p>
            </div>
            <div className="grid gap-[2px] sm:grid-cols-2">
              {massageStyles.map((style) => (
                <Link key={style} href={styleHref(style)} className="mm-service-link">
                  <span style={{ fontFamily: S.sans, fontSize: 14, fontWeight: 600, color: S.dark }}>{style}</span>
                  <ArrowRight className="mm-arrow" style={{ width: 14, height: 14, color: S.orange }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EDITORIAL / ABOUT BLOCK
          ═══════════════════════════════════════════ */}
      <section style={{ padding: "clamp(64px, 10vw, 100px) 20px" }}>
        <div className="grid gap-[2px] lg:grid-cols-[1.1fr_0.9fr]" style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ background: S.white, padding: "clamp(36px, 5vw, 56px)" }}>
            <p style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: S.orange, marginBottom: 16 }}>About MasseurMatch</p>
            <h2 style={{ fontFamily: S.serif, fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 400, lineHeight: 1.25, color: S.dark, marginBottom: 24 }}>
              Find massage therapists in your city.
            </h2>
            <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.85, color: S.muted, marginBottom: 16 }}>
              MasseurMatch helps clients discover independent massage therapists through city-based directory pages and detailed therapist profiles. Whether visitors are looking for deep tissue, Swedish, sports, mobile, incall, or outcall options, the directory makes it easier to compare profiles and contact therapists directly.
            </p>
            <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.85, color: S.muted }}>
              Unlike booking platforms, MasseurMatch does not manage appointments, payments, calendars, or therapist schedules. Each profile provides information submitted by the provider, helping clients make informed direct contact outside the platform.
            </p>
          </div>
          <div style={{ background: S.dark, padding: "clamp(36px, 5vw, 56px)", color: S.cream }}>
            <TrendingUp style={{ width: 28, height: 28, color: S.orange }} />
            <h3 style={{ fontFamily: S.serif, fontSize: 24, fontWeight: 400, color: S.cream, marginTop: 24, marginBottom: 24 }}>
              Built for organic growth.
            </h3>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {["City-based internal links", "Service category clusters", "Featured profile pathways", "FAQ content for long-tail search", "Direct, indexable directory copy"].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontFamily: S.sans, fontSize: 13, lineHeight: 1.7, color: "rgba(252,251,248,0.65)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: S.orange, flexShrink: 0, marginTop: 5 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid rgba(11,31,58,0.08)", background: S.white, padding: "clamp(64px, 10vw, 100px) 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: S.orange, marginBottom: 20, textAlign: "center" }}>FAQ</p>
          <h2 style={{ fontFamily: S.serif, fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 400, textAlign: "center", marginBottom: 44, color: S.dark }}>
            Frequently asked questions.
          </h2>
          {faqs.map(([question, answer], i) => (
            <div key={String(question)} style={{ padding: "28px 0", borderBottom: "1px solid rgba(11,31,58,0.08)", borderTop: i === 0 ? "1px solid rgba(11,31,58,0.08)" : "none" }}>
              <h3 style={{ fontFamily: S.serif, fontSize: 17, fontWeight: 400, color: S.dark, marginBottom: 12 }}>{question}</h3>
              <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.75, color: S.muted }}>{answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════ */}
      <section style={{ padding: "clamp(64px, 10vw, 100px) 20px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", background: S.dark, padding: "clamp(56px, 8vw, 88px) clamp(28px, 5vw, 56px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: "-100px", top: "-100px", width: 380, height: 380, borderRadius: "50%", background: "rgba(255,138,31,0.08)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontFamily: S.serif, fontSize: "clamp(28px, 5vw, 50px)", fontWeight: 400, color: S.cream, marginBottom: 18, lineHeight: 1.15 }}>
              Start exploring independent massage therapists.
            </h2>
            <p style={{ fontFamily: S.sans, fontSize: 15, lineHeight: 1.7, color: "rgba(252,251,248,0.55)", maxWidth: 520, margin: "0 auto 48px" }}>
              Browse city pages, compare profiles, or create a therapist profile to grow visibility in a premium directory experience.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", fontFamily: S.sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", background: S.orange, color: S.dark, textDecoration: "none" }}>
                Browse Therapists <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
              <Link href="/for-therapists" style={{ display: "inline-flex", alignItems: "center", padding: "16px 32px", fontFamily: S.sans, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", background: "transparent", color: S.cream, textDecoration: "none", border: "1px solid rgba(252,251,248,0.22)" }}>
                List Your Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
