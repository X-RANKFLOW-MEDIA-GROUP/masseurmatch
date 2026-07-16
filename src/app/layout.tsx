import type { Metadata } from "next";
import { AppMotionShell } from "@/app/_components/app-motion-shell";
import { GoogleAnalytics } from "@/app/_components/google-analytics";
import { GoogleTagManager } from "@/app/_components/google-tag-manager";
import { SiteFooter } from "@/app/_components/site-footer";
import SiteHeader from "@/app/_components/site-header";
import { CookieConsent } from "@/app/_components/CookieConsent";
import { SITE_DESCRIPTION, SITE_NAME, createPageMetadata } from "@/app/_lib/metadata";
import { AppProviders } from "@/app/providers";
import { SITE_URL } from "@/lib/site";
import { SketchFilter } from "@/components/icons";
import "@/index.css";
import "@/styles/mobile-responsive.css";
import "@/styles/homepage-mobile-hotfix.css";
import { satoshi } from "./fonts";
import SmoothScroll from "@/components/motion/SmoothScroll";

const rootMetadata = createPageMetadata({
  title: "MasseurMatch — Coming Soon",
  description:
    "AI-powered verified therapist discovery — a premium directory of male massage therapists you can trust.",
  path: "/",
});

const faviconVersion = "20260603mm";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  manifest: `/manifest.json?v=${faviconVersion}`,
  category: "wellness",
  icons: {
    icon: [{ url: `/favicon.ico?v=${faviconVersion}`, type: "image/x-icon" }],
    shortcut: `/favicon.ico?v=${faviconVersion}`,
    apple: `/favicon.ico?v=${faviconVersion}`,
  },
  ...rootMetadata,
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={satoshi.variable}>
      <head>
        <style>{`
          /* Coming-soon page: hide header/footer and reset layout wrappers */
          :root.coming-soon header,
          :root.coming-soon footer {
            display: none !important;
          }
          :root.coming-soon [data-motion-shell],
          :root.coming-soon div[style*="position: relative"] > div:last-of-type {
            padding: 0 !important;
            margin: 0 !important;
          }
        `}</style>
      </head>
      <body className="theme-masseurmatch min-h-screen overflow-x-hidden font-sans text-foreground antialiased">
        <GoogleTagManager />
        <GoogleAnalytics />
        <AppProviders>
          <SketchFilter />
          <div style={{ position: "relative", zIndex: 9999 }}>
            <SiteHeader />
          </div>
          <AppMotionShell>
            <SmoothScroll>{children}</SmoothScroll>
          </AppMotionShell>
          <SiteFooter />
          <CookieConsent />
          {/* Knotty floating chat is mounted once inside AppProviders
              (dynamic, ssr:false, wrapped in an error boundary). */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (window.location.pathname === '/') {
                  document.documentElement.classList.add('coming-soon');
                }
              `,
            }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
