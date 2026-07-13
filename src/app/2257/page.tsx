import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "18 U.S.C. § 2257 Compliance Notice",
  description:
    "MasseurMatch's statement regarding 18 U.S.C. § 2257 record-keeping requirements and our policy against sexually explicit content.",
  path: "/2257",
  keywords: ["2257 compliance", "record keeping", "18 usc 2257", "age verification"],
});

export default function Section2257Page() {
  return (
    <LegalPage title="18 U.S.C. § 2257 Compliance Notice" path="/2257" lastUpdated="July 12, 2026">
      <p>
        This notice explains how the record-keeping requirements of{" "}
        <strong>18 U.S.C. &sect;&nbsp;2257</strong> and{" "}
        <strong>&sect;&nbsp;2257A</strong> apply to MasseurMatch.
      </p>

      <h2>1. No sexually explicit content</h2>
      <p>
        MasseurMatch is a professional massage-therapy directory. The platform does not produce, host, or
        distribute sexually explicit content or actual or simulated sexually explicit conduct as defined in
        18 U.S.C. &sect;&nbsp;2256. Providers may not post nudity, pornographic material, or sexually explicit
        images or text, and such content is prohibited under our{" "}
        <Link href="/prohibited-conduct">Prohibited Conduct Policy</Link> and{" "}
        <Link href="/photo-profile-policy">Photo &amp; Profile Policy</Link>.
      </p>

      <h2>2. Exemption statement</h2>
      <p>
        Because MasseurMatch does not contain visual depictions of actual or simulated sexually explicit
        conduct, the record-keeping obligations imposed by 18 U.S.C. &sect;&nbsp;2257 and &sect;&nbsp;2257A do
        not apply to the platform. Any content that would fall within the scope of those statutes is prohibited
        and removed.
      </p>

      <h2>3. Everyone on the platform is an adult</h2>
      <p>
        All users — clients and providers — must be at least 18 years old. Providers verify their identity as
        part of listing on MasseurMatch, and we confirm that each provider is of legal age before their profile
        goes live. We do not knowingly permit anyone under 18 to use the platform.
      </p>

      <h2>4. Zero tolerance for child exploitation</h2>
      <p>
        MasseurMatch has zero tolerance for any content that sexualizes or involves a minor. Apparent child
        sexual abuse material is preserved and reported to the National Center for Missing &amp; Exploited
        Children (NCMEC) CyberTipline (<strong>1-800-843-5678</strong> /{" "}
        <a href="https://report.cybertip.org" target="_blank" rel="noopener noreferrer">report.cybertip.org</a>)
        and to law enforcement, consistent with 18 U.S.C. &sect;&nbsp;2258A.
      </p>

      <h2>5. Reporting and contact</h2>
      <p>
        To report content you believe violates this notice, use the &ldquo;Report this profile&rdquo; link on
        any listing or email <a href="mailto:trust@masseurmatch.com">trust@masseurmatch.com</a>.<br />
        Custodian of records inquiries: <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>.<br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
