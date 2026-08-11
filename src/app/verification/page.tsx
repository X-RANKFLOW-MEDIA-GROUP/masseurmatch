import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { FileText, ShieldCheck, Trash2, UserCheck } from "lucide-react";

import { IconArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Identity Verification | MasseurMatch",
  description: "How MasseurMatch reviews identity evidence, what the Identity Verified badge means, and what it does not verify.",
  alternates: { canonical: "https://www.masseurmatch.com/verification" },
  openGraph: {
    title: "Identity Verification | MasseurMatch",
    description: "What the Identity Verified badge on MasseurMatch profiles means — and what it does not mean.",
    url: "https://www.masseurmatch.com/verification",
    siteName: "MasseurMatch",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Identity Verification – MasseurMatch",
  url: "https://www.masseurmatch.com/verification",
  description: "Explains the identity review process used by MasseurMatch and the limits of the Identity Verified badge.",
  publisher: { "@type": "Organization", name: "MasseurMatch", url: "https://www.masseurmatch.com" },
};

const steps = [
  {
    icon: FileText,
    title: "Provider submits a government-issued ID",
    body: "The provider uploads a clear image of a passport, driver's license, state ID, or other supported government-issued identity document through the secure MasseurMatch verification flow.",
  },
  {
    icon: UserCheck,
    title: "Provider submits a current challenge selfie",
    body: "MasseurMatch generates a one-time six-digit challenge. The provider submits a current selfie showing their face and the challenge code so the reviewer can compare it with the ID photo.",
  },
  {
    icon: ShieldCheck,
    title: "A human reviewer checks required criteria",
    body: "Approval requires a readable and apparently valid ID, an apparently unexpired document, a selfie that appears to match the ID photo, and a clearly visible current challenge code.",
  },
  {
    icon: Trash2,
    title: "Sensitive images are deleted after the decision",
    body: "After approval or rejection is finalized, MasseurMatch removes the submitted identity images from the private verification storage. The account keeps the decision status and limited audit metadata, not the raw evidence.",
  },
];

const caveats = [
  {
    label: "Does NOT verify professional licensing",
    detail: "Identity Verified confirms identity only. MasseurMatch does not independently verify massage licenses, certifications, insurance, professional standing, or regulatory compliance.",
  },
  {
    label: "Does NOT include a background check",
    detail: "The identity review is not a criminal, civil, employment, sanctions, or other background investigation unless MasseurMatch explicitly states otherwise for a separate program.",
  },
  {
    label: "Does NOT guarantee services or outcomes",
    detail: "The badge is not an endorsement, recommendation, guarantee of service quality, or approval of any specific service offered by a provider.",
  },
  {
    label: "It is a point-in-time identity review",
    detail: "Verification reflects the evidence reviewed at a specific time. Clients should still use their own judgment when choosing and contacting a provider.",
  },
];

const COLORS = {
  accent: "#8B1E2D",
  accentTint: "#F8EDEE",
  textPrimary: "#111111",
  textSecondary: "#6F6F6F",
  surfaceBase: "#FFFFFF",
  borderSubtle: "#E8E8E8",
};

export default function VerificationPage() {
  return (
    <>
      <Script id="verification-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ background: COLORS.surfaceBase, color: COLORS.textPrimary, fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh" }}>
        <section style={{ background: COLORS.textPrimary, color: COLORS.surfaceBase, padding: "clamp(56px, 8vw, 80px) 20px clamp(48px, 7vw, 72px)" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.accent, marginBottom: 20, fontFamily: "system-ui, sans-serif" }}>Trust &amp; Safety</p>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 400, lineHeight: 1.1, marginBottom: 20 }}>Identity Verification</h1>
            <p style={{ fontSize: "clamp(14px, 2.8vw, 16px)", opacity: 0.75, fontFamily: "system-ui, sans-serif", lineHeight: 1.7, maxWidth: 600 }}>
              The <strong>Identity Verified</strong> badge means MasseurMatch reviewed identity evidence for the provider. It is deliberately limited to identity and should not be read as a license check, background check, or endorsement.
            </p>
          </div>
        </section>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(40px, 7vw, 72px) 20px clamp(56px, 8vw, 96px)" }}>
          <section style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 500, marginBottom: 32, fontFamily: "system-ui, sans-serif" }}>How verification works</h2>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {steps.map((step, i) => (
                <li key={step.title} style={{ display: "flex", gap: 20, marginBottom: 28, paddingBottom: 28, borderBottom: i < steps.length - 1 ? "1px solid rgba(17,17,17,0.08)" : "none" }}>
                  <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, background: "rgba(139,30,45,0.08)", border: `1px solid ${COLORS.borderSubtle}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <step.icon style={{ width: 18, height: 18, color: COLORS.accent }} strokeWidth={2.25} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, fontFamily: "system-ui, sans-serif", marginBottom: 6 }}>{i + 1}. {step.title}</p>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: COLORS.textSecondary, fontFamily: "system-ui, sans-serif" }}>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 500, marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>What the badge does not mean</h2>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, fontFamily: "system-ui, sans-serif", marginBottom: 24, lineHeight: 1.6 }}>Clear limits prevent a trust signal from becoming a misleading claim.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {caveats.map((c) => (
                <li key={c.label} style={{ background: COLORS.accentTint, border: "1px solid rgba(139,30,45,0.15)", borderRadius: 12, padding: "16px 20px", fontFamily: "system-ui, sans-serif" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.accent, marginBottom: 6 }}>{c.label}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: COLORS.textSecondary }}>{c.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 500, marginBottom: 16, fontFamily: "system-ui, sans-serif" }}>Privacy and retention</h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: COLORS.textSecondary, fontFamily: "system-ui, sans-serif", maxWidth: 620 }}>
              Identity evidence is uploaded to private storage for authorized review. Once a final decision is recorded, the raw identity document and challenge-selfie files are deleted. Limited verification status and audit metadata may be retained to operate the trust feature, prevent abuse, and document the review decision.
            </p>
          </section>

          <section style={{ background: COLORS.textPrimary, color: COLORS.surfaceBase, borderRadius: 16, padding: "28px 32px", fontFamily: "system-ui, sans-serif" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.accent, marginBottom: 12, fontWeight: 600 }}>Questions or concerns</p>
            <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.8, marginBottom: 20 }}>If you believe a profile is misrepresenting its identity or violating platform policies, contact MasseurMatch support.</p>
            <Link href="mailto:support@masseurmatch.com?subject=Identity%20verification%20concern" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: COLORS.accent, color: COLORS.surfaceBase, borderRadius: 99, padding: "11px 22px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Contact support@masseurmatch.com <IconArrowRight size={14} />
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
