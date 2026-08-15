const CANONICAL_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns true only for canonical UUID strings that PostgreSQL uuid columns can
 * safely compare against. Synthetic directory IDs such as `fallback-<slug>`
 * must never be sent to a uuid filter.
 */
export function isDatabaseUuid(value: string): boolean {
  return CANONICAL_UUID_RE.test(value);
}
