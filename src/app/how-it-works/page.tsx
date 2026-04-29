import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works | MasseurMatch Directory",
  description:
    "Learn how MasseurMatch works — search massage therapists, review profiles, connect directly. Free directory service.",
  openGraph: {
    title: "How MasseurMatch Works",
    description:
      "Search and discover LGBTQ+-inclusive massage therapists.",
    url: "https://masseurmatch.com/how-it-works",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/how-it-works" },
};

const howItWorksSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Find a Massage Therapist on MasseurMatch",
  description:
    "Step-by-step guide to finding and connecting with a verified, LGBTQ+-inclusive massage therapist using MasseurMatch.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Search Your City",
      text: "Enter your city or ZIP code in the search bar. Filter by massage modality, price range, and other preferences.",
      url: "https://masseurmatch.com/search",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Review Profiles",
      text: "Browse detailed therapist profiles including services offered, rates, photos, and verified client reviews.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Connect Directly",
      text: "Reach out to your chosen therapist through the platform. All contact goes directly to the therapist — no middleman.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Book confidently",
      text: "Use contact options to confirm details directly, then finalize the session with your selected therapist.",
    },
  ],
  totalTime: "PT5M",
  tool: {
    "@type": "HowToTool",
    name: "MasseurMatch",
  },
};

const clientSteps = [
  {
    n: "01",
    title: "Search your city",
    body: "Enter your city or ZIP. Filter by modality — Swedish, deep tissue, sports, and more. Set your price range.",
    detail: "104 cities covered across the US",
  },
  {
    n: "02",
    title: "Review detailed profiles",
    body: "See services, rates, photos, and client reviews. The therapist's LGBTQ+ affirmation is displayed clearly on every profile.",
    detail: "Transparent therapist information",
  },
  {
    n: "03",
    title: "Connect directly",
    body: "Message or call your therapist directly using the contact buttons. No intermediary, direct communication.",
    detail: "Direct therapist contact",
  },
  {
    n: "04",
    title: "Experience & review",
    body: "After connecting with a therapist, share your experience. Your feedback helps the community.",
    detail: "Community feedback",
  },
];

const therapistSteps = [
  {
    n: "01",
    title: "Create your profile",
    body: "Add your bio, services, rates, availability, photos, and background. Build a profile that represents your practice.",
  },
  {
    n: "02",
    title: "Go live & get discovered",
    body: "Your profile is indexed by search engines and appears in local searches. Potential clients find you directly.",
  },
  {
    n: "03",
    title: "Clients reach out",
    body: "Manage your own schedule and communication. Clients contact you directly using the contact buttons on your profile.",
  },
  {
    n: "04",
    title: "Build your reputation",
    body: "Help clients understand your services by maintaining a complete, accurate profile. Reviews help build community trust.",
  },
];

