import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const MarketingConsent = () => (
  <LegalPageLayout
    title="Marketing Consent Language"
    seoTitle="Marketing Consent — MasseurMatch"
    seoDescription="CAN-SPAM, TCPA, and FCC-compliant marketing consent language and practices for MasseurMatch."
    path="/marketing-consent"
  >
    <h2>1. Email Marketing — CAN-SPAM Compliance</h2>
    <p>MasseurMatch complies with the CAN-SPAM Act. All marketing emails include a visible sender identity, a physical mailing address, and a one-click unsubscribe mechanism honored within 10 business days. Email marketing is only sent to users who have provided prior express consent via a checkbox (not pre-checked) at a documented collection point.</p>

    <h2>2. Consent Language — Email Opt-In</h2>
    <div className="legal-snippet">
      <p className="!mb-0">"By checking this box, I agree to receive promotional emails from MasseurMatch, including news, special offers, and platform updates. I understand I may unsubscribe at any time by clicking the Unsubscribe link in any email. Consent to marketing is not required to create a listing or use the Platform."</p>
    </div>

    <h2>3. SMS / Text Marketing — TCPA Compliance</h2>
    <p>MasseurMatch may send SMS messages for transactional purposes (billing alerts, account notifications) without separate SMS marketing consent. Marketing SMS requires prior express written consent under the Telephone Consumer Protection Act (TCPA).</p>

    <div className="legal-snippet">
      <p className="!mb-0">"By providing your mobile number and checking this box, you agree to receive recurring automated marketing text messages from MasseurMatch at the number provided. Consent is not a condition of purchase. Message and data rates may apply. Message frequency may vary. Reply STOP to cancel. Reply HELP for help."</p>
    </div>

    <h2>4. FCC One-to-One Consent Rule (Effective January 27, 2025)</h2>
    <p>Under FCC regulations, consent for automated marketing calls and texts must be obtained on a one-to-one basis. MasseurMatch will not share SMS marketing consent with third parties.</p>

    <h2>5. Transactional SMS</h2>
    <p>Transactional messages (billing receipts, account security alerts, renewal reminders) do not require marketing consent but must clearly identify MasseurMatch as the sender.</p>

    <h2>6. Record Keeping</h2>
    <p>MasseurMatch maintains documented records of all email and SMS marketing consents, including the date, time, IP address, opt-in source, and consent language. Records are retained for a minimum of 4 years.</p>
  </LegalPageLayout>
);

export default MarketingConsent;
