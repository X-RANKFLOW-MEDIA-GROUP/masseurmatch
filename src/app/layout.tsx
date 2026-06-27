import type { Metadata } from "next";
import { AppMotionShell } from "@/app/_components/app-motion-shell";
import { SiteFooter } from "@/app/_components/site-footer";
import SiteHeader from "@/app/_components/site-header";
import { CookieConsent } from "@/app/_components/CookieConsent";
import { ChatWidget } from "@/app/_components/chat-widget";
import { IntroVideoSplash } from "@/app/_components/IntroVideoSplash";
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
  title: "Premium verified male massage therapist directory",
  description: SITE_DESCRIPTION,
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
      <body className="theme-masseurmatch min-h-screen overflow-x-hidden font-sans text-foreground antialiased">
        <AppProviders>
          <SketchFilter />
          <IntroVideoSplash />
          <div style={{ position: "relative", zIndex: 9999 }}>
            <SiteHeader />
          </div>
          <AppMotionShell>
            <SmoothScroll>{children}</SmoothScroll>
          </AppMotionShell>
          <SiteFooter />
          <CookieConsent />
          <ChatWidget />
        </AppProviders>
      </body>
    </html>
  );
}
