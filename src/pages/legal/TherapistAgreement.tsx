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
      <p className="!text-foreground/80 !mb-0">MasseurMatch sells directory listing visibility only. This Agreement does not create an employment relationship, agency, joint venture, or partnership of any kind. You are an independent provider. MasseurMatch is not a party to any service you render.</p>
    </div>

    <h2>2. Eligibility to List</h2>
    <p>By subscribing, you represent and warrant that:</p>
    <ul>
      <li>You are at least 18 years of age</li>
      <li>You possess all professional licenses, certifications, and permits required by your state, county, or municipality</li>
      <li>Your license is currently valid, active, and in good standing</li>
      <li>All information you provide in your profile is accurate, current, and not misleading</li>
      <li>You will immediately update your profile if your license expires, is suspended, or is revoked</li>
      <li>You comply with all applicable federal, state, and local laws governing your practice</li>
    </ul>

    <h2>3. Profile Content — Your Obligations</h2>
    <p>You are solely responsible for all content you submit to your listing. You agree that your profile content:</p>
    <ul>
      <li>Is truthful, accurate, and not misleading in any respect</li>
      <li>Does not contain claims of credentials you do not hold</li>
      <li>Does not contain medical claims, diagnosis language, or therapeutic outcome guarantees</li>
      <li>Does not contain solicitation of, or coded references to, sexual services of any kind</li>
      <li>Does not infringe any copyright, trademark, or privacy right of any third party</li>
      <li>Does not contain content involving or targeting minors</li>
      <li>Does not misrepresent your location, availability, or identity</li>
    </ul>

    <h2>4. License Grant to MasseurMatch</h2>
    <p>By submitting profile content, you grant XRankFlow Media Group LLC a non-exclusive, royalty-free, sublicensable, worldwide license to host, display, resize, crop, reformat, distribute, and moderate your content on the Platform and in marketing materials for as long as your subscription is active, and for up to 90 days after termination.</p>

    <h2>5. Subscription Plans & Pricing</h2>
    <p>MasseurMatch offers tiered subscription plans. Current plans, pricing, and included features are displayed on the Platform's pricing page. All prices are in US Dollars (USD). We reserve the right to modify plan pricing or features with 30 days' written notice to active subscribers.</p>

    <h2>6. Billing & Automatic Renewal</h2>
    <div className="legal-callout">
      <p className="!text-foreground/80 !mb-0">YOUR SUBSCRIPTION RENEWS AUTOMATICALLY. By subscribing, you authorize MasseurMatch and our payment processor to charge your payment method on a recurring basis until you cancel.</p>
    </div>

    <h2>7. Payment Processing</h2>
    <p>Payments are processed by Stripe, Inc. MasseurMatch does not store your full credit card number or bank account details on its servers. Payment tokens are managed by Stripe in accordance with PCI DSS standards.</p>

    <h2>8. Trial Periods</h2>
    <p>If MasseurMatch offers a free trial period, you will not be charged during the trial. At the end of the trial, your subscription will automatically convert to a paid plan unless you cancel before the trial end date. Trial eligibility is limited to one trial per person or business entity.</p>

    <h2>9. Cancellation by Therapist</h2>
    <ul>
      <li>Online: Account Settings → Subscription → Cancel Subscription</li>
      <li>Email: <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a></li>
    </ul>
    <p>Cancellation takes effect at the end of the current billing period. We do not provide prorated refunds for unused portions, except as required by applicable law.</p>

    <h2>10. Refunds</h2>
    <p>Subscription fees are generally non-refundable. Exceptions may apply for billing errors or mandatory statutory cooling-off periods. Contact <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a> within 14 days of the charge.</p>

    <h2>11. Chargebacks</h2>
    <p>Filing a chargeback without first contacting us constitutes a breach of this Agreement and may result in permanent termination of your account.</p>

    <h2>12. Taxes</h2>
    <p>You are solely responsible for all taxes applicable to your subscription fees and to any income you earn from your independent practice.</p>

    <h2>13. Suspension & Termination by MasseurMatch</h2>
    <p>We reserve the right to suspend or permanently terminate your listing for violation of this Agreement, submission of illegal content, sexual solicitation, failure to maintain a valid license, or any conduct posing reputational or legal risk to MasseurMatch.</p>

    <h2>14. Indemnification by Therapist</h2>
    <p>You agree to indemnify and hold harmless MasseurMatch from any claims arising from your profile content, your independent services, or your violation of this Agreement or applicable law.</p>

    <h2>15. Zero-Tolerance Policy</h2>
    <div className="legal-callout">
      <p className="!text-foreground/80 !mb-0">MasseurMatch maintains a strict zero-tolerance policy against any solicitation, facilitation, or implied offer of sexual services. Any listing containing such content will be removed immediately and the account permanently terminated.</p>
    </div>

    <h2>16. Entire Agreement</h2>
    <p>This Agreement, together with the Terms of Use, Privacy Policy, and all applicable policies, constitutes the entire agreement between you and MasseurMatch with respect to your subscription and listing.</p>
  </LegalPageLayout>
);

export default TherapistAgreement;
