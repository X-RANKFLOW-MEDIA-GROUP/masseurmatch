import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { AlertTriangle, ArrowRight, Ban, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Moderation Policy | MasseurMatch",
  description:
    "How MasseurMatch handles policy violations, content enforcement, account actions, and appeals. Every enforcement action is documented with a reason.",
  alternates: { canonical: "https://masseurmatch.com/moderation-policy" },
  openGraph: {
    title: "Moderation Policy | MasseurMatch",
    description: "How we handle violations, enforcement actions, and appeals on MasseurMatch.",
    url: "https://masseurmatch.com/moderation-policy",
    siteName: "MasseurMatch",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Moderation Policy – MasseurMatch",
  url: "https://masseurmatch.com/moderation-policy",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
};

const actionTypes = [
  {
    icon: AlertTriangle,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    action: "Warning",
    when: "A first or minor violation — inaccurate profile claim, ambiguous photo, or a single reported incident that does not yet justify removal.",
    effect: "Notification sent. No public-facing change. Logged for pattern tracking.",
  },
  {
    icon: ShieldAlert,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    action: "Content removal",
    when: "A specific photo, post, or profile section violates policy: explicit material, misleading credentials, watermarked images.",
    effect: "The violating content is removed. Profile remains active if no pattern exists.",
  },
  {
    icon: Clock,
    color: "#6366F1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
    action: "Suspension (temporary)",
    when: "Repeated warnings, a substantiated complaint, or a pending investigation into a serious but unconfirmed allegation.",
    effect: "Profile hidden from public search. Provider retains account access. SLA: resolved within 5 business days.",
  },
  {
    icon: Ban,
    color: "#DC2626",
    bg: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.2)",
    action: "Permanent ban",
    when: "A confirmed pattern of serious violations, solicitation of illegal services, identity fraud, or client harm.",
    effect: "Account terminated. Profile removed permanently. Device and email fingerprints flagged to prevent re-registration.",
  },
];

const slaRows = [
  { action: "Warning", response: "24 hours" },
  { action: "Content removal", response: "24 hours" },
  { action: "Suspension review", response: "5 business days" },
  { action: "Ban appeal decision", response: "10 business days" },
  { action: "Report acknowledgment", response: "48 hours" },
];

export default function ModerationPolicyPage() {
  return (
    <>
      <Script
        id="moderation-policy-jsonld"
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
        {/* Header */}
        <section
          style={{
            background: "#0B1F3A",
            color: "#FCFBF8",
            padding: "clamp(56px, 8vw, 80px) 20px clamp(48px, 7vw, 72px)",
          }}
        >
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
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
              Platform Governance
            </p>
            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 400,
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              Moderation Policy
            </h1>
            <p
              style={{
                fontSize: "clamp(12px, 2.5vw, 14px)",
                opacity: 0.5,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Last Updated: June 11, 2026
            </p>
            <p
              style={{
                fontSize: "clamp(14px, 2.8vw, 16px)",
                opacity: 0.65,
                marginTop: 16,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.7,
                maxWidth: 560,
              }}
            >
              MasseurMatch is a directory platform, not a passive hosting service. We actively
              enforce quality and safety standards. Every enforcement action is logged with a
              documented reason. This page explains exactly how that works.
            </p>
          </div>
        </section>

        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            padding: "clamp(40px, 7vw, 64px) 20px clamp(56px, 8vw, 96px)",
          }}
        >
          {/* Core principle */}
          <section style={{ marginBottom: 56 }}>
            <div
              style={{
                background: "#0B1F3A",
                color: "#FCFBF8",
                borderRadius: 14,
                padding: "22px 24px",
                fontFamily: "system-ui, sans-serif",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "#FF8A1F" }}>Transparency principle:</strong>{" "}
              Every moderation action we take — warning, removal, suspension, or ban — is logged
              with a written reason. Affected users receive that reason. We do not take silent
              action without documentation.
            </div>
          </section>

          {/* Action types */}
          <section style={{ marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(20px, 3.5vw, 26px)",
                fontWeight: 400,
                marginBottom: 28,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Types of enforcement actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {actionTypes.map((a) => (
                <div
                  key={a.action}
                  style={{
                    border: `1px solid ${a.border}`,
                    background: a.bg,
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    gap: 16,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <a.icon style={{ width: 18, height: 18, color: a.color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0B1F3A", marginBottom: 4 }}>
                      {a.action}
                    </p>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: "#374151", marginBottom: 6 }}>
                      <strong>When:</strong> {a.when}
                    </p>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: "#374151" }}>
                      <strong>Effect:</strong> {a.effect}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SLA table */}
          <section style={{ marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(20px, 3.5vw, 26px)",
                fontWeight: 400,
                marginBottom: 20,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Response time commitments
            </h2>
            <div
              style={{
                border: "1px solid rgba(11,31,58,0.1)",
                borderRadius: 14,
                overflow: "hidden",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {slaRows.map((row, i) => (
                <div
                  key={row.action}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "13px 20px",
                    background: i % 2 === 0 ? "#fff" : "rgba(11,31,58,0.02)",
                    borderBottom: i < slaRows.length - 1 ? "1px solid rgba(11,31,58,0.06)" : "none",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#374151" }}>{row.action}</span>
                  <span style={{ fontWeight: 600, color: "#0B1F3A" }}>{row.response}</span>
                </div>
              ))}
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                fontFamily: "system-ui, sans-serif",
                marginTop: 10,
              }}
            >
              SLAs apply during business hours (Mon–Fri, 9 AM–6 PM CT). Complex cases may take longer; we will communicate delays proactively.
            </p>
          </section>

          {/* Appeals */}
          <section style={{ marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(20px, 3.5vw, 26px)",
                fontWeight: 400,
                marginBottom: 16,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Appeals process
            </h2>
            <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, lineHeight: 1.8, color: "#374151" }}>
              <p style={{ marginBottom: 12 }}>
                Any user who receives a suspension or ban may submit an appeal within{" "}
                <strong>30 days</strong> of the action date. Appeals must include:
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 16px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {[
                  "A clear statement of why you believe the action was in error",
                  "Any evidence or context relevant to the decision",
                  "Contact information so we can follow up",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <CheckCircle2
                      style={{ width: 15, height: 15, color: "#10B981", flexShrink: 0, marginTop: 3 }}
                      strokeWidth={2.25}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                Send appeals to{" "}
                <a
                  href="mailto:appeals@masseurmatch.com"
                  style={{ color: "#0B1F3A", fontWeight: 600 }}
                >
                  appeals@masseurmatch.com
                </a>
                . We will acknowledge within 48 hours and issue a final decision within 10 business days.
              </p>
            </div>
          </section>

          {/* Report & contact */}
          <section
            style={{
              background: "#0B1F3A",
              color: "#FCFBF8",
              borderRadius: 16,
              padding: "28px 28px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#FF8A1F",
                marginBottom: 10,
              }}
            >
              Report a violation
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.75, marginBottom: 16 }}>
              If you see a profile, listing, or interaction that violates these policies, report it.
              Include as much context as possible — screenshot, profile URL, description of the
              incident. Every report is reviewed by a human.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link
                href="mailto:trust@masseurmatch.com?subject=Policy%20violation%20report"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#FF8A1F",
                  color: "#fff",
                  borderRadius: 99,
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Report to trust@masseurmatch.com
                <ArrowRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
              </Link>
              <Link
                href="/trust"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  color: "rgba(252,251,248,0.7)",
                  border: "1px solid rgba(252,251,248,0.2)",
                  borderRadius: 99,
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Our Trust &amp; Safety standards
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
