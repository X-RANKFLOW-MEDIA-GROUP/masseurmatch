import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const Privacy = () => (
  <LegalPageLayout
    title="Privacy Policy"
    seoTitle="Privacy Policy — MasseurMatch"
    seoDescription="How MasseurMatch collects, uses, shares, and protects your personal information. CCPA/TDPSA compliant."
    path="/privacy"
  >
    <p>XRankFlow Media Group LLC ("we," "us," "our") operates MasseurMatch. This Privacy Policy explains what personal information we collect, how we use and share it, and your rights. Contact: <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a></p>

    <h2>1. Scope</h2>
    <p>This Policy applies to all users of www.masseurmatch.com, including visitors, registered clients, and therapist subscribers.</p>

    <h2>2. Information We Collect</h2>
    <h3>2a. Information You Provide</h3>
    <ul>
      <li>Account data: name, email address, phone number, password (hashed)</li>
      <li>Therapist profile data: bio, modalities, location, pricing, availability, photos</li>
      <li>Subscription and billing data: payment metadata managed by Stripe</li>
      <li>Communications: support emails, contact form submissions</li>
    </ul>
    <h3>2b. Information Collected Automatically</h3>
    <ul>
      <li>Technical data: IP address, browser type, device type, OS, referring URLs</li>
      <li>Usage data: pages visited, features accessed, time on site</li>
      <li>Location data: approximate location from IP; precise only if granted</li>
      <li>Cookies (see <a href="/cookies">Cookie Policy</a>)</li>
    </ul>

    <h2>3. How We Use Your Information</h2>
    <ul>
      <li>To create and manage your account and listing</li>
      <li>To process payments and send billing receipts</li>
      <li>To display your public profile to visitors</li>
      <li>To send transactional emails and marketing (with consent)</li>
      <li>To improve Platform performance and security</li>
      <li>To detect and prevent fraud and illegal activity</li>
      <li>To comply with legal obligations</li>
    </ul>

    <h2>4. How We Share Your Information</h2>
    <p>We do not sell your personal information. We share data with service providers (Stripe, Resend, cloud hosting), law enforcement when required, and in connection with business transfers.</p>

    <h2>5. Data Retention</h2>
    <p>We retain data while your account is active. After deletion, data is kept up to 90 days for backup, then permanently deleted.</p>

    <h2>6. Your Rights</h2>
    <ul>
      <li><strong>Access:</strong> Request a copy of your personal data</li>
      <li><strong>Correction:</strong> Request correction of inaccurate data</li>
      <li><strong>Deletion:</strong> Request deletion of your personal data</li>
      <li><strong>Portability:</strong> Request data in machine-readable format</li>
      <li><strong>Opt-out:</strong> Unsubscribe from marketing at any time</li>
    </ul>
    <p>Email <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a>. Response within 45 days per CCPA/TDPSA.</p>

    <h2>7. Security</h2>
    <p>We use encryption in transit (TLS), secure authentication, and access controls.</p>

    <h2>8. Children's Privacy</h2>
    <p>MasseurMatch is not directed to individuals under 18.</p>

    <h2>9. Changes</h2>
    <p>Material changes communicated via email at least 14 days before taking effect.</p>

    <h2>10. Contact</h2>
    <p><a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a> · XRankFlow Media Group LLC — Dover, DE</p>
  </LegalPageLayout>
);

export default Privacy;
