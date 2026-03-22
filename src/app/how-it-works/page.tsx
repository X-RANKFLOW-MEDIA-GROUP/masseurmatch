import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works | Finding a Massage Therapist on MasseurMatch",
  description:
    "Learn how MasseurMatch works — search verified therapists, review profiles, connect directly, and book on your terms. Free for clients, LGBTQ+-inclusive always.",
  openGraph: {
    title: "How MasseurMatch Works",
    description:
      "Search, discover, and connect with verified LGBTQ+-inclusive massage therapists in minutes.",
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
      text: "Browse detailed therapist profiles including credentials, services offered, rates, photos, and verified client reviews.",
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
      name: "Book Your Session",
      text: "Coordinate your appointment directly with the therapist on the schedule and terms that work for both of you.",
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
    body: "Enter your city or ZIP. Filter by modality — Swedish, deep tissue, sports, prenatal, and more. Set your price range.",
    detail: "104 cities covered across the US",
  },
  {
    n: "02",
    title: "Review detailed profiles",
    body: "See credentials, services, rates, photos, and verified reviews. The therapist's LGBTQ+ commitment is displayed clearly on every profile.",
    detail: "All licenses manually verified",
  },
  {
    n: "03",
    title: "Connect directly",
    body: "Message or call your therapist directly — no platform intermediary, no booking fee taken. 100% of your payment goes to your therapist.",
    detail: "Zero booking commissions",
  },
  {
    n: "04",
    title: "Experience & review",
    body: "After your session, leave a review to help the community. Your feedback shapes who gets visibility and keeps quality high.",
    detail: "Reviews manually moderated",
  },
];

const therapistSteps = [
  {
    n: "01",
    title: "Create your profile",
    body: "Add your bio, services, rates, availability, photos, and training. Build a profile that represents your full practice.",
  },
  {
    n: "02",
    title: "License verification",
    body: "Submit your state license. We cross-check with licensing boards and activate your listing within 1–2 business days.",
  },
  {
    n: "03",
    title: "Go live & get discovered",
    body: "Your profile is indexed by Google and appears in local searches. Clients find you on their terms.",
  },
  {
    n: "04",
    title: "Clients contact you",
    body: "No booking system to manage. Clients reach you directly and you coordinate sessions your way.",
  },
];

const questions = [
  {
    q: "Is MasseurMatch free for clients?",
    a: "Yes. Searching, browsing, and contacting therapists is completely free for clients.",
  },
  {
    q: "Does MasseurMatch take a booking fee?",
    a: "No. We never take a percentage of your session payment. Clients pay therapists directly.",
  },
  {
    q: "How is MasseurMatch different from Soothe or Zeel?",
    a: "Soothe and Zeel are on-demand service companies — they employ therapists and take a cut of every booking. MasseurMatch is a pure directory: we connect you with independent professionals. You deal directly with the therapist.",
  },
  {
    q: "Are all therapists really LGBTQ+-affirming?",
    a: "Yes. Every therapist agrees to our LGBTQ+-Inclusive Practice Standards before their profile goes live. It's not a filter — it's a prerequisite.",
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
              fontSize: 17,
              lineHeight: 1.7,
              maxWidth: 500,
              margin: "0 auto 44px",
              opacity: 0.65,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
            }}
          >
            MasseurMatch is a directory, not a booking platform. We connect you
            with verified professionals and then step aside.
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
            padding: "40px 24px",
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
            <strong>MasseurMatch is a directory, not a service company.</strong>{" "}
            We don't employ therapists, take booking fees, or insert ourselves
            into your session. We just make the right connection.
          </p>
        </section>

        {/* ── Client Steps ── */}
        <section style={{ padding: "100px 24px" }}>
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
              From search to session in four steps
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
                  "0% booking commission",
                  "Independent therapists",
                  "Direct client–therapist contact",
                  "You choose your price",
                  "LGBTQ+-inclusive by design",
                  "Licensed & verified professionals",
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
