import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const Terms = () => (
  <LegalPageLayout
    title="Terms of Use"
    seoTitle="Terms of Use — MasseurMatch"
    seoDescription="Terms of Use governing access to the MasseurMatch platform, operated by XRankFlow Media Group LLC."
    path="/terms"
  >
    <p>These Terms of Use ("Terms") govern your access to and use of the MasseurMatch website located at <a href="https://www.masseurmatch.com">www.masseurmatch.com</a> (the "Site") and all related services (collectively, the "Platform"), operated by XRankFlow Media Group LLC ("Company," "we," "us," or "our"), incorporated in the State of Delaware.</p>
    <p>By accessing or using the Platform in any way — including browsing as a visitor — you agree to be bound by these Terms. If you do not agree, you must immediately stop using the Platform.</p>

    <h2>1. What MasseurMatch Is — And Is Not</h2>
    <div className="legal-callout">
      <p className="!text-foreground/80 !mb-0">MasseurMatch is an online directory. It lists independent massage therapists and bodywork practitioners who pay a subscription to maintain a public profile. MasseurMatch does NOT book appointments, process payments between clients and therapists, employ therapists, verify licenses, conduct background checks, or guarantee any outcome of any kind.</p>
    </div>
    <p>MasseurMatch is a passive information intermediary. Any contact, scheduling, or service arrangement between a visitor and a listed therapist occurs entirely outside the Platform and is solely the responsibility of those parties.</p>

    <h2>2. Eligibility</h2>
    <p>You must be at least 18 years of age to use this Platform, create an account, or submit any content. By using the Platform, you represent and warrant that you are 18 or older and have full legal capacity to enter into binding agreements. We may request proof of age at any time. Accounts of users found to be under 18 will be terminated immediately.</p>

    <h2>3. User Accounts</h2>
    <p>Therapist accounts require registration and a paid subscription. Visitors may browse the Platform without registration. If you create an account, you agree to:</p>
    <ul>
      <li>Provide accurate, truthful, and current information at registration and keep it updated</li>
      <li>Maintain the confidentiality of your login credentials and accept responsibility for all activity under your account</li>
      <li>Notify us immediately at <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a> of any unauthorized account use or security breach</li>
      <li>Not share your account credentials with any third party</li>
    </ul>
    <p>We reserve the right to suspend or terminate any account that contains false, misleading, or incomplete information.</p>

    <h2>4. Directory — No Booking, No Payments</h2>
    <p>MasseurMatch does not offer, support, or facilitate booking of appointments or payment processing between clients and therapists. Any reference to scheduling, availability, or pricing in a therapist's profile represents information provided directly by that therapist and is displayed for informational purposes only. MasseurMatch is not a party to any service arrangement, and assumes no responsibility for any transaction, interaction, or outcome occurring between users.</p>

    <h2>5. No Verification of Credentials or Safety</h2>
    <p>MasseurMatch does not verify, confirm, or endorse the professional licenses, certifications, qualifications, background, insurance, or identity of any listed therapist, unless a specific listing is expressly and individually marked as "Verified" through a documented verification process and that designation is accompanied by a clear explanation of what was verified and how. Absent such express individual marking, no verification of any kind should be inferred. Users are solely responsible for conducting their own due diligence before contacting or engaging any listed therapist.</p>

    <h2>6. Intellectual Property</h2>
    <p>All content on the Platform created by XRankFlow Media Group LLC — including the MasseurMatch name, logo, design, software, and original text — is owned by XRankFlow Media Group LLC and protected by copyright, trademark, and other applicable intellectual property laws. You may not reproduce, distribute, or create derivative works of Company content without prior written authorization. Therapist-submitted profile content remains the property of the submitting therapist, subject to the license granted in the Therapist Subscription Agreement.</p>

    <h2>7. Prohibited Conduct</h2>
    <p>All users agree NOT to:</p>
    <ul>
      <li>Use the Platform to solicit, arrange, or facilitate any illegal activity, including the solicitation of sexual services</li>
      <li>Impersonate any person, entity, or professional credential</li>
      <li>Post, transmit, or distribute false, defamatory, or misleading information</li>
      <li>Scrape, harvest, or collect data from the Platform through automated means without written authorization</li>
      <li>Introduce malware, viruses, or other malicious code</li>
      <li>Attempt to gain unauthorized access to any part of the Platform or another user's account</li>
      <li>Use the Platform if you are under 18 years of age</li>
      <li>Circumvent or disable any security or access control feature of the Platform</li>
    </ul>

    <h2>8. Third-Party Links</h2>
    <p>The Platform may contain links to third-party websites. Such links are provided for convenience only. MasseurMatch has no control over and assumes no responsibility for the content, privacy practices, or conduct of any third-party sites.</p>

    <h2>9. Disclaimer of Warranties</h2>
    <p>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, TITLE, AND NON-INFRINGEMENT.</p>

    <h2>10. Limitation of Liability</h2>
    <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, XRANKFLOW MEDIA GROUP LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM. IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED ONE HUNDRED US DOLLARS ($100.00).</p>

    <h2>11. Indemnification</h2>
    <p>You agree to indemnify, defend, and hold harmless XRankFlow Media Group LLC from and against any and all claims, damages, losses, liabilities, costs, and expenses arising out of: (a) your use of the Platform; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) any content you submit to the Platform.</p>

    <h2>12. Modifications to These Terms</h2>
    <p>We reserve the right to modify these Terms at any time. We will notify registered users of material changes via email or Platform notice at least 14 days before the change takes effect. Continued use of the Platform after the effective date constitutes acceptance of the revised Terms.</p>

    <h2>13. Acceptance — Clickwrap</h2>
    <p>For new account registrations, acceptance of these Terms is confirmed by clicking "I agree to the Terms of Use" during the registration process. This constitutes a valid, binding agreement.</p>

    <h2>14. Contact</h2>
    <p>Legal inquiries: <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a> | Dover, DE, United States</p>
  </LegalPageLayout>
);

export default Terms;
