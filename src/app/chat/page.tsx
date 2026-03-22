import type { Metadata } from "next";
import { JsonLd } from "@/app/_components/json-ld";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/app/_lib/structured-data";
import { MeetKnottyHero, TrustBar, ExploreSection } from "./_components/meet-knotty-hero";

export const metadata: Metadata = createPageMetadata({
  title: "Meet Knotty — AI-powered massage discovery",
  description:
    "Meet Knotty AI, the MasseurMatch concierge layer for therapist discovery, stronger matches, and faster profile clicks.",
  path: "/chat",
  keywords: ["knotty ai", "directory assistant", "massage search assistant", "ai chat", "meet knotty"],
});

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[#060913]">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Meet Knotty", path: "/chat" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "Meet Knotty AI",
          description:
            "Use Knotty AI to get faster guidance on therapist discovery, profiles, pricing, and support flows.",
          path: "/chat",
        })}
      />

      <MeetKnottyHero />
      <TrustBar />
      <ExploreSection />
    </div>
  );
}
