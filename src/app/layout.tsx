import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Sora } from "next/font/google";
import { JsonLd } from "@/app/_components/json-ld";
import { SiteFooter } from "@/app/_components/site-footer";
import { SiteHeader } from "@/app/_components/site-header";
import { SITE_DESCRIPTION, SITE_NAME, createPageMetadata } from "@/app/_lib/metadata";
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/app/_lib/structured-data";
import { AppProviders } from "@/app/providers";
import { SITE_URL } from "@/lib/site";
import "@/index.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

const rootMetadata = createPageMetadata({
  title: "Find massage therapists near you",
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
      <body className={`${sora.variable} ${inter.variable} ${plexMono.variable} min-h-screen font-body text-foreground`}>
        <AppProviders>
          <JsonLd data={buildOrganizationJsonLd()} />
          <JsonLd data={buildWebsiteJsonLd()} />
          <SiteHeader />

          <main className="pt-16">{children}</main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
