import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const PhotoPolicy = () => (
  <LegalPageLayout
    title="Photo & Profile Policy"
    seoTitle="Photo & Profile Policy — MasseurMatch"
    seoDescription="Photo submission guidelines, profile content standards, and moderation rules for MasseurMatch therapist listings."
    path="/photo-policy"
  >
    <h2>1. Purpose</h2>
    <p>This Photo & Profile Policy governs all visual and written content submitted to therapist listings on MasseurMatch. It supplements the Acceptable Use & Content Standards and the Therapist Subscription Agreement.</p>

    <h2>2. Photo Requirements</h2>
    <p>All photos submitted to your profile must meet the following standards:</p>
    <ul>
      <li>Professional quality: clear, well-lit, and in focus</li>
      <li>Fully clothed: all individuals in the photo must be wearing appropriate professional attire</li>
      <li>Recent: photos must have been taken within the last 12 months and accurately represent your current appearance</li>
      <li>Original: you must own the photo or have written permission from the photographer</li>
      <li>No watermarks, logos, or overlaid text from other platforms</li>
      <li>No group photos unless all individuals have given written consent</li>
    </ul>

    <h2>3. Prohibited Photo Content</h2>
    <ul>
      <li>Nudity, partial nudity, or sexually suggestive imagery — zero tolerance</li>
      <li>Underwear, swimwear, or sheer clothing</li>
      <li>Provocative or suggestive poses</li>
      <li>Photos containing minors</li>
      <li>Stock photos or photos of other people presented as you</li>
      <li>AI-generated or heavily filtered images that misrepresent your appearance</li>
      <li>Images containing illegal activity or substances</li>
    </ul>

    <h2>4. Profile Text Standards</h2>
    <p>Your profile bio, specialties, and all text fields must:</p>
    <ul>
      <li>Be truthful and accurately describe your actual services and qualifications</li>
      <li>Not contain coded language, innuendo, or euphemisms for sexual services</li>
      <li>Not make medical claims, diagnosis language, or guarantee therapeutic outcomes</li>
      <li>Not include personal contact information in free-text fields to bypass platform controls</li>
      <li>Be written in a professional, respectful tone</li>
    </ul>

    <h2>5. AI-Assisted Moderation</h2>
    <p>MasseurMatch uses automated moderation tools to screen photos and text for policy compliance. Content flagged by automated systems is reviewed by a human moderator before any action is taken. You will be notified if content is removed and given an opportunity to submit compliant alternatives.</p>

    <h2>6. Verification Badge</h2>
    <p>The "Verified" badge indicates that a therapist has completed MasseurMatch's identity verification process through Stripe Identity. It confirms that the person behind the listing matches a government-issued photo ID. It does NOT verify professional licenses, certifications, skills, or service quality.</p>

    <h2>7. Enforcement</h2>
    <ul>
      <li>First violation (minor): content removed, warning issued</li>
      <li>Second violation: temporary account suspension (7–30 days)</li>
      <li>Serious violations (sexual content, fraud, minors): immediate permanent ban</li>
    </ul>
    <p>Appeals may be submitted to <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a> within 14 days of the action.</p>
  </LegalPageLayout>
);

export default PhotoPolicy;
