import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const BillingPolicy = () => (
  <LegalPageLayout
    title="Billing, Cancellation & Refund Policy"
    seoTitle="Billing & Refund Policy — MasseurMatch"
    seoDescription="MasseurMatch billing, automatic renewal, cancellation, and refund policies for therapist subscriptions."
    path="/billing-policy"
  >
    <div className="legal-callout">
      <p className="!text-foreground/80 !mb-0">READ BEFORE SUBSCRIBING: MasseurMatch subscriptions renew automatically. Review this Policy carefully before entering payment information.</p>
    </div>

    <h2>1. Who Is Billed</h2>
    <p>Only therapists who subscribe to a paid listing plan are charged by MasseurMatch. MasseurMatch does not charge visitors or clients for any purpose.</p>

    <h2>2. What You Are Billed For</h2>
    <p>Your subscription includes access to a public listing profile on MasseurMatch for the duration of your billing period. Plan-specific features are described on the Pricing page and may vary by tier.</p>

    <h2>3. Automatic Renewal</h2>
    <p>All subscriptions renew automatically at the end of each billing cycle unless you cancel before the renewal date. Annual subscribers receive a renewal reminder at least 7 days before the renewal charge.</p>

    <h2>4. Price Changes</h2>
    <p>We reserve the right to change subscription prices. For active subscribers, any price increase will take effect at your next renewal date, following at least 30 days' advance email notice.</p>

    <h2>5. Free Trials</h2>
    <p>If a free trial is offered, no charge is made during the trial period. Your selected payment method will be charged at the standard plan rate when the trial ends unless you cancel before the trial expiration date. Trial eligibility: one per person or entity.</p>

    <h2>6. Payment Processing</h2>
    <p>Payments are processed by Stripe, Inc. in compliance with PCI DSS standards. MasseurMatch does not store full card numbers, CVV codes, or bank account numbers on its servers.</p>

    <h2>7. Failed Payments</h2>
    <p>If a payment fails, we will attempt to charge the payment method up to 3 times over a 7-day period. If payment is not collected after 3 attempts, your listing will be automatically suspended.</p>

    <h2>8. How to Cancel</h2>
    <ul>
      <li>Online (preferred): Account Settings → Subscription → Cancel Subscription</li>
      <li>Email: <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a></li>
    </ul>
    <div className="legal-callout">
      <p className="!text-foreground/80 !mb-0">Cancellation must be completed before your renewal date to avoid being charged for the next period.</p>
    </div>

    <h2>9. Refunds</h2>
    <ul>
      <li>Subscription fees are non-refundable except as described below</li>
      <li>Annual plans: a prorated refund may be issued at our sole discretion if you cancel within 7 days of a new annual billing cycle</li>
      <li>Billing errors: corrected within 10 business days upon verified request</li>
      <li>Statutory rights: residents of jurisdictions with mandatory cooling-off or refund rights may exercise those rights</li>
    </ul>
    <p>To request a refund, contact <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a> within 14 days of the charge.</p>

    <h2>10. Chargebacks</h2>
    <p>Filing a chargeback without first contacting us constitutes a breach of this Agreement. We reserve the right to dispute chargebacks and recover associated fees. Confirmed fraudulent chargebacks may result in permanent account termination.</p>

    <h2>11. Taxes</h2>
    <p>Subscription fees are exclusive of any applicable taxes. Where required by law, applicable sales tax or VAT may be added to your invoice.</p>

    <h2>12. Checkout Disclosure</h2>
    <div className="legal-snippet">
      <p className="!mb-0">"By clicking 'Subscribe,' you agree to a recurring charge of $[PLAN PRICE] every [MONTH/YEAR], starting [DATE], charged to your selected payment method. Subscription renews automatically until canceled. Cancel anytime in Account Settings. No prorated refunds for partial periods. See Billing Policy for details."</p>
    </div>
  </LegalPageLayout>
);

export default BillingPolicy;
