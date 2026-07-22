// MasseurMatch SEO Implementation Roadmap - All 5 Initiatives

export const SEO_ROADMAP_SUMMARY = {
  goal: "Enable MasseurMatch to rank with competitors and dominate local massage therapy search results",
  timeline: "6-12 months for sustained 50-100%+ organic growth",
  investment: "Staff + tools, no paid ads required",
};

export const IMPLEMENTATION_PLAN = {
  initiative_1: {
    name: "📝 Blog SEO Content Strategy",
    status: "READY TO IMPLEMENT",
    components: [
      "blog-seo.ts (blog schema markup)",
      "content-keyword-strategy.ts (keywords + content calendar)",
    ],
    tasks: [
      {
        task: "Create 24-36 foundational blog posts (Months 1-3)",
        content_types: [
          "What is [massage type]?",
          "[Massage type] benefits & how it works",
          "LGBTQ+ affirming massage practices",
          "How to find [specialty] therapist",
          "Therapist spotlight interviews",
        ],
        frequency: "2-3 posts per week",
        tools_needed: "WordPress/Next.js blogging, Content calendar (Trello/Notion)",
        success_metric: "Ranking for 50+ low-intent keywords within 6 months",
      },
      {
        task: "Build internal linking structure",
        pattern: "Each blog → links to 1-2 service pages, service pages link back",
        example: "Blog: 'Massage for back pain' → Links to /services/therapeutic-massage",
        tracking: "UTM parameters to track blog→profile→booking flow",
        success_metric: "Authority flow to therapist profiles visible in Search Console",
      },
      {
        task: "Implement schema markup on all blog posts",
        implementation: "ArticleSchema + FAQSchema where applicable",
        files: "Already created in blog-seo.ts",
        success_metric: "Blog posts appear in rich snippets on Google",
      },
    ],
    timeline: "Months 1-6 (foundational), 7-12 (optimization)",
    team: "Content writer + SEO strategist (0.5 FTE each)",
    tools: "Ahrefs/SEMrush (keyword research), Google Search Console (monitoring)",
  },

  initiative_2: {
    name: "🏢 Google Business Profile Integration",
    status: "READY TO IMPLEMENT",
    components: [
      "gbp-integration.ts (GBP setup checklist + schema)",
    ],
    tasks: [
      {
        task: "Claim and verify MasseurMatch Google Business Profile",
        steps: [
          "Go to https://mybusiness.google.com",
          "Claim business listing",
          "Complete full business information",
          "Add business photos and video",
        ],
        timeline: "1-2 days",
      },
      {
        task: "Optimize GBP profile",
        checklist: [
          "Add complete business info (hours, phone, website, email)",
          "Add 20+ high-quality photos (therapists, studios, services)",
          "Write compelling business description",
          "Add service categories + service areas",
          "Enable booking widget (if available)",
          "Set up Q&A section",
        ],
        impact: "Improves local search visibility immediately",
        timeline: "1-2 weeks",
      },
      {
        task: "Publish regular GBP posts (1-2/week)",
        content_types: [
          "Service highlights with images",
          "Wellness tips and seasonal content",
          "Special offers and promotions",
          "Testimonial spotlights",
          "Educational quick tips",
        ],
        timeline: "Ongoing (1-2 posts/week)",
        automation: "Can be templated for consistency",
      },
      {
        task: "Manage reviews and Q&A",
        requirements: [
          "Monitor reviews daily",
          "Respond to all reviews within 24 hours",
          "Answer questions in Q&A section",
          "Feature positive reviews on website",
        ],
        timeline: "Ongoing (15-30 min daily)",
        success_metric: "Average rating maintained 4.5+ stars",
      },
    ],
    timeline: "Months 1-3 (setup), 4-12 (ongoing management)",
    team: "Local SEO specialist + community manager (part-time)",
    tools: "Google My Business, BrightLocal (citation management)",
  },

  initiative_3: {
    name: "⚡ Core Web Vitals Optimization",
    status: "READY TO MONITOR",
    components: [
      "core-web-vitals-monitoring.ts (monitoring setup + recommendations)",
      "performance-optimization.ts (existing performance config)",
    ],
    tasks: [
      {
        task: "Establish baseline Core Web Vitals",
        metrics: ["LCP (Largest Contentful Paint)", "INP (Interaction to Next Paint)", "CLS (Cumulative Layout Shift)"],
        tools: [
          "Google PageSpeed Insights",
          "Google Search Console",
          "Vercel Analytics (built-in)",
          "web-vitals npm package",
        ],
        timeline: "1 week",
      },
      {
        task: "Optimize for LCP (target < 2.5s)",
        improvements: [
          "Preload critical fonts (Satoshi woff2)",
          "Optimize hero image (compress, responsive sizes)",
          "Defer non-critical JavaScript",
          "Use Vercel Edge Network for fast TTFB",
          "Minimize render-blocking resources",
        ],
        timeline: "2-3 weeks",
        team: "Frontend engineer",
      },
      {
        task: "Optimize for CLS (target < 0.1)",
        improvements: [
          "Set explicit dimensions on all images",
          "Reserve space for dynamic content",
          "Use transform for animations (not margin/top)",
          "Test on real devices/networks",
        ],
        timeline: "1-2 weeks",
        team: "Frontend engineer",
      },
      {
        task: "Set up continuous monitoring",
        implementation: "web-vitals SDK sending metrics to analytics",
        files: "core-web-vitals-monitoring.ts",
        dashboard: "Vercel Analytics + Google Search Console",
        timeline: "1 week setup, then ongoing",
      },
    ],
    timeline: "Months 1-3 (optimization), 4-12 (monitoring)",
    team: "Frontend engineer (1-2 weeks initial), then 2-3 hours/month",
    tools: "Vercel Analytics, Google Search Console, Lighthouse",
    success_metric: "All three vitals in green (good) on PageSpeed Insights",
  },

  initiative_4: {
    name: "🔗 Internal Linking & Authority Flow",
    status: "READY TO IMPLEMENT",
    components: [
      "content-keyword-strategy.ts (linking strategy detailed)",
    ],
    tasks: [
      {
        task: "Map content hierarchy (Hub & Spoke)",
        structure: {
          hub: "/blog/massage-therapy-guide (pillar page)",
          spokes: [
            "/blog/deep-tissue-massage",
            "/blog/swedish-massage",
            "/blog/sports-massage",
            "/blog/prenatal-massage",
          ],
        },
        linking: "Hub links all spokes, spokes link to hub and service pages",
        timeline: "1-2 weeks planning + 4 weeks implementation",
      },
      {
        task: "Build topical clusters",
        example: {
          cluster: "Stress & Anxiety Relief",
          content: [
            "Blog: Massage for anxiety (links → therapeutic-massage service)",
            "Blog: How massage reduces cortisol (links → wellness services)",
            "Blog: Stress relief techniques (links → related therapist profiles)",
          ],
        },
        result: "Topical authority that lifts all cluster URLs",
      },
      {
        task: "Link blog posts to therapist profiles",
        pattern: "Match blog content to therapist specialties",
        example: 'Blog: "Sports massage for runners" → Links to therapists with sports massage specialization',
        tracking: "UTM parameters: ?utm_source=blog&utm_medium=internal&utm_campaign=sports-massage",
      },
      {
        task: "Monitor authority flow in Search Console",
        metrics: [
          "Top search queries driving traffic",
          "Pages gaining/losing impressions",
          "Click-through rate trends",
          "Position trends for target keywords",
        ],
        frequency: "Weekly review",
        adjustments: "Add/remove links based on performance data",
      },
    ],
    timeline: "Months 1-3 (structure), 4-12 (optimization)",
    team: "SEO strategist + content team (1 FTE)",
    tools: "Google Search Console, Ahrefs/SEMrush (backlink analysis)",
  },

  initiative_5: {
    name: "📊 Analytics & Conversion Tracking",
    status: "READY TO IMPLEMENT",
    components: [
      "analytics-tracking.ts (event tracking + conversion setup)",
    ],
    tasks: [
      {
        task: "Set up Google Tag Manager (GTM)",
        setup: [
          "Create GTM container for MasseurMatch",
          "Install GTM code in layout.tsx",
          "Set up Google Analytics 4 property",
          "Link Google Ads account (for remarketing)",
        ],
        timeline: "1-2 days",
        team: "Marketer + engineer",
      },
      {
        task: "Implement conversion tracking events",
        events: [
          "therapist_profile_view",
          "therapist_contact_click",
          "phone_call_initiated",
          "book_appointment_click",
          "blog_post_viewed",
          "search_performed",
        ],
        implementation: "Track via gtag() and dataLayer",
        files: "analytics-tracking.ts has trackEvent() functions ready",
        timeline: "1-2 weeks",
      },
      {
        task: "Track Core Web Vitals to Analytics",
        implementation: "Send LCP, INP, CLS metrics to GA4",
        correlation: "Analyze relationship between vitals and conversions",
        benefit: "Identify if performance improvements drive more bookings",
      },
      {
        task: "Create conversion dashboards",
        metrics: [
          "Organic traffic by source (blog, directory, local search)",
          "Blog→Profile→Booking conversion funnel",
          "Revenue per organic visitor",
          "Cost per acquisition comparison (paid vs organic)",
        ],
        tools: "Google Analytics 4, Data Studio",
        frequency: "Weekly reporting",
      },
      {
        task: "Set up remarketing campaigns",
        audience: "Users who viewed therapist profiles but didn't contact",
        channels: "Google Ads, Facebook/Instagram",
        goal: "Re-engage high-intent visitors",
      },
    ],
    timeline: "Months 1-2 (setup), 3-12 (optimization)",
    team: "Analytics specialist (0.5 FTE)",
    tools: "Google Tag Manager, Google Analytics 4, Google Ads, Data Studio",
  },
};

