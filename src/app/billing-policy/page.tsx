import type { Metadata } from "next";
import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Billing, Cancellation & Refund Policy",
  description: "MasseurMatch subscription billing, automatic renewal, cancellation, and refund terms for therapists.",
  path: "/billing-policy",
});

export default function BillingPolicyPage() {
  return (
    <LegalPage title="Billing, Cancellation & Refund Policy" path="/billing-policy" lastUpdated="March 10, 2026">
      <p>
        <strong>READ BEFORE SUBSCRIBING:</strong> MasseurMatch subscriptions renew automatically. Review this
        Policy carefully before entering payment information.
      </p>

      <h2>1. Who Is Billed</h2>
      <p>
        Only therapists who subscribe to a paid listing plan are charged by MasseurMatch. MasseurMatch does not
        charge, process, or receive payments from visitors or clients for any purpose. All billing described in
        this Policy relates exclusively to therapist subscription fees.
      </p>

      <h2>2. What You Are Billed For</h2>
      <p>
        Your subscription includes access to a public listing profile on MasseurMatch for the duration of your
        billing period. Plan-specific features (e.g., enhanced visibility, photo slots, badge display) are
        described on the Pricing page and may vary by plan tier.
      </p>

      <h2>3. Automatic Renewal</h2>
      <p>
        All subscriptions renew automatically at the end of each billing cycle (monthly or annually) unless you
        cancel before the renewal date. By subscribing, you expressly authorize MasseurMatch and our payment
        processor (Stripe) to charge your payment method on file at the applicable renewal rate on or around the
        same calendar date each period.
      </p>
      <p>
        Annual subscribers will receive a renewal reminder email at least 7 days before the renewal charge.
        Monthly subscribers receive a billing confirmation each cycle.
      </p>

      <h2>4. Price Changes</h2>
      <p>
        We reserve the right to change subscription prices. For active subscribers, any price increase will take
        effect at your next renewal date, following at least 30 days&apos; advance email notice. Continuing your
        subscription after a price change takes effect constitutes acceptance of the new price.
      </p>

      <h2>5. Free Trials</h2>
      <p>
        If a free trial is offered, no charge is made during the trial period. Your selected payment method will
        be charged at the standard plan rate when the trial ends unless you cancel before the trial expiration
        date. Trial eligibility: one per person or entity. Creating multiple accounts to obtain additional trials
        is prohibited.
      </p>

      <h2>6. Payment Processing</h2>
      <p>
        Payments are processed by Stripe, Inc. All payment data is handled in compliance with PCI DSS standards.
        MasseurMatch does not store full card numbers, CVV codes, or bank account numbers on its servers. By
        subscribing, you also accept Stripe&apos;s Terms of Service and Privacy Policy.
      </p>

      <h2>7. Failed Payments</h2>
      <p>
        If a payment fails, we will attempt to charge the payment method on file up to 3 times over a 7-day
        period. If payment is not collected after 3 attempts, your listing will be automatically suspended until
        payment is received. A failed payment does not cancel your subscription; you remain responsible for
        bringing the account current.
      </p>

      <h2>8. How to Cancel</h2>
      <p>You may cancel your subscription at any time using one of these methods:</p>
      <ul>
        <li><strong>Online (preferred):</strong> Account Settings &gt; Subscription &gt; Cancel Subscription</li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a> with your registered account
          email and written cancellation request
        </li>
      </ul>
      <p>
        Cancellation takes effect at the end of the current billing period. Your listing remains active and
        publicly visible until that date. After the billing period ends, your listing is removed and your account
        is downgraded to inactive.
      </p>
      <p>
        Cancellation must be completed before your renewal date to avoid being charged for the next period.
        Canceling after a charge is processed does not entitle you to a refund for that period.
      </p>

      <h2>9. Refunds</h2>
      <ul>
        <li>Subscription fees are non-refundable except as described below.</li>
        <li>
          <strong>Annual plans:</strong> a prorated refund may be issued at our sole discretion if you cancel
          within 7 days of the start of a new annual billing cycle and your listing had no material use during
          that period.
        </li>
        <li>
          <strong>Billing errors:</strong> if you were charged an incorrect amount due to a platform error, we
          will issue a correction within 10 business days upon verified request.
        </li>
        <li>
          <strong>Statutory rights:</strong> residents of jurisdictions with mandatory cooling-off or refund
          rights may exercise those rights regardless of this policy.
        </li>
      </ul>
      <p>
        To request a refund, contact{" "}
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a> within 14 days of the charge with
        your account email, subscription plan, charge amount, and reason.
      </p>

      <h2>10. Chargebacks</h2>
      <p>
        Filing a chargeback or payment reversal with your bank or card issuer without first contacting us and
        allowing us a reasonable opportunity to resolve the issue constitutes a breach of this Agreement. We
        reserve the right to dispute chargebacks we believe are filed without basis and to recover associated
        fees and costs. Confirmed fraudulent chargebacks may result in permanent account termination.
      </p>

      <h2>11. Taxes</h2>
      <p>
        Subscription fees are exclusive of any applicable taxes. Where required by law, applicable sales tax or
        VAT may be added to your invoice. You are responsible for any additional taxes applicable to your
        subscription under the laws of your jurisdiction. MasseurMatch may issue tax documents (e.g., IRS Form
        1099-K) where legally required.
      </p>

      <h2>12. Checkout Disclosure</h2>
      <p>The following disclosure is displayed at checkout immediately before payment is authorized:</p>
      <p>
        <em>
          &ldquo;By clicking &lsquo;Subscribe,&rsquo; you agree to a recurring charge of $[PLAN PRICE] every [MONTH/YEAR],
          starting [DATE], charged to your selected payment method. Subscription renews automatically until
          canceled. Cancel anytime in Account Settings. No prorated refunds for partial periods. See Billing
          Policy for details.&rdquo;
        </em>
      </p>
    </LegalPage>
  );
}
