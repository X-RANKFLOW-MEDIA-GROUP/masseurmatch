export const PERFORMANCE_HINTS = {
  image_optimization: {
    formats: ["webp", "avif"],
    responsive_sizes: {
      therapist_avatar: {
        small: { width: 200, height: 200 },
        medium: { width: 400, height: 400 },
        large: { width: 600, height: 600 },
      },
      gallery: {
        small: { width: 300, height: 225 },
        medium: { width: 800, height: 600 },
        large: { width: 1200, height: 900 },
      },
    },
    lazy_loading: true,
    importance: {
      hero_images: "high",
      therapist_profiles: "high",
      city_pages: "high",
      gallery_images: "auto",
    },
  },
  font_optimization: {
    preload_woff2: true,
    font_display: "swap",
    variable_font: "Satoshi",
    unicode_ranges: {
      latin: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
      extended_latin: "U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF",
    },
  },
  core_web_vitals_targets: {
    lcp: "2.5s",
    inp: "200ms",
    cls: "0.1",
    ttfb: "600ms",
  },
  css_optimization: {
    critical_css: [
      "layout",
      "header",
      "hero",
      "navigation",
      "above-fold content",
    ],
    defer_non_critical: true,
    minify: true,
  },
  javascript_optimization: {
    defer_non_critical: true,
    code_splitting: true,
    lazy_load_components: true,
    bundle_analysis: true,
  },
  caching_strategy: {
    static_assets: "1 year",
    html_pages: "1 hour",
    api_responses: "5 minutes",
    database_queries: "10 minutes",
  },
  third_party_optimization: {
    google_analytics: "async, after-interactive",
    google_tag_manager: "async, after-interactive",
    chat_widget: "lazy-load on interaction",
    social_buttons: "lazy-load below fold",
  },
};

export const LCP_OPTIMIZATION_CHECKLIST = [
  "Preload critical resources (fonts, hero image)",
  "Defer non-critical CSS and JavaScript",
  "Use Next.js Image component with priority prop",
  "Optimize server response time (TTFB < 600ms)",
  "Minimize render-blocking resources",
  "Enable compression (gzip/brotli)",
  "Use CDN for static assets (Vercel Edge)",
];

export const CLS_PREVENTION_CHECKLIST = [
  "Set explicit width/height on all images",
  "Use aspect-ratio CSS property",
  "Reserve space for ads and embeds",
  "Use transform instead of top/left for animations",
  "Avoid unsized DOM insertions",
  "Use font-display: swap for fonts",
];

export const INP_OPTIMIZATION_CHECKLIST = [
  "Break up long JavaScript tasks (> 50ms)",
  "Use Web Workers for heavy computation",
  "Defer non-essential event listeners",
  "Optimize event handler performance",
  "Use requestIdleCallback for analytics",
  "Profile with DevTools Performance tab",
];
