import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "List Your Massage Practice | For Therapists - MasseurMatch",
  description:
    "Grow your massage therapy practice with MasseurMatch. Get discovered by LGBTQ+-affirming clients, manage your profile, and build a sustainable independent business.",
  openGraph: {
    title: "List Your Massage Practice on MasseurMatch",
    description:
      "Join verified massage therapists on the leading LGBTQ+-inclusive directory.",
    url: "https://masseurmatch.com/for-therapists",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/for-therapists" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "List Your Massage Practice - MasseurMatch",
  url: "https://masseurmatch.com/for-therapists",
  description:
    "MasseurMatch helps independent massage therapists grow their practices by connecting them with LGBTQ+-affirming clients across the United States.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
  potentialAction: {
    "@type": "RegisterAction",
    target: "https://masseurmatch.com/register",
    name: "List Your Practice",
  },
};

const benefits = [
  {
    icon: "01",
    title: "Reach clients who value you",
    body: "Our community actively seeks inclusive, affirming therapists. Every client browsing MasseurMatch is already aligned with your values.",
  },
  {
    icon: "02",
    title: "Own your professional identity",
    body: "Build a profile that represents your full practice - modalities, training, rates, availability, and photos. No generic templates.",
  },
  {
    icon: "03",
    title: "No bookings taken from you",
    body: "Clients contact you directly. We do not insert ourselves into the transaction or take a booking fee. Your business stays your business.",
  },
  {
    icon: "04",
    title: "Verified badge builds trust",
    body: "Our verification process signals to clients that you are committed to professional standards before they even read your bio.",
  },
  {
    icon: "05",
    title: "Built for independent therapists",
    body: "No employer. No franchise. No commission. Just a high-quality directory that sends you clients and gets out of the way.",
  },
  {
    icon: "06",
    title: "SEO-powered visibility",
    body: "Your profile is indexed by Google and optimized for local searches like 'LGBTQ+ massage therapist Dallas.' We do the SEO work so you do not have to.",
  },
];

const steps = [
  {
    n: "01",
    title: "Create your profile",
    body: "Add your credentials, services, photos, and rates. Takes about 15 minutes.",
  },
  {
    n: "02",
    title: "Submit your profile details",
    body: "Our team reviews profile quality and safety details within 1-2 business days.",
  },
  {
    n: "03",
    title: "Go live",
    body: "Your profile goes live and starts appearing in searches. Clients reach out directly to you.",
  },
  {
    n: "04",
    title: "Grow at your pace",
    body: "Upgrade your plan anytime to unlock priority placement and enhanced visibility.",
  },
];

const testimonials = [
  {
    quote:
      "Since listing on MasseurMatch, about 40% of my new clients mention they found me there specifically because they wanted a safe space. That alignment matters for both of us.",
    name: "Jordan T.",
    location: "Austin, TX",
    years: "LMT, 8 years",
  },
  {
    quote:
      "I tried other directories but the client base here is completely different - more intentional, more respectful. My cancellation rate dropped significantly.",
    name: "Marcus R.",
    location: "Chicago, IL",
    years: "LMT, 5 years",
  },
  {
    quote:
      "Setting up was fast and the verification gave me credibility I could not build on my own website alone. Clients trust the badge.",
    name: "Elena V.",
    location: "Miami, FL",
    years: "LMT, 11 years",
  },
];

