// Central brand asset references.
//
// Large video files are served from Vercel Blob storage (a CDN) so they do not
// bloat the repository; raster images that need next/image optimization live in
// /public/brand.
const BLOB_BASE = "https://a9brroevex4i0bnq.public.blob.vercel-storage.com";

export const BRAND_ASSETS = {
  // Full-screen opening/intro video played once per session on first visit.
  introVideo: `${BLOB_BASE}/Mm_hero_video2.MP4`,
  // Desktop hero banner background video.
  heroVideo: `${BLOB_BASE}/Mm_hero_video.MP4`,
  // Local, next/image-optimized stills.
  heroPoster: "/brand/hero-desktop.png", // desktop poster + video fallback
  heroMobile: "/brand/hero-mobile.png", // mobile hero (no video on small screens)
  logo: "/brand/mm-logo.png",
} as const;
