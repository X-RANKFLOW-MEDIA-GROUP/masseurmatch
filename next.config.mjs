import path from "node:path";

/**
 * Redirect manifest — mirrors src/app/_lib/redirects-manifest.ts.
 * Source of truth for intent: the TypeScript file.
 * Source of truth for HTTP behaviour: these entries (tested by Playwright CI).
 * Keep both files in sync when adding new redirects.
 *
 * permanent: true → Next.js serves HTTP 308. Google honours 308 as permanent.
 * If you require strict HTTP 301, apply a header rewrite at the CDN/edge layer.
 */
const LEGACY_REDIRECTS = [
  // /city/* legacy prefix → canonical /cities/{city-state}
  { source: "/city/dallas",          destination: "/cities/dallas-tx",          permanent: true },
  { source: "/city/plano",           destination: "/cities/plano-tx",           permanent: true },
  { source: "/city/irving",          destination: "/cities/irving-tx",          permanent: true },
  { source: "/city/highland-park",   destination: "/cities/highland-park-tx",   permanent: true },
  { source: "/city/fort-worth",      destination: "/cities/fort-worth-tx",      permanent: true },
  { source: "/city/houston",         destination: "/cities/houston-tx",         permanent: true },
  { source: "/city/austin",          destination: "/cities/austin-tx",          permanent: true },
  { source: "/city/los-angeles",     destination: "/cities/los-angeles-ca",     permanent: true },
  { source: "/city/miami",           destination: "/cities/miami-fl",           permanent: true },
  { source: "/city/new-york",        destination: "/cities/new-york-ny",        permanent: true },
  { source: "/city/chicago",         destination: "/cities/chicago-il",         permanent: true },
  { source: "/city/san-diego",       destination: "/cities/san-diego-ca",       permanent: true },
  { source: "/city/fort-lauderdale", destination: "/cities/fort-lauderdale-fl", permanent: true },
  { source: "/city/wilton-manors",   destination: "/cities/wilton-manors-fl",   permanent: true },
  { source: "/city/west-hollywood",  destination: "/cities/west-hollywood-ca",  permanent: true },
  { source: "/city/atlanta",         destination: "/cities/atlanta-ga",         permanent: true },
  { source: "/city/seattle",         destination: "/cities/seattle-wa",         permanent: true },
  { source: "/city/denver",          destination: "/cities/denver-co",          permanent: true },
  { source: "/city/phoenix",         destination: "/cities/phoenix-az",         permanent: true },
  // Root city legacy aliases → canonical /cities/{city-state}
  { source: "/dallas",          destination: "/cities/dallas-tx",          permanent: true },
  { source: "/plano",           destination: "/cities/plano-tx",           permanent: true },
  { source: "/irving",          destination: "/cities/irving-tx",          permanent: true },
  { source: "/highland-park",   destination: "/cities/highland-park-tx",   permanent: true },
  { source: "/fort-worth",      destination: "/cities/fort-worth-tx",      permanent: true },
  { source: "/houston",         destination: "/cities/houston-tx",         permanent: true },
  { source: "/austin",          destination: "/cities/austin-tx",          permanent: true },
  { source: "/los-angeles",     destination: "/cities/los-angeles-ca",     permanent: true },
  { source: "/miami",           destination: "/cities/miami-fl",           permanent: true },
  { source: "/new-york",        destination: "/cities/new-york-ny",        permanent: true },
  { source: "/chicago",         destination: "/cities/chicago-il",         permanent: true },
  { source: "/san-diego",       destination: "/cities/san-diego-ca",       permanent: true },
  { source: "/fort-lauderdale", destination: "/cities/fort-lauderdale-fl", permanent: true },
  { source: "/wilton-manors",   destination: "/cities/wilton-manors-fl",   permanent: true },
  { source: "/west-hollywood",  destination: "/cities/west-hollywood-ca",  permanent: true },
  { source: "/atlanta",         destination: "/cities/atlanta-ga",         permanent: true },
  { source: "/seattle",         destination: "/cities/seattle-wa",         permanent: true },
  { source: "/denver",          destination: "/cities/denver-co",          permanent: true },
  { source: "/phoenix",         destination: "/cities/phoenix-az",         permanent: true },
  // Legacy Dallas service pages → canonical city-category pages
  { source: "/cities/dallas-tx/gay-massage",    destination: "/cities/dallas-tx/gay-massage",    permanent: true },
  { source: "/cities/dallas-tx/male-massage",   destination: "/cities/dallas-tx/male-massage",   permanent: true },
  { source: "/dallas/lgbtq-friendly",           destination: "/cities/dallas-tx/gay-massage",    permanent: true },
  { source: "/dallas/male-therapists",          destination: "/cities/dallas-tx/male-massage",   permanent: true },
  { source: "/dallas/wellness/deep-tissue",     destination: "/cities/dallas-tx/deep-tissue",    permanent: true },
  { source: "/dallas/wellness/outcall",         destination: "/cities/dallas-tx/outcall",        permanent: true },
  { source: "/dallas/wellness/incall",          destination: "/cities/dallas-tx/incall",         permanent: true },
  { source: "/dallas/wellness/swedish",         destination: "/cities/dallas-tx/swedish",        permanent: true },
  { source: "/dallas/wellness/sports-recovery", destination: "/cities/dallas-tx/sports-massage", permanent: true },
  { source: "/dallas/wellness/mobile-massage",  destination: "/cities/dallas-tx/mobile",         permanent: true },
  { source: "/dallas/wellness/hotel-massage",   destination: "/cities/dallas-tx/hotel",          permanent: true },
  // Legacy SPA routes → App Router
  { source: "/Auth",    destination: "/auth",    permanent: true },
  { source: "/Privacy", destination: "/privacy", permanent: true },
  // Legacy alias for the therapists directory
  { source: "/massage-therapists", destination: "/therapists", permanent: true },
];

const isDev = process.env.NODE_ENV !== "production";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://js.stripe.com https://vercel.live`,
  "connect-src 'self' https://*.supabase.co https://api.stripe.com https://vercel.live https://*.vercel.app https://*.vercel.sh",
  "frame-src 'self' http://localhost:* https://*.vusercontent.net https://*.lite.vusercontent.net https://generated.vusercontent.net https://*.vercel.run https://*.vercel.app https://*.vercel.sh https://vercel.live https://vercel.com https://vercel.fides-cdn.ethyca.com https://js.stripe.com https://hooks.stripe.com https://*.accounts.dev https://*.clerk.accounts.dev https://ops.askchapter.org https://*.supabase.co",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests"
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  allowedDevOrigins: ["100.69.207.7", "localhost", "127.0.0.1", "::1", "*.replit.dev", "*.janeway.replit.dev"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  webpack(config, { dev }) {
    if (config.cache && !dev) {
      config.cache = Object.freeze({ type: "memory" });
    }

    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "lucide-react$": path.resolve(process.cwd(), "node_modules/lucide-react/dist/esm/lucide-react.js"),
    };

    return config;
  },
  async redirects() {
    return LEGACY_REDIRECTS.filter((redirect) => redirect.source !== redirect.destination);
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
