import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const NoticeAtCollection = () => (
  <LegalPageLayout
    title="Notice at Collection"
    seoTitle="Notice at Collection — MasseurMatch"
    seoDescription="Short-form privacy notices displayed at each data collection point on MasseurMatch, per CCPA/CPRA and TDPSA requirements."
    path="/notice-at-collection"
  >
    <p>This section provides the short-form privacy notices that must appear at each point of data collection on the MasseurMatch Platform, as required by the California Consumer Privacy Act (CCPA/CPRA) and as recommended under the Texas Data Privacy and Security Act (TDPSA).</p>

    <h2>1. What Is a Notice at Collection?</h2>
    <p>A Notice at Collection is a short, plain-language disclosure provided at or before the point where personal information is collected, explaining what categories of data are collected and the purposes for which they are used.</p>

    <h2>2. Standard Notice — Account Registration Form</h2>
    <div className="legal-snippet">
      <p className="!mb-0">"MasseurMatch collects your name, email, and phone number to create and manage your account, communicate with you, and (with your consent) send marketing updates. We do not sell your personal information. View our full Privacy Policy at [LINK]."</p>
    </div>

    <h2>3. Therapist Subscription Checkout Notice</h2>
    <div className="legal-snippet">
      <p className="!mb-0">"Your billing information is collected and processed by Stripe. MasseurMatch receives your subscription status and the last 4 digits of your payment method only. We do not store full card numbers."</p>
    </div>

    <h2>4. Contact & Support Form Notice</h2>
    <div className="legal-snippet">
      <p className="!mb-0">"Information you provide is used solely to respond to your inquiry and to maintain a record of our communication. It will not be shared with third parties or used for marketing without your consent."</p>
    </div>

    <h2>5. Email Signup Form Notice</h2>
    <div className="legal-snippet">
      <p className="!mb-0">"We collect your email address to send you marketing communications. You may unsubscribe at any time. See our Privacy Policy."</p>
    </div>

    <h2>6. Footer / Global Notice</h2>
    <p>The MasseurMatch footer includes a persistent link labeled "Privacy Policy" which constitutes the primary vehicle for full notice of data practices to all visitors.</p>

    <h2>7. California Residents — Additional Rights</h2>
    <p>California residents have the right to know what personal information is collected, to request deletion, to opt out of sale (MasseurMatch does not sell data), and to non-discrimination. To exercise these rights, email <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a>.</p>
  </LegalPageLayout>
);

export default NoticeAtCollection;
