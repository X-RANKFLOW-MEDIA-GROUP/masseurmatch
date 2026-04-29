import type { Metadata } from "next";
import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Acceptable Use & Content Standards",
  description: "Rules governing all content submitted to and use of the MasseurMatch Platform.",
  path: "/acceptable-use",
});

export default function AcceptableUsePage() {
  return (
    <LegalPage title="Acceptable Use & Content Standards" path="/acceptable-use" lastUpdated="March 10, 2026">
      <h2>1. Purpose</h2>
      <p>
        This Acceptable Use &amp; Content Standards Policy governs all content submitted to, and all use of, the
        MasseurMatch Platform. It applies to all users. Violation may result in immediate account suspension or
        permanent termination without refund.
      </p>

      <h2>2. Content You May Submit</h2>
      <p>You may submit content that is:</p>
      <ul>
        <li>Truthful, accurate, and based on your actual qualifications and services</li>
        <li>Relevant to the professional massage therapy or bodywork context of the Platform</li>
        <li>Original, or content for which you own or hold a valid license</li>
        <li>Professional in tone, presentation, and imagery</li>
      </ul>

      <h2>3. Prohibited Content</h2>

      <h3>3a. Sexual &amp; Illegal Content</h3>
      <ul>
        <li>
          Any solicitation, coded reference, implication, or facilitation of sexual services of any kind —
          zero tolerance, immediate permanent ban
        </li>
        <li>Pornographic, sexually explicit, or nudity-containing images</li>
        <li>Content that facilitates any illegal activity</li>
        <li>Content involving minors in any context</li>
      </ul>

      <h3>3b. Misleading &amp; Deceptive Content</h3>
      <ul>
        <li>False or unverifiable professional credentials, license numbers, or certifications</li>
        <li>
          Medical claims, diagnosis language, or disease treatment claims (e.g., &ldquo;cures back pain,&rdquo;
          &ldquo;treats fibromyalgia&rdquo;)
        </li>
        <li>Outcome guarantees of any therapeutic or medical nature</li>
        <li>Before/after imagery or testimonials used deceptively</li>
        <li>False location, identity, or availability information</li>
      </ul>

      <h3>3c. Harmful &amp; Offensive Content</h3>
      <ul>
        <li>Hate speech, discriminatory language, or content targeting protected groups</li>
        <li>Threats, harassment, or content designed to intimidate or distress</li>
        <li>Doxxing or publication of others&apos; private information</li>
        <li>Content promoting or glorifying violence or self-harm</li>
      </ul>

      <h3>3d. Technical &amp; Security Violations</h3>
      <ul>
        <li>Spam, phishing, or unsolicited commercial messaging</li>
        <li>Malware, viruses, or any malicious code</li>
        <li>Automated scraping or data harvesting without authorization</li>
        <li>Attempts to compromise the Platform&apos;s security or other users&apos; accounts</li>
      </ul>

      <h2>4. Medical &amp; Health Claims — FTC Standard</h2>
      <p>
        Per FTC guidelines, all objective claims in advertising — including therapist profile descriptions —
        must be truthful, non-deceptive, and substantiated. Do not use language that states or implies you can
        diagnose, treat, cure, or prevent any medical condition. Claims like &ldquo;I treat chronic pain&rdquo; or
        &ldquo;heals sports injuries&rdquo; enter regulated health claim territory. Use factual, qualified language:
        &ldquo;relaxation massage,&rdquo; &ldquo;Swedish technique,&rdquo; &ldquo;sports massage,&rdquo; etc.
      </p>

      <h2>5. Reviews &amp; Testimonials</h2>
      <p>MasseurMatch prohibits:</p>
      <ul>
        <li>Fake, purchased, or incentivized reviews</li>
        <li>Reviews submitted by the therapist for their own listing</li>
        <li>
          Suppression or selective display of negative reviews to create a misleadingly positive impression
        </li>
        <li>Reviews that include personal identifying information of private individuals</li>
      </ul>
      <p>
        These prohibitions reflect FTC regulations on reviews and endorsements (effective October 21, 2024).
        Violation may result in profile removal and referral to the FTC.
      </p>

      <h2>6. Enforcement &amp; Reporting</h2>
      <p>
        Violations may be reported via the in-Platform report tool or by emailing{" "}
        <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a>. We review all reports and may
        take any of the following actions: remove content, issue a warning, temporarily suspend the account,
        permanently terminate the account, or refer matters to law enforcement.
      </p>
    </LegalPage>
  );
}
