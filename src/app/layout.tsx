import type { Metadata } from "next";
import { AppMotionShell } from "@/app/_components/app-motion-shell";
import { JsonLd } from "@/app/_components/json-ld";
import { SiteFooter } from "@/app/_components/site-footer";
import SiteHeader from "@/app/_components/site-header";
import { CookieConsent } from "@/app/_components/CookieConsent";
import { SITE_DESCRIPTION, SITE_NAME, createPageMetadata } from "@/app/_lib/metadata";
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/app/_lib/structured-data";
import { AppProviders } from "@/app/providers";
import { SITE_URL } from "@/lib/site";
import "@/index.css";
import "@/styles/mobile-responsive.css";
import "@/styles/homepage-mobile-hotfix.css";

// Font stacks are defined in CSS variables to keep production builds deterministic
// even in CI environments without access to Google Fonts.

const rootMetadata = createPageMetadata({
  title: "The safest and most trusted premium male massage directory",
  description: SITE_DESCRIPTION,
  path: "/",
});

const faviconVersion = "20260508b";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  manifest: `/manifest.json?v=${faviconVersion}`,
  category: "wellness",
  icons: {
    icon: [
      { url: `/favicon.svg?v=${faviconVersion}`, type: "image/svg+xml" },
      { url: `/favicon.ico?v=${faviconVersion}`, type: "image/x-icon" },
    ],
    shortcut: `/favicon.svg?v=${faviconVersion}`,
    apple: `/favicon.svg?v=${faviconVersion}`,
  },
  ...rootMetadata,
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="theme-masseurmatch min-h-screen overflow-x-hidden font-sans text-foreground antialiased">
        <AppProviders>
          <JsonLd data={buildOrganizationJsonLd()} />
          <JsonLd data={buildWebsiteJsonLd()} />
          <div style={{ position: "relative", zIndex: 9999 }}>
            <SiteHeader />
          </div>
          <AppMotionShell>{children}</AppMotionShell>
          <SiteFooter />
          <CookieConsent />
        </AppProviders>
      </body>
    </html>
  );
}
