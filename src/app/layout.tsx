import type { Metadata } from "next";
import { AppMotionShell } from "@/app/_components/app-motion-shell";
import { JsonLd } from "@/app/_components/json-ld";
import { SiteFooter } from "@/app/_components/site-footer";
import SiteHeader from "@/app/_components/site-header";
import { SITE_DESCRIPTION, SITE_NAME, createPageMetadata } from "@/app/_lib/metadata";
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/app/_lib/structured-data";
import { AppProviders } from "@/app/providers";
import { SITE_URL } from "@/lib/site";
import "leaflet/dist/leaflet.css";
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="theme-masseurmatch min-h-screen overflow-x-hidden font-sans text-foreground antialiased">
        <AppProviders>
          <JsonLd data={buildOrganizationJsonLd()} />
          <JsonLd data={buildWebsiteJsonLd()} />
          <SiteHeader />
          <AppMotionShell>{children}</AppMotionShell>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
