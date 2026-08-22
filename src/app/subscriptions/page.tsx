import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Paid Subscription and Add-On Terms",
  description:
    "Terms governing paid subscriptions, add-ons, boosts, and visibility tools on MasseurMatch — billing, renewal, and important limitations.",
  path: "/subscriptions",
  keywords: ["subscription terms", "paid listing", "add-on terms", "billing policy"],
});

export default function SubscriptionsPage() {
  return (
    <LegalPage title="Paid Subscription and Add-On Terms" path="/subscriptions" lastUpdated="August 16, 2026">
      <p>
        These Paid Subscription and Add-On Terms govern paid products made available through MasseurMatch,
        including provider subscription plans and, when offered, profile add-ons, boost credits, and featured
        placement tools. These terms supplement the general <Link href="/terms">Terms of Service</Link> and the{" "}
        <Link href="/provider-terms">Provider Terms</Link>. By purchasing a paid product, you agree to these terms.
      </p>

      <h2>1. What Paid Products Cover</h2>
      <p>MasseurMatch may offer the following categories of paid products:</p>
      <ul>
        <li><strong>Subscription plans:</strong> Recurring provider listing plans with plan-specific profile features, placement, analytics, or visibility benefits.</li>
        <li><strong>Add-ons:</strong> Optional paid features purchased separately when available.</li>
        <li><strong>Boost credits:</strong> Promotional credits or paid visibility tools that may temporarily increase a profile&apos;s exposure when available.</li>
        <li><strong>Featured placement:</strong> Clearly labeled promotional placement in eligible directory surfaces when available.</li>
      </ul>

      <h2>2. Billing and Recurring Charges</h2>
      <p>
        Paid provider subscriptions are processed through PayPal. The billing cadence, trial terms, price, and
        renewal details shown at checkout control your purchase. Unless canceled before the next renewal date,
        recurring subscriptions renew automatically according to the terms presented at checkout.
      </p>
      <p>
        By approving a recurring subscription, you authorize PayPal to process future recurring charges for the
        selected MasseurMatch plan until the subscription is canceled. You are responsible for keeping your PayPal
        account and payment information current. Failed or suspended payments may result in loss of paid plan
        access until billing is resolved.
      </p>

      <h2>3. Add-Ons and Boost Credits</h2>
      <p>
        Add-ons, boost credits, and other promotional products are subject to the price, duration, expiration,
        placement, and renewal terms displayed at the time of purchase. Some products may be one-time purchases
        and others may recur only when clearly disclosed before purchase.
      </p>

      <h2>4. No Guarantee of Results</h2>
      <p>
        Paid subscriptions, boost credits, add-ons, featured placements, and other visibility tools may increase
        display opportunities for an eligible profile, but they do not guarantee views, messages, leads, bookings,
        clients, income, revenue, rankings, or any other outcome.
      </p>
      <p>
        Visibility may depend on location, search filters, user behavior, subscription tier, moderation status,
        inventory availability, and platform rules. MasseurMatch does not guarantee a specific position or ranking.
      </p>

      <h2>5. Paid Placement and Verification Are Separate</h2>
      <p>
        Purchasing a subscription, add-on, boost, Featured placement, or other promotional product does not verify
        identity, professional licensing, credentials, qualifications, background, service quality, or safety.
        Identity verification, when displayed, is a separate identity-only platform signal.
      </p>

      <h2>6. Payment Processing</h2>
      <p>
        Provider subscription payments are processed by PayPal. Available payment methods are determined and shown
        by PayPal during checkout. MasseurMatch does not store full payment card or bank account numbers. Your use
        of PayPal is also subject to PayPal&apos;s applicable terms and policies.
      </p>
      <p>
        MasseurMatch is a directory only and does not process payments for massage sessions between clients and
        independent providers.
      </p>

      <h2>7. Cancellation</h2>
      <p>
        You may cancel a recurring subscription through PayPal or by contacting{" "}
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>. Unless applicable law or the checkout
        terms provide otherwise, cancellation stops future renewals and paid access continues through the end of
        the already-paid period or applicable trial period.
      </p>

      <h2>8. Refunds</h2>
      <p>
        Refund eligibility is governed by our <Link href="/refund-policy">Refund and Cancellation Policy</Link>.
        Subscription fees are generally non-refundable except where required by law or where MasseurMatch confirms
        a qualifying billing error. Lack of leads, bookings, clients, views, ranking, income, or other performance
        does not by itself create refund eligibility.
      </p>

      <h2>9. Price and Product Changes</h2>
      <p>
        MasseurMatch may change pricing, plan features, or product availability. Any protected founding-member rate
        applies only according to the specific offer terms shown to the eligible subscriber. Changes to separate
        add-ons, taxes, fees, upgrades, or different plans are not automatically covered by a base-plan price lock.
      </p>

      <h2>10. Content and Moderation Requirements</h2>
      <p>
        Paid status does not exempt a profile from MasseurMatch&apos;s content, trust, safety, or moderation rules.
        Profiles or accounts that violate platform policies may be restricted, suspended, or removed regardless of
        subscription status.
      </p>

      <h2>11. Changes to These Terms</h2>
      <p>
        We may update these terms from time to time. Updated terms apply as permitted by law and according to any
        notice requirements that apply to an existing recurring subscription.
      </p>

      <h2>12. Contact</h2>
      <p>
        Billing questions: <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.<br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
