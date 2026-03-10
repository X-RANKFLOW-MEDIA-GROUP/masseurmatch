import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const LegalContact = () => (
  <LegalPageLayout
    title="Legal Contact & Requests"
    seoTitle="Legal Contact — MasseurMatch"
    seoDescription="Legal contact directory for MasseurMatch. DMCA, privacy, billing, and law enforcement contact information."
    path="/legal-contact"
  >
    <h3>Legal Contact Directory</h3>
    <p>Use the appropriate contact for your matter to ensure the fastest and most accurate response.</p>

    <table>
      <thead>
        <tr>
          <th>Matter</th>
          <th>Email</th>
          <th>Response SLA</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Legal inquiries, subpoenas, law enforcement requests, cease & desist</td>
          <td><a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a></td>
          <td>5 business days</td>
        </tr>
        <tr>
          <td>DMCA copyright takedown notices, counter-notifications</td>
          <td><a href="mailto:dmca@masseurmatch.com">dmca@masseurmatch.com</a></td>
          <td>2 business days</td>
        </tr>
        <tr>
          <td>Privacy rights requests (access, deletion, correction)</td>
          <td><a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a></td>
          <td>45 days (per TDPSA/CCPA)</td>
        </tr>
        <tr>
          <td>Billing disputes, subscription cancellations, refund requests</td>
          <td><a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a></td>
          <td>3 business days</td>
        </tr>
        <tr>
          <td>General support, content reports, account issues</td>
          <td><a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a></td>
          <td>2 business days</td>
        </tr>
      </tbody>
    </table>

    <h3>Mailing Address</h3>
    <p>XRankFlow Media Group LLC<br />Dover, DE, United States</p>

    <h3>For Law Enforcement & Legal Process</h3>
    <p>Subpoenas, court orders, and official legal process must be directed to <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a> and additionally served at the mailing address above. MasseurMatch will review all legal process for validity and scope and will respond within the timeframes required by law. We may require formal legal process for disclosure of user data; informal requests are generally not honored absent compelling safety circumstances.</p>

    <h3>Response Times</h3>
    <p>We aim to acknowledge all inquiries promptly. Complex legal matters, privacy rights requests, and formal legal process may require additional time within the legal limits. We do not guarantee a particular outcome from any contact.</p>

    <p className="text-xs !text-muted-foreground/60 mt-8">© 2026 XRankFlow Media Group LLC. All rights reserved.</p>
    <p className="text-xs !text-muted-foreground/60">MasseurMatch™ is a trademark of XRankFlow Media Group LLC, Dover, DE.</p>
  </LegalPageLayout>
);

export default LegalContact;
