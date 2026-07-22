// Blog admin dashboard configuration and helpers

export interface BlogAdminDashboard {
  quickStats: {
    publishedThisMonth: number;
    scheduledPosts: number;
    drafts: number;
    totalPageViews: number;
    totalEngagement: number;
  };
  recentActivity: Array<{
    action: string;
    post: string;
    timestamp: Date;
    status: "success" | "pending" | "error";
  }>;
  upcomingPublications: Array<{
    postId: string;
    title: string;
    scheduledAt: Date;
    status: string;
  }>;
  performanceMetrics: {
    topPosts: Array<{
      title: string;
      views: number;
      engagement: number;
      ctr: number;
    }>;
    topKeywords: Array<{
      keyword: string;
      impressions: number;
      clicks: number;
      position: number;
    }>;
  };
}

export const BLOG_ADMIN_FEATURES = {
  content_management: [
    "Create blog posts from templates",
    "Edit scheduled posts",
    "Preview post with schema markup",
    "Auto-generate SEO meta descriptions",
    "Schedule posts for future publishing",
    "Bulk schedule posts (upload CSV)",
    "Set internal links to therapist profiles",
    "Automatic social media post generation",
  ],
  automation_controls: [
    "Enable/disable auto-publishing",
    "Set publishing schedule (frequency, days, times)",
    "Enable/disable GBP auto-posting",
    "Enable/disable social media auto-sharing",
    "Enable/disable email subscriber notifications",
    "Enable/disable Search Console submission",
    "View cron job status and logs",
    "Manually trigger publishing job",
  ],
  analytics: [
    "View blog traffic by post",
    "Track keyword rankings from blog content",
    "Monitor blog→profile click-through rates",
    "Measure blog→booking conversion rate",
    "See most popular blog categories",
    "Compare performance across scheduling strategies",
    "Export analytics reports",
  ],
  content_calendar: [
    "12-week auto-generated content calendar",
    "Visualize posting schedule",
    "Identify content gaps",
    "Drag-and-drop reschedule posts",
    "Team collaboration notes on posts",
    "Content approval workflow",
  ],
};

export const ADMIN_API_ENDPOINTS = [
  {
    method: "POST",
    route: "/api/admin/blog/posts",
    description: "Create new blog post",
    params: ["title", "content", "keywords", "category"],
  },
  {
    method: "GET",
    route: "/api/admin/blog/posts",
    description: "List all posts (with filters)",
    params: ["status", "category", "limit", "offset"],
  },
  {
    method: "PUT",
    route: "/api/admin/blog/posts/:id",
    description: "Update blog post",
    params: ["title", "content", "keywords", "scheduledAt"],
  },
  {
    method: "DELETE",
    route: "/api/admin/blog/posts/:id",
    description: "Delete blog post",
  },
  {
    method: "POST",
    route: "/api/admin/blog/schedule/bulk",
    description: "Bulk schedule posts from CSV",
    params: ["csv_file"],
  },
  {
    method: "POST",
    route: "/api/admin/blog/automation/settings",
    description: "Update automation settings",
    params: [
      "enable_auto_publish",
      "enable_gbp_posting",
      "enable_social_posting",
      "enable_email_notifications",
      "enable_search_console",
    ],
  },
  {
    method: "GET",
    route: "/api/admin/blog/automation/status",
    description: "Get current automation status and queue",
  },
  {
    method: "POST",
    route: "/api/admin/blog/automation/trigger",
    description: "Manually trigger publishing job",
  },
  {
    method: "GET",
    route: "/api/admin/blog/analytics",
    description: "Get blog performance analytics",
    params: ["startDate", "endDate", "groupBy"],
  },
  {
    method: "POST",
    route: "/api/admin/blog/preview",
    description: "Preview post with schema markup",
    params: ["postId"],
  },
];

