import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Photo & Profile Policy",
  description:
    "Rules governing photos, images, and profile text submitted by therapists to MasseurMatch, including copyright, consent, and moderation.",
  path: "/photo-policy",
  keywords: [
    "photo policy",
    "profile policy",
    "image guidelines",
    "copyright",
    "consent",
    "therapist listing",
  ],
});

export default function PhotoPolicyPage() {
  return (
    <LegalPage title="Photo & Profile Policy" path="/photo-policy">
      <h2>1. Purpose</h2>
      <p>
        This policy governs all photographs, images, videos, and profile text submitted by therapists to
        MasseurMatch. Because MasseurMatch hosts user-generated content (UGC), clear rules are essential to
        protect therapists, protect the Platform, and ensure the directory remains professional and legally
        compliant.
      </p>

      <h2>2. Photo Requirements</h2>

      <h3>2a. Permitted Photos</h3>
      <ul>
        <li>Professional headshots and studio portraits</li>
        <li>Photos of your workspace, massage table, or treatment environment</li>
        <li>
          Professional images of massage techniques (fully clothed or appropriately draped client; no
          identifiable client without written consent)
        </li>
        <li>Logo images for business accounts</li>
        <li>Images for which you own the copyright or hold a valid, written license</li>
      </ul>

      <h3>2b. Prohibited Photos</h3>
      <ul>
        <li>Photos containing nudity, partial nudity, or sexually suggestive imagery</li>
        <li>
          Images of identifiable third parties (including clients) without documented written consent from each
          individual
        </li>
        <li>Photos containing minors</li>
        <li>
          Stock images, AI-generated faces, or images representing a person other than you or your actual
          workspace
        </li>
        <li>Photos that contain misleading or deceptive visual claims</li>
        <li>Images that infringe the copyright or trademark of any third party</li>
        <li>Photos containing hate symbols, violent imagery, or illegal content</li>
      </ul>

      <h2>3. Profile Text Requirements</h2>

      <h3>3a. Required Accuracy</h3>
      <ul>
        <li>
          Your professional name (or DBA) must be accurate and match your license or registration where
          applicable
        </li>
        <li>Location must reflect your actual practice location (city and state)</li>
        <li>Modalities and specialties must reflect services you actually offer</li>
        <li>Pricing must reflect your actual rates</li>
        <li>License or certification numbers, if listed, must be accurate and current</li>
      </ul>

      <h3>3b. Prohibited Text</h3>
      <ul>
        <li>Medical claims, including diagnosis language and disease treatment or cure claims</li>
        <li>Therapeutic outcome guarantees of any kind</li>
        <li>
          Coded, euphemistic, or indirect references to sexual services (examples: &ldquo;full service,&rdquo;
          &ldquo;happy ending,&rdquo; &ldquo;FBSM,&rdquo; &ldquo;incall/outcall with extras,&rdquo;
          &ldquo;GFE,&rdquo; or similar)
        </li>
        <li>False credential claims (license numbers you do not hold, certifications you have not earned)</li>
        <li>Impersonation of another therapist or professional</li>
      </ul>

      <h2>4. Copyright &amp; Ownership</h2>
      <p>
        By submitting any photo or content, you represent and warrant that you own the content or have the legal
        right to use it and to grant MasseurMatch the license described in the{" "}
        <a href="/therapist-agreement">Therapist Subscription Agreement</a>. If any submitted content infringes
        a third party&apos;s copyright, you are solely responsible for resulting claims.
      </p>

      <h2>5. Consent for Identifiable Persons</h2>
      <p>
        If any photo in your profile includes an identifiable person other than yourself, you must obtain and
        retain documented written consent from that person authorizing you to use their image on your
        professional profile. MasseurMatch may request proof of consent and will remove images upon credible
        claim of lack of consent.
      </p>

      <h2>6. Content Moderation</h2>
      <p>
        MasseurMatch reserves the right to review, remove, or require replacement of any photo or profile text
        that violates this Policy, our Acceptable Use Policy, or applicable law. Repeated violations will result
        in account termination. Moderation decisions are made at MasseurMatch&apos;s sole discretion.
      </p>

      <h2>7. Takedown Process</h2>
      <p>
        To request removal of content you believe violates this Policy, contact{" "}
        <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a> with a description of the content,
        its URL on the Platform, and the basis for your removal request. We will review and respond within 5
        business days. For copyright-specific takedowns, see the{" "}
        <a href="/dmca">DMCA Policy</a>.
      </p>
    </LegalPage>
  );
}
