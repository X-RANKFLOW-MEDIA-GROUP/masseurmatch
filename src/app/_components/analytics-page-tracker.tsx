"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackEvent } from "@/lib/analytics";

function getSourcePage(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/explore")) return "explore";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/join")) return "join";
  if (pathname.startsWith("/waitlist")) return "waitlist";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/admin")) return "admin";
  return pathname.split("/").filter(Boolean)[0] ?? "unknown";
}

function getPageEventName(pathname: string) {
  if (pathname.startsWith("/explore")) return "explore_view";
  if (pathname.startsWith("/profile")) return "profile_view";
  if (pathname.includes("/city/") || pathname.startsWith("/cities/")) return "city_page_view";
  return "page_view";
}

export function AnalyticsPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryString = searchParams.toString();
    const pathWithQuery = queryString ? `${pathname}?${queryString}` : pathname;

    void trackEvent({
      eventName: getPageEventName(pathname),
      sourcePage: getSourcePage(pathname),
      metadata: {
        path: pathname,
        path_with_query: pathWithQuery,
      },
    });
  }, [pathname, searchParams]);

  return null;
}
