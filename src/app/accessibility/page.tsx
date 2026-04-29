import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Accessibility Statement",
  description: "MasseurMatch accessibility commitment, WCAG 2.1 AA target, reporting process, and legal framework.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility Statement" path="/accessibility" lastUpdated="March 10, 2026">
      <h2>1. Our Commitment to Accessibility</h2>
      <p>
        XRankFlow Media Group LLC is committed to ensuring that MasseurMatch is accessible to all users,
        including people with disabilities. We believe that an inclusive, barrier-free digital environment is
        both a legal obligation and the right approach to building a platform for all members of the community.
      </p>

      <h2>2. Standard We Target</h2>
      <p>
        MasseurMatch aims to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as a baseline
        standard. This includes providing text alternatives for non-text content, ensuring sufficient color
        contrast, making all functionality accessible via keyboard, providing captions for video content, and
        designing the interface to work with screen readers and assistive technologies.
      </p>

      <h2>3. Known Limitations</h2>
      <p>
        We acknowledge that some areas of the Platform may not yet fully meet WCAG 2.1 AA standards. We are
        actively working to identify and address accessibility gaps. Known limitations are tracked internally
        and prioritized for remediation.
      </p>

      <h2>4. How to Report Accessibility Issues</h2>
      <p>If you encounter an accessibility barrier on MasseurMatch, please contact us:</p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a> (subject: Accessibility Issue)
        </li>
        <li>
          <strong>Include:</strong> description of the issue, your operating system and browser or assistive
          technology, and the URL where the issue occurred
        </li>
      </ul>
      <p>
        We will acknowledge your report within 5 business days and aim to resolve identified accessibility
        barriers within 30 days.
      </p>

      <h2>5. Legal Framework</h2>
      <p>
        MasseurMatch seeks to comply with Title III of the Americans with Disabilities Act (ADA) and applicable
        state accessibility laws. The Department of Justice has provided guidance that websites of businesses
        open to the public are expected to be accessible. We treat this as a serious obligation, not merely a
        technical checkbox.
      </p>

      <h2>6. Third-Party Content</h2>
      <p>
        MasseurMatch may contain content submitted by therapists and links to third-party websites. We cannot
        guarantee the accessibility of third-party content but encourage all users to report inaccessible
        content for review.
      </p>

      <h2>7. Formal Accessibility Audit</h2>
      <p>
        We commit to conducting a formal third-party accessibility audit at least annually and to publishing a
        summary of findings and remediation progress on this page.
      </p>
    </LegalPage>
  );
}