const questions = [
  {
    q: "Is MasseurMatch free?",
    a: "Yes. MasseurMatch is a free directory for browsing and contacting therapists.",
  },
  {
    q: "Does MasseurMatch collect payments or take fees?",
    a: "No. MasseurMatch is a directory service only. We do not collect payments, process transactions, or take commissions. All communication and arrangements are made directly between you and the therapist.",
  },
  {
    q: "How is MasseurMatch different from Soothe or Zeel?",
    a: "Soothe and Zeel are on-demand service platforms. MasseurMatch is a directory: we connect you directly with independent therapists. All communication and arrangements happen directly.",
  },
  {
    q: "Is my information private?",
    a: "Yes. Your information is kept private and is only used to facilitate direct contact with therapists you choose to reach out to.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Script
        id="how-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema) }}
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
            padding: "clamp(64px, 10vw, 100px) 20px clamp(56px, 8vw, 90px)",
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
            How It Works
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 6.5vw, 66px)",
              fontWeight: 400,
              lineHeight: 1.08,
              maxWidth: 760,
              margin: "0 auto 24px",
            }}
          >
            Finding your therapist
            <br />
            <em style={{ color: "#FF8A1F", fontStyle: "italic" }}>
              takes minutes.
            </em>
          </h1>
          <p
            style={{
              fontSize: "clamp(15px, 2.6vw, 17px)",
              lineHeight: 1.7,
              maxWidth: 500,
              margin: "0 auto 44px",
              opacity: 0.65,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
            }}
          >
            MasseurMatch is a directory service. We connect you
            with massage therapists and step aside.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/search"
              style={{
                display: "inline-block",
                padding: "15px 36px",
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
              Search Therapists
            </Link>
            <Link
              href="#for-therapists"
              style={{
                display: "inline-block",
                padding: "15px 28px",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
                background: "transparent",
                color: "#FCFBF8",
                textDecoration: "none",
                border: "1px solid rgba(252,251,248,0.2)",
              }}
            >
              I'm a Therapist
            </Link>
          </div>
        </section>

        {/* ── Model Explainer ── */}
        <section
          style={{
            background: "#FF8A1F",
            padding: "clamp(28px, 5vw, 40px) 20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontFamily: "system-ui, sans-serif",
              color: "#0B1F3A",
              fontWeight: 500,
              maxWidth: 680,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            <strong>MasseurMatch is a directory service.</strong>{" "}
            We connect you with therapists and facilitate direct contact.
            All arrangements happen between you and the therapist.
          </p>
        </section>

        {/* ── Client Steps ── */}
        <section style={{ padding: "clamp(56px, 9vw, 100px) 20px" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
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
              For Clients
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 400,
                marginBottom: 60,
                maxWidth: 480,
                lineHeight: 1.25,
              }}
            >
              Connect directly in four steps
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 0 }}
            >
              {clientSteps.map((s, i) => (
                <div
                  key={s.n}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr auto",
                    gap: 32,
                    alignItems: "start",
                    padding: "36px 0",
                    borderBottom: "1px solid rgba(11,31,58,0.08)",
                    borderTop: i === 0 ? "1px solid rgba(11,31,58,0.08)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 700,
                      color: "rgba(255,138,31,0.2)",
                      fontFamily: "system-ui, sans-serif",
                      lineHeight: 1,
                      paddingTop: 4,
                    }}
                  >
                    {s.n}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: 19,
                        fontWeight: 400,
                        marginBottom: 10,
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
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: "system-ui, sans-serif",
                      color: "#FF8A1F",
                      background: "rgba(255,138,31,0.08)",
                      padding: "6px 12px",
                      whiteSpace: "nowrap",
                      alignSelf: "center",
                    }}
                  >
                    {s.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison ── */}
        <section
          style={{
            background: "#0B1F3A",
            color: "#FCFBF8",
            padding: "100px 24px",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#FF8A1F",
                marginBottom: 20,
                fontFamily: "system-ui, sans-serif",
                textAlign: "center",
              }}
            >
              The Difference
            </p>
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 38px)",
                fontWeight: 400,
                textAlign: "center",
                marginBottom: 56,
              }}
            >
              Directory vs. Service Platform
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
              }}
            >
              {/* MasseurMatch column */}
              <div style={{ background: "#1E4B8F", padding: "40px 36px" }}>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontFamily: "system-ui, sans-serif",
                    color: "#FF8A1F",
                    marginBottom: 24,
                    fontWeight: 700,
                  }}
                >
                  MasseurMatch
                </div>
                {[
                  "Free to search & browse",
                  "Direct therapist contact",
                  "Independent therapists",
                  "No intermediary in communication",
                  "Therapist sets their rates",
                  "LGBTQ+-inclusive therapists available",
                  "Transparent therapist profiles",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(252,251,248,0.08)",
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "#FF8A1F" }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* Others column */}
              <div
                style={{
                  background: "rgba(252,251,248,0.04)",
                  padding: "40px 36px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontFamily: "system-ui, sans-serif",
                    color: "rgba(252,251,248,0.35)",
                    marginBottom: 24,
                    fontWeight: 700,
                  }}
                >
                  On-Demand Platforms
                </div>
                {[
                  "Free to browse",
                  "20–30% commission on every booking",
                  "Platform-employed or contract workers",
                  "Platform controls communication",
                  "Platform sets pricing tiers",
                  "Inclusion varies by therapist",
                  "Varying verification standards",
                ].map((item, i) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(252,251,248,0.06)",
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 14,
                      opacity: 0.5,
                    }}
                  >
                    <span>{i > 0 ? "✕" : "✓"}</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── For Therapists ── */}
        <section
          id="for-therapists"
          style={{ padding: "100px 24px", scrollMarginTop: 80 }}
        >
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
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
              For Therapists
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 400,
                marginBottom: 60,
                maxWidth: 480,
                lineHeight: 1.25,
              }}
            >
              Getting your practice listed
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 2,
              }}
            >
              {therapistSteps.map((s) => (
                <div
                  key={s.n}
                  style={{ background: "#fff", padding: "36px 28px" }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "rgba(255,138,31,0.2)",
                      fontFamily: "system-ui, sans-serif",
                      lineHeight: 1,
                      marginBottom: 16,
                    }}
                  >
                    {s.n}
                  </div>
                  <h3
                    style={{ fontSize: 16, fontWeight: 400, marginBottom: 10 }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
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
            <div style={{ marginTop: 36 }}>
              <Link
                href="/for-therapists"
                style={{
                  display: "inline-block",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "system-ui, sans-serif",
                  color: "#FF8A1F",
                  textDecoration: "none",
                  borderBottom: "1px solid #FF8A1F",
                  paddingBottom: 2,
                }}
              >
                Full Therapist Guide →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Quick FAQ ── */}
        <section
          style={{
            background: "#FCFBF8",
            borderTop: "1px solid rgba(11,31,58,0.08)",
            padding: "80px 24px",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 400,
                marginBottom: 44,
              }}
            >
              Quick answers
            </h2>
            {questions.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "24px 0",
                  borderBottom: "1px solid rgba(11,31,58,0.08)",
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    marginBottom: 10,
                  }}
                >
                  {item.q}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.75,
                    color: "#6B7280",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {item.a}
                </p>
              </div>
            ))}
            <p
              style={{
                marginTop: 32,
                fontSize: 14,
                fontFamily: "system-ui, sans-serif",
                color: "#9CA3AF",
              }}
            >
              More questions?{" "}
              <Link href="/faq" style={{ color: "#1E4B8F" }}>
                Full FAQ →
              </Link>
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          style={{
            background: "#0B1F3A",
            color: "#FCFBF8",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(24px, 3.5vw, 38px)",
              fontWeight: 400,
              marginBottom: 14,
            }}
          >
            Ready to find your match?
          </h2>
          <p
            style={{
              fontSize: 15,
              opacity: 0.6,
              marginBottom: 36,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Free for clients. Verified for everyone.
          </p>
          <Link
            href="/search"
            style={{
              display: "inline-block",
              padding: "15px 40px",
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
            Search Therapists Now
          </Link>
        </section>
      </main>
    </>
  );
}
