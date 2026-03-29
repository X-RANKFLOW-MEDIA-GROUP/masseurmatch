import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const DMCA = () => (
  <LegalPageLayout
    title="DMCA & Intellectual Property Policy"
    seoTitle="DMCA Policy — MasseurMatch"
    seoDescription="DMCA takedown procedures, counter-notifications, and intellectual property policy for MasseurMatch."
    path="/dmca"
  >
    <h2>1. Our Commitment</h2>
    <p>XRankFlow Media Group LLC respects intellectual property rights and complies with the Digital Millennium Copyright Act (17 U.S.C. § 512). We respond promptly to valid takedown notices and maintain a repeat infringer policy.</p>

    <h2>2. Designated DMCA Agent</h2>
    <ul>
      <li>Name: DMCA Agent, MasseurMatch / XRankFlow Media Group LLC</li>
      <li>Email: <a href="mailto:dmca@masseurmatch.com">dmca@masseurmatch.com</a></li>
      <li>Mailing Address: Dover, DE, United States</li>
    </ul>

    <h2>3. Filing a Copyright Infringement Claim</h2>
    <p>Submit a written notice containing ALL of the following:</p>
    <ul>
      <li>Your full legal name, mailing address, telephone number, and email address</li>
      <li>Identification of the copyrighted work you claim has been infringed</li>
      <li>Identification of the allegedly infringing material and its URL</li>
      <li>A good faith belief statement that the use is not authorized</li>
      <li>A statement under penalty of perjury that the information is accurate</li>
      <li>Your physical or electronic signature</li>
    </ul>
    <div className="legal-callout">
      <p className="!text-foreground/80 !mb-0">Notices that are materially incomplete, or that make false or bad-faith claims, may expose the notifying party to liability under 17 U.S.C. § 512(f).</p>
    </div>

    <h2>4. Our Response to Valid Notices</h2>
    <p>Upon receipt of a valid DMCA notice, we will: (1) remove or disable access to the content; (2) notify the user; and (3) provide information about filing a counter-notification.</p>

    <h2>5. Counter-Notification</h2>
    <p>If you believe your content was removed due to mistake, submit a counter-notification containing:</p>
    <ul>
      <li>Your full name, address, telephone number, and email</li>
      <li>Identification of the removed content and its former location</li>
      <li>A good faith belief statement under penalty of perjury</li>
      <li>Consent to jurisdiction of the federal district court</li>
      <li>Your physical or electronic signature</li>
    </ul>

    <h2>6. Repeat Infringer Policy</h2>
    <p>MasseurMatch maintains a policy of terminating accounts of repeat infringers.</p>

    <h2>7. Trademark Infringement</h2>
    <p>The MasseurMatch name, logo, and related marks are trademarks of XRankFlow Media Group LLC. Claims should be submitted to <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>.</p>

    <h2>8. Intellectual Property in Therapist Profiles</h2>
    <p>Each therapist retains ownership of their original profile content but grants MasseurMatch the license described in the Therapist Subscription Agreement.</p>
  </LegalPageLayout>
);

export default DMCA;
