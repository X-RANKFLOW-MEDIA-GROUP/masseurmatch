import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust & Safety | How MasseurMatch Protects You",
  description:
    "Learn how MasseurMatch verifies therapists, protects your privacy, and ensures a safe, LGBTQ+-affirming environment for every client and professional.",
  openGraph: {
    title: "Trust & Safety | MasseurMatch",
    description:
      "How MasseurMatch verifies therapists and ensures a safe experience for clients and professionals.",
    url: "https://masseurmatch.com/trust",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/trust" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Trust & Safety – MasseurMatch",
  url: "https://masseurmatch.com/trust",
  description:
    "MasseurMatch's commitment to therapist verification, client privacy, and LGBTQ+-inclusive safety practices.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
};

const verificationSteps = [
  {
    step: "01",
    title: "License Verification",
    body: "Every therapist submits their state massage therapy license. We cross-reference with the relevant state licensing board before activation.",
  },
  {
    step: "02",
    title: "Profile Review",
    body: "A human reviewer checks each profile for accuracy, appropriate content, and alignment with our community guidelines — no automated rubber-stamping.",
  },
  {
    step: "03",
    title: "Inclusive Commitment",
    body: "Therapists explicitly agree to our LGBTQ+-Inclusive Practice Standards. This commitment is displayed on their profile for transparency.",
  },
  {
    step: "04",
    title: "Ongoing Monitoring",
    body: "Client reviews and reports are reviewed by our team. Therapists who receive substantiated complaints are removed promptly.",
  },
];

const privacyPoints = [
  {
    title: "We never sell your data",
    body: "Your search history, booking details, and personal information are never sold to third parties, ever. Full stop.",
  },
  {
    title: "Discreet browsing",
    body: "Search results and profile views are not visible to therapists until you choose to reach out. Browse on your terms.",
  },
  {
    title: "Minimal data collection",
    body: "We collect only what we need to operate the directory. No health data is ever collected or stored.",
  },
  {
    title: "Secure messaging",
    body: "All communication through the platform is encrypted in transit. Messages are stored securely and not accessed by staff unless required for safety.",
  },
];

const communityStandards = [
  "Zero tolerance for discrimination based on gender identity, sexual orientation, race, disability, or religion",
  "All listed services must be legal, licensed therapeutic massage",
  "Therapists must maintain appropriate professional boundaries at all times",
  "Clients have the right to end any session at any time without penalty",
  "Any harassment — from either side — results in immediate account suspension",
  "We cooperate fully with law enforcement in cases involving illegal activity",
];

export default function TrustPage() {
  return (
    <>
      <Script
        id="trust-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        style={{
          background: "#FCFBF8",
          color: "#0B1F3A",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          minHeight: "100vh",
        }}
      >
        {/* ── Hero ── */}
        <section
          style={{
            background: "#0B1F3A",
            color: "#FCFBF8",
            padding: "100px 24px 90px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#FF8A1F",
              marginBottom: 20,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Trust & Safety
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 62px)",
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: 20,
              maxWidth: 700,
              margin: "0 auto 20px",
            }}
          >
            Safety is not a feature.
            <br />
            <em style={{ color: "#FF8A1F", fontStyle: "italic" }}>
              It's the product.
            </em>
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "rgba(252,251,248,0.65)",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Every decision we make — from how we onboard therapists to how we
            handle your data — starts with your safety and dignity.
          </p>
        </section>

        {/* ── Commitment Badges ── */}
        <section
          style={{
            background: "#FF8A1F",
            padding: "40px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 40,
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {[
              "✓  LGBTQ+-Inclusive",
              "✓  License Verified",
              "✓  Privacy First",
              "✓  Human-Reviewed",
            ].map((badge) => (
              <span
                key={badge}
                style={{
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 700,
                  color: "#0B1F3A",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </section>

        {/* ── Verification Process ── */}
        <section style={{ padding: "100px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#FF8A1F",
                marginBottom: 20,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Therapist Verification
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 400,
                marginBottom: 60,
                maxWidth: 600,
                lineHeight: 1.25,
              }}
            >
              Every therapist earns their listing — it's not automatic
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 2,
              }}
            >
              {verificationSteps.map((s) => (
                <div
                  key={s.step}
                  style={{ background: "#fff", padding: "40px 32px" }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      fontFamily: "system-ui, sans-serif",
                      color: "#FF8A1F",
                      marginBottom: 20,
                      fontWeight: 700,
                    }}
                  >
                    Step {s.step}
                  </div>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 400,
                      marginBottom: 14,
                      lineHeight: 1.3,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.75,
                      color: "#6B7280",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Privacy ── */}
        <section
          style={{
            background: "#1E4B8F",
            color: "#FCFBF8",
            padding: "100px 24px",
          }}
        >
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#FF8A1F",
                marginBottom: 20,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Your Privacy
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 400,
                marginBottom: 60,
                maxWidth: 580,
                lineHeight: 1.25,
              }}
            >
              Your health journey is your business — not ours
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 2,
              }}
            >
              {privacyPoints.map((p) => (
                <div
                  key={p.title}
                  style={{
                    borderLeft: "1px solid rgba(252,251,248,0.12)",
                    padding: "0 32px 0 28px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 400,
                      marginBottom: 12,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.75,
                      opacity: 0.6,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 48 }}>
              <Link
                href="/privacy"
                style={{
                  display: "inline-block",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#FF8A1F",
                  textDecoration: "none",
                  fontFamily: "system-ui, sans-serif",
                  borderBottom: "1px solid #FF8A1F",
                  paddingBottom: 2,
                }}
              >
                Read Full Privacy Policy →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Community Standards ── */}
        <section style={{ padding: "100px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#FF8A1F",
                marginBottom: 20,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Community Standards
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 400,
                marginBottom: 48,
                lineHeight: 1.25,
              }}
            >
              The rules that protect everyone in our community
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 0 }}
            >
              {communityStandards.map((standard, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 20,
                    alignItems: "flex-start",
                    padding: "24px 0",
                    borderBottom: "1px solid rgba(11,31,58,0.08)",
                  }}
                >
                  <span
                    style={{
                      color: "#FF8A1F",
                      fontSize: 18,
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  >
                    ◎
                  </span>
                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: 1.65,
                      fontFamily: "system-ui, sans-serif",
                      color: "#374151",
                    }}
                  >
                    {standard}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Report Section ── */}
        <section
          style={{
            background: "#0B1F3A",
            color: "#FCFBF8",
            padding: "80px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 700,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 38px)",
                fontWeight: 400,
                marginBottom: 16,
              }}
            >
              Something feel wrong?
            </h2>
            <p
              style={{
                fontSize: 16,
                opacity: 0.65,
                marginBottom: 36,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.7,
              }}
            >
              Report a safety concern, inappropriate profile, or policy
              violation. We take every report seriously and respond within 24
              hours.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="mailto:safety@masseurmatch.com"
                style={{
                  display: "inline-block",
                  padding: "14px 32px",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "system-ui, sans-serif",
                  background: "#FF8A1F",
                  color: "#0B1F3A",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Report a Concern
              </a>
              <Link
                href="/contact"
                style={{
                  display: "inline-block",
                  padding: "14px 32px",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "system-ui, sans-serif",
                  background: "transparent",
                  color: "#FCFBF8",
                  textDecoration: "none",
                  border: "1px solid rgba(252,251,248,0.3)",
                }}
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
