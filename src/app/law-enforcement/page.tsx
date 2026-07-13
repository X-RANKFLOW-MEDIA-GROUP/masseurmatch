import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Law Enforcement Guidelines",
  description:
    "How law enforcement and government agencies can request records from MasseurMatch, our legal-process requirements, emergency disclosure, and data-preservation practices.",
  path: "/law-enforcement",
  keywords: ["law enforcement", "legal process", "records request", "subpoena", "emergency disclosure"],
});

export default function LawEnforcementPage() {
  return (
    <LegalPage title="Law Enforcement Guidelines" path="/law-enforcement" lastUpdated="July 12, 2026">
      <p>
        These guidelines explain how MasseurMatch responds to requests for user information from law enforcement
        and government agencies. MasseurMatch is operated by XRankFlow Media Group LLC (Dover, Delaware, USA).
        We are committed to user safety and to cooperating with valid legal process, including investigations
        into human trafficking, sexual exploitation, and other criminal activity.
      </p>

      <h2>1. How to submit a request</h2>
      <p>
        Send legal process and law-enforcement requests to{" "}
        <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a> from an official government email
        address. Please include the requesting agency, the name and contact information of the requesting
        officer, the legal authority for the request, and a reasonable deadline. We may contact you to verify
        the request before responding.
      </p>

      <h2>2. Legal process we require</h2>
      <ul>
        <li>
          <strong>Basic subscriber information</strong> (such as the name, email, and account timestamps a user
          provided) requires a valid subpoena, court order, or equivalent legal process.
        </li>
        <li>
          <strong>Non-content records</strong> (such as account or transaction logs) generally require a court
          order or equivalent.
        </li>
        <li>
          <strong>Content and other stored communications</strong> require a valid search warrant issued on a
          showing of probable cause, or other legal process required by applicable law.
        </li>
      </ul>
      <p>
        We review every request for legal sufficiency and may object to, narrow, or seek to quash requests that
        are overbroad, vague, or legally deficient. We disclose only the information the applicable legal process
        requires.
      </p>

      <h2>3. Emergency disclosure requests</h2>
      <p>
        If we receive a request based on a good-faith belief that there is an emergency involving a danger of
        death or serious physical injury to a person, we may voluntarily disclose information necessary to
        prevent that harm, consistent with applicable law. Mark emergency requests{" "}
        <strong>&ldquo;EMERGENCY DISCLOSURE REQUEST&rdquo;</strong> in the subject line and describe the nature
        of the emergency, the person at risk, and the information needed.
      </p>

      <h2>4. Data preservation</h2>
      <p>
        On receipt of a valid preservation request, we will preserve available account records for 90 days, and
        for an additional 90 days on renewal, pending service of formal legal process. Send preservation
        requests to <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a> with the relevant account
        identifiers (profile URL, email, or username).
      </p>

      <h2>5. Human trafficking and child exploitation</h2>
      <p>
        Consistent with FOSTA-SESTA (18 U.S.C. &sect;&nbsp;2421A) and our obligations under 18 U.S.C.
        &sect;&nbsp;2258A, MasseurMatch prohibits any use of the platform to facilitate prostitution or sex
        trafficking, and reports apparent child sexual abuse material to the National Center for Missing &amp;
        Exploited Children (NCMEC) CyberTipline. Trafficking tips from the public can also be directed to the
        National Human Trafficking Hotline at <strong>1-888-373-7888</strong>, and child-exploitation reports to
        the NCMEC CyberTipline at <strong>1-800-843-5678</strong> or{" "}
        <a href="https://report.cybertip.org" target="_blank" rel="noopener noreferrer">report.cybertip.org</a>.
      </p>

      <h2>6. User notice</h2>
      <p>
        Our policy is to notify users of requests for their information before disclosure, so that they may seek
        to protect their rights, unless we are legally prohibited from doing so (for example, by a valid
        non-disclosure order) or where we believe notice would create a risk of harm, endanger an investigation,
        or involve child exploitation.
      </p>

      <h2>7. Contact</h2>
      <p>
        Legal and law-enforcement requests: <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>.<br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
