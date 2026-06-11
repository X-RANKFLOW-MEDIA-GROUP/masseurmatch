import { FlaskConical } from "lucide-react";

/**
 * Discreet banner shown on demo/seed profiles so visitors understand this is a
 * sample listing, not a live therapist. Rendered server-side so it appears
 * before any client-side hydration.
 */
export function DemoProfileBanner() {
  return (
    <div
      role="note"
      aria-label="Sample profile notice"
      className="flex items-center justify-center gap-2.5 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm font-medium text-amber-800"
    >
      <FlaskConical className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={2.25} />
      <span>
        <strong>Sample profile</strong> — this is a design showcase listing, not a verified therapist.{" "}
        <a href="/search" className="underline underline-offset-2 hover:text-amber-900">
          Browse real profiles
        </a>
        .
      </span>
    </div>
  );
}
