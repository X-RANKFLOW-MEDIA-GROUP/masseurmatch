import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Notice at Collection",
  description:
    "Short-form privacy notices displayed at each data collection point on MasseurMatch, as required by CCPA/CPRA and recommended under TDPSA.",
  path: "/notice-at-collection",
  keywords: [
    "notice at collection",
    "CCPA",
    "CPRA",
    "TDPSA",
    "privacy notice",
    "data collection",
    "California privacy",
  ],
});

export default function NoticeAtCollectionPage() {
  return (
    <LegalPage title="Notice at Collection" path="/notice-at-collection">
      <h2>1. What Is a Notice at Collection?</h2>
      <p>
        A Notice at Collection is a short, plain-language disclosure provided at or before the point where
        personal information is collected, explaining what categories of data are collected and the purposes for
        which they are used. It is distinct from (and shorter than) the full{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
      <p>
        These notices are required by the California Consumer Privacy Act (CCPA/CPRA) and reflect recommended
        best practice under the Texas Data Privacy and Security Act (TDPSA).
      </p>

      <h2>2. Account Registration Form</h2>
      <blockquote>
        &ldquo;MasseurMatch collects your name, email, and phone number to create and manage your account,
        communicate with you, and (with your consent) send marketing updates. We do not sell your personal
        information. View our full{" "}
        <a href="/privacy">Privacy Policy</a>.&rdquo;
      </blockquote>

      <h2>3. Therapist Subscription Checkout</h2>
      <blockquote>
        &ldquo;Your billing information is collected and processed by Stripe. MasseurMatch receives your
        subscription status and the last 4 digits of your payment method only. We do not store full card
        numbers. See our{" "}
        <a href="/privacy">Privacy Policy</a> and Stripe&apos;s Privacy Policy.&rdquo;
      </blockquote>

      <h2>4. Contact &amp; Support Form</h2>
      <blockquote>
        &ldquo;Information you provide is used solely to respond to your inquiry and to maintain a record of our
        communication. It will not be shared with third parties or used for marketing without your
        consent.&rdquo;
      </blockquote>

      <h2>5. Email Signup Form</h2>
      <blockquote>
        &ldquo;We collect your email address to send you marketing communications. You may unsubscribe at any
        time. See our{" "}
        <a href="/privacy">Privacy Policy</a>.&rdquo;
      </blockquote>

      <h2>6. Footer / Global Notice</h2>
      <p>
        The MasseurMatch footer includes a persistent link labeled &ldquo;Privacy Policy&rdquo; which
        constitutes the primary vehicle for full notice of data practices to all visitors. In addition, a
        first-visit cookie banner serves as the notice for cookie-related data collection.
      </p>

      <h2>7. California Residents — Additional Rights</h2>
      <p>
        California residents have the right to know what personal information is collected, to request deletion,
        to opt out of sale (MasseurMatch does not sell data), and to non-discrimination for exercising these
        rights. To exercise these rights, email{" "}
        <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a>.
      </p>
    </LegalPage>
  );
}
