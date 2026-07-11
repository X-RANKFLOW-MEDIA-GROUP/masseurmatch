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
} as const;
