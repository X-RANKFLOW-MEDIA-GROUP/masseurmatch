/**
 * Central redirect manifest — single source of truth for all legacy URL redirects.
 *
 * Rules:
 * - Every entry here mirrors the corresponding rule in next.config.mjs → redirects().
 * - CI: Playwright reads this file and asserts every redirect returns 301 or 308 with the
 *   correct Location header. If a destination changes here, the CI test catches the drift.
 *
 * permanent: true → Next.js issues HTTP 308 (permanent redirect).
 *   Google treats both 301 and 308 as permanent. If your CDN/host needs strict 301, add a
 *   header rewrite at the edge layer (Vercel rewrites or Cloudflare Workers).
 */

export type LegacyRedirect = {
  /** Path the user (or bot) will hit. */
  source: string;
  /** Path they should land on. */
  destination: string;
  /** permanent: true → 308 via Next.js. */
  permanent: boolean;
};

export const legacyRedirects: LegacyRedirect[] = [
  // ── /city/* → /{city} (singular legacy prefix) ──────────────────────────────
  { source: "/city/dallas",        destination: "/dallas",        permanent: true },
  { source: "/city/plano",         destination: "/plano",         permanent: true },
  { source: "/city/irving",        destination: "/irving",        permanent: true },
  { source: "/city/highland-park", destination: "/highland-park", permanent: true },
  { source: "/city/fort-worth",    destination: "/fort-worth",    permanent: true },
  { source: "/city/houston",       destination: "/houston",       permanent: true },
  { source: "/city/austin",        destination: "/austin",        permanent: true },
  { source: "/city/los-angeles",   destination: "/los-angeles",   permanent: true },
  { source: "/city/miami",         destination: "/miami",         permanent: true },
  { source: "/city/new-york",      destination: "/new-york",      permanent: true },
  { source: "/city/chicago",       destination: "/chicago",       permanent: true },
  { source: "/city/san-diego",     destination: "/san-diego",     permanent: true },
  { source: "/city/fort-lauderdale", destination: "/fort-lauderdale", permanent: true },
  { source: "/city/wilton-manors", destination: "/wilton-manors", permanent: true },
  { source: "/city/west-hollywood", destination: "/west-hollywood", permanent: true },
  { source: "/city/atlanta",       destination: "/atlanta",       permanent: true },
  { source: "/city/seattle",       destination: "/seattle",       permanent: true },
  { source: "/city/denver",        destination: "/denver",        permanent: true },
  { source: "/city/phoenix",       destination: "/phoenix",       permanent: true },

  // ── /cities/{city-state} → /{city} (canonical-to-legacy consolidation) ──────
  { source: "/cities/dallas-tx",        destination: "/dallas",        permanent: true },
  { source: "/cities/plano-tx",         destination: "/plano",         permanent: true },
  { source: "/cities/irving-tx",        destination: "/irving",        permanent: true },
  { source: "/cities/highland-park-tx", destination: "/highland-park", permanent: true },
  { source: "/cities/fort-worth-tx",    destination: "/fort-worth",    permanent: true },
  { source: "/cities/houston-tx",       destination: "/houston",       permanent: true },
  { source: "/cities/austin-tx",        destination: "/austin",        permanent: true },
  { source: "/cities/los-angeles-ca",   destination: "/los-angeles",   permanent: true },
  { source: "/cities/miami-fl",         destination: "/miami",         permanent: true },
  { source: "/cities/new-york-ny",      destination: "/new-york",      permanent: true },
  { source: "/cities/chicago-il",       destination: "/chicago",       permanent: true },
  { source: "/cities/san-diego-ca",     destination: "/san-diego",     permanent: true },
  { source: "/cities/fort-lauderdale-fl", destination: "/fort-lauderdale", permanent: true },
  { source: "/cities/atlanta-ga",       destination: "/atlanta",       permanent: true },
  { source: "/cities/seattle-wa",       destination: "/seattle",       permanent: true },
  { source: "/cities/denver-co",        destination: "/denver",        permanent: true },
  { source: "/cities/phoenix-az",       destination: "/phoenix",       permanent: true },

  // ── Service-page legacy slugs under /cities/dallas-tx/* ──────────────────────
  { source: "/cities/dallas-tx/gay-massage",        destination: "/dallas/lgbtq-friendly",        permanent: true },
  { source: "/cities/dallas-tx/male-massage",       destination: "/dallas/male-therapists",       permanent: true },
  { source: "/cities/dallas-tx/deep-tissue",        destination: "/dallas/wellness/deep-tissue",  permanent: true },
  { source: "/cities/dallas-tx/outcall",            destination: "/dallas/wellness/outcall",      permanent: true },
  { source: "/cities/dallas-tx/incall",             destination: "/dallas/wellness/incall",       permanent: true },
  { source: "/cities/dallas-tx/swedish",            destination: "/dallas/wellness/swedish",      permanent: true },
  { source: "/cities/dallas-tx/sports-massage",     destination: "/dallas/wellness/sports-recovery", permanent: true },
  { source: "/cities/dallas-tx/mobile",             destination: "/dallas/wellness/mobile-massage", permanent: true },
  { source: "/cities/dallas-tx/hotel",              destination: "/dallas/wellness/hotel-massage", permanent: true },

  // ── Global legacy aliases ────────────────────────────────────────────────────
  { source: "/massage-therapists", destination: "/therapists", permanent: true },
];

/** Convenience lookup: source path → destination. */
export const REDIRECTS_BY_SOURCE: ReadonlyMap<string, string> = new Map(
  legacyRedirects.map(({ source, destination }) => [source, destination]),
);
