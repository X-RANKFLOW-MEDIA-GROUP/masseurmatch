import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const Cookies = () => (
  <LegalPageLayout
    title="Cookie Policy"
    seoTitle="Cookie Policy — MasseurMatch"
    seoDescription="How MasseurMatch uses cookies and tracking technologies, your consent options, and how to manage preferences."
    path="/cookies"
  >
    <h2>1. What Are Cookies?</h2>
    <p>Cookies are small text files placed on your device by websites you visit. MasseurMatch uses cookies and similar technologies (web beacons, pixels, local storage) to operate the Platform, remember your preferences, and analyze usage.</p>

    <h2>2. Categories of Cookies We Use</h2>

    <h3>Category A — Strictly Necessary (Always Active)</h3>
    <ul>
      <li>Session management: maintain your logged-in state</li>
      <li>CSRF protection: prevent cross-site request forgery</li>
      <li>Load balancing: route requests to the correct server</li>
      <li>Cookie consent preferences: store your cookie choices</li>
    </ul>

    <h3>Category B — Performance & Analytics (Consent Required)</h3>
    <ul>
      <li>Google Analytics: page views, session duration, traffic sources</li>
      <li>Error monitoring: application crash and error tracking</li>
      <li>Heatmaps: aggregated click and scroll patterns</li>
    </ul>

    <h3>Category C — Functional (Consent Required)</h3>
    <ul>
      <li>Language/region preferences</li>
      <li>"Stay logged in" functionality</li>
      <li>UI personalization settings</li>
    </ul>

    <h3>Category D — Marketing & Advertising (Consent Required)</h3>
    <ul>
      <li>Meta Pixel (Facebook Ads)</li>
      <li>Google Ads Remarketing</li>
      <li>Affiliate tracking</li>
    </ul>

    <h2>3. Cookie Durations</h2>
    <ul>
      <li>Session cookies: deleted when you close your browser</li>
      <li>Persistent cookies: retained up to 12 months unless cleared</li>
      <li>Third-party cookies: duration governed by the respective third party</li>
    </ul>

    <h2>4. Consent Manager</h2>
    <p>When you first visit MasseurMatch, a cookie consent banner is displayed. You may accept all cookies, reject non-essential cookies, or customize your preferences by category. Essential cookies cannot be declined.</p>

    <h2>5. Managing Cookies via Browser</h2>
    <p>Most browsers allow you to refuse new cookies, delete existing cookies, and receive alerts when cookies are set. Disabling cookies may impair Platform functionality.</p>

    <h2>6. Do Not Track</h2>
    <p>MasseurMatch currently does not respond to browser Do Not Track signals. We use the consent manager described in Section 4 as our primary mechanism for tracking preference management.</p>

    <h2>7. Updates to This Policy</h2>
    <p>We may update this Cookie Policy as our use of tracking technologies evolves. Material changes will be notified via the consent banner or by email to registered users.</p>
  </LegalPageLayout>
);

export default Cookies;
