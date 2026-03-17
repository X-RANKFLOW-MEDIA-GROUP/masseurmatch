import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Use",
  description: "Terms governing access to the MasseurMatch platform, listings, subscriptions, and acceptable use.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" path="/terms">
      <p>
        These Terms of Use govern your access to and use of MasseurMatch, including our public directory,
        therapist listing tools, editorial content, and subscription features. By using the site, you agree to
        these terms.
      </p>

      <h2>1. What the Platform Is</h2>
      <p>
        MasseurMatch is a directory and discovery platform. We help visitors browse therapist profiles, compare
        specialties, and contact providers directly. We do not book appointments, process sessions between
        visitors and therapists, or guarantee services from any listed provider.
      </p>

      <h2>2. Eligibility</h2>
      <p>You must be at least 18 years old to create an account, publish a profile, or use provider features.</p>

      <h2>3. Accounts and Listings</h2>
      <ul>
        <li>You must provide accurate, current, and complete information.</li>
        <li>You are responsible for protecting your login credentials.</li>
        <li>Therapists are responsible for all profile content, pricing, and contact details they publish.</li>
        <li>We may suspend accounts that are misleading, abusive, unsafe, or non-compliant.</li>
      </ul>

      <h2>4. Prohibited Conduct</h2>
      <ul>
        <li>No illegal activity, deceptive listings, harassment, or impersonation.</li>
        <li>No scraping, automated abuse, malware, or attempts to bypass access controls.</li>
        <li>No sexual solicitation, coded offers, or unlawful service promotion.</li>
      </ul>

      <h2>5. Directory Disclaimer</h2>
      <p>
        Therapists operate independently. Unless a profile is explicitly marked otherwise, MasseurMatch does not
        verify licenses, credentials, insurance, or service quality. Visitors should perform their own due
        diligence before contacting a provider.
      </p>

      <h2>6. Billing and Subscriptions</h2>
      <p>
        Paid plans renew automatically unless canceled. Plan features and prices may change with notice. Charges
        are processed through Stripe or other designated billing providers. Additional subscription terms for
        therapists appear in the therapist agreement.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        Our branding, software, editorial copy, and platform design belong to MasseurMatch or its licensors.
        Therapists retain ownership of their submitted content, while granting us the right to host and display it
        as needed to operate and market the directory.
      </p>

      <h2>8. Warranty and Liability Limits</h2>
      <p>
        The platform is provided "as is" and "as available." To the fullest extent allowed by law, we disclaim
        warranties and limit liability for indirect, incidental, or consequential damages arising from use of the
        site.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these terms can be sent to <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>.
      </p>
    </LegalPage>
  );
}
