import type { Metadata } from "next";
import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Marketing Consent Language",
  description: "Standardized consent language for MasseurMatch email and SMS marketing programs under CAN-SPAM and TCPA.",
  path: "/marketing-consent",
});

export default function MarketingConsentPage() {
  return (
    <LegalPage title="Marketing Consent Language" path="/marketing-consent" lastUpdated="March 10, 2026">
      <p>
        This section provides the standardized consent language required for MasseurMatch&apos;s email and SMS
        marketing programs, in compliance with CAN-SPAM (email), TCPA (SMS/calls), and FCC regulations.
      </p>

      <h2>1. Email Marketing — CAN-SPAM Compliance</h2>
      <p>All marketing emails sent by MasseurMatch include:</p>
      <ul>
        <li>A clear, non-deceptive subject line that accurately reflects the content</li>
        <li>Clear identification of MasseurMatch as the sender</li>
        <li>A valid physical postal address: Dover, DE, United States</li>
        <li>A working, prominent, one-click unsubscribe link in every email</li>
        <li>Processing of unsubscribe requests within 10 business days</li>
      </ul>
      <p>
        Opt-out requests are permanent and will not result in re-enrollment without new express consent.
      </p>

      <h2>2. Email Opt-In — Consent Language for Signup Forms</h2>
      <p>Use at email signup or account registration:</p>
      <p>
        <em>
          &ldquo;By checking this box, I agree to receive promotional emails from MasseurMatch, including news,
          special offers, and platform updates. I understand I may unsubscribe at any time by clicking the
          Unsubscribe link in any email. Consent to marketing is not required to create a listing or use the
          Platform.&rdquo;
        </em>
      </p>

      <h2>3. SMS / Text Marketing — TCPA Compliance</h2>
      <p>
        MasseurMatch may send SMS messages for transactional purposes (billing alerts, account notifications)
        without separate SMS marketing consent. Marketing SMS requires prior express written consent under the
        Telephone Consumer Protection Act (TCPA).
      </p>
      <p>
        If MasseurMatch elects to send SMS marketing, the following prior express written consent standard
        applies:
      </p>
      <p><strong>SMS Consent Language — use at point of SMS opt-in:</strong></p>
      <p>
        <em>
          &ldquo;By providing your mobile number and checking this box, you agree to receive recurring automated
          marketing text messages from MasseurMatch at the number provided. Consent is not a condition of
          purchase. Message and data rates may apply. Message frequency may vary. Reply STOP to cancel. Reply
          HELP for help. View our Privacy Policy at [URL].&rdquo;
        </em>
      </p>

      <h2>4. FCC One-to-One Consent Rule (Effective January 27, 2025)</h2>
      <p>
        Under FCC regulations effective January 27, 2025, consent for automated marketing calls and texts must
        be obtained on a one-to-one basis — that is, from a single seller per consent form, not bundled with
        consent for multiple companies. MasseurMatch will not share SMS marketing consent with third parties.
        Any lead generation or referral forms must obtain consent specific to MasseurMatch.
      </p>

      <h2>5. Transactional SMS</h2>
      <p>
        Transactional messages (billing receipts, account security alerts, subscription renewal reminders) do
        not require marketing consent but must clearly identify MasseurMatch as the sender and include
        instructions for opting out of future transactional messages where applicable.
      </p>

      <h2>6. Record Keeping</h2>
      <p>
        MasseurMatch maintains documented records of all email and SMS marketing consents, including the date,
        time, IP address, opt-in source, and consent language presented at time of opt-in. These records are
        retained for a minimum of 4 years and are available upon lawful request.
      </p>
    </LegalPage>
  );
}