export default function ForTherapistsPage() {
  return (
    <>
      <Script
        id="therapists-jsonld"
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
        {/* Hero */}
        <section
          style={{
            background: "#0B1F3A",
            color: "#FCFBF8",
            padding: "110px 24px 100px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {[420, 580, 740].map((size) => (
            <div
              key={size}
              aria-hidden
              style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                border: "1px solid rgba(255,138,31,0.07)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                pointerEvents: "none",
              }}
            />
          ))}

          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#FF8A1F",
              marginBottom: 24,
              fontFamily: "system-ui, sans-serif",
              position: "relative",
            }}
          >
            For Therapists
          </p>
          <h1
            style={{
              fontSize: "clamp(38px, 7vw, 72px)",
              fontWeight: 400,
              lineHeight: 1.05,
              maxWidth: 780,
              margin: "0 auto 28px",
              position: "relative",
            }}
          >
            Your practice deserves{" "}
            <em style={{ color: "#FF8A1F", fontStyle: "italic" }}>
              the right clients.
            </em>
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              maxWidth: 540,
              margin: "0 auto 44px",
              opacity: 0.7,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
              position: "relative",
            }}
          >
            MasseurMatch connects you with LGBTQ+-affirming clients who
            specifically seek inclusive, professional care. No middleman. No
            commission. Just the right connections.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <Link
              href="/register"
              style={{
                display: "inline-block",
                padding: "16px 40px",
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
              List Your Practice - Free
            </Link>
            <Link
              href="/pricing"
              style={{
                display: "inline-block",
                padding: "16px 32px",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
                background: "transparent",
                color: "#FCFBF8",
                textDecoration: "none",
                border: "1px solid rgba(252,251,248,0.25)",
              }}
            >
              See Pricing
            </Link>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section
          style={{
            background: "#1E4B8F",
            color: "#FCFBF8",
            padding: "32px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 48,
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {[
              { value: "Growing", label: "Active Therapist Listings" },
              { value: "80+", label: "US Cities Covered" },
              { value: "$0", label: "Booking Commission" },
              { value: "48h", label: "Average Verification Time" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#FF8A1F",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    opacity: 0.65,
                    marginTop: 4,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section style={{ padding: "100px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
              Why MasseurMatch
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 400,
                marginBottom: 64,
                maxWidth: 540,
                lineHeight: 1.25,
              }}
            >
              Everything you need. Nothing you do not.
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 2,
              }}
            >
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  style={{ background: "#fff", padding: "40px 36px" }}
                >
                  <div
                    style={{ fontSize: 26, color: "#FF8A1F", marginBottom: 18 }}
                  >
                    {benefit.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 400,
                      marginBottom: 12,
                      lineHeight: 1.3,
                    }}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.75,
                      color: "#6B7280",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {benefit.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          style={{
            background: "#0B1F3A",
            color: "#FCFBF8",
            padding: "100px 24px",
          }}
        >
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
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
              The Process
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 400,
                textAlign: "center",
                marginBottom: 64,
              }}
            >
              Live in 4 steps
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 0,
              }}
            >
              {steps.map((step, index) => (
                <div
                  key={step.n}
                  style={{
                    padding: "36px 28px",
                    borderLeft:
                      index > 0 ? "1px solid rgba(252,251,248,0.1)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: "rgba(255,138,31,0.25)",
                      fontFamily: "system-ui, sans-serif",
                      marginBottom: 16,
                      lineHeight: 1,
                    }}
                  >
                    {step.n}
                  </div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 400,
                      marginBottom: 12,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      opacity: 0.55,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ padding: "100px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
              Therapist Voices
            </p>
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 38px)",
                fontWeight: 400,
                marginBottom: 56,
              }}
            >
              From the community, for the community
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 2,
              }}
            >
              {testimonials.map((testimonial) => (
                <blockquote
                  key={testimonial.name}
                  style={{
                    background: "#fff",
                    padding: "40px 36px",
                    margin: 0,
                    borderTop: "3px solid #FF8A1F",
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.8,
                      color: "#374151",
                      fontStyle: "italic",
                      marginBottom: 24,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <footer>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0B1F3A",
                        fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      {testimonial.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        fontFamily: "system-ui, sans-serif",
                        marginTop: 2,
                      }}
                    >
                      {testimonial.location} | {testimonial.years}
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section
          style={{
            background: "#FCFBF8",
            borderTop: "1px solid rgba(11,31,58,0.08)",
            padding: "80px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 400,
                marginBottom: 40,
              }}
            >
              Requirements to list
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                textAlign: "left",
              }}
            >
              {[
                "Accurate service profile details",
                "License in good standing",
                "Commitment to LGBTQ+-inclusive practice",
                "Accurate, truthful profile information",
                "Professional profile photo",
                "Legally operating independent practice",
              ].map((requirement) => (
                <div
                  key={requirement}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "16px 20px",
                    background: "#fff",
                  }}
                >
                  <span style={{ color: "#FF8A1F", marginTop: 2, flexShrink: 0 }}>
                    +
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontFamily: "system-ui, sans-serif",
                      color: "#374151",
                      lineHeight: 1.5,
                    }}
                  >
                    {requirement}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Knotty AI — Elite differentiator */}
        <section
          style={{
            background: "#060E1A",
            padding: "80px 24px",
            color: "#FCFBF8",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#F59E0B",
                marginBottom: 20,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Elite · AI Answering
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 400,
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              Knotty AI answers for you —
              <br />
              24 hours a day, 7 days a week.
            </h2>
            <p
              style={{
                fontSize: "clamp(14px, 2.5vw, 16px)",
                opacity: 0.65,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.7,
                marginBottom: 36,
                maxWidth: 540,
              }}
            >
              Elite profiles get a Knotty AI chat widget embedded directly on their listing.
              It answers client questions about rates, availability, specialties, and LGBTQ+
              affirmation — without you needing to be online. First impressions happen at all
              hours; Knotty makes sure yours is always ready.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 36,
              }}
            >
              {[
                { label: "Answers rate & availability questions", detail: "Without interrupting your schedule" },
                { label: "Explains your services clearly", detail: "Using your own profile data" },
                { label: "Available on every Elite listing", detail: "Not a third-party chatbot — fully integrated" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    padding: "16px 18px",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 12, opacity: 0.5, lineHeight: 1.5 }}>{item.detail}</p>
                </div>
              ))}
            </div>
            <Link
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#F59E0B",
                color: "#0B1F3A",
                borderRadius: 99,
                padding: "12px 24px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "system-ui, sans-serif",
                textDecoration: "none",
                letterSpacing: "0.03em",
              }}
            >
              See Elite pricing
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            background: "#FF8A1F",
            padding: "88px 24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 4.5vw, 48px)",
              fontWeight: 400,
              color: "#0B1F3A",
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            Ready to reach clients who
            <br />
            are looking for exactly you?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(11,31,58,0.7)",
              marginBottom: 40,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Free listing. No commitment. Live within 48 hours.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/register"
              style={{
                display: "inline-block",
                padding: "16px 44px",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
                background: "#0B1F3A",
                color: "#FCFBF8",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Create Free Listing
            </Link>
            <Link
              href="/pricing"
              style={{
                display: "inline-block",
                padding: "16px 32px",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
                background: "transparent",
                color: "#0B1F3A",
                textDecoration: "none",
                border: "1px solid rgba(11,31,58,0.35)",
              }}
            >
              View Plans
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
