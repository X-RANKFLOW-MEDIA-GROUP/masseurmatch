import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AppMotionShell } from "@/app/_components/app-motion-shell";
import { JsonLd } from "@/app/_components/json-ld";
import { SiteFooter } from "@/app/_components/site-footer";
import { SiteHeader } from "@/app/_components/site-header";
import { SITE_DESCRIPTION, SITE_NAME, createPageMetadata } from "@/app/_lib/metadata";
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/app/_lib/structured-data";
import { AppProviders } from "@/app/providers";
import { SITE_URL } from "@/lib/site";
import "@/index.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

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
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} theme-masseurmatch noise-bg min-h-screen overflow-x-hidden font-sans text-foreground`}
      >
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
