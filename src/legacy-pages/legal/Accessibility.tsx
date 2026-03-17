import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const Accessibility = () => (
  <LegalPageLayout
    title="Accessibility Statement"
    seoTitle="Accessibility Statement — MasseurMatch"
    seoDescription="MasseurMatch's commitment to web accessibility, WCAG 2.1 compliance, and how to report accessibility issues."
    path="/accessibility"
  >
    <h2>1. Our Commitment to Accessibility</h2>
    <p>XRankFlow Media Group LLC is committed to ensuring that MasseurMatch is accessible to all users, including people with disabilities. We believe that an inclusive, barrier-free digital environment is both a legal obligation and the right approach.</p>

    <h2>2. Standard We Target</h2>
    <p>MasseurMatch aims to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as a baseline standard. This includes text alternatives, sufficient color contrast, keyboard accessibility, captions for video content, and screen reader compatibility.</p>

    <h2>3. Known Limitations</h2>
    <p>We acknowledge that some areas may not yet fully meet WCAG 2.1 AA standards. We are actively working to identify and address accessibility gaps.</p>

    <h2>4. How to Report Accessibility Issues</h2>
    <ul>
      <li>Email: <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a> (subject: Accessibility Issue)</li>
      <li>Include: description of the issue, your OS and browser or assistive technology, and the URL</li>
    </ul>
    <p>We will acknowledge your report within 5 business days and aim to resolve issues within 30 days.</p>

    <h2>5. Legal Framework</h2>
    <p>MasseurMatch seeks to comply with Title III of the Americans with Disabilities Act (ADA) and applicable state accessibility laws.</p>

    <h2>6. Third-Party Content</h2>
    <p>MasseurMatch may contain content submitted by therapists and links to third-party websites. We cannot guarantee the accessibility of third-party content.</p>

    <h2>7. Formal Accessibility Audit</h2>
    <p>We commit to conducting a formal third-party accessibility audit at least annually and publishing a summary on this page.</p>
  </LegalPageLayout>
);

export default Accessibility;
