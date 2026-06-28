import path from "node:path";

/**
 * Redirect manifest — mirrors src/app/_lib/redirects-manifest.ts.
 * Source of truth for intent: the TypeScript file.
 * Source of truth for HTTP behaviour: these entries.
 * Keep both files in sync when adding new redirects.
 */
const LEGACY_REDIRECTS = [
  // /city/{slug} → /{slug}  (old single-level city format)
  { source: "/city/dallas", destination: "/dallas", permanent: true },
  { source: "/city/plano", destination: "/plano", permanent: true },
  { source: "/city/irving", destination: "/irving", permanent: true },
  { source: "/city/highland-park", destination: "/highland-park", permanent: true },
  { source: "/city/fort-worth", destination: "/fort-worth", permanent: true },
  { source: "/city/houston", destination: "/houston", permanent: true },
  { source: "/city/austin", destination: "/austin", permanent: true },
  { source: "/city/los-angeles", destination: "/los-angeles", permanent: true },
  { source: "/city/miami", destination: "/miami", permanent: true },
  { source: "/city/new-york", destination: "/new-york", permanent: true },
  { source: "/city/chicago", destination: "/chicago", permanent: true },
  { source: "/city/san-diego", destination: "/san-diego", permanent: true },
  { source: "/city/fort-lauderdale", destination: "/fort-lauderdale", permanent: true },
  { source: "/city/wilton-manors", destination: "/wilton-manors", permanent: true },
  { source: "/city/west-hollywood", destination: "/west-hollywood", permanent: true },
  { source: "/city/atlanta", destination: "/atlanta", permanent: true },
  { source: "/city/seattle", destination: "/seattle", permanent: true },
  { source: "/city/denver", destination: "/denver", permanent: true },
  { source: "/city/phoenix", destination: "/phoenix", permanent: true },
  // /cities/{city-state} → /{city}  (legacy state-qualified format → canonical short slug)
  { source: "/cities/dallas-tx", destination: "/dallas", permanent: true },
  { source: "/cities/plano-tx", destination: "/plano", permanent: true },
  { source: "/cities/irving-tx", destination: "/irving", permanent: true },
  { source: "/cities/highland-park-tx", destination: "/highland-park", permanent: true },
  { source: "/cities/fort-worth-tx", destination: "/fort-worth", permanent: true },
  { source: "/cities/houston-tx", destination: "/houston", permanent: true },
  { source: "/cities/austin-tx", destination: "/austin", permanent: true },
  { source: "/cities/los-angeles-ca", destination: "/los-angeles", permanent: true },
  { source: "/cities/miami-fl", destination: "/miami", permanent: true },
  { source: "/cities/new-york-ny", destination: "/new-york", permanent: true },
  { source: "/cities/chicago-il", destination: "/chicago", permanent: true },
  { source: "/cities/san-diego-ca", destination: "/san-diego", permanent: true },
  { source: "/cities/fort-lauderdale-fl", destination: "/fort-lauderdale", permanent: true },
  { source: "/cities/wilton-manors-fl", destination: "/wilton-manors", permanent: true },
  { source: "/cities/west-hollywood-ca", destination: "/west-hollywood", permanent: true },
  { source: "/cities/atlanta-ga", destination: "/atlanta", permanent: true },
  { source: "/cities/seattle-wa", destination: "/seattle", permanent: true },
  { source: "/cities/denver-co", destination: "/denver", permanent: true },
  { source: "/cities/phoenix-az", destination: "/phoenix", permanent: true },
  // /cities/dallas-tx/{category} → /dallas/{segment}  (legacy service pages → canonical)
  { source: "/cities/dallas-tx/gay-massage", destination: "/dallas/lgbtq-friendly", permanent: true },
  { source: "/cities/dallas-tx/male-massage", destination: "/dallas/male-therapists", permanent: true },
  { source: "/cities/dallas-tx/deep-tissue", destination: "/dallas/wellness/deep-tissue", permanent: true },
  { source: "/cities/dallas-tx/outcall", destination: "/dallas/wellness/outcall", permanent: true },
  { source: "/cities/dallas-tx/incall", destination: "/dallas/wellness/incall", permanent: true },
  { source: "/cities/dallas-tx/swedish", destination: "/dallas/wellness/swedish", permanent: true },
  { source: "/cities/dallas-tx/sports-massage", destination: "/dallas/wellness/sports-recovery", permanent: true },
  { source: "/cities/dallas-tx/mobile", destination: "/dallas/wellness/mobile-massage", permanent: true },
  { source: "/cities/dallas-tx/hotel", destination: "/dallas/wellness/hotel-massage", permanent: true },
  // Global legacy aliases
  // NOTE: Next.js redirect `source` matching is case-insensitive, so a redirect
  // whose source differs from its destination only by letter case (e.g.
  // "/Auth" -> "/auth") matches the lowercase destination too and creates an
  // infinite 308 loop. Capitalized variants are handled safely by the
  // case-sensitive (===) guards in src/middleware.ts instead.
  { source: "/massage-therapists", destination: "/therapists", permanent: true },
  // Privacy policy alias — some external links use the longer form
  { source: "/privacy-policy", destination: "/privacy", permanent: true },
  // Legacy therapist profile URL — canonical is /therapists/:slug
  { source: "/:city/therapist/:slug", destination: "/therapists/:slug", permanent: true },
  // Client-side booking pages removed — clients browse without accounts
  { source: "/client", destination: "/search", permanent: false },
  { source: "/client/:path*", destination: "/search", permanent: false },
];

const isDev = process.env.NODE_ENV !== "production";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https://a9brroevex4i0bnq.public.blob.vercel-storage.com",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://js.stripe.com https://vercel.live https://www.googletagmanager.com`,
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.cloudinary.com https://vercel.live https://*.vercel.app https://*.vercel.sh https://*.tile.openstreetmap.org https://*.bugsnag.com https://www.google-analytics.com https://www.googletagmanager.com",
  "frame-src 'self' http://localhost:* https://*.vusercontent.net https://*.lite.vusercontent.net https://generated.vusercontent.net https://*.vercel.net https://*.vercel.run https://*.vercel.app https://*.vercel.sh https://vercel.live https://vercel.com https://vercel.fides-cdn.ethyca.com https://js.stripe.com https://hooks.stripe.com https://*.accounts.dev https://*.clerk.accounts.dev https://ops.askchapter.org https://*.supabase.co https://www.google.com https://maps.google.com",
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
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
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
    return LEGACY_REDIRECTS;
  },
  async headers() {
    const securityHeaders = [
      { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
    ];

    if (!isDev) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
