import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const Privacy = () => (
  <LegalPageLayout
    title="Privacy Policy"
    seoTitle="Privacy Policy — MasseurMatch"
    seoDescription="How MasseurMatch collects, uses, shares, and protects your personal information. CCPA/TDPSA compliant."
    path="/privacy"
  >
    <p>XRankFlow Media Group LLC ("we," "us," "our") operates MasseurMatch. This Privacy Policy explains what personal information we collect, how we use and share it, and your rights. Contact for privacy matters: <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a></p>

    <h2>1. Scope</h2>
    <p>This Policy applies to all users of <a href="https://www.masseurmatch.com">www.masseurmatch.com</a>, including visitors, registered clients, and therapist subscribers. It does not apply to third-party websites linked from the Platform.</p>

    <h2>2. Information We Collect</h2>
    <h3>2a. Information You Provide</h3>
    <ul>
      <li>Account data: name, email address, phone number, password (hashed)</li>
      <li>Therapist profile data: professional bio, modalities, location (city/state), pricing, availability, profile photos</li>
      <li>Professional data (Therapists): license number, certifications — as provided by the therapist; not independently verified unless expressly stated</li>
      <li>Subscription and billing data: payment method metadata managed by Stripe; we do not store full card numbers or CVV</li>
      <li>Communications: support emails, contact form submissions, chat messages</li>
      <li>Marketing consents: email opt-in/opt-out records, SMS consent</li>
    </ul>

    <h3>2b. Information Collected Automatically</h3>
    <ul>
      <li>Technical data: IP address, browser type, device type, operating system, referring URLs</li>
      <li>Usage data: pages visited, features accessed, time on site, click paths</li>
      <li>Location data: approximate location derived from IP address; precise location only if explicitly granted</li>
      <li>Cookies and tracking technologies (see <a href="/cookies">Cookie Policy</a>, Section 4)</li>
    </ul>

    <p>2c. Information from Third Parties</p>
    <ul>
      <li>Stripe: payment status, last 4 card digits, subscription status</li>
      <li>Analytics providers: aggregated, de-identified usage metrics</li>
    </ul>

    <h2>3. How We Use Your Information</h2>
    <ul>
      <li>To create and manage your account and listing</li>
      <li>To process subscription payments and send billing receipts</li>
      <li>To display your public profile to visitors (therapist listings only)</li>
      <li>To respond to support requests and communications</li>
      <li>To send transactional emails (receipts, account alerts, renewal reminders)</li>
      <li>To send marketing emails or SMS — only with your express consent, and with easy opt-out</li>
      <li>To improve Platform performance, security, and features</li>
      <li>To detect and prevent fraud, abuse, and illegal activity</li>
      <li>To comply with applicable legal obligations</li>
    </ul>

    <h2>4. Legal Bases (Texas TDPSA & CCPA Context)</h2>
    <p>MasseurMatch operates primarily in the United States. We process personal data based on:</p>
    <ul>
      <li>Contract performance: subscription and account management</li>
      <li>Legitimate interests: fraud prevention, security, product improvement — balanced against your rights</li>
      <li>Consent: marketing emails, SMS, analytics cookies, and location data</li>
      <li>Legal obligation: tax records, responses to lawful government requests</li>
    </ul>
    <p>Texas residents have rights under the Texas Data Privacy and Security Act (TDPSA), effective July 1, 2024. California residents have rights under the CCPA/CPRA. See Section 7 for how to exercise your rights.</p>

    <h2>5. Data Sharing</h2>
    <p>We do not sell your personal information. We share data only as follows:</p>
    <ul>
      <li>Public therapist profiles: name (or display name), bio, specialty, city/state, photos, and contact link are publicly visible to all Site visitors</li>
      <li>Stripe: billing and subscription data shared with Stripe for payment processing</li>
      <li>Hosting and infrastructure: Supabase (database), Vercel (hosting) — all under data processing agreements</li>
      <li>Email providers: for transactional and marketing communications</li>
      <li>Analytics providers: aggregated, de-identified data only</li>
      <li>Law enforcement: when required by law, valid legal process, or to protect safety</li>
      <li>Business transfers: in a merger, acquisition, or asset sale, with appropriate data protection obligations transferred</li>
    </ul>

    <h2>6. Data Retention</h2>
    <ul>
      <li>Active accounts: retained for the duration of the subscription or account</li>
      <li>Deleted accounts: personal data deleted or anonymized within 90 days of account deletion, except where longer retention is required by law</li>
      <li>Financial records: retained for 7 years as required by tax law</li>
      <li>Consent records: retained for as long as needed to demonstrate compliance</li>
    </ul>

    <h2>7. Your Rights</h2>
    <p>Depending on your jurisdiction, you may have the right to:</p>
    <ul>
      <li>Access: request a copy of your personal data</li>
      <li>Correction: request correction of inaccurate data</li>
      <li>Deletion: request deletion of your data ('right to erasure')</li>
      <li>Portability: receive your data in a machine-readable format</li>
      <li>Opt-out of marketing: unsubscribe at any time via any email or by contacting <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a></li>
      <li>Object to processing based on legitimate interests</li>
    </ul>
    <p>To exercise any right, email <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a> with your full name, account email, and specific request. We will respond within 45 days (or shorter where required by law). We may require identity verification before fulfilling requests.</p>

    <h2>8. Data Security</h2>
    <p>We implement reasonable security measures including TLS/SSL encryption for data in transit, AES-256 encryption for sensitive data at rest, row-level security policies in our database, and access controls that limit employee access to personal data. No security system is impenetrable. In the event of a data breach affecting Texas residents, we will notify the Texas Attorney General and affected users within 30 days of discovery, as required by Texas law.</p>

    <h2>9. Children's Privacy</h2>
    <p>The Platform is not directed to individuals under 18. We do not knowingly collect data from minors. If we discover we have collected data from a minor, we will delete it immediately. Contact <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a> if you believe a minor has used the Platform.</p>

    <h2>10. International Users</h2>
    <p>The Platform is operated in the United States and is intended for US users. We do not actively target users in the European Union. If you access the Platform from outside the US, you do so at your own initiative and consent to your data being processed in the US, where data protection laws may differ from those in your country.</p>

    <h2>11. Changes to This Policy</h2>
    <p>We may update this Privacy Policy at any time. Material changes will be communicated via email to registered users at least 14 days before taking effect. Continued use after the effective date constitutes acceptance.</p>
  </LegalPageLayout>
);

export default Privacy;