export const QUICK_START_CHECKLIST = [
  {
    phase: "Week 1-2: Foundation",
    items: [
      "☐ Deploy blog-seo.ts, analytics-tracking.ts, core-web-vitals-monitoring.ts",
      "☐ Set up Google Tag Manager container",
      "☐ Audit current Core Web Vitals baseline",
      "☐ Claim Google Business Profile",
    ],
  },
  {
    phase: "Week 3-4: Content & GBP",
    items: [
      "☐ Publish first 4-6 blog posts (what-is guides + benefits)",
      "☐ Optimize GBP profile (complete information + photos)",
      "☐ Set up internal linking hub-and-spoke structure",
      "☐ Implement Core Web Vitals monitoring dashboard",
    ],
  },
  {
    phase: "Month 2-3: Scale & Optimize",
    items: [
      "☐ Reach 12+ published blog posts (2-3/week cadence)",
      "☐ Publish first 2-3 GBP posts",
      "☐ Optimize LCP (should be < 2.5s by now)",
      "☐ Create topical clusters for high-volume keywords",
      "☐ Set up conversion tracking dashboard",
    ],
  },
  {
    phase: "Month 4-6: Authority Building",
    items: [
      "☐ Reach 24+ published blog posts",
      "☐ Monitor Search Console for ranking keywords",
      "☐ Build backlinks from wellness/health sites",
      "☐ Optimize top-performing content with internal links",
      "☐ Analyze blog→profile→booking conversion funnel",
    ],
  },
  {
    phase: "Month 7-12: Leadership",
    items: [
      "☐ Maintain 2-3 blog posts/week publishing",
      "☐ Update evergreen content quarterly",
      "☐ Achieve 50-100%+ organic traffic growth",
      "☐ Rank top 10 for 20+ target keywords",
      "☐ 40%+ of new therapist sign-ups from organic search",
    ],
  },
];

