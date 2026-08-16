import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Paid Subscription and Add-On Terms",
  description:
    "Terms governing paid subscriptions, add-ons, boosts, and visibility tools on MasseurMatch — billing, renewal, price locks, and important limitations.",
  path: "/subscriptions",
  keywords: ["subscription terms", "paid listing", "add-on terms", "billing policy"],
});

export default function SubscriptionsPage() {
  return (
    <LegalPage title="Paid Subscription and Add-On Terms" path="/subscriptions" lastUpdated="August 15, 2026">
      <p>
        These Paid Subscription and Add-On Terms govern paid products available through MasseurMatch, including
        provider subscription plans, profile add-ons, boosts, and featured placement tools. They supplement the{" "}
        <Link href="/terms">Terms of Service</Link> and the{" "}
        <Link href="/provider-terms">Provider Terms</Link>.
      </p>

      <h2>1. Paid Products</h2>
      <ul>
        <li><strong>Subscription plans:</strong> recurring listing plans with plan-specific profile, visibility, analytics, travel, AI, or other features shown at purchase.</li>
        <li><strong>Add-ons and boosts:</strong> optional products that may temporarily or continuously change visibility, media capacity, analytics, or other listing features.</li>
        <li><strong>Featured or sponsored placement:</strong> paid promotional positioning within eligible MasseurMatch surfaces.</li>
      </ul>
      <p>
        Current prices, included features, billing cadence, promotional terms, and trial terms are shown on the
        pricing or checkout surface before purchase and may differ by product or promotion.
      </p>

      <h2>2. Billing and Recurring Charges</h2>
      <p>
        Recurring subscriptions renew at the end of the billing period shown at checkout unless canceled before
        renewal. By subscribing, you authorize MasseurMatch and Stripe to charge the selected payment method for
        recurring amounts, applicable taxes, and purchases you authorize.
      </p>
      <p>
        Failed or reversed payments may result in loss of paid features or suspension of paid visibility until the
        billing issue is resolved.
      </p>

      <h2>3. Trials and Introductory Promotions</h2>
      <p>
        If a plan includes a free trial or introductory discount, the duration and post-promotion price are shown
        before purchase. A temporary introductory discount ends when its stated promotional period ends unless the
        offer expressly says otherwise.
      </p>
      <p>
        For example, the current founding-member promotion may provide 50% off for the first three paid months
        after any applicable trial. That introductory discount does not continue indefinitely merely because a
        separate base-rate price lock applies.
      </p>

      <h2>4. Founding-Member Price Lock</h2>
      <p>
        When MasseurMatch displays a founding-member price-lock offer for a subscription, the subscriber&apos;s base
        subscription rate that applies after any stated temporary introductory discount is intended to remain
        locked while that same eligible subscription remains continuously active and in good standing.
      </p>
      <p>
        The price lock does not extend a temporary trial or introductory discount beyond its stated duration and
        does not freeze taxes, separately purchased add-ons, usage-based products, optional upgrades, a different
        plan selected by the provider, or new products not included in the locked subscription. A canceled or
        terminated subscription may lose its locked rate if later restarted.
      </p>

      <h2>5. Add-Ons and Boosts</h2>
      <p>
        Add-ons and boosts may be one-time, recurring, duration-based, or usage-based as disclosed before purchase.
        Availability, inventory, placement, and expiration rules may vary by product. Purchasing a promotional
        feature does not convert that feature into a trust or credential signal.
      </p>

      <h2>6. No Guarantee of Results</h2>
      <p>
        Paid subscriptions, boosts, add-ons, and featured placements may increase display opportunities or unlock
        product features, but they do not guarantee views, messages, leads, clients, bookings, income, revenue, or
        any particular business result.
      </p>
      <p>
        Paid placement and trust signals are separate. An Identity Verified badge is displayed only after the
        applicable identity review is successfully completed; payment by itself does not verify identity,
        professional licensing, qualifications, background, or service quality.
      </p>

      <h2>7. Payment Processing</h2>
      <p>
        Provider billing is processed through Stripe. MasseurMatch does not store full payment card numbers.
        Payment and billing disputes are also subject to our{" "}
        <Link href="/refund-policy">Refund and Cancellation Policy</Link>.
      </p>

      <h2>8. Cancellation</h2>
      <p>
        You may cancel through available account controls or by contacting{" "}
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>. Unless otherwise stated or required
        by law, cancellation takes effect at the end of the current paid period and stops future recurring charges.
      </p>

      <h2>9. Refunds</h2>
      <p>
        Refund eligibility is governed by the{" "}
        <Link href="/refund-policy">Refund and Cancellation Policy</Link>. Lack of views, inquiries, clients,
        bookings, ranking position, or revenue does not by itself create a refund entitlement.
      </p>

      <h2>10. Price and Feature Changes</h2>
      <p>
        MasseurMatch may change prices for new purchases, new subscribers, unlocked subscriptions, add-ons, and
        future products, and may change the features offered by a plan. If an active subscription is covered by an
        express founding-member base-rate price lock, a general future price increase will not override that
        specific lock while the subscription remains eligible under Section 4.
      </p>

      <h2>11. Moderation and Platform Rules</h2>
      <p>
        Paid status never overrides moderation, safety, content, or publication rules. MasseurMatch may hide,
        restrict, suspend, or remove a listing for policy, safety, legal, billing, or technical reasons. Paid
        advertising labels such as Featured, Boosted, or Sponsored are not endorsements or professional
        credentials.
      </p>

      <h2>12. Changes to These Terms</h2>
      <p>
        These terms may be updated as products and billing practices evolve. Updates do not retroactively erase an
        express active price-lock commitment except as permitted by the terms of that specific offer or applicable
        law.
      </p>

      <h2>13. Contact</h2>
      <p>
        Billing questions: <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.<br />
        Operator: XRankFlow Media Group LLC.
      </p>

      <p>
        These terms are written to describe the current product contract in plain English and should be reviewed
        by qualified counsel as billing products and jurisdictions evolve.
      </p>
    </LegalPage>
  );
}
