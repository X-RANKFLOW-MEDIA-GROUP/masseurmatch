import { AssistantPanel } from "@/mm/components/assistant-panel";
import { SectionHeading } from "@/mm/components/primitives";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Directory Assistant",
  description: "Ask Knotty about cities, profile filters, and how the MasseurMatch directory works.",
  path: "/chat",
});

export default function ChatPage() {
  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Directory assistant"
        title="Ask Knotty about cities, filters, and profiles."
        description="Knotty is a directory assistant. It helps visitors understand city coverage, therapist filters, and direct contact paths."
      />
      <div className="mt-10 max-w-3xl">
        <AssistantPanel />
      </div>
    </section>
  );
}
