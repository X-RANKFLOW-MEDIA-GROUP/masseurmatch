/**
 * Post-authentication routing for the OAuth / email-link callback.
 *
 * Kept in its own module (no Supabase or Next.js imports) so the routing rules
 * are unit-testable without booting the route handler's dependency graph.
 */

/**
 * Canonical onboarding entry point. Middleware maps it to the current first
 * step of the signup wizard, so callers never hardcode that step.
 */
export const ONBOARDING_ENTRY = "/pro/onboard";

export const DASHBOARD = "/pro/dashboard";

/**
 * Restricts a caller-supplied `next` to a same-origin absolute path.
 * Protocol-relative values (`//evil.com`) are rejected as open redirects.
 */
export function sanitizeRedirect(next: string | null): string {
  if (!next) return DASHBOARD;
  if (!next.startsWith("/") || next.startsWith("//")) return DASHBOARD;
  return next;
}

/**
 * Chooses where an authenticated user lands.
 *
 * New accounts enter onboarding at {@link ONBOARDING_ENTRY}, the same entry
 * point the password signup form uses, so social and password signups converge.
 *
 * Returning users go where they asked — except when that is the onboarding
 * entry. The social buttons on the "Sign up" tab always attach
 * `next=/pro/onboard`, so an existing provider who signs in with Google from
 * that tab would otherwise be dropped back into the plan picker instead of
 * their dashboard.
 */
export function resolveAuthDestination(options: {
  profileCreated: boolean;
  next: string;
}): string {
  if (options.profileCreated) return ONBOARDING_ENTRY;
  if (options.next === ONBOARDING_ENTRY) return DASHBOARD;
  return options.next;
}
