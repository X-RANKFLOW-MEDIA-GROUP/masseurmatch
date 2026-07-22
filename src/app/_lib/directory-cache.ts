import "server-only";

import { revalidateTag } from "next/cache";

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
