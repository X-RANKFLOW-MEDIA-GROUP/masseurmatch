// Strategic content and keyword planning for MasseurMatch blog and SEO

export interface KeywordCluster {
  category: string;
  intent: "informational" | "commercial" | "local" | "navigational";
  keywords: string[];
  monthlySearchVolume?: number;
  difficulty?: number;
  priority: "critical" | "high" | "medium" | "low";
}

export const THERAPIST_HIGH_INTENT_KEYWORDS: KeywordCluster[] = [
  {
    category: "Location + Service Combos (Highest Converting)",
    intent: "commercial",
    priority: "critical",
    keywords: [
      "Deep tissue massage [city]",
      "Sports massage near me",
      "Prenatal massage [city]",
      "Registered massage therapist [city]",
      "Book massage appointment online",
      "Massage therapist near me",
      "Best massage near me",
      "Medical massage near me",
    ],
  },
  {
    category: "Action-Oriented Keywords",
    intent: "commercial",
    priority: "critical",
    keywords: [
      "Book deep tissue massage today",
      "Schedule massage appointment",
      "Find massage therapist near me",
      "Massage available today",
      "Accepting new massage clients",
    ],
  },
  {
    category: "Symptom-Based (High Conversion)",
    intent: "commercial",
    priority: "high",
    keywords: [
      "Massage for lower back pain",
      "Massage for neck pain",
      "Massage for back pain",
      "Massage for sciatica",
      "Massage for muscle tension",
      "Massage for shoulder pain",
      "Massage for headaches",
      "Massage for stress relief",
    ],
  },
  {
    category: "Specialty/Treatment Types",
    intent: "commercial",
    priority: "high",
    keywords: [
      "Deep tissue massage",
      "Sports massage",
      "Swedish massage",
      "Myofascial release",
      "Trigger point therapy",
      "Prenatal massage",
      "Therapeutic massage",
      "Shiatsu massage",
    ],
  },
];

export const CLIENT_LOW_INTENT_KEYWORDS: KeywordCluster[] = [
  {
    category: "Benefits of [Massage Type]",
    intent: "informational",
    priority: "high",
    monthlySearchVolume: 40000,
    keywords: [
      "Benefits of massage therapy",
      "Benefits of deep tissue massage",
      "Benefits of Swedish massage",
      "Benefits of sports massage",
      "Benefits of prenatal massage",
      "Benefits of lymphatic massage",
      "Benefits of trigger point massage",
    ],
  },
  {
    category: "What is [Massage Type]",
    intent: "informational",
    priority: "high",
    keywords: [
      "What is deep tissue massage",
      "What is Swedish massage",
      "What is sports massage",
      "What is therapeutic massage",
      "What is trigger point therapy",
      "What is myofascial release",
    ],
  },
  {
    category: "Condition-Based (High Conversion)",
    intent: "informational",
    priority: "critical",
    keywords: [
      "Massage for anxiety",
      "Massage for back pain",
      "Massage for stress relief",
      "Massage for neck and shoulder pain",
      "Massage for migraines",
      "Massage for muscle tension",
      "Massage for athletes",
      "Massage for recovery",
      "Massage for chronic pain",
      "Massage for sleep problems",
    ],
  },
  {
    category: "LGBTQ+ Affirming Specific",
    intent: "commercial",
    priority: "critical",
    keywords: [
      "LGBTQ+ affirming massage therapist",
      "Gay-friendly massage therapist near me",
      "Gay massage therapist [city]",
      "LGBTQ-friendly massage therapy",
      "Safe space massage therapist",
      "Inclusive massage therapy",
      "Queer-friendly massage",
      "Male massage therapist",
      "Transgender-affirming massage",
    ],
  },
];

export const BLOG_CONTENT_STRATEGY = {
  publishing_frequency: "2-3 posts per week",
  post_types: [
    {
      type: "Technique Guides",
      word_count: "1500+",
      examples: [
        "Swedish vs Deep Tissue Massage: 7 Key Differences",
        "Complete Guide to Sports Massage for Athletes",
        "Prenatal Massage: Safe Practices for Expectant Mothers",
      ],
    },
    {
      type: "Benefits-Focused Articles",
      word_count: "600-1200",
      examples: [
        "The Complete Benefits of Regular Massage Therapy for Stress Relief",
        "How Massage Reduces Anxiety: The Science Behind Cortisol Reduction",
        "Massage Therapy for Chronic Pain Management",
      ],
    },
    {
      type: "Condition-Specific Guides",
      word_count: "800-1200",
      examples: [
        "Massage Therapy for Migraine Relief",
        "Managing Lower Back Pain with Targeted Massage",
        "Sleep Better: How Massage Improves Sleep Quality",
      ],
    },
    {
      type: "FAQ & How-To",
      word_count: "400-800",
      examples: [
        "Is Massage Therapy Covered by Insurance?",
        "What's the Difference Between Massage and Physical Therapy?",
        "What to Expect During Your First Massage Appointment",
      ],
    },
    {
      type: "LGBTQ+ Affirmation Content",
      word_count: "800-1200",
      examples: [
        "Creating Safe Spaces: How We Affirm LGBTQ+ Clients",
        "Trans-Affirming Massage Practices",
        "Massage Therapy and LGBTQ+ Wellness: Building Trust",
      ],
    },
  ],
};

