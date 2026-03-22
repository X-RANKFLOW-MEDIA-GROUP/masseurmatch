import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Therapist Subscription Agreement",
  description: "Terms for therapists who publish paid or free listings on MasseurMatch.",
  path: "/therapist-agreement",
  noIndex: true,
});

export default function TherapistAgreementPage() {
  return (
    <LegalPage title="Therapist Subscription Agreement" path="/therapist-agreement">
      <p>
        This agreement applies to therapists and providers who create, maintain, or pay for a listing on
        MasseurMatch. It supplements the general Terms of Use and describes listing obligations, billing, and
        moderation expectations.
      </p>

      <h2>1. Independent Relationship</h2>
      <p>
        Therapists listed on MasseurMatch are independent providers. The platform does not employ therapists, act
        as an agent, or become a party to any service arrangement between a visitor and a therapist.
      </p>

      <h2>2. Listing Eligibility</h2>
      <ul>
        <li>You must be 18 or older and legally permitted to provide the services you advertise.</li>
        <li>Your listing must be truthful, current, and not misleading.</li>
        <li>You are responsible for complying with all local laws, licensing rules, and professional standards.</li>
      </ul>

      <h2>3. Content Rules</h2>
      <ul>
        <li>Profile photos and text must be professional and accurate.</li>
        <li>No unlawful content, deceptive claims, or sexual solicitation.</li>
        <li>No stolen photos, impersonation, or false credentials.</li>
      </ul>

      <h2>4. Billing</h2>
      <p>
        Paid listings renew automatically until canceled. We may update plan pricing or features with notice.
        Failed or disputed payments may lead to listing suspension until the account is resolved.
      </p>

      <h2>5. Cancellation and Removal</h2>
      <p>
        Therapists may cancel at any time, with changes typically taking effect at the end of the current billing
        period. We may suspend or remove listings that violate policy, create trust-and-safety risk, or contain
        misleading information.
      </p>

      <h2>6. License to Display Content</h2>
      <p>
        You keep ownership of your content, but grant MasseurMatch a non-exclusive license to host, format,
        moderate, and display it as needed to operate the directory and promote the platform.
      </p>

      <h2>7. Contact</h2>
      <p>
        Billing or agreement questions can be sent to <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.
      </p>
    </LegalPage>
  );
}
