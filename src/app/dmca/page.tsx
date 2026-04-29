import type { Metadata } from "next";
import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "DMCA & Intellectual Property Policy",
  description: "MasseurMatch DMCA process, designated agent, counter-notification procedure, and repeat infringer policy.",
  path: "/dmca",
});

export default function DmcaPage() {
  return (
    <LegalPage title="DMCA & Intellectual Property Policy" path="/dmca" lastUpdated="March 10, 2026">
      <h2>1. Our Commitment</h2>
      <p>
        XRankFlow Media Group LLC respects intellectual property rights and complies with the Digital Millennium
        Copyright Act (17 U.S.C. Sec. 512) (&ldquo;DMCA&rdquo;). We respond promptly to valid takedown notices and
        maintain a repeat infringer policy.
      </p>

      <h2>2. Designated DMCA Agent</h2>
      <p>DMCA takedown notices must be sent to our registered agent:</p>
      <ul>
        <li><strong>Name:</strong> DMCA Agent, MasseurMatch / XRankFlow Media Group LLC</li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:dmca@masseurmatch.com">dmca@masseurmatch.com</a>
        </li>
        <li><strong>Mailing Address:</strong> Dover, DE, United States</li>
      </ul>
      <p>
        Note: Inquiries other than DMCA notices should be directed to{" "}
        <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>. Non-DMCA requests sent to the DMCA
        agent email will not receive expedited handling.
      </p>

      <h2>3. Filing a Copyright Infringement Claim</h2>
      <p>
        If you believe content on MasseurMatch infringes your copyright, submit a written notice containing all
        of the following:
      </p>
      <ul>
        <li>Your full legal name, mailing address, telephone number, and email address</li>
        <li>
          Identification of the copyrighted work you claim has been infringed (or a representative list for
          multiple works on the same site)
        </li>
        <li>
          Identification of the allegedly infringing material and its URL or specific location on the Platform
        </li>
        <li>
          A statement that you have a good faith belief that the use is not authorized by the copyright owner,
          its agent, or the law
        </li>
        <li>
          A statement, under penalty of perjury, that the information in your notice is accurate and that you
          are the copyright owner or authorized to act on the copyright owner&apos;s behalf
        </li>
        <li>Your physical or electronic signature</li>
      </ul>
      <p>
        Notices that are materially incomplete, or that make false or bad-faith claims, may expose the notifying
        party to liability under 17 U.S.C. Sec. 512(f).
      </p>

      <h2>4. Our Response to Valid Notices</h2>
      <p>
        Upon receipt of a valid DMCA notice, we will: (1) expeditiously remove or disable access to the
        allegedly infringing content; (2) notify the user who posted the content; and (3) provide the user with
        information about filing a counter-notification.
      </p>

      <h2>5. Counter-Notification</h2>
      <p>
        If you believe your content was removed due to mistake or misidentification, you may submit a
        counter-notification containing:
      </p>
      <ul>
        <li>Your full name, address, telephone number, and email address</li>
        <li>Identification of the removed content and its former location on the Platform</li>
        <li>
          A statement, under penalty of perjury, that you have a good faith belief the material was removed due
          to mistake or misidentification
        </li>
        <li>
          A statement that you consent to the jurisdiction of the federal district court for the judicial
          district in which your address is located (or, if outside the US, the federal district court for the
          District of Delaware)
        </li>
        <li>Your physical or electronic signature</li>
      </ul>
      <p>
        If a valid counter-notification is received, we may restore the content after 10 business days unless
        the original complainant files a court action.
      </p>

      <h2>6. Repeat Infringer Policy</h2>
      <p>
        MasseurMatch maintains a policy of terminating the accounts of users who are found to be repeat
        infringers of copyright or other intellectual property rights. We track all DMCA notices and
        counter-notifications and will terminate accounts where a pattern of infringement is established.
      </p>

      <h2>7. Trademark Infringement</h2>
      <p>
        The MasseurMatch name, logo, and all related marks are trademarks or service marks of XRankFlow Media
        Group LLC. Unauthorized use is prohibited. Trademark infringement claims should be submitted to{" "}
        <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a> with the same level of specificity as
        DMCA notices.
      </p>

      <h2>8. Intellectual Property in Therapist Profiles</h2>
      <p>
        Each therapist retains ownership of their original profile content but grants MasseurMatch the license
        described in the Therapist Subscription Agreement. Therapists must not include content that infringes
        any third-party copyright, trademark, or right of publicity. MasseurMatch will remove infringing content
        upon valid notice and may terminate the account of repeat infringers.
      </p>
    </LegalPage>
  );
}
