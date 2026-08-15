import "server-only";

import { revalidateTag } from "next/cache";
import { FALLBACK_PUBLIC_THERAPISTS } from "@/app/_lib/directory-fallback";

/**
 * Synthetic fallback therapists are development fixtures, never production
 * data. Production must surface a real empty/error state when the database is
 * unavailable instead of silently publishing invented provider profiles.
 *
 * directory.ts imports this module alongside directory-fallback, so clearing
 * the shared array here applies to every fallback path without changing test
 * fixtures. Tests/dev can still opt into fixture behavior outside production.
 */
if (process.env.NODE_ENV === "production") {
  FALLBACK_PUBLIC_THERAPISTS.length = 0;
}

/**
 * Cache tag for the public directory reads (getPublicTherapists — homepage,
 * city pages, search, sitemap). Kept in this dependency-light module so both
 * the reader (directory.ts) and the admin mutation routes can share it without
 * a circular import (directory.ts imports from supabase-server, which some
 * admin routes also touch).
 */
export const PUBLIC_THERAPISTS_TAG = "public-therapists";

/**
 * Invalidate the cached public directory reads. Call after any admin action
 * that changes the listable set or its ordering — approve, reject, request
 * changes, suspend, ban, unsuspend, unban, feature/unfeature — so the change
 * surfaces immediately instead of waiting out the revalidate window.
 */
export function revalidatePublicDirectory(): void {
  revalidateTag(PUBLIC_THERAPISTS_TAG);
}
