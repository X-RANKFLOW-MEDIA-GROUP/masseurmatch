// Blog post automation and publishing scheduler

export interface BlogPostDraft {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  keywords: string[];
  category: "client-guide" | "therapist-guide" | "wellness" | "affirmation";
  readTime: number;
  authorId: string;
  scheduledAt?: Date;
  status: "draft" | "scheduled" | "published";
  seoMetadata: {
    metaDescription: string;
    focusKeyword: string;
    relatedKeywords: string[];
  };
  linkedProfiles?: string[]; // Therapist profile slugs to link to
  linkedServices?: string[]; // Service types to link to
  internalLinks?: Array<{
    text: string;
    url: string;
    anchor: string;
  }>;
  publishedAt?: Date;
  updatedAt?: Date;
  thumbnail?: string;
  featured?: boolean;
}

export const BLOG_AUTOMATION_CONFIG = {
  publishing_schedule: {
    frequency: "2-3 posts per week",
    preferred_days: ["Monday", "Wednesday", "Friday"],
    preferred_times: ["9:00 AM EST", "2:00 PM EST"], // UTC-4
    timezone: "America/New_York",
  },
  auto_publish_workflows: [
    {
      trigger: "scheduled_date_reached",
      actions: [
        "publish_to_blog",
        "generate_social_media_posts",
        "publish_gbp_post",
        "send_email_notification",
        "add_to_sitemap",
        "send_to_search_console",
      ],
    },
  ],
  social_media_automation: {
    enabled: true,
    channels: ["twitter", "facebook", "instagram", "linkedin"],
    posting_strategy: "publish_simultaneously_with_blog",
  },
  gbp_automation: {
    enabled: true,
    auto_create_gbp_posts: true,
    content_type: "blog_to_gbp_excerpt", // Publish blog excerpt to GBP
    include_link: true,
    include_image: true,
  },
};

export const BLOG_POST_TEMPLATES = {
  "what-is-guide": {
    structure: [
      { type: "h1", content: "What is {massage_type}?" },
      { type: "p", content: "Introduction paragraph (2-3 sentences)" },
      { type: "h2", content: "Definition & How It Works" },
      { type: "p", content: "Detailed explanation (150-200 words)" },
      { type: "h2", content: "Key Benefits" },
      { type: "list", items: ["benefit 1", "benefit 2", "benefit 3"] },
      { type: "h2", content: "Who It's Good For" },
      { type: "p", content: "Target demographics (100-150 words)" },
      { type: "h2", content: "What to Expect During Your Session" },
      { type: "p", content: "Session description (100-150 words)" },
      { type: "cta", content: "Find a {massage_type} therapist near you" },
    ],
    word_count: "800-1000",
    focus_keyword: "{massage_type}",
  },
  "benefits-guide": {
    structure: [
      { type: "h1", content: "Benefits of {massage_type}" },
      { type: "p", content: "Introduction with key benefit summary" },
      { type: "h2", content: "Clinical Evidence" },
      { type: "p", content: "Science-backed benefits with citations" },
      { type: "h2", content: "5 Key Benefits Explained" },
      { type: "list", items: ["benefit 1", "benefit 2", "benefit 3", "benefit 4", "benefit 5"] },
      { type: "h2", content: "How These Benefits Work" },
      { type: "p", content: "Mechanism of benefits (body/physiology)" },
      { type: "h2", content: "Who Benefits Most" },
      { type: "p", content: "Target demographics" },
      { type: "cta", content: "Book your {massage_type} session today" },
    ],
    word_count: "1000-1200",
    focus_keyword: "benefits of {massage_type}",
  },
  "condition-guide": {
    structure: [
      { type: "h1", content: "{Condition}: How Massage Therapy Helps" },
      { type: "p", content: "Condition overview and impact" },
      { type: "h2", content: "How Massage Therapy Addresses {Condition}" },
      { type: "p", content: "Mechanism of relief (150-200 words)" },
      { type: "h2", content: "Best Massage Types for {Condition}" },
      { type: "list", items: ["massage type 1", "massage type 2", "massage type 3"] },
      { type: "h2", content: "What the Research Says" },
      { type: "p", content: "Clinical studies and evidence" },
      { type: "h2", content: "What to Tell Your Therapist" },
      { type: "p", content: "Communication tips for first session" },
      { type: "cta", content: "Find a therapist specializing in {condition} relief" },
    ],
    word_count: "1000-1200",
    focus_keyword: "massage for {condition}",
  },
  "lgbtq-affirmation": {
    structure: [
      { type: "h1", content: "LGBTQ+ Affirming Massage: What It Means & Why It Matters" },
      { type: "p", content: "Why safe spaces matter for LGBTQ+ wellness" },
      { type: "h2", content: "What Is LGBTQ+-Affirming Massage?" },
      { type: "p", content: "Definition and core values" },
      { type: "h2", content: "How Our Therapists Provide Affirming Care" },
      { type: "list", items: ["training detail", "practice detail", "commitment detail"] },
      { type: "h2", content: "Creating Safe Spaces for Trans & Non-Binary Clients" },
      { type: "p", content: "Specific practices and sensitivity" },
      { type: "h2", content: "What to Expect in Your Session" },
      { type: "p", content: "Step-by-step from booking to completion" },
      { type: "testimonial", content: "Client testimonial (with permission)" },
      { type: "cta", content: "Book with an LGBTQ+-affirming therapist" },
    ],
    word_count: "1000-1200",
    focus_keyword: "LGBTQ+ affirming massage",
  },
};

