"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquareText, X } from "lucide-react";
import { AssistantPanel } from "@/mm/components/assistant-panel";
import { Button } from "@/mm/components/primitives";

const hiddenPrefixes = ["/admin", "/pro", "/login", "/register", "/forgot-password"];

export function KnottyChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[min(24rem,calc(100vw-2rem))]">
          <div className="mb-3 flex justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AssistantPanel compact />
        </div>
      ) : (
        <Button type="button" onClick={() => setOpen(true)}>
          <MessageSquareText className="mr-2 h-4 w-4" />
          Ask Knotty
        </Button>
      )}
    </div>
  );
}
