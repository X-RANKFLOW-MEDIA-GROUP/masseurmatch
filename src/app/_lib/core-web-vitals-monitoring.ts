// Core Web Vitals monitoring and optimization tracking
export interface CoreWebVital {
  name: "LCP" | "INP" | "CLS" | "TTFB";
  value: number;
  rating: "good" | "needsImprovement" | "poor";
  threshold: {
    good: number;
    needsImprovement: number;
  };
}

export const CWV_THRESHOLDS = {
  LCP: {
    good: 2500,
    needsImprovement: 4000,
    metric: "ms",
    description: "Largest Contentful Paint - loading performance",
  },
  INP: {
    good: 200,
    needsImprovement: 500,
    metric: "ms",
    description: "Interaction to Next Paint - responsiveness",
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
    metric: "unitless",
    description: "Cumulative Layout Shift - visual stability",
  },
  TTFB: {
    good: 600,
    needsImprovement: 1000,
    metric: "ms",
    description: "Time to First Byte - backend response time",
  },
};

export const OPTIMIZATION_RECOMMENDATIONS = {
  LCP: [
    "Preload critical resources (fonts, hero image)",
    "Optimize server response time (TTFB < 600ms)",
    "Defer non-critical CSS and JavaScript",
    "Use Next.js Image component with priority prop",
    "Enable gzip/brotli compression",
    "Minimize render-blocking resources",
    "Use CDN for static assets (Vercel Edge)",
    "Split code and lazy-load non-critical components",
  ],
  INP: [
    "Break up long JavaScript tasks (> 50ms)",
    "Use Web Workers for heavy computation",
    "Defer non-essential event listeners",
    "Optimize event handler performance",
    "Use requestIdleCallback for analytics",
    "Profile with DevTools Performance tab",
    "Reduce third-party script impact",
    "Optimize React render cycles",
  ],
  CLS: [
    "Set explicit width/height on all images",
    "Use aspect-ratio CSS property",
    "Reserve space for ads and embeds",
    "Use transform instead of top/left for animations",
    "Avoid unsized DOM insertions",
    "Use font-display: swap for fonts",
    "Prevent layout shifts from dynamic content",
    "Test on real devices and network conditions",
  ],
  TTFB: [
    "Optimize database queries",
    "Implement caching (Redis, CDN)",
    "Use edge computing for geolocation logic",
    "Optimize API response payloads",
    "Compress responses (gzip/brotli)",
    "Minimize database round-trips",
    "Use query result caching",
    "Profile server-side bottlenecks",
  ],
};

export const CWV_MONITORING_CONFIG = {
  enabled: true,
  reporting_endpoints: [
    "https://www.google-analytics.com/collect",
    process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
  ],
  sample_rate: {
    lcp: 1.0,
    inp: 0.1,
    cls: 1.0,
  },
  send_to_analytics: true,
  store_locally: true,
  local_storage_key: "cwv_metrics",
};

export const generateCWVReport = (metrics: Record<string, CoreWebVital>) => {
  const report = {
    timestamp: new Date().toISOString(),
    page_url: typeof window !== "undefined" ? window.location.href : "",
    metrics,
    overall_score: calculateOverallScore(metrics),
    recommendations: getRecommendations(metrics),
  };

  return report;
};

function calculateOverallScore(metrics: Record<string, CoreWebVital>): "good" | "needs-improvement" | "poor" {
  const ratings = Object.values(metrics).map((m) => m.rating);

  if (ratings.every((r) => r === "good")) return "good";
  if (ratings.some((r) => r === "poor")) return "poor";
  return "needs-improvement";
}

function getRecommendations(metrics: Record<string, CoreWebVital>): string[] {
  const recommendations: string[] = [];

  Object.entries(metrics).forEach(([key, metric]) => {
    if (metric.rating !== "good") {
      const metricKey = key as keyof typeof OPTIMIZATION_RECOMMENDATIONS;
      recommendations.push(
        ...OPTIMIZATION_RECOMMENDATIONS[metricKey].slice(0, 2)
      );
    }
  });

  return recommendations;
}

export const CWV_MONITORING_SCRIPT = `
// Web Vitals monitoring script
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals/dist/web-vitals.js';

function sendVitalMetric(metric) {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics', JSON.stringify(metric));
  }
}

getCLS(sendVitalMetric);
getFID(sendVitalMetric);
getFCP(sendVitalMetric);
getLCP(sendVitalMetric);
getTTFB(sendVitalMetric);
`;

export const performanceOptimizationChecklist = [
  {
    category: "Image Optimization",
    items: [
      "Use Next.js Image component for all images",
      "Provide WebP and AVIF formats",
      "Set responsive sizes and srcset",
      "Lazy load below-fold images",
      "Compress images (< 100KB for thumbnails)",
      "Use CDN for image delivery (Vercel)",
    ],
  },
  {
    category: "Font Optimization",
    items: [
      "Preload critical font (Satoshi woff2)",
      "Use font-display: swap",
      "Limit font weights to necessary ones",
      "Use unicode-range for subsetting",
      "Self-host fonts (no external requests)",
    ],
  },
  {
    category: "JavaScript",
    items: [
      "Enable code splitting and lazy loading",
      "Defer non-critical scripts",
      "Remove unused dependencies",
      "Profile bundle size with webpack-bundle-analyzer",
      "Use dynamic imports for route-based code splitting",
    ],
  },
  {
    category: "CSS",
    items: [
      "Extract critical CSS inline",
      "Defer non-critical CSS",
      "Use CSS modules or Tailwind for scoped styles",
      "Remove unused CSS",
      "Minimize CSS file size",
    ],
  },
  {
    category: "Caching",
    items: [
      "Enable HTTP caching headers",
      "Use ISR (Incremental Static Regeneration)",
      "Cache API responses with Redis",
      "Set appropriate cache control directives",
      "Use Vercel's edge caching",
    ],
  },
];