export interface BlogPublishingTask {
  id: string;
  postId: string;
  scheduledTime: Date;
  status: "pending" | "in_progress" | "completed" | "failed";
  actions: {
    publish_to_blog: boolean;
    create_gbp_post?: boolean;
    share_social_media?: boolean;
    notify_subscribers?: boolean;
    submit_to_search_console?: boolean;
  };
  results?: {
    blog_url?: string;
    gbp_post_id?: string;
    social_media_links?: Record<string, string>;
    submission_status?: string;
  };
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// API routes for automation
export const blogAutomationEndpoints = {
  "POST /api/blog/schedule": "Schedule a blog post for publishing",
  "GET /api/blog/schedule": "Get all scheduled posts",
  "PUT /api/blog/schedule/:id": "Update scheduled post timing",
  "DELETE /api/blog/schedule/:id": "Cancel scheduled post",
  "POST /api/blog/publish-now": "Immediately publish a draft post",
  "GET /api/blog/automation/status": "Get automation status and queue",
  "POST /api/blog/automation/trigger": "Manually trigger automation job",
};

// Cron job configuration for scheduled publishing
export const BLOG_CRON_JOBS = {
  check_scheduled_posts: {
    schedule: "*/5 * * * *", // Every 5 minutes
    job: "check_posts_ready_to_publish",
    description: "Check for posts scheduled to publish and trigger publishing",
  },
  daily_digest: {
    schedule: "0 8 * * *", // 8 AM daily
    job: "send_daily_blog_digest",
    description: "Send email digest of today's published posts",
  },
  weekly_content_plan: {
    schedule: "0 9 * * 1", // 9 AM Mondays
    job: "send_weekly_content_plan",
    description: "Send team weekly content calendar",
  },
  auto_generate_social_posts: {
    schedule: "*/30 * * * *", // Every 30 minutes
    job: "generate_and_queue_social_posts",
    description: "Auto-generate social media posts from scheduled blogs",
  },
};

// Database schema for blog automation
export interface BlogAutomationDB {
  scheduled_posts: BlogPostDraft[];
  publishing_queue: BlogPublishingTask[];
  publication_history: Array<{
    postId: string;
    publishedAt: Date;
    url: string;
    channels: string[];
  }>;
}

// Automation helpers
export const getBlogPostsForWeek = (startDate: Date) => {
  // Get all posts scheduled for the upcoming week
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  // Query from database
  return { startDate, endDate };
};

export const generateSocialMediaPost = (blogPost: BlogPostDraft): Record<string, string> => {
  return {
    twitter: `📚 New blog post: "${blogPost.title}" - ${blogPost.excerpt.slice(0, 80)}... Read more: ${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blogPost.slug} #MassageTherapy`,
    facebook: `🧘 Just published: "${blogPost.title}"\n\n${blogPost.excerpt}\n\nLearn more and find a therapist: [link]`,
    instagram: `New on the blog! 📝\n\n${blogPost.title}\n\n${blogPost.keywords.slice(0, 3).map((k) => `#${k.replace(/\s+/g, "")}`).join(" ")}`,
    linkedin: `[Professional version] New article: "${blogPost.title}"\n\n${blogPost.excerpt}\n\n[Read full article]`,
  };
};

export const generateGBPPost = (blogPost: BlogPostDraft) => {
  return {
    title: blogPost.title,
    content: `${blogPost.excerpt}\n\nRead the full article on our blog.`,
    image: blogPost.thumbnail,
    link: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blogPost.slug}`,
    callToAction: "Read Article",
  };
};

export interface PublishingBatch {
  date: Date;
  posts: BlogPostDraft[];
  status: "scheduled" | "publishing" | "completed" | "error";
  socialMediaPosts?: Record<string, Record<string, string>>;
  gbpPosts?: Array<ReturnType<typeof generateGBPPost>>;
  emailNotification?: {
    subject: string;
    recipients: string[];
    sent: boolean;
  };
}

// Content calendar generator
export const generateContentCalendar = (startDate: Date, weeksAhead: number = 12) => {
  const calendar: PublishingBatch[] = [];
  const therapyTypes = [
    "Deep Tissue",
    "Swedish",
    "Sports",
    "Prenatal",
    "Trigger Point",
    "Therapeutic",
    "Shiatsu",
    "Reflexology",
  ];
  const conditions = ["Back Pain", "Anxiety", "Stress", "Migraines", "Athletes", "Sleep"];
  const lgbtqTopics = [
    "Affirming Care",
    "Trans Wellness",
    "Safe Spaces",
    "Inclusive Practices",
    "Community Healing",
  ];

  let contentIndex = 0;
  for (let week = 0; week < weeksAhead; week++) {
    const batchDate = new Date(startDate);
    batchDate.setDate(batchDate.getDate() + week * 7);

    const postsThisWeek: BlogPostDraft[] = [];

    // 2-3 posts per week
    for (let i = 0; i < 2; i++) {
      let title = "";
      let category: BlogPostDraft["category"] = "wellness";

      if (contentIndex % 5 === 0) {
        title = `What is ${therapyTypes[contentIndex % therapyTypes.length]} Massage?`;
        category = "client-guide";
      } else if (contentIndex % 5 === 1) {
        title = `Benefits of ${therapyTypes[contentIndex % therapyTypes.length]} Massage`;
        category = "wellness";
      } else if (contentIndex % 5 === 2) {
        title = `${conditions[contentIndex % conditions.length]}: How Massage Helps`;
        category = "client-guide";
      } else if (contentIndex % 5 === 3) {
        title = `LGBTQ+ ${lgbtqTopics[contentIndex % lgbtqTopics.length]}: Best Practices`;
        category = "affirmation";
      } else {
        title = `Therapist Guide: Building Your ${therapyTypes[contentIndex % therapyTypes.length]} Practice`;
        category = "therapist-guide";
      }

      const publishDate = new Date(batchDate);
      publishDate.setDate(publishDate.getDate() + i * 3); // Space posts 3 days apart
      if (publishDate.getDay() === 0) publishDate.setDate(publishDate.getDate() + 1); // Skip Sundays

      const post: BlogPostDraft = {
        id: `blog-${week}-${i}`,
        title,
        slug: title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-"),
        excerpt: `Learn about ${title.toLowerCase()}. This comprehensive guide covers everything you need to know.`,
        content: "Content to be written",
        keywords: [title.toLowerCase()],
        category,
        readTime: 5 + Math.floor(Math.random() * 5),
        authorId: "editorial",
        scheduledAt: new Date(publishDate.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        status: "scheduled",
        seoMetadata: {
          metaDescription: `${title}. Learn more about this massage therapy technique and its benefits.`,
          focusKeyword: title.toLowerCase(),
          relatedKeywords: [
            `${title} benefits`,
            `${title} therapy`,
            `what is ${title}`,
          ],
        },
      };

      postsThisWeek.push(post);
      contentIndex++;
    }

    calendar.push({
      date: batchDate,
      posts: postsThisWeek,
      status: "scheduled",
    });
  }

  return calendar;
};
