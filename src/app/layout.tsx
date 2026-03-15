import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google";
import "../index.css";
import { SiteFooter } from "@/mm/components/site-footer";
import { SiteHeader } from "@/mm/components/site-header";
import { KnottyChatWidget } from "@/mm/components/chat-widget";
import { buildMetadata } from "@/mm/lib/metadata";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = buildMetadata({
  title: "Massage therapist directory",
  description:
    "Find therapist profiles, city landing pages, and direct contact details across Dallas, Houston, and Austin.",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <KnottyChatWidget />
      </body>
    </html>
  );
}
