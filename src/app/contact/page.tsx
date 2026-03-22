import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Contact Us | MasseurMatch Support & Inquiries",
  description:
    "Get in touch with the MasseurMatch team. Support for clients, therapist onboarding inquiries, press contacts, and partnership opportunities.",
  openGraph: {
    title: "Contact MasseurMatch",
    description:
      "Reach our team for client support, therapist onboarding, press, and partnerships.",
    url: "https://masseurmatch.com/contact",
    siteName: "MasseurMatch",
    type: "website",
  },
  alternates: { canonical: "https://masseurmatch.com/contact" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact MasseurMatch",
  url: "https://masseurmatch.com/contact",
  description:
    "Contact the MasseurMatch team for support, therapist listing inquiries, press, and partnership opportunities.",
  mainEntity: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
    email: "hello@masseurmatch.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dallas",
      addressRegion: "TX",
      addressCountry: "US",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@masseurmatch.com",
        availableLanguage: ["English", "Portuguese"],
      },
      {
        "@type": "ContactPoint",
        contactType: "technical support",
        email: "tech@masseurmatch.com",
      },
    ],
  },
};

const contactOptions = [
  {
    icon: "◎",
    label: "Client Support",
    desc: "Questions about bookings, profiles, or your account.",
    action: "support@masseurmatch.com",
    href: "mailto:support@masseurmatch.com",
  },
  {
    icon: "◈",
    label: "Therapist Onboarding",
    desc: "List your practice, manage your profile, or upgrade your plan.",
    action: "therapists@masseurmatch.com",
    href: "mailto:therapists@masseurmatch.com",
  },
  {
    icon: "✦",
    label: "Press & Media",
    desc: "Media kits, interview requests, and brand partnerships.",
    action: "press@masseurmatch.com",
    href: "mailto:press@masseurmatch.com",
  },
  {
    icon: "⬡",
    label: "General Inquiries",
    desc: "Everything else — partnerships, feedback, and ideas.",
    action: "hello@masseurmatch.com",
    href: "mailto:hello@masseurmatch.com",
  },
];

export default function ContactPage() {
  return (
    <>
      <Script
        id="contact-jsonld"
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
            padding: "96px 24px 88px",
            textAlign: "center",
            color: "#FCFBF8",
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
            Get in Touch
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 60px)",
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            We're here to help
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "rgba(252,251,248,0.65)",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Whether you're a client, a therapist, or a partner — our team
            typically responds within one business day.
          </p>
        </section>

        {/* ── Contact Options ── */}
        <section style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 2,
            }}
          >
            {contactOptions.map((opt) => (
              <a
                key={opt.label}
                href={opt.href}
                className="mm-card-hover"
                style={{
                  display: "block",
                  background: "#fff",
                  padding: "40px 32px",
                  textDecoration: "none",
                  color: "#0B1F3A",
                  borderBottom: "3px solid transparent",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ fontSize: 28, color: "#FF8A1F", marginBottom: 20 }}>
                  {opt.icon}
                </div>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 400,
                    marginBottom: 10,
                  }}
                >
                  {opt.label}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: "#6B7280",
                    fontFamily: "system-ui, sans-serif",
                    marginBottom: 20,
                  }}
                >
                  {opt.desc}
                </p>
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: "system-ui, sans-serif",
                    color: "#1E4B8F",
                    borderBottom: "1px solid #1E4B8F",
                    paddingBottom: 1,
                  }}
                >
                  {opt.action}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ── Contact Form + Info ── */}
        <section
          style={{
            padding: "0 24px 100px",
            maxWidth: 1000,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 40,
            alignItems: "start",
          }}
        >
          {/* Form */}
          <div style={{ background: "#fff", padding: "48px 44px" }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 400,
                marginBottom: 8,
              }}
            >
              Send us a message
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#6B7280",
                fontFamily: "system-ui, sans-serif",
                marginBottom: 36,
                lineHeight: 1.6,
              }}
            >
              Use this form for detailed inquiries. For urgent support, email
              directly.
            </p>

            {/* Using div-based form to avoid HTML form element restrictions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    htmlFor="contact-name"
                    style={{
                      display: "block",
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontFamily: "system-ui, sans-serif",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: 14,
                      fontFamily: "system-ui, sans-serif",
                      border: "1px solid rgba(11,31,58,0.15)",
                      background: "#FCFBF8",
                      color: "#0B1F3A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    style={{
                      display: "block",
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontFamily: "system-ui, sans-serif",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: 14,
                      fontFamily: "system-ui, sans-serif",
                      border: "1px solid rgba(11,31,58,0.15)",
                      background: "#FCFBF8",
                      color: "#0B1F3A",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  style={{
                    display: "block",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontFamily: "system-ui, sans-serif",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Subject
                </label>
                <select
                  id="contact-subject"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: 14,
                    fontFamily: "system-ui, sans-serif",
                    border: "1px solid rgba(11,31,58,0.15)",
                    background: "#FCFBF8",
                    color: "#374151",
                    outline: "none",
                    appearance: "none",
                  }}
                >
                  <option value="">Select a topic…</option>
                  <option>Client Support</option>
                  <option>Therapist Onboarding</option>
                  <option>Technical Issue</option>
                  <option>Press / Media</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  style={{
                    display: "block",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontFamily: "system-ui, sans-serif",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Tell us how we can help…"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: 14,
                    fontFamily: "system-ui, sans-serif",
                    border: "1px solid rgba(11,31,58,0.15)",
                    background: "#FCFBF8",
                    color: "#0B1F3A",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                style={{
                  padding: "15px 36px",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "system-ui, sans-serif",
                  background: "#0B1F3A",
                  color: "#FCFBF8",
                  border: "none",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  fontWeight: 600,
                }}
              >
                Send Message
              </button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                background: "#0B1F3A",
                color: "#FCFBF8",
                padding: "36px 28px",
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  marginBottom: 20,
                  letterSpacing: "0.04em",
                }}
              >
                Response Times
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 13,
                }}
              >
                {[
                  { label: "Client Support", time: "< 24 hours" },
                  { label: "Therapist Queries", time: "< 48 hours" },
                  { label: "Press & Media", time: "< 24 hours" },
                  { label: "Partnerships", time: "3–5 business days" },
                ].map((r) => (
                  <div
                    key={r.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingBottom: 14,
                      borderBottom: "1px solid rgba(252,251,248,0.08)",
                    }}
                  >
                    <span style={{ opacity: 0.65 }}>{r.label}</span>
                    <span style={{ color: "#FF8A1F" }}>{r.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                padding: "28px",
                borderLeft: "3px solid #FF8A1F",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "system-ui, sans-serif",
                  color: "#FF8A1F",
                  marginBottom: 10,
                }}
              >
                Based in
              </p>
              <p
                style={{
                  fontSize: 15,
                  fontFamily: "system-ui, sans-serif",
                  color: "#374151",
                  lineHeight: 1.6,
                }}
              >
                Dallas, Texas
                <br />
                <span style={{ fontSize: 13, color: "#9CA3AF" }}>
                  XRankFlow Media Group LLC
                </span>
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                padding: "28px",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "system-ui, sans-serif",
                  color: "#374151",
                  marginBottom: 14,
                }}
              >
                Languages
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontFamily: "system-ui, sans-serif",
                  color: "#6B7280",
                  lineHeight: 1.7,
                }}
              >
                English & Portuguese
                <br />
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                  Support available in both
                </span>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
