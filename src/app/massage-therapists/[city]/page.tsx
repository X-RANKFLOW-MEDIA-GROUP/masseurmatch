import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CityData {
  slug: string;               // "dallas-tx"
  name: string;               // "Dallas"
  stateCode: string;          // "TX"
  stateName: string;          // "Texas"
  displayName: string;        // "Dallas, TX"
  population?: string;        // "1.3 million"
  neighborhoods: string[];
  nearbyAreas: NearbyArea[];
  modalities: string[];
  seoBlurb: string;           // city-specific paragraph for uniqueness
  therapistCount: number;
}

interface NearbyArea {
  name: string;
  slug: string;
}

interface TherapistCard {
  id: string;
  name: string;
  modalities: string[];
  neighborhood: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  lgbtqCertified: boolean;
}

// ─── City Data ────────────────────────────────────────────────────────────────
// TODO: Replace with Supabase query:
//   const { data: city } = await supabase
//     .from("cities")
//     .select("*")
//     .eq("slug", slug)
//     .single();

const CITIES: Record<string, CityData> = {
  "dallas-tx": {
    slug: "dallas-tx",
    name: "Dallas",
    stateCode: "TX",
    stateName: "Texas",
    displayName: "Dallas, TX",
    population: "1.3 million",
    neighborhoods: ["Uptown", "Oak Lawn", "Deep Ellum", "Bishop Arts", "Lower Greenville", "Lakewood", "Preston Hollow", "Addison"],
    nearbyAreas: [
      { name: "Fort Worth, TX", slug: "fort-worth-tx" },
      { name: "Plano, TX", slug: "plano-tx" },
      { name: "Irving, TX", slug: "irving-tx" },
      { name: "Arlington, TX", slug: "arlington-tx" },
    ],
    modalities: ["Swedish Massage", "Deep Tissue", "Sports Massage", "Hot Stone", "Prenatal Massage", "Trigger Point Therapy", "Thai Massage", "Lymphatic Drainage"],
    seoBlurb:
      "Dallas is home to one of the most vibrant LGBTQ+ communities in the South, centered around Oak Lawn and the Cedar Springs strip. MasseurMatch connects Dallas-area clients with licensed massage therapists who understand the importance of a judgment-free, affirming environment — whether you're in Uptown, Deep Ellum, or anywhere across the Metroplex.",
    therapistCount: 87,
  },
  "houston-tx": {
    slug: "houston-tx",
    name: "Houston",
    stateCode: "TX",
    stateName: "Texas",
    displayName: "Houston, TX",
    population: "2.3 million",
    neighborhoods: ["Montrose", "Midtown", "Heights", "Museum District", "Galleria", "River Oaks", "EaDo", "Pearland"],
    nearbyAreas: [
      { name: "Pasadena, TX", slug: "pasadena-tx" },
      { name: "Sugar Land, TX", slug: "sugar-land-tx" },
      { name: "The Woodlands, TX", slug: "the-woodlands-tx" },
    ],
    modalities: ["Swedish Massage", "Deep Tissue", "Sports Massage", "Prenatal Massage", "Cupping Therapy", "Myofascial Release", "Hot Stone", "Shiatsu"],
    seoBlurb:
      "Houston's Montrose neighborhood is the cultural heart of the city's LGBTQ+ community — one of the largest and most established in Texas. MasseurMatch connects Houston clients with licensed massage therapists committed to inclusive, affirming care across all of Houston's diverse neighborhoods.",
    therapistCount: 112,
  },
  "austin-tx": {
    slug: "austin-tx",
    name: "Austin",
    stateCode: "TX",
    stateName: "Texas",
    displayName: "Austin, TX",
    population: "950,000",
    neighborhoods: ["East Austin", "South Congress", "Hyde Park", "Zilker", "Domain", "Mueller", "North Loop", "Barton Hills"],
    nearbyAreas: [
      { name: "Round Rock, TX", slug: "round-rock-tx" },
      { name: "Cedar Park, TX", slug: "cedar-park-tx" },
      { name: "San Marcos, TX", slug: "san-marcos-tx" },
    ],
    modalities: ["Swedish Massage", "Deep Tissue", "Sports Massage", "Prenatal Massage", "Ashiatsu", "Hot Stone", "Trigger Point Therapy", "Reflexology"],
    seoBlurb:
      "Austin has long been known for its progressive culture and welcoming LGBTQ+ community. From East Austin studios to South Congress wellness centers, MasseurMatch helps Austin clients find massage therapists who match their values — inclusive, professional, and fully licensed.",
    therapistCount: 64,
  },
  "new-york-ny": {
    slug: "new-york-ny",
    name: "New York",
    stateCode: "NY",
    stateName: "New York",
    displayName: "New York, NY",
    population: "8.3 million",
    neighborhoods: ["Chelsea", "Hell's Kitchen", "Brooklyn Heights", "Astoria", "Park Slope", "Upper West Side", "Harlem", "Williamsburg"],
    nearbyAreas: [
      { name: "Jersey City, NJ", slug: "jersey-city-nj" },
      { name: "Hoboken, NJ", slug: "hoboken-nj" },
      { name: "Yonkers, NY", slug: "yonkers-ny" },
    ],
    modalities: ["Swedish Massage", "Deep Tissue", "Sports Massage", "Shiatsu", "Thai Massage", "Prenatal Massage", "Lymphatic Drainage", "Hot Stone"],
    seoBlurb:
      "New York City is home to the largest LGBTQ+ population in the United States. From Chelsea to Hell's Kitchen, Brooklyn to Queens, MasseurMatch connects NYC clients with verified, LGBTQ+-inclusive massage therapists who bring professional standards and genuine affirming care.",
    therapistCount: 241,
  },
  "los-angeles-ca": {
    slug: "los-angeles-ca",
    name: "Los Angeles",
    stateCode: "CA",
    stateName: "California",
    displayName: "Los Angeles, CA",
    population: "3.9 million",
    neighborhoods: ["West Hollywood", "Silver Lake", "Echo Park", "Los Feliz", "Santa Monica", "Culver City", "Long Beach", "Koreatown"],
    nearbyAreas: [
      { name: "Pasadena, CA", slug: "pasadena-ca" },
      { name: "Glendale, CA", slug: "glendale-ca" },
      { name: "Burbank, CA", slug: "burbank-ca" },
    ],
    modalities: ["Swedish Massage", "Deep Tissue", "Sports Massage", "Thai Massage", "Prenatal Massage", "CBD Massage", "Hot Stone", "Reflexology"],
    seoBlurb:
      "Los Angeles — especially West Hollywood and Silver Lake — is one of the most LGBTQ+-affirming cities in the world. MasseurMatch connects LA clients with licensed massage therapists across the Basin who bring genuine inclusivity, not just lip service.",
    therapistCount: 198,
  },
};

