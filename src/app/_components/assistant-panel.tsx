"use client";

import { KnottyChat } from "@/components/ai/KnottyChat";
import { Surface } from "@/app/_components/primitives";

const DEFAULT_PROMPTS = [
  "Find verified therapists in Dallas",
  "Show Pro tier therapists with outcall",
  "How do I update my profile completeness?",
  "Open billing portal and manage my plan",
];

export function AssistantPanel({
  title = "Knotty AI assistant",
  description = "Ask Knotty to narrow intent, recommend the strongest match, and guide the next click with clearer context.",
  prompts = DEFAULT_PROMPTS,
}: {
  title?: string;
  description?: string;
  prompts?: string[];
}) {
  return (
    <Surface className="p-0">
      <div className="border-b border-border px-6 py-6">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="p-4 sm:p-6">
        <KnottyChat mode="embedded" promptExamples={prompts} />
      </div>
    </Surface>
  );
}
