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
  // /city/* → /{city}
  { source: "/city/dallas",          destination: "/dallas",          permanent: true },
  { source: "/city/plano",           destination: "/plano",           permanent: true },
  { source: "/city/irving",          destination: "/irving",          permanent: true },
  { source: "/city/highland-park",   destination: "/highland-park",   permanent: true },
  { source: "/city/fort-worth",      destination: "/fort-worth",      permanent: true },
  { source: "/city/houston",         destination: "/houston",         permanent: true },
  { source: "/city/austin",          destination: "/austin",          permanent: true },
  { source: "/city/los-angeles",     destination: "/los-angeles",     permanent: true },
  { source: "/city/miami",           destination: "/miami",           permanent: true },
  { source: "/city/new-york",        destination: "/new-york",        permanent: true },
  { source: "/city/chicago",         destination: "/chicago",         permanent: true },
  { source: "/city/san-diego",       destination: "/san-diego",       permanent: true },
  { source: "/city/fort-lauderdale", destination: "/fort-lauderdale", permanent: true },
  { source: "/city/wilton-manors",   destination: "/wilton-manors",   permanent: true },
  { source: "/city/west-hollywood",  destination: "/west-hollywood",  permanent: true },
  { source: "/city/atlanta",         destination: "/atlanta",         permanent: true },
  { source: "/city/seattle",         destination: "/seattle",         permanent: true },
  { source: "/city/denver",          destination: "/denver",          permanent: true },
  { source: "/city/phoenix",         destination: "/phoenix",         permanent: true },
  // /cities/{city-state} → /{city}
  { source: "/cities/dallas-tx",          destination: "/dallas",          permanent: true },
  { source: "/cities/plano-tx",           destination: "/plano",           permanent: true },
  { source: "/cities/irving-tx",          destination: "/irving",          permanent: true },
  { source: "/cities/highland-park-tx",   destination: "/highland-park",   permanent: true },
  { source: "/cities/fort-worth-tx",      destination: "/fort-worth",      permanent: true },
  { source: "/cities/houston-tx",         destination: "/houston",         permanent: true },
  { source: "/cities/austin-tx",          destination: "/austin",          permanent: true },
  { source: "/cities/los-angeles-ca",     destination: "/los-angeles",     permanent: true },
  { source: "/cities/miami-fl",           destination: "/miami",           permanent: true },
  { source: "/cities/new-york-ny",        destination: "/new-york",        permanent: true },
  { source: "/cities/chicago-il",         destination: "/chicago",         permanent: true },
  { source: "/cities/san-diego-ca",       destination: "/san-diego",       permanent: true },
  { source: "/cities/fort-lauderdale-fl", destination: "/fort-lauderdale", permanent: true },
  { source: "/cities/atlanta-ga",         destination: "/atlanta",         permanent: true },
  { source: "/cities/seattle-wa",         destination: "/seattle",         permanent: true },
  { source: "/cities/denver-co",          destination: "/denver",          permanent: true },
  { source: "/cities/phoenix-az",         destination: "/phoenix",         permanent: true },
  // Service pages under /cities/dallas-tx/*
  { source: "/cities/dallas-tx/gay-massage",    destination: "/dallas/lgbtq-friendly",        permanent: true },
  { source: "/cities/dallas-tx/male-massage",   destination: "/dallas/male-therapists",       permanent: true },
  { source: "/cities/dallas-tx/deep-tissue",    destination: "/dallas/wellness/deep-tissue",  permanent: true },
  { source: "/cities/dallas-tx/outcall",        destination: "/dallas/wellness/outcall",      permanent: true },
  { source: "/cities/dallas-tx/incall",         destination: "/dallas/wellness/incall",       permanent: true },
  { source: "/cities/dallas-tx/swedish",        destination: "/dallas/wellness/swedish",      permanent: true },
  { source: "/cities/dallas-tx/sports-massage", destination: "/dallas/wellness/sports-recovery", permanent: true },
  { source: "/cities/dallas-tx/mobile",         destination: "/dallas/wellness/mobile-massage", permanent: true },
  { source: "/cities/dallas-tx/hotel",          destination: "/dallas/wellness/hotel-massage", permanent: true },
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
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  allowedDevOrigins: ["100.69.207.7", "localhost", "127.0.0.1", "::1", "*.replit.dev", "*.janeway.replit.dev"],
  experimental: {
    webpackBuildWorker: true,
    webpackMemoryOptimizations: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  webpack(config, { dev }) {
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: "memory",
      });
    }

    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "lucide-react$": path.resolve(process.cwd(), "node_modules/lucide-react/dist/esm/lucide-react.js"),
    };

    return config;
  },
  async redirects() {
    return LEGACY_REDIRECTS;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: CONTENT_SECURITY_POLICY,
          },
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
