import type { Metadata } from "next";
import Link from "next/link";
import { AssistantPanel } from "@/app/_components/assistant-panel";
import { JsonLd } from "@/app/_components/json-ld";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/app/_lib/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "Knotty AI directory assistant",
  description:
    "Meet Knotty AI, the MasseurMatch assistant for therapist discovery, directory guidance, and product support.",
  path: "/chat",
  keywords: ["knotty ai", "directory assistant", "massage search assistant", "ai chat"],
});

export default function ChatPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Knotty AI", path: "/chat" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "Knotty AI assistant",
          description:
            "Use Knotty AI to get faster guidance on therapist discovery, profiles, pricing, and support flows.",
          path: "/chat",
        })}
      />

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">AI support</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Knotty AI helps users move deeper into the directory.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Knotty is part of the public discovery layer. It helps visitors understand city pages, therapist listings,
            and common product questions without forcing them to leave the search journey.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/search" className="text-primary hover:underline">
              Search the directory
            </Link>
            <Link href="/blog" className="text-primary hover:underline">
              Read blog guides
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <AssistantPanel />
        </div>
      </div>
    </>
  );
}
