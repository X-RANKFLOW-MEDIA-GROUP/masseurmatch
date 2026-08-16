import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How MasseurMatch collects, uses, shares, protects, and retains personal information, including identity verification evidence.",
  path: "/privacy",
  keywords: ["privacy policy", "data privacy", "identity verification privacy", "MasseurMatch privacy"],
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy" lastUpdated="August 15, 2026">
      <p>
        MasseurMatch is operated by XRankFlow Media Group LLC. This policy explains the categories of information
        we process, why we process them, how verification evidence is handled, and the choices available to users.
        MasseurMatch does not sell personal information for monetary consideration.
      </p>

      <h2>1. Information We Collect</h2>
      <p>Depending on how you use MasseurMatch, we may collect:</p>
      <ul>
        <li><strong>Account information:</strong> name, display name, email address, phone number, authentication status, and account preferences.</li>
        <li><strong>Provider profile information:</strong> city, state, service areas, biography, techniques, pricing, availability, photos, business information, and other information a provider chooses to publish.</li>
        <li><strong>Identity verification evidence:</strong> a government-issued identity document, a current challenge selfie, the one-time challenge code shown in that selfie, verification status, and limited audit metadata.</li>
        <li><strong>Billing information:</strong> subscription and transaction metadata. Payment card details are handled by Stripe and are not stored by MasseurMatch as full card numbers.</li>
        <li><strong>Communications:</strong> support requests, reports, email and SMS preferences, and messages sent to MasseurMatch or through supported platform communication features.</li>
        <li><strong>AI interactions:</strong> prompts, questions, profile context, and generated responses when a user chooses to use Knotty AI or another MasseurMatch AI feature.</li>
        <li><strong>Technical and analytics data:</strong> IP address, device and browser information, page activity, referral information, profile views, contact events, and similar security or product analytics.</li>
      </ul>
      <p>
        MasseurMatch does not need information about the private details of an off-platform massage session in
        order to operate the directory. Do not submit unnecessary medical, financial, authentication, or other
        highly sensitive information through public profile fields or support forms.
      </p>

      <h2>2. Identity Verification</h2>
      <p>
        The current MasseurMatch identity verification flow uses a government-issued ID, a current challenge
        selfie, and human review. Identity evidence is stored in private verification storage while the review is
        pending. When an approval or rejection decision is finalized, the application removes the submitted raw
        identity images and retains limited status and audit metadata needed to operate the trust feature, prevent
        abuse, and document the decision.
      </p>
      <p>
        Identity Verified confirms a point-in-time identity review only. It is not a professional license check,
        background check, qualification review, endorsement, or guarantee. See the{" "}
        <Link href="/verification">Identity Verification page</Link> for the public badge explanation.
      </p>

      <h2>3. How We Use Information</h2>
      <ul>
        <li>Operate accounts, profiles, search, directory pages, subscriptions, and provider tools.</li>
        <li>Verify email, phone, and identity where those workflows are used.</li>
        <li>Review profile quality, moderation status, safety reports, and policy compliance.</li>
        <li>Provide support and send transactional or consented communications.</li>
        <li>Measure site and profile performance and improve product reliability.</li>
        <li>Detect fraud, abuse, security incidents, spam, and prohibited conduct.</li>
        <li>Provide AI-assisted features using the minimum context reasonably needed for the requested feature.</li>
        <li>Comply with legal obligations and enforce platform terms.</li>
      </ul>

      <h2>4. Service Providers and Data Sharing</h2>
      <p>
        We may disclose information to service providers that help operate MasseurMatch, including database and
        hosting infrastructure, payment processing, email and messaging delivery, analytics, security, and AI
        infrastructure. These providers process information for operational purposes under their applicable
        agreements and privacy terms.
      </p>
      <p>
        Stripe processes provider subscription payments. MasseurMatch may also disclose information when required
        by valid legal process, to protect users or the platform, to investigate fraud or abuse, or in connection
        with a corporate transaction where permitted by law.
      </p>

      <h2>5. Public Profile Information</h2>
      <p>
        Provider profiles are designed for public discovery. Information marked for public display may appear on
        profile pages, directory results, city or service pages, search engines, and social previews. Providers
        should publish only information they are comfortable making public. Private verification evidence is not
        part of the public profile.
      </p>

      <h2>6. Cookies and Similar Technologies</h2>
      <p>
        MasseurMatch uses cookies and similar technologies for authentication, session state, preferences,
        security, analytics, and other platform functionality. See our{" "}
        <Link href="/cookie-policy">Cookie Policy</Link> for additional details and available controls.
      </p>

      <h2>7. Data Retention</h2>
      <p>
        Retention depends on the type of information and why it is needed. Account and profile information may be
        retained while an account is active. Billing, security, moderation, fraud-prevention, consent, and audit
        records may be retained longer when reasonably necessary or legally required. Raw identity evidence is
        deleted after the manual verification decision as described above; limited verification metadata may be
        retained.
      </p>

      <h2>8. Security</h2>
      <p>
        We use administrative, technical, and organizational safeguards intended to protect information, including
        access controls and encrypted transport. No internet service can guarantee absolute security. Users are
        responsible for protecting their credentials and should contact us promptly if they suspect unauthorized
        account access.
      </p>

      <h2>9. Your Choices and Privacy Requests</h2>
      <p>
        Depending on applicable law, you may have rights to request access, correction, deletion, portability,
        restriction, or information about certain processing. You may also manage communication preferences using
        the controls provided in MasseurMatch emails, messages, or account settings.
      </p>
      <p>
        Submit privacy requests to <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a>. We may
        need to verify your identity before completing a request. Some information may be retained where permitted
        or required for security, fraud prevention, legal compliance, billing records, dispute resolution, or
        enforcement of our agreements.
      </p>

      <h2>10. California and Other U.S. State Privacy Rights</h2>
      <p>
        Residents of jurisdictions with applicable consumer privacy laws may have additional rights regarding
        access, correction, deletion, portability, and certain disclosures. MasseurMatch does not sell personal
        information for monetary consideration. Requests may be submitted to privacy@masseurmatch.com for review
        under the law that applies to the request.
      </p>

      <h2>11. International Users</h2>
      <p>
        MasseurMatch is a U.S.-based service. If you access the platform from another country, your information may
        be processed in the United States or other locations where our service providers operate. Where required,
        appropriate contractual or legal mechanisms may be used for international processing.
      </p>

      <h2>12. Children</h2>
      <p>
        MasseurMatch is intended only for adults age 18 or older. We do not knowingly permit minors to create
        provider or client accounts. Contact us if you believe a minor has submitted personal information.
      </p>

      <h2>13. Changes to This Policy</h2>
      <p>
        We may update this policy as the platform, vendors, legal requirements, or data practices change. Material
        updates will be reflected by a new “Last updated” date and, where appropriate, additional notice.
      </p>

      <h2>14. Contact</h2>
      <p>
        Privacy: <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a><br />
        Legal: <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a><br />
        Support: <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a><br />
        Operator: XRankFlow Media Group LLC<br />
        Mailing address: 2810 N Church St PMB 74302, Wilmington, DE 19802
      </p>

      <p>
        This policy describes current platform practices in plain English and should be reviewed by qualified
        counsel as the product, jurisdictions served, and data-processing vendors evolve.
      </p>
    </LegalPage>
  );
}
