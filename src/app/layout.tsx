import type { Metadata } from "next";
import { AppMotionShell } from "@/app/_components/app-motion-shell";
import { GoogleAnalytics } from "@/app/_components/google-analytics";
import { GoogleTagManager } from "@/app/_components/google-tag-manager";
import { SiteFooter } from "@/app/_components/site-footer";
import SiteHeader from "@/app/_components/site-header";
import { CookieConsent } from "@/app/_components/CookieConsent";
import { SITE_NAME, createPageMetadata } from "@/app/_lib/seo";
import { AppProviders } from "@/app/providers";
import { SITE_URL } from "@/lib/site";
import { SketchFilter } from "@/components/icons";
import "@/index.css";
import "@/styles/mobile-responsive.css";
import "@/styles/homepage-mobile-hotfix.css";
import { satoshi } from "./fonts";
import SmoothScroll from "@/components/motion/SmoothScroll";

const BRAND_ICON_URL =
  "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1785553494/ChatGPT_Image_Jul_31_2026_10_04_01_PM_1_akq6hj.png";
const SOCIAL_PREVIEW_URL =
  "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1785553494/ChatGPT_Image_Jul_31_2026_07_31_32_PM_tsdzpd.png";

const rootMetadata = createPageMetadata({
  title: "MasseurMatch — Directory of LGBTQ+-Affirming Male Massage Therapists",
  description:
    "Discover public profiles from independent LGBTQ+-affirming male massage therapists and compare provider supplied details, trust signals, and direct contact options.",
  path: "/",
  image: SOCIAL_PREVIEW_URL,
});

const faviconVersion = "20260731mm";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  manifest: `/manifest.json?v=${faviconVersion}`,
  category: "wellness",
  icons: {
    icon: [{ url: BRAND_ICON_URL, type: "image/png" }],
    shortcut: BRAND_ICON_URL,
    apple: BRAND_ICON_URL,
  },
  ...rootMetadata,
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={satoshi.variable}>
      <head></head>
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
        </AppProviders>
      </body>
    </html>
  );
}