// ─── Therapist Data ───────────────────────────────────────────────────────────
// TODO: Replace with Supabase query:
//   const { data: therapists } = await supabase
//     .from("therapist_profiles")
//     .select("id, name, modalities, neighborhood, rating, review_count, verified, lgbtq_certified")
//     .eq("city_slug", citySlug)
//     .eq("active", true)
//     .order("plan_tier", { ascending: false })
//     .limit(6);

function getSeedTherapists(city: CityData): TherapistCard[] {
  return [
    { id: "1", name: "Alex M.", modalities: ["Swedish Massage", "Deep Tissue"], neighborhood: city.neighborhoods[0], rating: 4.9, reviewCount: 47, verified: true, lgbtqCertified: true },
    { id: "2", name: "Jordan K.", modalities: ["Sports Massage", "Trigger Point Therapy"], neighborhood: city.neighborhoods[1], rating: 4.8, reviewCount: 31, verified: true, lgbtqCertified: true },
    { id: "3", name: "Sam R.", modalities: ["Hot Stone", "Swedish Massage"], neighborhood: city.neighborhoods[2] ?? city.neighborhoods[0], rating: 5.0, reviewCount: 22, verified: true, lgbtqCertified: true },
    { id: "4", name: "Morgan T.", modalities: ["Prenatal Massage", "Lymphatic Drainage"], neighborhood: city.neighborhoods[3] ?? city.neighborhoods[1], rating: 4.7, reviewCount: 38, verified: true, lgbtqCertified: true },
    { id: "5", name: "Casey L.", modalities: ["Deep Tissue", "Myofascial Release"], neighborhood: city.neighborhoods[4] ?? city.neighborhoods[0], rating: 4.9, reviewCount: 19, verified: true, lgbtqCertified: false },
    { id: "6", name: "Riley B.", modalities: ["Thai Massage", "Swedish Massage"], neighborhood: city.neighborhoods[5] ?? city.neighborhoods[2] ?? city.neighborhoods[0], rating: 4.8, reviewCount: 55, verified: true, lgbtqCertified: true },
  ];
}

