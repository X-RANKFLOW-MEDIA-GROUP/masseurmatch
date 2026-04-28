import type { Metadata } from "next";

import { LegalPage } from "@/app/_components/legal-page";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy",
  description:
    "How MasseurMatch uses cookies and similar technologies, what categories are active, and how to manage your preferences.",
  path: "/cookie-policy",
  keywords: ["cookie policy", "cookies", "tracking", "consent", "privacy"],
});

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" path="/cookie-policy">
      <p>
        Cookies are small text files placed on your device by websites you visit. MasseurMatch uses cookies and
        similar technologies (web beacons, pixels, local storage) to operate the Platform, remember your
        preferences, and analyze usage. This Cookie Policy explains what we use and how you can manage your
        preferences.
      </p>

      <h2>1. Categories of Cookies We Use</h2>

      <h3>Category A — Strictly Necessary (Always Active)</h3>
      <p>
        These cookies are essential to the Platform&apos;s basic functions and cannot be disabled. They do not
        require consent.
      </p>
      <ul>
        <li>Session management: maintain your logged-in state</li>
        <li>CSRF protection: prevent cross-site request forgery</li>
        <li>Load balancing: route requests to the correct server</li>
        <li>Cookie consent preferences: store your cookie choices</li>
      </ul>

      <h3>Category B — Performance &amp; Analytics (Consent Required)</h3>
      <p>
        These cookies collect anonymous, aggregated information about how visitors use the Site to help us improve
        performance.
      </p>
      <ul>
        <li>Google Analytics: page views, session duration, traffic sources</li>
        <li>Error monitoring: application crash and error tracking</li>
        <li>Heatmaps: aggregated click and scroll patterns</li>
      </ul>

      <h3>Category C — Functional (Consent Required)</h3>
      <p>These cookies remember your preferences for a more personalized experience.</p>
      <ul>
        <li>Language/region preferences</li>
        <li>&ldquo;Stay logged in&rdquo; functionality</li>
        <li>UI personalization settings</li>
      </ul>

      <h3>Category D — Marketing &amp; Advertising (Consent Required)</h3>
      <p>
        These cookies track browsing behavior to enable targeted advertising and measure campaign performance. They
        are only active if you have given explicit consent.
      </p>
      <ul>
        <li>Meta Pixel (Facebook Ads)</li>
        <li>Google Ads Remarketing</li>
        <li>Affiliate tracking</li>
      </ul>

      <h2>2. Cookie Durations</h2>
      <ul>
        <li>Session cookies: deleted when you close your browser</li>
        <li>Persistent cookies: retained up to 12 months unless cleared</li>
        <li>Third-party cookies: duration governed by the respective third party</li>
      </ul>

      <h2>3. Consent Manager</h2>
      <p>
        When you first visit MasseurMatch, a cookie consent banner is displayed. You may accept all cookies,
        reject non-essential cookies, or customize your preferences by category. Your preferences are saved via a
        strictly necessary consent cookie and can be updated at any time via the &ldquo;Cookie Settings&rdquo;
        link in the footer.
      </p>
      <p>
        Essential cookies cannot be declined as they are required for the Platform to function. Declining
        analytics, functional, or advertising cookies will limit certain features and personalization.
      </p>

      <h2>4. Managing Cookies via Browser</h2>
      <p>
        Most browsers allow you to refuse new cookies, delete existing cookies, and receive alerts when cookies
        are set. Disabling cookies may impair Platform functionality. Browser-specific instructions are available
        from your browser&apos;s help documentation.
      </p>

      <h2>5. Do Not Track</h2>
      <p>
        MasseurMatch currently does not respond to browser Do Not Track signals. We use the consent manager
        described in Section 3 as our primary mechanism for tracking preference management.
      </p>

      <h2>6. Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy as our use of tracking technologies evolves. Material changes will be
        notified via the consent banner or by email to registered users.
      </p>
    </LegalPage>
  );
}