export const SUCCESS_METRICS = {
  organic_traffic: {
    month_3: "+20% vs baseline",
    month_6: "+40-60% vs baseline",
    month_12: "+100%+ vs baseline",
  },
  keyword_rankings: {
    target: "Page 1 (top 10) for 20+ commercial keywords",
    timeline: "6-9 months for competitive terms",
  },
  blog_traffic: {
    month_6: "5-10% of total organic traffic from blog",
    month_12: "15-25% of total organic traffic from blog",
  },
  conversion_rate: {
    blog_visitor: "2-5% of blog readers view therapist profiles",
    profile_visitor: "10-15% of profile viewers make contact",
    contact_to_booking: "40-60% of contacts book appointments",
  },
  cost_per_acquisition: {
    organic: "$5-15 per therapist sign-up",
    paid_ads: "$25-50 per therapist sign-up",
    roi: "Organic delivers 3-5x better ROI than paid ads",
  },
};

export const ESTIMATED_EFFORT = {
  total_hours_year_1: "600-800 hours",
  breakdown: {
    content_creation: "300-400 hours (blog writing + optimization)",
    technical_seo: "100-150 hours (schema, speed, monitoring)",
    link_building: "100-150 hours (citations, backlinks)",
    analytics: "50-100 hours (tracking, reporting)",
  },
  team_composition: [
    "1 SEO Strategist (1 FTE) - Leadership, strategy, analytics",
    "1 Content Writer (1 FTE) - Blog posts, optimization",
    "1 Frontend Engineer (0.5 FTE) - Performance optimization, tracking",
    "1 Community Manager (0.25 FTE) - GBP management, reviews",
  ],
};
