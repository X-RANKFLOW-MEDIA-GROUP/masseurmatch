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
  // The source upload above is a presentation mockup — the icon + wordmark sit
  // in a small band in the middle of a large gray frame, so used raw it renders
  // tiny in the header. This c_crop transform trims to just the icon +
  // "MasseurMatch" lockup (dropping the in-artwork "RELAX · CONNECT · ENJOY"
  // tagline) so it fills the header height. Ratio ≈ 1140:185 (~6.16:1). Used by
  // the public site header (on white); the pro sidebar keeps `logo`.
  logoLockup:
    "https://res.cloudinary.com/dyfxkq2nk/image/upload/c_crop,x_180,y_345,w_1140,h_185/v1783717666/ChatGPT_Image_Jul_10_2026_04_07_35_PM_vxqgdv.png",
} as const;
