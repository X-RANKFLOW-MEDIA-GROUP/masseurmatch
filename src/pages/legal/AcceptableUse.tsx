import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const AcceptableUse = () => (
  <LegalPageLayout
    title="Acceptable Use & Content Standards"
    seoTitle="Acceptable Use Policy — MasseurMatch"
    seoDescription="Content standards and acceptable use rules for the MasseurMatch platform. Zero tolerance for prohibited content."
    path="/acceptable-use"
  >
    <h2>1. Purpose</h2>
    <p>This Acceptable Use & Content Standards Policy governs all content submitted to, and all use of, the MasseurMatch Platform. Violation may result in immediate account suspension or permanent termination without refund.</p>

    <h2>2. Content You May Submit</h2>
    <ul>
      <li>Truthful, accurate, and based on your actual qualifications and services</li>
      <li>Relevant to the professional massage therapy or bodywork context</li>
      <li>Original, or content for which you own or hold a valid license</li>
      <li>Professional in tone, presentation, and imagery</li>
    </ul>

    <h2>3. Prohibited Content</h2>

    <h3>3a. Sexual & Illegal Content</h3>
    <ul>
      <li>Any solicitation or facilitation of sexual services — zero tolerance, immediate permanent ban</li>
      <li>Pornographic, sexually explicit, or nudity-containing images</li>
      <li>Content that facilitates any illegal activity</li>
      <li>Content involving minors in any context</li>
    </ul>

    <h3>3b. Misleading & Deceptive Content</h3>
    <ul>
      <li>False or unverifiable professional credentials</li>
      <li>Medical claims, diagnosis language, or disease treatment claims</li>
      <li>Outcome guarantees of any therapeutic or medical nature</li>
      <li>False location, identity, or availability information</li>
    </ul>

    <h3>3c. Harmful & Offensive Content</h3>
    <ul>
      <li>Hate speech, discriminatory language</li>
      <li>Threats, harassment, or content designed to intimidate</li>
      <li>Doxxing or publication of others' private information</li>
      <li>Content promoting violence or self-harm</li>
    </ul>

    <h3>3d. Technical & Security Violations</h3>
    <ul>
      <li>Spam, phishing, or unsolicited commercial messaging</li>
      <li>Malware, viruses, or malicious code</li>
      <li>Automated scraping or data harvesting without authorization</li>
      <li>Attempts to compromise Platform security</li>
    </ul>

    <h2>4. Medical & Health Claims — FTC Standard</h2>
    <div className="legal-callout">
      <p className="!text-foreground/80 !mb-0">Per FTC guidelines, all claims in advertising must be truthful, non-deceptive, and substantiated. Do not use language that implies you can diagnose, treat, cure, or prevent any medical condition. Use factual language: "relaxation massage," "Swedish technique," "sports massage," etc.</p>
    </div>

    <h2>5. Reviews & Testimonials</h2>
    <ul>
      <li>Fake, purchased, or incentivized reviews are prohibited</li>
      <li>Reviews submitted by the therapist for their own listing are prohibited</li>
      <li>Suppression of negative reviews to create a misleadingly positive impression is prohibited</li>
      <li>Reviews containing personal identifying information of private individuals are prohibited</li>
    </ul>

    <h2>6. Enforcement & Reporting</h2>
    <p>Violations may be reported via the in-Platform report tool or by emailing <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a>. We may: remove content, issue a warning, suspend or terminate the account, or refer matters to law enforcement.</p>
  </LegalPageLayout>
);

export default AcceptableUse;