// ─── Static Params ────────────────────────────────────────────────────────────
// TODO: Replace with Supabase city table
export async function generateStaticParams() {
  return Object.keys(CITIES).map((slug) => ({ city: slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = CITIES[citySlug];
  if (!city) return { title: "City Not Found | MasseurMatch" };

  return {
    title: `LGBTQ+-Inclusive Massage Therapists in ${city.displayName} | MasseurMatch`,
    description: `Find verified, LGBTQ+-affirming massage therapists in ${city.displayName}. Browse ${city.therapistCount}+ licensed professionals offering Swedish, deep tissue, sports massage, and more.`,
    openGraph: {
      title: `Massage Therapists in ${city.displayName} | MasseurMatch`,
      description: `${city.therapistCount}+ verified, LGBTQ+-inclusive massage therapists in ${city.displayName}.`,
      url: `https://masseurmatch.com/massage-therapists/${city.slug}`,
      siteName: "MasseurMatch",
      type: "website",
    },
    alternates: { canonical: `https://masseurmatch.com/massage-therapists/${city.slug}` },
  };
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────
function buildSchemas(city: CityData) {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://masseurmatch.com/massage-therapists/${city.slug}`,
    name: `Massage Therapists in ${city.displayName} – MasseurMatch`,
    description: `LGBTQ+-inclusive massage therapist directory for ${city.displayName}. ${city.therapistCount}+ verified professionals.`,
    url: `https://masseurmatch.com/massage-therapists/${city.slug}`,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "State",
        name: city.stateName,
      },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Massage Therapy Services",
      itemListElement: city.modalities.map((m) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: m },
      })),
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://masseurmatch.com" },
      { "@type": "ListItem", position: 2, name: "Find a Therapist", item: "https://masseurmatch.com/search" },
      {
        "@type": "ListItem",
        position: 3,
        name: `Massage Therapists in ${city.displayName}`,
        item: `https://masseurmatch.com/massage-therapists/${city.slug}`,
      },
    ],
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Top Massage Therapists in ${city.displayName}`,
    description: `LGBTQ+-inclusive, verified massage therapists in ${city.displayName}`,
    numberOfItems: city.therapistCount,
    url: `https://masseurmatch.com/massage-therapists/${city.slug}`,
  };

  return { localBusiness, breadcrumb, itemList };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <span aria-label={`${rating} out of 5 stars`} style={{ color: "#FF8A1F", fontSize: 13 }}>
      {"★".repeat(full)}
      {rating % 1 >= 0.5 ? "½" : ""}
    </span>
  );
}

