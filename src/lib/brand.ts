// Central brand asset references.
//
// Large video files are served from Vercel Blob storage (a CDN) so they do not
// bloat the repository; raster images that need next/image optimization live in
// /public/brand.
export const BRAND_ASSETS = {
  // Local, next/image-optimized stills (the homepage no longer uses video).
  heroPoster: "/brand/hero-desktop.png", // desktop hero still
  heroMobile: "/brand/hero-mobile.png", // mobile hero still
  logo: "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1783717666/ChatGPT_Image_Jul_10_2026_04_07_35_PM_vxqgdv.png",
  // Local, transparent, next/image-optimized lockup: the metallic "MM" mark +
  // "MasseurMatch" wordmark, vertically centered, with the in-artwork
  // "RELAX · CONNECT · ENJOY" tagline dropped. It was composited from the
  // source mockup above (whose gray frame is actually transparent) so the full
  // icon is no longer clipped the way the earlier tight Cloudinary c_crop band
  // clipped its base. Ratio ≈ 1116:265 (~4.21:1). Used by the public site
  // header, the pro sidebar, and the AI Coach dashboard (all on white).
  logoLockup: "/brand/logo-lockup.png",
} as const;
