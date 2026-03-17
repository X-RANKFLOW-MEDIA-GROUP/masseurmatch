"use client";

import { usePathname } from "next/navigation";
import { KnottyChat } from "@/components/ai/KnottyChat";

export function ChatWidget() {
  const pathname = usePathname();

  if (pathname === "/chat") {
    return null;
  }

  return <KnottyChat mode="floating" />;
}
