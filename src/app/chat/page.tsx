import type { Metadata } from "next";
import Link from "next/link";
import { AssistantPanel } from "@/app/_components/assistant-panel";
import { JsonLd } from "@/app/_components/json-ld";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/app/_lib/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "Knotty AI concierge closer",
  description:
    "Meet Knotty AI, the MasseurMatch concierge layer for therapist discovery, stronger matches, and faster profile clicks.",
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
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Knotty AI turns indecision into a clear next step.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Knotty works like a concierge closer for the directory. It detects intent, ranks the strongest matches first,
            and gives visitors a fast reason to open the right profile instead of browsing cold lists.
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
