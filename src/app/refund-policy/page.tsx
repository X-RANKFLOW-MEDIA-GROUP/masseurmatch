import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Refund and Cancellation Policy",
  description:
    "MasseurMatch refund and cancellation policy — how to cancel subscriptions, when refunds apply, and what happens to unused add-ons.",
  path: "/refund-policy",
  keywords: ["refund policy", "cancellation policy", "subscription refund", "billing refund"],
});

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund and Cancellation Policy" path="/refund-policy" lastUpdated="August 16, 2026">
      <p>
        This Refund and Cancellation Policy governs paid products made available through MasseurMatch, including
        provider subscription plans and, when offered, add-ons, boost credits, and featured placements. By
        purchasing a paid product, you agree to this policy.
      </p>

      <h2>1. Cancellation</h2>
      <p>
        You may cancel a recurring MasseurMatch subscription through PayPal or by contacting{" "}
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.
      </p>
      <ul>
        <li>Cancellation stops future recurring renewals once processed.</li>
        <li>Unless the checkout terms or applicable law provide otherwise, paid access continues through the end of the already-paid billing period.</li>
        <li>At the end of paid entitlement, your profile may revert to the appropriate free or lower tier.</li>
        <li>Canceling a subscription does not automatically create a refund for charges already processed.</li>
      </ul>

      <h2>2. Refunds — General Principle</h2>
      <p>
        MasseurMatch subscription fees are generally non-refundable except where required by applicable law or
        where MasseurMatch confirms a qualifying billing error. This includes cancellation before the end of a
        billing period, dissatisfaction with visibility, or a decision to stop using the service.
      </p>
      <p>
        We do not issue refunds solely because a profile did not receive an expected number of views, messages,
        leads, bookings, clients, income, revenue, or a particular ranking. Paid visibility creates promotional
        opportunities, not guaranteed outcomes.
      </p>

      <h2>3. When Refunds or Credits May Apply</h2>
      <p>Refunds or account credits may be considered in limited circumstances, including:</p>
      <ul>
        <li><strong>Billing errors:</strong> You were charged an incorrect amount or charged after a cancellation that should already have stopped renewal.</li>
        <li><strong>Duplicate charges:</strong> The same subscription period or product was charged more than once because of a confirmed technical error.</li>
        <li><strong>Material platform failure:</strong> A significant MasseurMatch outage prevented access to a paid feature for a material portion of the applicable paid period.</li>
        <li><strong>Legal requirement:</strong> A refund is required by applicable law based on your location and circumstances.</li>
        <li><strong>Removal without policy cause:</strong> MasseurMatch removes paid access without a provider policy violation and determines a refund or credit is appropriate.</li>
      </ul>
      <p>
        Any discretionary refund or credit is evaluated case by case. A refund issued in one situation does not
        create an obligation to issue the same refund in another situation.
      </p>

      <h2>4. Policy Violations</h2>
      <p>
        Accounts restricted, suspended, or terminated for violations of MasseurMatch policies may be ineligible
        for refunds to the extent permitted by law. Paid status does not exempt a provider from moderation, trust,
        safety, content, or prohibited-conduct rules.
      </p>

      <h2>5. Add-Ons, Boost Credits, and Promotional Products</h2>
      <p>
        When these products are offered, their refundability, duration, expiration, and usage terms are disclosed
        at purchase. Consumed promotional credits or completed promotional placement periods are generally not
        refundable unless required by law or affected by a confirmed MasseurMatch billing or delivery error.
      </p>

      <h2>6. Payment Processor</h2>
      <p>
        Provider subscription payments are processed through PayPal. Approved refunds are returned through the
        available PayPal refund flow to the applicable funding source where possible. The time required for a
        refund to appear is controlled by PayPal, the funding source, and the relevant financial institution and
        may vary. MasseurMatch does not control those external posting timelines.
      </p>

      <h2>7. Payment Disputes and Chargebacks</h2>
      <p>
        If you believe a charge is incorrect, contact <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>{" "}
        so we can investigate. A payment dispute or chargeback may cause the related subscription entitlement to
        be suspended while the dispute is reviewed. Fraudulent or abusive disputes may result in account action
        consistent with MasseurMatch policies.
      </p>

      <h2>8. How to Request a Refund</h2>
      <p>
        To request review of a charge, contact <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>{" "}
        and include:
      </p>
      <ul>
        <li>Your MasseurMatch account email address.</li>
        <li>The transaction date and amount.</li>
        <li>The PayPal transaction or subscription identifier, if available.</li>
        <li>The reason for your request.</li>
        <li>Supporting documentation relevant to the billing issue.</li>
      </ul>

      <h2>9. Trials and Promotional Pricing</h2>
      <p>
        Any trial, introductory discount, founding-member offer, or promotional pricing is governed by the terms
        shown at signup or checkout. A temporary promotional discount ending as disclosed does not itself create
        refund eligibility.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Changes apply as permitted by law and according to any notice
        requirements that apply to existing recurring subscriptions.
      </p>

      <h2>11. Contact</h2>
      <p>
        Billing and refund requests: <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.<br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
