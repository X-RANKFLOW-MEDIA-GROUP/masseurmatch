import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { FileText, UserCheck } from "lucide-react";

import { IconArrowRight, IconShield } from "@/components/icons";

export const metadata: Metadata = {
  title: "Identity Verification | MasseurMatch",
  description:
    "How MasseurMatch verifies the identity of massage therapists using Stripe Identity. What the verified badge means — and what it does not mean.",
  alternates: { canonical: "https://masseurmatch.com/verification" },
  openGraph: {
    title: "Identity Verification | MasseurMatch",
    description: "What the Verified badge on MasseurMatch profiles means — and what it does not mean.",
    url: "https://masseurmatch.com/verification",
    siteName: "MasseurMatch",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Identity Verification – MasseurMatch",
  url: "https://masseurmatch.com/verification",
  description: "Explains the Stripe Identity verification process used by MasseurMatch to verify therapist identities.",
  publisher: {
    "@type": "Organization",
    name: "MasseurMatch",
    url: "https://masseurmatch.com",
  },
};

const steps = [
  {
    icon: FileText,
    title: "Therapist submits a government-issued ID",
    body: "The therapist provides a passport, driver's license, or national ID through a secure Stripe-hosted flow. MasseurMatch never sees or stores the raw document.",
  },
  {
    icon: UserCheck,
    title: "Stripe compares ID against a live selfie",
    body: "Stripe Identity uses computer vision to confirm that the face on the ID matches the person holding it in real time. The check is automated and typically completes in under 60 seconds.",
  },
  {
    icon: IconShield,
    title: "MasseurMatch receives a pass / fail result",
    body: "If the check passes, we mark the profile Verified and record the date. If it fails or cannot be confirmed, no badge is shown. We review disputed outcomes manually.",
  },
  {
    icon: IconShield,
    title: "The badge appears on the profile with the verification date",
    body: "The Verified badge shows the month and year of the check so clients can see how recent it is. Therapists who let their subscription lapse and then re-subscribe must re-verify.",
  },
];

const caveats = [
  {
    label: "Does NOT verify professional credentials",
    detail: "The Verified badge confirms identity only — it does not verify a therapist's licenses, certifications, insurance, or compliance with local massage regulations.",
  },
  {
    label: "Does NOT guarantee service quality",
    detail: "Identity verification is not an endorsement or recommendation. Direct communication with the therapist remains the best way to assess fit.",
  },
  {
    label: "Based on a point-in-time check",
    detail: "Verification captures a moment. We cannot guarantee ongoing compliance after the badge is issued. Report any concerns to support@masseurmatch.com.",
  },
];

export default function VerificationPage() {
  return (
    <>
      <Script
        id="verification-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        style={{
          background: "#FFFFFF",
          color: "#111111",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <section
          style={{
            background: "#111111",
            color: "#FFFFFF",
            padding: "clamp(56px, 8vw, 80px) 20px clamp(48px, 7vw, 72px)",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#10B981",
                marginBottom: 20,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Trust &amp; Safety
            </p>
            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 400,
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              Identity Verification
            </h1>
            <p
              style={{
                fontSize: "clamp(14px, 2.8vw, 16px)",
                opacity: 0.65,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.7,
                maxWidth: 540,
              }}
            >
              The{" "}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.4)",
                  borderRadius: 99,
                  padding: "1px 8px",
                  fontSize: 12,
                  fontFamily: "system-ui, sans-serif",
                  color: "#34D399",
                }}
              >
                Verified
              </span>{" "}
              badge on a MasseurMatch profile means the therapist has passed a
              real-person identity check powered by Stripe Identity. Here is
              exactly what that means — and what it does not.
            </p>
          </div>
        </section>

        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "clamp(40px, 7vw, 72px) 20px clamp(56px, 8vw, 96px)",
          }}
        >
          {/* How it works */}
          <section style={{ marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(20px, 3.5vw, 26px)",
                fontWeight: 400,
                marginBottom: 32,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              How the verification works
            </h2>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  style={{
                    display: "flex",
                    gap: 20,
                    marginBottom: 28,
                    paddingBottom: 28,
                    borderBottom: i < steps.length - 1 ? "1px solid rgba(17,17,17,0.08)" : "none",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <step.icon
                      style={{ width: 18, height: 18, color: "#10B981" }}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        fontFamily: "system-ui, sans-serif",
                        marginBottom: 6,
                        color: "#111111",
                      }}
                    >
                      {i + 1}. {step.title}
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.75,
                        color: "#4B5563",
                        fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Caveats */}
          <section style={{ marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(20px, 3.5vw, 26px)",
                fontWeight: 400,
                marginBottom: 8,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              What the badge does not mean
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#6B7280",
                fontFamily: "system-ui, sans-serif",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Being transparent about the limits of identity verification is part of our commitment to honest platform design.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {caveats.map((c) => (
                <li
                  key={c.label}
                  style={{
                    background: "#F8EDEE",
                    border: "1px solid rgba(249,115,22,0.2)",
                    borderRadius: 12,
                    padding: "14px 18px",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#C2410C", marginBottom: 4 }}>
                    {c.label}
                  </p>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: "#6B7280" }}>{c.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Powered by Stripe */}
          <section style={{ marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(20px, 3.5vw, 26px)",
                fontWeight: 400,
                marginBottom: 16,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Powered by Stripe Identity
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.75,
                color: "#4B5563",
                fontFamily: "system-ui, sans-serif",
                maxWidth: 580,
              }}
            >
              We use{" "}
              <span style={{ fontWeight: 600, color: "#111111" }}>Stripe Identity</span>{" "}
              for all document and biometric verification. Stripe is a PCI-certified
              payments infrastructure company trusted by millions of businesses.
              MasseurMatch does not store raw government ID images — they are processed
              exclusively within Stripe&apos;s secure environment.
            </p>
          </section>

          {/* Report concern */}
          <section
            style={{
              background: "#111111",
              color: "#FFFFFF",
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
                color: "#10B981",
                marginBottom: 10,
              }}
            >
              Report a concern
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.75, marginBottom: 16 }}>
              If you believe a verified profile is misrepresenting itself or violating our
              policies, please report it. We investigate every report and will revoke the
              badge if fraud or misrepresentation is confirmed.
            </p>
            <Link
              href="mailto:trust@masseurmatch.com?subject=Report%20verification%20concern"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#10B981",
                color: "#fff",
                borderRadius: 99,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Report to trust@masseurmatch.com
              <IconArrowRight size={14} />
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
