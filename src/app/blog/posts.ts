export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  blocks: BlogBlock[];
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "massage-therapist-near-me-how-to-choose",
    title: "Massage Therapist Near Me: How to Choose a Local Provider",
    excerpt: "A practical guide to comparing location, specialties, rates, service format, availability, and profile details before contacting a massage therapist.",
    publishedAt: "2026-08-10",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "A search for a massage therapist near you should lead to useful profiles quickly. Start with location, then compare the information that actually changes whether a provider fits your needs." },
      { type: "heading", text: "What to compare first" },
      { type: "list", items: ["City and neighborhood", "Incall, outcall, or both", "Massage specialties and experience", "Published rates and session lengths", "Current availability and travel dates", "Direct contact details"] },
      { type: "paragraph", text: "MasseurMatch is a directory, not a booking service. After reviewing a public profile, contact the independent provider directly to confirm timing, location, rates, credentials important to you, and session details." },
    ],
  },
  {
    slug: "incall-vs-outcall-massage-guide",
    title: "Incall vs Outcall Massage: What Is the Difference?",
    excerpt: "Understand incall and outcall massage, when each format is useful, and what to confirm before contacting a provider.",
    publishedAt: "2026-08-09",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "Incall means you travel to the provider's professional location. Outcall means the provider travels to an agreed location within the service area shown on the profile." },
      { type: "heading", text: "Choose based on logistics" },
      { type: "list", items: ["Choose incall when you prefer a provider's prepared workspace", "Choose outcall when travel convenience matters", "Check the provider's outcall radius in miles", "Confirm any travel fee directly with the provider"] },
      { type: "paragraph", text: "A profile can offer both formats. Availability, travel radius, pricing, and location details should be confirmed directly before making plans." },
    ],
  },
  {
    slug: "deep-tissue-massage-near-me-guide",
    title: "Deep Tissue Massage Near Me: What to Look for in a Therapist Profile",
    excerpt: "Use profile details to compare deep tissue massage providers by experience, service area, rates, and session format.",
    publishedAt: "2026-08-08",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "Deep tissue is one of the most common high-intent massage searches. A useful profile should make it easy to see whether the provider lists deep tissue among their specialties and whether their location and rates work for you." },
      { type: "heading", text: "Profile signals worth checking" },
      { type: "list", items: ["Deep tissue listed as a technique or specialty", "Years of massage experience", "Session lengths and starting rates", "Incall and outcall options", "Location and travel radius", "Clear professional bio and photos"] },
    ],
  },
  {
    slug: "mobile-massage-near-me-outcall-radius",
    title: "Mobile Massage Near Me: How Outcall Service Areas Work",
    excerpt: "Learn how mobile massage and outcall radius work, why distance matters, and what to confirm when a therapist travels to clients.",
    publishedAt: "2026-08-07",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "Mobile massage is another way to describe outcall service: the provider travels to the client rather than the client visiting the provider's location." },
      { type: "heading", text: "Distance changes availability" },
      { type: "list", items: ["Check the profile's outcall radius in miles", "Confirm that your ZIP code or neighborhood is covered", "Ask whether distance changes the published rate", "Confirm setup requirements before the session"] },
      { type: "paragraph", text: "MasseurMatch displays provider-supplied service information but does not schedule the appointment. Contact the provider directly for final availability and travel details." },
    ],
  },
  {
    slug: "massage-therapist-traveling-to-my-city",
    title: "How to Find a Massage Therapist Traveling to Your City",
    excerpt: "Travel schedules can help visitors discover therapists who will be temporarily available in another city.",
    publishedAt: "2026-08-06",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "Some massage therapists travel between cities. When a provider publishes destination dates, MasseurMatch can surface that profile in the destination city's discovery results during the relevant travel window." },
      { type: "heading", text: "What a travel listing should tell you" },
      { type: "list", items: ["Destination city and state", "Arrival and departure dates", "Whether incall or outcall is offered while traveling", "Rates and session lengths", "How to contact the provider directly"] },
    ],
  },
  {
    slug: "how-to-read-massage-therapist-profile",
    title: "How to Read a Massage Therapist Profile Before You Contact Them",
    excerpt: "A fast checklist for understanding profile completeness, verification indicators, services, rates, location, and direct-contact information.",
    publishedAt: "2026-08-05",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "A directory profile should reduce uncertainty, not create more of it. Focus on concrete information and treat badges as limited signals rather than guarantees." },
      { type: "heading", text: "A two-minute profile check" },
      { type: "list", items: ["Read the provider's bio and listed techniques", "Compare rates and session lengths", "Check incall/outcall availability", "Review location, service radius, and travel dates", "Understand what any verification badge actually means", "Use the published contact method to confirm details"] },
      { type: "paragraph", text: "MasseurMatch does not independently verify professional licenses. If a credential or license matters to your decision, verify it directly with the provider or the relevant authority." },
    ],
  },
  {
    slug: "local-seo-for-massage-therapists-profile-guide",
    title: "Local SEO for Massage Therapists: Build a Profile Search Engines Can Understand",
    excerpt: "A practical local SEO checklist for massage therapists using clear city, service, pricing, and profile information to improve discoverability.",
    publishedAt: "2026-08-04",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "Local SEO starts with accurate entity information. A complete provider profile gives search engines and users consistent signals about who you are, where you serve, and what services you offer." },
      { type: "heading", text: "Profile fields that support local relevance" },
      { type: "list", items: ["Use the real city and neighborhood you serve", "Choose accurate massage techniques instead of keyword stuffing", "Publish useful rates and session formats", "Keep travel dates current", "Use original professional photos", "Write a specific bio that explains experience and service focus"] },
      { type: "paragraph", text: "Consistency matters more than repeating keywords. Keep your business information accurate across your website, directory profiles, and other legitimate local listings." },
    ],
  },
  {
    slug: "massage-directory-safety-checklist",
    title: "Massage Directory Safety Checklist: What Clients and Providers Should Confirm",
    excerpt: "A practical safety and communication checklist for using a directory to discover independent massage providers.",
    publishedAt: "2026-08-03",
    author: "MasseurMatch Editorial",
    blocks: [
      { type: "paragraph", text: "Directories help people discover independent providers, but they do not replace personal due diligence. Clear communication before meeting protects both clients and providers." },
      { type: "heading", text: "Before meeting" },
      { type: "list", items: ["Confirm identity and contact information", "Confirm location and session format", "Discuss rates and practical expectations", "Verify credentials that matter to you", "Do not share passwords or one-time verification codes", "Report suspicious or prohibited activity to the platform"] },
    ],
  },
];

export function getBlogPosts() {
  return BLOG_POSTS.slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}