export const CONTENT_CALENDAR_3MONTH = [
  {
    week: 1,
    posts: [
      {
        title: "What is Deep Tissue Massage? Complete Beginner's Guide",
        keyword: "what is deep tissue massage",
        type: "educational",
        linking: "Link to: deep-tissue-massage-therapy service page",
      },
      {
        title: "Benefits of Massage for Back Pain: Evidence-Based Guide",
        keyword: "massage for back pain",
        type: "benefits",
        linking: "Link to: therapeutic-massage, pain-relief services",
      },
    ],
  },
  {
    week: 2,
    posts: [
      {
        title: "Swedish Massage vs Deep Tissue: Which is Right for You?",
        keyword: "swedish vs deep tissue massage",
        type: "comparison",
        linking: "Link to both service pages",
      },
      {
        title: "How Massage Reduces Stress: The Science of Cortisol & Serotonin",
        keyword: "massage for stress relief",
        type: "educational",
        linking: "Link to: stress-relief-massage service page",
      },
    ],
  },
  {
    week: 3,
    posts: [
      {
        title: "LGBTQ+ Affirming Massage Care: What to Expect",
        keyword: "LGBTQ affirming massage therapist",
        type: "affirmation",
        linking: "Link to: directory, featured-therapists",
      },
      {
        title: "Sports Massage for Recovery: Athlete's Guide",
        keyword: "sports massage for athletes",
        type: "specialized",
        linking: "Link to: sports-massage service page",
      },
    ],
  },
];

export const INTERNAL_LINKING_STRATEGY = {
  blog_to_services: {
    description: "Each blog post links to 1-2 relevant service pages",
    pattern: "Content flow: Benefits article → Service page → Therapist profiles",
    authority_flow: "Blog builds topical authority → Powers service page rankings",
  },
  hub_and_spoke: {
    hub_page: "/blog/massage-therapy-guide", // Main pillar page
    spokes: [
      "/blog/deep-tissue-massage-guide",
      "/blog/swedish-massage-guide",
      "/blog/sports-massage-guide",
      "/blog/prenatal-massage-guide",
    ],
    linking_pattern:
      "Hub links to spokes, spokes link back to hub and related service pages",
  },
  topical_clustering: {
    cluster_example: "Stress & Anxiety",
    content: [
      "/blog/massage-anxiety",
      "/blog/massage-stress-relief",
      "/blog/cortisol-reduction",
      "/therapists?specialty=therapeutic", // Service page
    ],
    result: "Builds topical authority that strengthens all URLs in cluster",
  },
  therapist_profile_links: {
    strategy: "Link blog posts to therapist profiles matching their specialties",
    example: "Sports massage blog → Links to therapists with sports massage specialization",
    tracking: "Use UTM parameters to track blog→profile→booking conversion",
  },
};

export const AUTHORITY_BUILDING_STRATEGY = {
  months_0_3: {
    goal: "Content foundation",
    tasks: [
      "Publish 24-36 high-quality blog posts (2-3/week)",
      "Build internal linking structure (hub & spoke)",
      "Establish topical clusters (massage types, conditions, demographics)",
    ],
    expected_result: "Topical authority signals to search engines",
  },
  months_4_6: {
    goal: "Traffic growth",
    tasks: [
      "Monitor Google Search Console for new keywords",
      "Optimize top-performing posts with internal links",
      "Add schema markup to all blog posts",
      "Build backlinks through guest posts on wellness sites",
    ],
    expected_result: "20-40% organic traffic increase",
  },
  months_7_12: {
    goal: "Sustained growth",
    tasks: [
      "Continue consistent publishing (2-3 posts/week)",
      "Update evergreen content quarterly",
      "Build topical depth in high-converting clusters",
      "Leverage user-generated testimonials in content",
    ],
    expected_result: "50-100%+ organic traffic growth",
  },
  months_12_plus: {
    goal: "Leadership positioning",
    expected_result: "40-60% of leads from organic search at lower acquisition cost",
  },
};

export const CITATIONS_AND_DIRECTORIES = [
  {
    name: "Google My Business",
    priority: "CRITICAL",
    url: "https://mybusiness.google.com",
  },
  {
    name: "Yelp",
    priority: "HIGH",
    url: "https://business.yelp.com",
  },
  {
    name: "Apple Maps",
    priority: "HIGH",
    url: "https://maps.apple.com",
  },
  {
    name: "Better Business Bureau",
    priority: "MEDIUM",
    url: "https://www.bbb.org",
  },
  {
    name: "TherapyDen",
    priority: "MEDIUM",
    url: "https://www.therapyden.com",
  },
  {
    name: "Healthgrades",
    priority: "MEDIUM",
    url: "https://www.healthgrades.com",
  },
];

export const LGBTQ_AFFIRMATION_SEO_TACTICS = [
  {
    tactic: "Authentic testimonials",
    impact: "Signals genuine inclusivity to search engines",
    timeline: "2-6 weeks to show effect",
  },
  {
    tactic: "Specific LGBTQ+ blog content",
    examples: ["Trans client care", "Nonbinary client experiences", "Queer community wellness"],
    impact: "Attracts both searchers and improves rankings",
  },
  {
    tactic: "Detailed affirmation practices",
    details: "Explain LGBTQ+ training, inclusive policies, community involvement",
    impact: "Builds trust signals stronger than generic 'we welcome everyone'",
  },
  {
    tactic: "Consistent local SEO",
    action: "Optimize local citations + Google My Business reviews",
    timeline: "Results within 2-6 weeks",
  },
];
