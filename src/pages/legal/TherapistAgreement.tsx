import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const TherapistAgreement = () => (
  <LegalPageLayout
    title="Therapist Subscription & Listing Agreement"
    seoTitle="Therapist Subscription Agreement — MasseurMatch"
    seoDescription="Binding agreement between therapists and MasseurMatch for paid directory listings, billing, content obligations, and cancellation terms."
    path="/therapist-agreement"
  >
    <p>This Therapist Subscription & Listing Agreement ("Agreement") is a binding contract between XRankFlow Media Group LLC ("Company") and the individual or entity ("Therapist," "you," "your") who subscribes to a paid listing on MasseurMatch. This Agreement supplements and is incorporated into the general Terms of Use.</p>

    <h2>1. Nature of the Relationship</h2>
    <div className="legal-callout">
      <p className="!text-foreground/80 !mb-0">MasseurMatch sells directory listing visibility only. This Agreement does not create an employment relationship, agency, joint venture, or partnership of any kind. You are an independent provider. MasseurMatch is not a party to any service you render. You bear full responsibility for the legality, quality, and safety of your services.</p>
    </div>

    <h2>2. Eligibility to List</h2>
    <p>By subscribing, you represent and warrant that:</p>
    <ul>
      <li>You are at least 18 years of age</li>
      <li>You possess all professional licenses, certifications, and permits required by your state, county, or municipality to practice massage therapy or your stated modality</li>
      <li>Your license is currently valid, active, and in good standing</li>
      <li>All information you provide in your profile is accurate, current, and not misleading</li>
      <li>You will immediately update your profile and notify us at <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a> if your license expires, is suspended, or is revoked</li>
      <li>You comply with all applicable federal, state, and local laws governing your practice</li>
    </ul>

    <h2>3. Profile Content — Your Obligations</h2>
    <p>You are solely responsible for all content you submit to your listing, including photos, text, descriptions, specialty claims, location, contact information, and pricing. You agree that your profile content:</p>
    <ul>
      <li>Is truthful, accurate, and not misleading in any respect</li>
      <li>Does not contain claims of credentials, licenses, or certifications you do not hold</li>
      <li>Does not contain medical claims, diagnosis language, disease treatment claims, or therapeutic outcome guarantees</li>
      <li>Does not contain solicitation of, or coded references to, sexual services of any kind</li>
      <li>Does not infringe any copyright, trademark, right of publicity, or privacy right of any third party</li>
      <li>Does not contain content involving or targeting minors</li>
      <li>Does not contain hate speech, discriminatory content, violent imagery, or illegal content</li>
      <li>Does not misrepresent your location, availability, or identity</li>
    </ul>

    <h2>4. License Grant to MasseurMatch</h2>
    <p>By submitting profile content, you grant XRankFlow Media Group LLC a non-exclusive, royalty-free, sublicensable, worldwide license to host, display, resize, crop, reformat, distribute, and moderate your content on the Platform and in marketing materials promoting the Platform for as long as your subscription is active, and for a reasonable wind-down period of up to 90 days after termination. You retain ownership of your content subject to this license.</p>

    <h2>5. Subscription Plans & Pricing</h2>
    <p>MasseurMatch offers tiered subscription plans. Current plans, pricing, and included features are displayed on the Platform's pricing page. All prices are in US Dollars (USD). We reserve the right to modify plan pricing or features with 30 days' written notice to active subscribers.</p>

    <h2>6. Billing & Automatic Renewal</h2>
    <div className="legal-callout">
      <p className="!text-foreground/80 !mb-0">YOUR SUBSCRIPTION RENEWS AUTOMATICALLY. By subscribing, you authorize MasseurMatch and our payment processor to charge your payment method on a recurring basis at the rate and frequency you selected (monthly or annually) until you cancel. You will be charged on or around the same calendar date each renewal period.</p>
    </div>
    <p>You will receive a renewal reminder at least 7 days before each annual renewal charge. Monthly subscribers will receive a billing statement each month. You are responsible for keeping your payment information current. Failed payments may result in immediate suspension of your listing.</p>

    <h2>7. Payment Processing</h2>
    <p>Payments are processed by Stripe, Inc. By subscribing, you also agree to Stripe's Terms of Service. MasseurMatch does not store your full credit card number or bank account details on its servers. Payment tokens are managed by Stripe in accordance with PCI DSS standards.</p>

    <h2>8. Trial Periods</h2>
    <p>If MasseurMatch offers a free or discounted trial period, you will not be charged during the trial. At the end of the trial, your subscription will automatically convert to a paid plan unless you cancel before the trial end date. Trial eligibility is limited to one trial per person or business entity.</p>

    <h2>9. Cancellation by Therapist</h2>
    <p>You may cancel your subscription at any time by:</p>
    <ul>
      <li>Logging into your account and navigating to Account Settings › Subscription › Cancel</li>
      <li>Emailing <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a> with your account email and cancellation request</li>
    </ul>
    <p>Cancellation takes effect at the end of the current billing period. Your listing will remain active and visible until the end of the paid period. We do not provide prorated refunds for unused portions of a billing period, except as required by applicable law.</p>

    <h2>10. Refunds</h2>
    <p>Subscription fees are generally non-refundable. Exceptions:</p>
    <ul>
      <li>If your listing was suspended by MasseurMatch in error, you may be eligible for a prorated credit</li>
      <li>Refunds may be issued at our sole discretion in cases of documented billing errors</li>
      <li>Residents of jurisdictions with mandatory cooling-off periods may be entitled to a refund within the applicable statutory period</li>
    </ul>
    <p>To request a refund, contact <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a> within 14 days of the charge in question.</p>

    <h2>11. Chargebacks</h2>
    <p>Filing a chargeback or payment dispute with your bank without first contacting us constitutes a breach of this Agreement and may result in immediate permanent termination of your account. We reserve the right to dispute chargebacks we believe are filed in bad faith and to pursue recovery of associated costs.</p>

    <h2>12. Taxes</h2>
    <p>You are solely responsible for all taxes applicable to your subscription fees and to any income you earn from your independent practice. MasseurMatch may issue applicable tax forms as required by law (e.g., IRS Form 1099-K). We recommend consulting a qualified tax professional.</p>

    <h2>13. Suspension & Termination by MasseurMatch</h2>
    <p>We reserve the right to suspend or permanently terminate your listing at any time for:</p>
    <ul>
      <li>Violation of this Agreement, the Terms of Use, the Photo & Profile Policy, or the Acceptable Use Policy</li>
      <li>Submission of false, misleading, or illegal profile content</li>
      <li>Receipt of credible reports of sexual solicitation, harassment, or illegal activity</li>
      <li>Failure to maintain a valid professional license where required</li>
      <li>Initiation of chargebacks without prior contact</li>
      <li>Any conduct that poses reputational, legal, or operational risk to MasseurMatch</li>
    </ul>
    <p>Upon termination for cause, no refund will be issued for the current billing period. Upon termination without cause, a prorated refund for the unused portion of a prepaid annual plan may be issued at our discretion.</p>

    <h2>14. Indemnification by Therapist</h2>
    <p>You agree to indemnify, defend, and hold harmless MasseurMatch, its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising out of: (a) your profile content; (b) your independent services; (c) your violation of this Agreement; (d) your violation of any applicable law; or (e) any claim by a client or third party arising from your practice.</p>

    <h2>15. Representations Regarding Zero-Tolerance Policy</h2>
    <div className="legal-callout">
      <p className="!text-foreground/80 !mb-0">MasseurMatch maintains a strict zero-tolerance policy against any solicitation, facilitation, or implied offer of sexual services. Any listing containing language, imagery, or coded references to sexual activity will be removed immediately and the account permanently terminated. Where legally required, we will cooperate with law enforcement.</p>
    </div>

    <h2>16. Entire Agreement</h2>
    <p>This Agreement, together with the Terms of Use, Privacy Policy, and all applicable policies listed herein, constitutes the entire agreement between you and MasseurMatch with respect to your subscription and listing.</p>
  </LegalPageLayout>
);

export default TherapistAgreement;
