import type { Metadata } from "next";
import { AppMotionShell } from "@/app/_components/app-motion-shell";
import { GoogleAnalytics } from "@/app/_components/google-analytics";
import { GoogleTagManager } from "@/app/_components/google-tag-manager";
import { AppProviders } from "@/app/providers";
import { createPageMetadata } from "@/app/_lib/metadata";
import "@/index.css";

export const metadata: Metadata = createPageMetadata({
  title: "MasseurMatch Coming Soon",
  description: "AI-powered verified therapist discovery — a premium directory of male massage therapists you can trust.",
  path: "/coming-soon",
});

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleTagManager />
      <GoogleAnalytics />
      <AppProviders>
        <AppMotionShell>
          {children}
        </AppMotionShell>
      </AppProviders>
    </>
  );
}