export interface BlogAutomationSettings {
  autoPublishing: {
    enabled: boolean;
    frequency: "1x_per_week" | "2x_per_week" | "3x_per_week" | "custom";
    daysToPublish: ("monday" | "wednesday" | "friday" | "thursday")[];
    timesToPublish: string[]; // ["9:00 AM", "2:00 PM"]
    timezone: string;
  };
  gbpPosting: {
    enabled: boolean;
    strategy: "publish_excerpt" | "publish_title_and_link";
    includeImage: boolean;
    includeLink: boolean;
  };
  socialMediaPosting: {
    enabled: boolean;
    channels: ("twitter" | "facebook" | "instagram" | "linkedin")[];
    strategy: "auto_generate_and_post" | "manual_review_before_posting";
    bestTimes: Record<string, string[]>; // {"twitter": ["9:00 AM", "2:00 PM"]}
  };
  emailNotifications: {
    enabled: boolean;
    recipientLists: string[]; // ["subscribers", "team", "vip_clients"]
    template: "full_article" | "excerpt_with_link";
    sendTime: string; // "9:00 AM EST"
  };
  searchConsoleSubmission: {
    enabled: boolean;
    autoCrawlSignal: boolean;
  };
}

// Default automation settings
export const DEFAULT_AUTOMATION_SETTINGS: BlogAutomationSettings = {
  autoPublishing: {
    enabled: true,
    frequency: "3x_per_week",
    daysToPublish: ["monday", "wednesday", "friday"],
    timesToPublish: ["9:00 AM", "2:00 PM"],
    timezone: "America/New_York",
  },
  gbpPosting: {
    enabled: true,
    strategy: "publish_excerpt",
    includeImage: true,
    includeLink: true,
  },
  socialMediaPosting: {
    enabled: true,
    channels: ["twitter", "facebook", "instagram", "linkedin"],
    strategy: "auto_generate_and_post",
    bestTimes: {
      twitter: ["9:00 AM", "2:00 PM", "6:00 PM"],
      facebook: ["12:00 PM", "3:00 PM"],
      instagram: ["10:00 AM", "7:00 PM"],
      linkedin: ["8:00 AM", "5:00 PM"],
    },
  },
  emailNotifications: {
    enabled: true,
    recipientLists: ["subscribers"],
    template: "excerpt_with_link",
    sendTime: "9:00 AM EST",
  },
  searchConsoleSubmission: {
    enabled: true,
    autoCrawlSignal: true,
  },
};

// Post creation template/wizard
export const POST_CREATION_WIZARD_STEPS = [
  {
    step: 1,
    title: "Choose Template",
    description: "Select a content template to get started",
    options: [
      "What is [massage type]?",
      "Benefits of [massage type]",
      "[Condition]: How massage helps",
      "LGBTQ+ affirming care",
      "Therapist guide",
      "Blank page",
    ],
  },
  {
    step: 2,
    title: "Fill in Content",
    description: "Write your post content",
    fields: ["title", "excerpt", "main_content", "thumbnail"],
  },
  {
    step: 3,
    title: "SEO Settings",
    description: "Optimize for search engines",
    fields: ["focus_keyword", "meta_description", "related_keywords", "internal_links"],
  },
  {
    step: 4,
    title: "Schedule Publishing",
    description: "Choose when to publish",
    fields: ["publish_date", "publish_time", "timezone"],
  },
  {
    step: 5,
    title: "Preview & Publish",
    description: "Review and confirm",
    actions: ["preview", "schedule", "publish_now"],
  },
];

// Performance tracking configuration
export const BLOG_PERFORMANCE_TRACKING = {
  metrics_to_track: [
    "page_views",
    "unique_visitors",
    "time_on_page",
    "scroll_depth",
    "ctr_from_serps",
    "ranking_position",
    "link_clicks_to_profiles",
    "link_clicks_to_services",
    "conversion_to_booking",
  ],
  benchmarks: {
    average_time_on_page: "3 min",
    average_scroll_depth: "75%",
    average_ctr: "3-5%",
    good_ranking: "top 10",
    good_conversion: "2-5% of visitors",
  },
};
