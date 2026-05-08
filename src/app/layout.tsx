import type { Metadata } from "next";
import type { CSSProperties } from "react";

// Google Fonts import (garante fontes corretas em todas as páginas)
import Head from "next/head";
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

const rootMetadata = createPageMetadata({
  title: "The safest and most trusted premium male massage directory",
  description: SITE_DESCRIPTION,
  path: "/",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  manifest: "/manifest.json",
  category: "wellness",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  ...rootMetadata,
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      style={
        {
          "--font-sora": "Sora, Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          "--font-inter": "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          "--font-space-grotesk": "Space Grotesk, Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        } as CSSProperties
      }
    >
      <Head>
        {/* Google Fonts para DM Sans, Playfair Display, Sora, Inter, Space Grotesk */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;700&family=Sora:wght@400;600;700&family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="theme-masseurmatch min-h-screen overflow-x-hidden font-sans text-foreground antialiased">
        <AppProviders>
          <JsonLd data={buildOrganizationJsonLd()} />
          <JsonLd data={buildWebsiteJsonLd()} />
          {/* Força visibilidade/z-index do header */}
          <div style={{ position: 'relative', zIndex: 9999 }}>
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
