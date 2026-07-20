import { Suspense } from "react";
import type { Metadata } from "next";
import { ComingSoonPage } from "./_components/coming-soon-page";
import HomePage from "./home-3d/page";

// Control homepage mode via environment variable
// NEXT_PUBLIC_SHOW_COMING_SOON=true to show coming soon page (default: false for production)
const SHOW_COMING_SOON = process.env.NEXT_PUBLIC_SHOW_COMING_SOON === "true";

export const metadata: Metadata = SHOW_COMING_SOON
  ? {
      title: "MasseurMatch — Launching Soon",
      description: "The most trustworthy directory of LGBTQ+-affirming male massage therapists in the US. Launching soon.",
      robots: { index: false, follow: false },
    }
  : {
      title: "Premium LGBTQ+-Affirming Male Massage Therapists Directory | MasseurMatch",
      description: "Find verified, LGBTQ+-affirming male massage therapists near you. Premium profiles, instant booking, and trusted reviews.",
    };

function RootPageContent() {
  if (SHOW_COMING_SOON) {
    return <ComingSoonPage />;
  }

  return <HomePage />;
}

export default function RootPage() {
  return (
    <Suspense fallback={null}>
      <RootPageContent />
    </Suspense>
  );
}
