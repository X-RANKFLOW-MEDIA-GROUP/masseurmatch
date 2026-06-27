"use client";

import { Sparkles } from "lucide-react";

// Floating "Ask {firstName}'s AI" launcher. Opens the site-wide Knotty chat
// (mounted in layout via ChatWidget) by dispatching the documented custom event.
export function VoxAiButton({ firstName, prompt }: { firstName: string; prompt: string }) {
  const open = () => {
    window.dispatchEvent(new CustomEvent("knotty:open", { detail: { prompt } }));
  };

  return (
    <button
      type="button"
      onClick={open}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(26,26,26,0.35)] ring-1 ring-white/10 transition-transform hover:-translate-y-0.5 lg:bottom-7 lg:right-7"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B1E2D] text-[#1A1A1A]">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
      Ask {firstName}&apos;s AI
    </button>
  );
}
