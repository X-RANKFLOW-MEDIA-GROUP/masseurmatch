import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About MasseurMatch | The LGBTQ+-Inclusive Massage Directory",
  description:
    "MasseurMatch connects clients with professional, vetted massage therapists in a safe, LGBTQ+-inclusive environment. Learn our story, mission, and values.",
  openGraph: {
    title: "About MasseurMatch | The LGBTQ+-Inclusive Massage Directory",
    description:
      "MasseurMatch connects clients with professional, vetted massage therapists in a safe, LGBTQ+-inclusive environment.",
    url: "https://masseurmatch.com/about",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/about" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About MasseurMatch",
  url: "https://masseurmatch.com/about",
  description:
    "MasseurMatch is the leading LGBTQ+-inclusive massage therapist directory, connecting clients with verified professionals across the United States.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
    logo: {
      "@type": "ImageObject",
      url: "https://masseurmatch.com/logo.png",
    },
    sameAs: [
      "https://www.instagram.com/masseurmatch",
      "https://www.facebook.com/masseurmatch",
    ],
  },
};

const pillars = [
  {
    icon: "✦",
    title: "Inclusivity First",
    body: "Every therapist on our platform is committed to a welcoming, judgment-free experience for LGBTQ+ clients, allies, and everyone in between.",
  },
  {
    icon: "◈",
    title: "Verified Professionals",
    body: "We manually review each therapist profile. Credentials, licensing, and identity are validated before any listing goes live.",
  },
  {
    icon: "◎",
    title: "Privacy by Design",
    body: "Your searches, bookings, and personal data are never sold or shared. We engineer privacy into every layer of the platform.",
  },
  {
    icon: "⬡",
    title: "Community Driven",
    body: "Built from within the community, with the community. Therapist feedback shapes every feature we ship.",
  },
];

const stats = [
  { value: "2,400+", label: "Verified Therapists" },
  { value: "104", label: "Cities Covered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "100%", label: "LGBTQ+-Inclusive" },
];

export default function AboutPage() {
  return (
    <>
      <Script
        id="about-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        style={{
          background: "#FCFBF8",
          color: "#0B1F3A",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        {/* ── Hero ── */}
        <section
          style={{
            background: "#0B1F3A",
            color: "#FCFBF8",
            padding: "120px 24px 100px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative arc */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: -80,
              left: "50%",
              transform: "translateX(-50%)",
              width: 900,
              height: 160,
              borderRadius: "50%",
              background: "#FCFBF8",
            }}
          />
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#FF8A1F",
              marginBottom: 24,
            }}
          >
            Our Story
          </p>
          <h1
            style={{
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 400,
              lineHeight: 1.1,
              maxWidth: 820,
              margin: "0 auto 28px",
              fontFamily: "'Georgia', serif",
            }}
          >
            Healing starts with{" "}
            <em style={{ color: "#FF8A1F", fontStyle: "italic" }}>belonging</em>
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              maxWidth: 580,
              margin: "0 auto",
              opacity: 0.8,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
            }}
          >
            MasseurMatch was built on a simple belief: every person deserves to
            find professional massage therapy in an environment where they feel
            completely safe, seen, and respected.
          </p>
        </section>

        {/* ── Stats ── */}
        <section
          style={{
            background: "#1E4B8F",
            color: "#FCFBF8",
            padding: "60px 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              maxWidth: 900,
              margin: "0 auto",
              gap: 40,
              textAlign: "center",
            }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontSize: "clamp(32px, 5vw, 52px)",
                    fontWeight: 700,
                    color: "#FF8A1F",
                    fontFamily: "system-ui, sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    opacity: 0.7,
                    marginTop: 8,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mission ── */}
        <section style={{ padding: "100px 24px", maxWidth: 780, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#FF8A1F",
              marginBottom: 20,
            }}
          >
            Our Mission
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 400,
              lineHeight: 1.25,
              marginBottom: 28,
              maxWidth: 640,
            }}
          >
            Connecting people with therapists who truly understand them
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
              fontFamily: "system-ui, sans-serif",
              fontSize: 16,
              lineHeight: 1.8,
              color: "#374151",
            }}
          >
            <p>
              Finding a massage therapist shouldn't require navigating awkward
              disclaimers or wondering if you'll be welcomed. For too long,
              LGBTQ+ individuals had to rely on word-of-mouth just to find a
              safe table.
            </p>
            <p>
              MasseurMatch changes that. We built a platform where inclusive
              practice isn't a filter — it's the foundation. Every profile,
              every search, every booking is designed with your comfort and
              dignity at the center.
            </p>
          </div>
        </section>

        {/* ── Pillars ── */}
        <section
          style={{
            background: "#0B1F3A",
            color: "#FCFBF8",
            padding: "100px 24px",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#FF8A1F",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              What We Stand For
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 400,
                textAlign: "center",
                marginBottom: 64,
              }}
            >
              Our core principles
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 2,
              }}
            >
              {pillars.map((p) => (
                <div
                  key={p.title}
                  style={{
                    padding: "48px 36px",
                    borderLeft: "1px solid rgba(252,251,248,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      color: "#FF8A1F",
                      marginBottom: 20,
                    }}
                  >
                    {p.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 400,
                      marginBottom: 14,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.75,
                      opacity: 0.65,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Origin Story ── */}
        <section style={{ padding: "100px 24px" }}>
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 64,
              alignItems: "start",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#FF8A1F",
                  marginBottom: 20,
                }}
              >
                The Origin
              </p>
              <div
                style={{
                  width: 1,
                  height: 120,
                  background: "#FF8A1F",
                  margin: "24px 0",
                }}
              />
              <p
                style={{
                  fontSize: 13,
                  fontFamily: "system-ui, sans-serif",
                  color: "#6B7280",
                  lineHeight: 1.7,
                }}
              >
                Founded in Dallas, TX
                <br />
                Operating across the US
              </p>
            </div>
            <div>
              <h2
                style={{
                  fontSize: "clamp(24px, 3.5vw, 38px)",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  marginBottom: 32,
                }}
              >
                Born from a gap the market refused to fill
              </h2>
              <div
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 16,
                  lineHeight: 1.85,
                  color: "#374151",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <p>
                  MasseurMatch started with a straightforward frustration:
                  existing massage directories were built for a default client
                  that doesn't reflect the full diversity of people seeking
                  therapeutic care. LGBTQ+ clients deserved a space built for
                  them — not as an afterthought, but as the starting point.
                </p>
                <p>
                  Today, MasseurMatch operates as a pure directory platform
                  under XRankFlow Media Group LLC — we don't employ therapists,
                  we connect people. That distinction means our only incentive
                  is to make the connection as good as possible for both sides.
                </p>
                <p>
                  We're proud to be LGBTQ+-owned and committed to the community
                  we serve. This isn't a pivot or a feature flag — it's the
                  entire reason we exist.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          style={{
            background: "#FF8A1F",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 400,
              color: "#0B1F3A",
              marginBottom: 16,
            }}
          >
            Ready to find your therapist?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#0B1F3A",
              opacity: 0.8,
              marginBottom: 36,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Browse verified, LGBTQ+-inclusive professionals near you.
          </p>
          <Link
            href="/search"
            style={{
              display: "inline-block",
              background: "#0B1F3A",
              color: "#FCFBF8",
              padding: "16px 40px",
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Search Therapists
          </Link>
        </section>
      </main>
    </>
  );
}
