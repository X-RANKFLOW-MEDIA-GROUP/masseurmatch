"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { KnottyChat } from "@/components/ai/KnottyChat";

export function ChatWidget() {
  const pathname = usePathname() ?? "";
  const [ready, setReady] = useState(false);
  const isAppSurface =
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/pro") && !pathname.startsWith("/pro/join"));

  useEffect(() => {
    if (isAppSurface) return;

    const windowWithIdle = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (windowWithIdle.requestIdleCallback) {
      const id = windowWithIdle.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => windowWithIdle.cancelIdleCallback?.(id);
    }

    const timeout = window.setTimeout(() => setReady(true), 1800);
    return () => window.clearTimeout(timeout);
  }, [isAppSurface]);

  if (isAppSurface || !ready) return null;
  return <KnottyChat mode="floating" />;
}