function TherapistCardUI({ t }: { t: TherapistCard }) {
  return (
    <Link
      href={`/therapists/${t.id}`}
      style={{
        display: "block",
        background: "#fff",
        padding: "28px",
        textDecoration: "none",
        color: "#0B1F3A",
        borderBottom: "3px solid transparent",
        transition: "border-color 0.2s",
        position: "relative",
      }}
    >
      {/* Avatar placeholder */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1E4B8F 0%, #0B1F3A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FF8A1F",
          fontSize: 20,
          marginBottom: 16,
        }}
      >
        ◎
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <h3 style={{ fontSize: 16, fontWeight: 400, fontFamily: "'Georgia', serif" }}>{t.name}</h3>
        {t.lgbtqCertified && (
          <span style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#FF8A1F", background: "rgba(255,138,31,0.1)", padding: "3px 8px", fontWeight: 700, flexShrink: 0 }}>
            LGBTQ+
          </span>
        )}
      </div>

      <p style={{ fontSize: 12, fontFamily: "system-ui, sans-serif", color: "#9CA3AF", marginBottom: 10 }}>{t.neighborhood}</p>

      <p style={{ fontSize: 13, fontFamily: "system-ui, sans-serif", color: "#6B7280", marginBottom: 14, lineHeight: 1.4 }}>
        {t.modalities.slice(0, 2).join(" · ")}
      </p>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <StarRating rating={t.rating} />
        <span style={{ fontSize: 12, fontFamily: "system-ui, sans-serif", color: "#9CA3AF" }}>
          {t.rating} ({t.reviewCount})
        </span>
        {t.verified && (
          <span style={{ fontSize: 10, fontFamily: "system-ui, sans-serif", color: "#1E4B8F", marginLeft: "auto" }}>✓ Verified</span>
        )}
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CityHubPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  const city = CITIES[citySlug];
  if (!city) notFound();

  const therapists = getSeedTherapists(city);
  const schemas = buildSchemas(city);

  return (
    <>
      <Script id="localbiz-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.localBusiness) }} />
      <Script id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }} />
      <Script id="itemlist-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.itemList) }} />

      <main style={{ background: "#FCFBF8", color: "#0B1F3A", fontFamily: "'Georgia', serif" }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ background: "#0B1F3A", padding: "14px 24px 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 8, fontSize: 12, fontFamily: "system-ui, sans-serif", color: "rgba(252,251,248,0.4)" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>›</span>
            <Link href="/search" style={{ color: "inherit", textDecoration: "none" }}>Find a Therapist</Link>
            <span>›</span>
            <span style={{ color: "#FF8A1F" }}>{city.displayName}</span>
          </div>
        </nav>

        {/* Hero */}
        <header style={{ background: "#0B1F3A", color: "#FCFBF8", padding: "56px 24px 80px", position: "relative", overflow: "hidden" }}>
          {[500, 700, 900].map((size) => (
            <div key={size} aria-hidden style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: "1px solid rgba(255,138,31,0.05)", top: "50%", right: -size / 2, transform: "translateY(-50%)", pointerEvents: "none" }} />
          ))}

          <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FF8A1F", marginBottom: 16, fontFamily: "system-ui, sans-serif" }}>
              {city.stateCode} · {city.therapistCount}+ Verified Therapists
            </p>
            <h1 style={{ fontSize: "clamp(30px, 5.5vw, 58px)", fontWeight: 400, lineHeight: 1.1, marginBottom: 20, maxWidth: 680 }}>
              LGBTQ+-Inclusive Massage Therapists in {city.displayName}
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, opacity: 0.65, fontFamily: "system-ui, sans-serif", fontWeight: 300, maxWidth: 540, marginBottom: 36 }}>
              Verified, licensed professionals committed to inclusive, affirming care — across every neighborhood in {city.name}.
            </p>

            {/* Inline search */}
            <div style={{ display: "flex", gap: 0, maxWidth: 500 }}>
              <input
                type="text"
                defaultValue={city.displayName}
                aria-label="Search city"
                style={{ flex: 1, padding: "14px 20px", fontSize: 14, fontFamily: "system-ui, sans-serif", border: "none", background: "rgba(252,251,248,0.1)", color: "#FCFBF8", outline: "none" }}
              />
              <Link
                href={`/search?city=${city.slug}`}
                style={{ padding: "14px 24px", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", background: "#FF8A1F", color: "#0B1F3A", textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center" }}
              >
                Search
              </Link>
            </div>
          </div>
        </header>

        {/* Stats bar */}
        <section style={{ background: "#1E4B8F", color: "#FCFBF8", padding: "28px 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 48, maxWidth: 900, margin: "0 auto" }}>
            {[
              { value: `${city.therapistCount}+`, label: "Active Therapists" },
              { value: city.neighborhoods.length.toString(), label: "Neighborhoods Covered" },
              { value: city.modalities.length.toString(), label: "Modalities Available" },
              { value: "100%", label: "License Verified" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#FF8A1F", fontFamily: "system-ui, sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.65, marginTop: 4, fontFamily: "system-ui, sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Main content */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 56, alignItems: "start" }}>

          {/* Left: therapist grid + content */}
          <div>
            {/* Featured therapists */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
              <h2 style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 400 }}>
                Therapists in {city.name}
              </h2>
              <Link href={`/search?city=${city.slug}`} style={{ fontSize: 12, fontFamily: "system-ui, sans-serif", color: "#FF8A1F", textDecoration: "none", letterSpacing: "0.1em" }}>
                View all {city.therapistCount}+ →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2, marginBottom: 56 }}>
              {therapists.map((t) => <TherapistCardUI key={t.id} t={t} />)}
            </div>

            {/* SEO text block */}
            <section aria-label={`About massage therapy in ${city.displayName}`} style={{ marginBottom: 52 }}>
              <h2 style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 400, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid rgba(11,31,58,0.08)" }}>
                Massage Therapy in {city.displayName}
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.85, color: "#374151", fontFamily: "system-ui, sans-serif", marginBottom: 20 }}>
                {city.seoBlurb}
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.85, color: "#374151", fontFamily: "system-ui, sans-serif", marginBottom: 20 }}>
                All therapists listed on MasseurMatch in {city.displayName} are manually verified against the {city.stateName} massage therapy licensing board. Our review process checks license status, confirms identity, and ensures each professional meets our LGBTQ+-Inclusive Practice Standards before their profile goes live.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.85, color: "#374151", fontFamily: "system-ui, sans-serif" }}>
                Whether you're looking for deep tissue work after a long week, prenatal massage support, or a Swedish session purely for relaxation — MasseurMatch makes it easy to find the right licensed therapist in {city.name} with the profile detail you need to choose confidently.
              </p>
            </section>

            {/* Modalities */}
            <section style={{ marginBottom: 52 }}>
              <h2 style={{ fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 400, marginBottom: 20 }}>
                Massage Modalities Available in {city.name}
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {city.modalities.map((m) => (
                  <Link
                    key={m}
                    href={`/search?city=${city.slug}&modality=${encodeURIComponent(m)}`}
                    style={{ fontSize: 13, fontFamily: "system-ui, sans-serif", color: "#0B1F3A", textDecoration: "none", background: "#fff", padding: "8px 16px", border: "1px solid rgba(11,31,58,0.12)" }}
                  >
                    {m}
                  </Link>
                ))}
              </div>
            </section>

            {/* Neighborhoods */}
            <section style={{ marginBottom: 52 }}>
              <h2 style={{ fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 400, marginBottom: 20 }}>
                Neighborhoods Covered in {city.name}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 2 }}>
                {city.neighborhoods.map((n) => (
                  <Link
                    key={n}
                    href={`/search?city=${city.slug}&neighborhood=${encodeURIComponent(n)}`}
                    style={{ display: "block", padding: "14px 18px", background: "#fff", fontSize: 13, fontFamily: "system-ui, sans-serif", color: "#374151", textDecoration: "none", borderLeft: "2px solid transparent", transition: "border-color 0.15s" }}
                  >
                    {n}
                  </Link>
                ))}
              </div>
            </section>

            {/* FAQ — local SEO */}
            <section>
              <h2 style={{ fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 400, marginBottom: 24 }}>
                Frequently Asked Questions
              </h2>
              {[
                {
                  q: `Are all massage therapists in ${city.displayName} on MasseurMatch licensed?`,
                  a: `Yes. Every therapist listed on MasseurMatch in ${city.displayName} holds a valid ${city.stateName} massage therapy license, manually verified before their profile is activated.`,
                },
                {
                  q: `Is MasseurMatch free to use in ${city.name}?`,
                  a: `Yes. Searching, browsing profiles, and contacting therapists is completely free for clients in ${city.displayName} and all other cities.`,
                },
                {
                  q: `How do I find an LGBTQ+-affirming massage therapist in ${city.name}?`,
                  a: `All therapists on MasseurMatch have committed to LGBTQ+-Inclusive Practice Standards. You can further filter search results by therapists with specific LGBTQ+ certifications or affirming specialties.`,
                },
                {
                  q: `What types of massage are available in ${city.displayName}?`,
                  a: `Therapists in ${city.name} offer ${city.modalities.slice(0, 4).join(", ")}, and more. Use the modality filter on the search page to find the specialty you need.`,
                },
              ].map((item, i) => (
                <details key={i} style={{ borderTop: "1px solid rgba(11,31,58,0.1)", padding: "20px 0" }}>
                  <summary style={{ fontSize: 15, fontWeight: 400, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", listStyle: "none", userSelect: "none" }}>
                    {item.q}
                    <span style={{ color: "#FF8A1F", fontSize: 18, flexShrink: 0, marginLeft: 16 }}>+</span>
                  </summary>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "#6B7280", fontFamily: "system-ui, sans-serif", marginTop: 12, paddingRight: 32 }}>{item.a}</p>
                </details>
              ))}
              <div style={{ borderTop: "1px solid rgba(11,31,58,0.1)" }} />
            </section>
          </div>

          {/* Sidebar */}
          <aside style={{ position: "sticky", top: 100 }}>
            {/* Search refinement */}
            <div style={{ background: "#0B1F3A", color: "#FCFBF8", padding: "28px", marginBottom: 24 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#FF8A1F", marginBottom: 16 }}>
                Refine Your Search
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["All Therapists", "LGBTQ+ Certified", "Accepts New Clients", "Available This Week"].map((filter) => (
                  <label key={filter} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, fontFamily: "system-ui, sans-serif", cursor: "pointer" }}>
                    <input type="checkbox" style={{ accentColor: "#FF8A1F" }} defaultChecked={filter === "All Therapists"} />
                    {filter}
                  </label>
                ))}
              </div>
              <Link href={`/search?city=${city.slug}`} style={{ display: "block", textAlign: "center", marginTop: 20, padding: "12px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", background: "#FF8A1F", color: "#0B1F3A", textDecoration: "none", fontWeight: 700 }}>
                Search {city.name}
              </Link>
            </div>

            {/* Nearby cities */}
            {city.nearbyAreas.length > 0 && (
              <div style={{ background: "#fff", padding: "24px" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#FF8A1F", marginBottom: 14 }}>
                  Nearby Areas
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {city.nearbyAreas.map((area) => (
                    <Link key={area.slug} href={`/massage-therapists/${area.slug}`} style={{ display: "block", padding: "10px 0", fontSize: 13, fontFamily: "system-ui, sans-serif", color: "#374151", textDecoration: "none", borderBottom: "1px solid rgba(11,31,58,0.06)" }}>
                      {area.name} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trust signal */}
            <div style={{ background: "#1E4B8F", color: "#FCFBF8", padding: "24px", marginTop: 16 }}>
              <p style={{ fontSize: 13, lineHeight: 1.65, fontFamily: "system-ui, sans-serif", opacity: 0.8, margin: 0 }}>
                Every therapist in {city.name} is manually verified and has committed to LGBTQ+-Inclusive Practice Standards.
              </p>
              <Link href="/trust" style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", color: "#FF8A1F", textDecoration: "none", marginTop: 14 }}>
                How We Verify →
              </Link>
            </div>
          </aside>
        </div>

        {/* CTA */}
        <section style={{ background: "#0B1F3A", color: "#FCFBF8", padding: "72px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 400, marginBottom: 14 }}>
            List your {city.name} practice on MasseurMatch
          </h2>
          <p style={{ fontSize: 15, opacity: 0.6, marginBottom: 32, fontFamily: "system-ui, sans-serif" }}>
            Reach LGBTQ+-affirming clients who are actively searching in {city.name}. Free to start.
          </p>
          <Link href="/therapists/register" style={{ display: "inline-block", padding: "14px 36px", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", background: "#FF8A1F", color: "#0B1F3A", textDecoration: "none", fontWeight: 700 }}>
            List Your Practice
          </Link>
        </section>
      </main>
    </>
  );
}
