import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "How MasseurMatch collects, uses, stores, and protects personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy">
      <p>
        This Privacy Policy explains what information MasseurMatch collects, how we use it, and the choices
        available to visitors, therapists, and subscribers who use the platform.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>Account details such as name, email address, phone number, and login data.</li>
        <li>Profile details such as bio, specialties, city, pricing, photos, and listing preferences.</li>
        <li>Billing and subscription metadata from payment providers.</li>
        <li>Usage data such as pages viewed, device information, browser details, and referral source.</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>To operate accounts, profiles, and subscriptions.</li>
        <li>To deliver platform functionality, security monitoring, and support responses.</li>
        <li>To publish therapist profile information selected for public display.</li>
        <li>To improve product performance, analytics, and trust-and-safety workflows.</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>
        We do not sell personal information. We may share data with infrastructure providers, payment partners,
        email tools, and legal authorities when required to operate the platform or comply with law.
      </p>

      <h2>4. Cookies and Tracking</h2>
      <p>
        We may use cookies and similar technologies for session management, analytics, and performance. More
        details are available in our <Link href="/cookie-policy">Cookie Policy</Link>.
      </p>

      <h2>5. Retention</h2>
      <p>
        We keep account and subscription data only as long as needed for platform operations, fraud prevention,
        support, accounting, and legal compliance.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or export your data. To make
        a request, contact <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a>.
      </p>

      <h2>7. Security</h2>
      <p>
        We use reasonable administrative, technical, and organizational safeguards to protect data, but no system
        is completely secure.
      </p>

      <h2>8. Contact</h2>
      <p>
        Privacy questions should be sent to <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a>.
      </p>
    </LegalPage>
  );
}
