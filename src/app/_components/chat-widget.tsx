"use client";

import { usePathname } from "next/navigation";
import { KnottyChat } from "@/components/ai/KnottyChat";

// Knotty is the visitor-facing concierge. Keep it off the admin and provider
// app surfaces, where the floating launcher covers dashboard controls and a
// consumer chat makes no sense. /pro/join stays eligible because it is a
// public marketing page, not part of the provider dashboard.
export function ChatWidget() {
  const pathname = usePathname() ?? "";
  const isAppSurface =
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/pro") && !pathname.startsWith("/pro/join"));

  if (isAppSurface) return null;
  return <KnottyChat mode="floating" />;
}
