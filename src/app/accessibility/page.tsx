import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Accessibility",
  description: "Accessibility commitment, support channels, and continuous improvement approach for MasseurMatch.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility" path="/accessibility">
      <div className="space-y-10">
        <p>
          MasseurMatch is committed to building a discovery experience that is easier to use across desktop,
          tablet, and mobile devices, including for visitors who rely on assistive technology. We aim to make
          core actions such as browsing cities, reviewing provider profiles, understanding rates, and reaching
          support clear and usable for as many people as possible.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Current Focus Areas</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Clear heading structure and readable page hierarchy.</li>
            <li>Consistent keyboard focus states across navigation and actions.</li>
            <li>Color contrast and text sizing that support faster scanning.</li>
            <li>Responsive layouts that remain usable on smaller screens.</li>
            <li>Descriptive labels for forms, buttons, images, and important links.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Ongoing Improvements</h2>
          <p>
            We continue reviewing Explore, profile, legal, and account flows for keyboard access, screen reader
            support, motion sensitivity, zoom behavior, and mobile usability. Accessibility is treated as part of
            product quality, not a one-time compliance task. As the directory expands, new page templates and
            interactive features are reviewed so that improvements can be applied consistently across the site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Alternative Access and Support</h2>
          <p>
            When a feature is difficult to use, our support team can help explain available options or provide
            information through another reasonable format. Include the page address, the action you were trying
            to complete, and the assistive technology or device involved so the report can be investigated.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Need Help?</h2>
          <p>
            If you encounter an accessibility barrier, email{" "}
            <a href="mailto:accessibility@masseurmatch.com">accessibility@masseurmatch.com</a> with the page URL,
            device or browser details, and a short description of the issue. We use those reports to prioritize
            fixes and improve future releases.
          </p>
        </section>
      </div>
    </LegalPage>
  );
}
