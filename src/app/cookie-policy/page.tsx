import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cookie Policy | MasseurMatch",
  description:
    "MasseurMatch cookie policy: how we use essential, preference, and analytics cookies to operate the platform securely and improve your experience.",
  alternates: { canonical: "https://masseurmatch.com/cookie-policy" },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Cookie Policy - MasseurMatch",
  url: "https://masseurmatch.com/cookie-policy",
  publisher: { "@type": "Organization", name: "MasseurMatch", url: "https://masseurmatch.com" },
};

const COOKIE_TYPES = [
  {
    id: "essential",
    name: "Essential Cookies",
    required: true,
    description:
      "Required for the platform to function. These cookies manage your session, authenticate your account, and prevent cross-site request forgery. You cannot opt out of essential cookies.",
    examples: ["mm_session (authentication)", "csrf_token (security)"],
  },
  {
    id: "preference",
    name: "Preference Cookies",
    required: false,
    description:
      "Remember your settings such as language preference, theme selection, and UI state between visits. Disabling these means you may need to re-enter your preferences each session.",
    examples: ["ui_theme", "cookie_consent"],
  },
  {
    id: "analytics",
    name: "Analytics Cookies",
    required: false,
    description:
      "Help us understand how the directory is used — which pages are visited most, how users navigate between city pages and profiles, and where we can improve. We use privacy-respecting analytics that do not share data with advertisers.",
    examples: ["_ga (Google Analytics, anonymized)", "vercel_analytics"],
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <Script
        id="cookie-policy-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        style={{
          background: "#FFFFFF",
          color: "#1A1A1A",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          minHeight: "100vh",
        }}
      >
        <section
          style={{
            background: "#1A1A1A",
            color: "#FFFFFF",
            padding: "80px 24px 72px",
          }}
        >
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#CC2424",
                marginBottom: 20,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Legal
            </p>
            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 400,
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              Cookie Policy
            </h1>
            <p style={{ fontSize: 14, opacity: 0.5, fontFamily: "system-ui, sans-serif" }}>
              Last Updated: March 1, 2025
            </p>
            <p
              style={{
                fontSize: 16,
                opacity: 0.65,
                marginTop: 16,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.7,
                maxWidth: 560,
              }}
            >
              MasseurMatch uses a minimal set of cookies to operate securely and improve your
              experience. We do not use advertising or behavioral tracking cookies.
            </p>
          </div>
        </section>

        <div style={{ maxWidth: 820, margin: "0 auto", padding: "72px 24px 100px" }}>
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 400,
                marginBottom: 12,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(26,26,26,0.1)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              What Are Cookies?
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.85,
                color: "#374151",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Cookies are small text files stored on your device by your browser. They allow
              websites to remember state between page visits — such as whether you are logged in.
              You can manage or disable cookies through your browser settings, though some platform
              features may not function correctly without essential cookies.
            </p>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 400,
                marginBottom: 20,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(26,26,26,0.1)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Cookies We Use
            </h2>

            {COOKIE_TYPES.map((type) => (
              <div
                key={type.id}
                style={{
                  marginBottom: 28,
                  padding: 20,
                  background: "#fff",
                  border: "1px solid rgba(26,26,26,0.08)",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A", margin: 0 }}>
                    {type.name}
                  </h3>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: type.required ? "rgba(16,185,129,0.1)" : "rgba(26,26,26,0.07)",
                      color: type.required ? "#059669" : "#6B7280",
                    }}
                  >
                    {type.required ? "Required" : "Optional"}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#374151",
                    fontFamily: "system-ui, sans-serif",
                    margin: "0 0 10px",
                  }}
                >
                  {type.description}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontFamily: "ui-monospace, monospace",
                    margin: 0,
                  }}
                >
                  Examples: {type.examples.join(", ")}
                </p>
              </div>
            ))}
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 400,
                marginBottom: 12,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(26,26,26,0.1)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Third-Party Cookies
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.85,
                color: "#374151",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              We do not use third-party advertising networks or behavioral tracking cookies.
              Limited analytics providers (such as Google Analytics with IP anonymization enabled)
              may set cookies governed by their own privacy policies. We do not sell or share cookie
              data with advertisers.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 400,
                marginBottom: 12,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(26,26,26,0.1)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Contact
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.85,
                color: "#374151",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Questions about our use of cookies? Email{" "}
              <a
                href="mailto:privacy@masseurmatch.com"
                style={{ color: "#CC2424", textDecoration: "none" }}
              >
                privacy@masseurmatch.com
              </a>
              . For broader privacy rights, see our{" "}
              <Link href="/privacy" style={{ color: "#CC2424", textDecoration: "none" }}>
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
