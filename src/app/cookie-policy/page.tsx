import type { Metadata } from "next";
import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy",
  description: "How MasseurMatch uses cookies and similar tracking technologies.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" path="/cookie-policy" lastUpdated="March 10, 2026">
      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device by websites you visit. MasseurMatch uses cookies and
        similar technologies (web beacons, pixels, local storage) to operate the Platform, remember your
        preferences, and analyze usage. This Cookie Policy explains what we use and how you can manage your
        preferences.
      </p>

      <h2>2. Categories of Cookies We Use</h2>

      <h3>Category A – Strictly Necessary (Always Active)</h3>
      <p>These cookies are essential to the Platform&apos;s basic functions and cannot be disabled. They do not require consent.</p>
      <ul>
        <li><strong>Session management:</strong> maintain your logged-in state</li>
        <li><strong>CSRF protection:</strong> prevent cross-site request forgery</li>
        <li><strong>Load balancing:</strong> route requests to the correct server</li>
        <li><strong>Cookie consent preferences:</strong> store your cookie choices</li>
      </ul>

      <h3>Category B – Performance &amp; Analytics (Consent Required)</h3>
      <p>These cookies collect anonymous, aggregated information about how visitors use the Site to help us improve performance.</p>
      <ul>
        <li><strong>Google Analytics:</strong> page views, session duration, traffic sources</li>
        <li><strong>Error monitoring:</strong> application crash and error tracking</li>
        <li><strong>Heatmaps:</strong> aggregated click and scroll patterns</li>
      </ul>

      <h3>Category C – Functional (Consent Required)</h3>
      <p>These cookies remember your preferences for a more personalized experience.</p>
      <ul>
        <li>Language/region preferences</li>
        <li>&ldquo;Stay logged in&rdquo; functionality</li>
        <li>UI personalization settings</li>
      </ul>

      <h3>Category D – Marketing &amp; Advertising (Consent Required)</h3>
      <p>
        These cookies track browsing behavior to enable targeted advertising and measure campaign performance.
        They are only active if you have given explicit consent.
      </p>
      <ul>
        <li>Meta Pixel (Facebook Ads)</li>
        <li>Google Ads Remarketing</li>
        <li>Affiliate tracking</li>
      </ul>

      <h2>3. Cookie Durations</h2>
      <ul>
        <li><strong>Session cookies:</strong> deleted when you close your browser</li>
        <li><strong>Persistent cookies:</strong> retained up to 12 months unless cleared</li>
        <li><strong>Third-party cookies:</strong> duration governed by the respective third party</li>
      </ul>

      <h2>4. Consent Manager</h2>
      <p>
        When you first visit MasseurMatch, a cookie consent banner is displayed. You may accept all cookies,
        reject non-essential cookies, or customize your preferences by category. Your preferences are saved via a
        strictly necessary consent cookie and can be updated at any time via the &ldquo;Cookie Settings&rdquo; link in the
        footer.
      </p>
      <p>
        Essential cookies cannot be declined as they are required for the Platform to function. Declining
        analytics, functional, or advertising cookies will limit certain features and personalization.
      </p>

      <h2>5. Managing Cookies via Browser</h2>
      <p>
        Most browsers allow you to refuse new cookies, delete existing cookies, and receive alerts when cookies
        are set. Disabling cookies may impair Platform functionality. Browser-specific instructions are available
        from your browser&apos;s help documentation.
      </p>

      <h2>6. Do Not Track</h2>
      <p>
        MasseurMatch currently does not respond to browser Do Not Track signals. We use the consent manager
        described in Section 4 as our primary mechanism for tracking preference management.
      </p>

      <h2>7. Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy as our use of tracking technologies evolves. Material changes will be
        notified via the consent banner or by email to registered users.
      </p>
    </LegalPage>
  );
}
