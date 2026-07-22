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
        MasseurMatch. It supplements the general Terms of Use and describes listing obligations, billing,
        professional conduct, and moderation expectations.
      </p>

      <h2>1. Independent Relationship</h2>
      <p>
        Therapists listed on MasseurMatch are independent providers. The platform does not employ therapists,
        act as an agent, process appointments between users, or become a party to any service arrangement.
      </p>

      <h2>2. Listing Eligibility</h2>
      <ul>
        <li>You must be at least 18 years old and legally permitted to provide the services you advertise.</li>
        <li>Your listing must be truthful, current, and not misleading.</li>
        <li>You are responsible for complying with applicable local laws, licensing rules, and professional standards.</li>
      </ul>

      <h2>3. Professional and Non-Sexual Use</h2>
      <p>
        MasseurMatch is a professional massage directory. By creating or maintaining a listing, you agree that
        you will not use the platform to offer, request, solicit, advertise, imply, negotiate, or arrange sexual
        services, erotic services, prostitution, sexual contact, or any unlawful service.
      </p>
      <ul>
        <li>Profiles, photos, rates, promotions, messages, and contact instructions must describe legitimate professional massage or bodywork.</li>
        <li>Code words, suggestive pricing, hidden menus, or language intended to bypass this rule are prohibited.</li>
        <li>Violations may result in content removal, suspension, permanent account removal, and reporting when legally required.</li>
      </ul>

      <h2>4. Content and Photo Rules</h2>
      <ul>
        <li>Profile photos and text must be professional, accurate, and owned or authorized by you.</li>
        <li>The primary profile photo must clearly show you, preferably facing the camera, in good lighting and against a plain or non-distracting background.</li>
        <li>No unlawful content, deceptive claims, impersonation, false credentials, or stolen photos.</li>
      </ul>

      <h2>5. Identity Verification and Publication</h2>
      <p>
        You may access your dashboard and continue completing a draft profile while identity verification is
        pending. Public visibility, verification badges, and some paid features may depend on successful identity
        verification, profile completeness, moderation, and account standing.
      </p>

      <h2>6. Rates</h2>
      <p>
        Rates must be accurate and professional. Published numeric rates may not exceed US$3.33 per minute.
        When a price would exceed that limit, you must use the “Ask Me” option rather than publishing the numeric rate.
        Incall and outcall rates must be identified separately when they differ.
      </p>

      <h2>7. Billing</h2>
      <p>
        Paid listings renew automatically until canceled. We may update plan pricing or features with notice.
        Failed or disputed payments may lead to paid-feature suspension until the account is resolved.
      </p>

      <h2>8. Cancellation and Removal</h2>
      <p>
        Therapists may cancel at any time, with changes typically taking effect at the end of the current billing
        period. We may suspend or remove listings that violate policy, create trust-and-safety risk, or contain
        misleading information.
      </p>

      <h2>9. License to Display Content</h2>
      <p>
        You keep ownership of your content, but grant MasseurMatch a non-exclusive license to host, format,
        moderate, process, and display it as needed to operate the directory and promote the platform.
      </p>

      <h2>10. Contact</h2>
      <p>
        Billing or agreement questions can be sent to <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.
      </p>
    </LegalPage>
  );
}
