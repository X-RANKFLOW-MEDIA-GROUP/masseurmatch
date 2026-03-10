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
          <td>Legal inquiries, subpoenas, law enforcement</td>
          <td><a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a></td>
          <td>5 business days</td>
        </tr>
        <tr>
          <td>DMCA takedown notices</td>
          <td><a href="mailto:dmca@masseurmatch.com">dmca@masseurmatch.com</a></td>
          <td>2 business days</td>
        </tr>
        <tr>
          <td>Privacy rights requests</td>
          <td><a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a></td>
          <td>45 days (per TDPSA/CCPA)</td>
        </tr>
        <tr>
          <td>Billing disputes, cancellations, refunds</td>
          <td><a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a></td>
          <td>3 business days</td>
        </tr>
        <tr>
          <td>General support, content reports</td>
          <td><a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a></td>
          <td>2 business days</td>
        </tr>
      </tbody>
    </table>

    <h3>Mailing Address</h3>
    <p>XRankFlow Media Group LLC<br />Dover, DE, United States</p>

    <h3>For Law Enforcement & Legal Process</h3>
    <p>Subpoenas, court orders, and official legal process must be directed to <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a> and served at the mailing address above. We review all legal process for validity and scope and respond within timeframes required by law.</p>

    <h3>Response Times</h3>
    <p>We aim to acknowledge all inquiries promptly. Complex legal matters and privacy requests may require additional time within legal limits.</p>

    <p className="text-xs !text-muted-foreground/60 mt-8">© 2026 XRankFlow Media Group LLC. All rights reserved. MasseurMatch™ is a trademark of XRankFlow Media Group LLC.</p>
  </LegalPageLayout>
);

export default LegalContact;
