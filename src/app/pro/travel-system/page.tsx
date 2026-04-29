"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PageSection, Surface } from "@/app/_components/primitives";
import { useState } from "react";

export default function ProTravelSystemPage() {
  const { subscription } = useAuth();
  const paidTier = subscription.plan_key === "standard" || subscription.plan_key === "pro" || subscription.plan_key === "elite";
  const [embedHtml, setEmbedHtml] = useState("<div style='padding:16px;border:1px solid #ddd;border-radius:12px'>Travel system HTML preview</div>");

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <PageSection
        title="Travel system HTML"
        description="Embed your travel system module directly in your dashboard tab."
      />

      {!paidTier ? (
        <Surface>
          <p className="text-sm text-amber-700">
            This tab is available only for paid tiers (Standard, Pro, Elite). Upgrade to unlock travel HTML embeds.
          </p>
        </Surface>
      ) : (
        <>
          <Surface>
            <p className="text-sm text-muted-foreground mb-3">Paste your HTML snippet below.</p>
            <textarea
              value={embedHtml}
              onChange={(event) => setEmbedHtml(event.target.value)}
              className="min-h-44 w-full rounded-md border border-input bg-background p-3 text-sm"
            />
          </Surface>

          <Surface>
            <p className="text-sm text-muted-foreground mb-3">Preview</p>
            <div className="rounded-lg border border-border p-3" dangerouslySetInnerHTML={{ __html: embedHtml }} />
          </Surface>
        </>
      )}
    </div>
  );
}
