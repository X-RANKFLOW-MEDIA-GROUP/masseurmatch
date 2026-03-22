import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Accessibility",
  description: "Accessibility commitment, support channels, and continuous improvement approach for MasseurMatch.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility" path="/accessibility">
      <p>
        MasseurMatch is committed to building a discovery experience that is easier to use across desktop,
        tablet, and mobile devices, including for visitors who rely on assistive technology.
      </p>

      <h2>1. Current Focus Areas</h2>
      <ul>
        <li>Clear heading structure and readable page hierarchy.</li>
        <li>Consistent keyboard focus states across navigation and actions.</li>
        <li>Color contrast and text sizing that support faster scanning.</li>
        <li>Responsive layouts that remain usable on smaller screens.</li>
      </ul>

      <h2>2. Ongoing Improvements</h2>
      <p>
        We continue reviewing Explore, profile, and account flows for keyboard access, screen reader support,
        motion sensitivity, and mobile usability. Accessibility is treated as part of product quality, not a
        one-time compliance task.
      </p>

      <h2>3. Need Help?</h2>
      <p>
        If you encounter an accessibility barrier, email{" "}
        <a href="mailto:accessibility@masseurmatch.com">accessibility@masseurmatch.com</a> with the page URL,
        device or browser details, and a short description of the issue. We use those reports to prioritize
        fixes and improve future releases.
      </p>
    </LegalPage>
  );
}
