import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [key, ...rest] = line.split("=");
    if (!(key in process.env)) {
      process.env[key] = rest.join("=");
    }
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

loadEnvFile(path.join(rootDir, ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

if (!/^eyJ[a-zA-Z0-9._-]+$/.test(serviceRoleKey)) {
  console.error("SUPABASE_SERVICE_ROLE_KEY does not look like a valid Supabase service JWT.");
  process.exit(1);
}

const preflightResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  },
});

if (!preflightResponse.ok) {
  console.error("Supabase rejected the configured service role key. Update SUPABASE_SERVICE_ROLE_KEY before seeding.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const timestamp = "2026-03-14T12:00:00.000Z";

const cities = [
  {
    slug: "dallas",
    name: "Dallas",
    state: "Texas",
    state_code: "TX",
    description:
      "Dallas blends polished wellness studios, direct communication, and a strong Oak Lawn and Uptown directory audience looking for trustworthy therapist profiles.",
    latitude: 32.7767,
    longitude: -96.797,
    hero: "A clean Dallas skyline directory page with therapist cards, city notes, and direct contact options.",
  },
  {
    slug: "houston",
    name: "Houston",
    state: "Texas",
    state_code: "TX",
    description:
      "Houston visitors tend to compare neighborhoods, modality depth, and flexible incall or outcall options before they reach out to a provider.",
    latitude: 29.7604,
    longitude: -95.3698,
    hero: "A Houston local directory view focused on inclusive therapists, clear modality tags, and contact-first listings.",
  },
  {
    slug: "austin",
    name: "Austin",
    state: "Texas",
    state_code: "TX",
    description:
      "Austin searchers respond to personality-rich profiles, detailed bodywork specialties, and directory pages that feel locally informed rather than generic.",
    latitude: 30.2672,
    longitude: -97.7431,
    hero: "An Austin directory landing page featuring confident editorial copy and therapist cards arranged around neighborhood discovery.",
  },
];

const keywordLabels = [
  "Deep Tissue",
  "Swedish",
  "Sports Massage",
  "Thai Massage",
  "Myofascial Release",
  "Trigger Point",
  "Lymphatic",
  "Cupping",
  "Stretch Therapy",
  "Prenatal",
  "Relaxation",
  "Aromatherapy",
  "Reflexology",
  "Hot Stone",
  "Recovery",
  "Neck Relief",
  "Shoulder Relief",
  "Back Relief",
  "Hip Relief",
  "Mobility Work",
  "Travel Friendly",
  "Hotel Outcall",
  "Incall Studio",
  "Same Day",
  "Weekend Hours",
  "Evening Hours",
  "English",
  "Spanish",
  "Portuguese",
  "French",
  "LGBTQ Affirming",
  "Gay Friendly",
  "Inclusive",
  "Male Therapist",
  "Female Therapist",
  "Non-Binary Therapist",
  "Bodywork",
  "Therapeutic Massage",
  "Stress Relief",
  "Wellness Recovery",
  "Athletic Recovery",
  "Compassionate Care",
  "First Session Friendly",
  "Quiet Studio",
  "Luxury Listing",
  "Budget Friendly",
  "Professional Boundaries",
  "Direct Contact",
  "Verified Photos",
  "Top Rated",
];

const keywords = keywordLabels.map((label) => ({
  slug: slugify(label),
  label,
  category:
    label.includes("Friendly") || label.includes("Affirming") || label.includes("Inclusive")
      ? "identity"
      : label.includes("Hours") || label.includes("Contact") || label.includes("Studio") || label.includes("Outcall")
        ? "intent"
        : "modality",
}));

const seedUsers = [
  {
    email: "admin@masseurmatch.com",
    password: "Admin@MM2025!",
    fullName: "MasseurMatch Admin",
    role: "admin",
  },
  {
    email: "therapist@masseurmatch.com",
    password: "Therapist@MM2025!",
    fullName: "Leo Martinez",
    role: "therapist",
  },
];

const therapists = [
  {
    slug: "mason-ellis",
    userEmail: null,
    citySlug: "dallas",
    display_name: "Mason Ellis",
    state: "TX",
    bio: "Mason works from Oak Lawn with a calm, recovery-first style built around deep tissue, stretch work, and direct communication before every session.",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
    ],
    modalities: ["deep-tissue", "sports-massage", "stretch-therapy"],
    keyword_slugs: ["deep-tissue", "sports-massage", "athletic-recovery", "gay-friendly", "verified-photos"],
    languages: ["English", "Spanish"],
    contact_email: "mason@masseurmatch.com",
    phone: "+1 (214) 555-1101",
    website: "https://masseurmatch.com/therapists/mason-ellis",
    incall: true,
    outcall: true,
    price_range: "$120-$180",
    gay_friendly: true,
    inclusive: true,
    segments: ["gay", "inclusive", "male", "lgbtq"],
    latitude: 32.8093,
    longitude: -96.7995,
    tier: "featured",
    status: "approved",
    view_count: 412,
    profile_completeness: 96,
  },
  {
    slug: "raul-vega",
    userEmail: null,
    citySlug: "dallas",
    display_name: "Raul Vega",
    state: "TX",
    bio: "Raul keeps his Dallas studio straightforward and welcoming, with Swedish and myofascial sessions tailored to stress relief and first-session comfort.",
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    gallery: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80"],
    modalities: ["swedish", "myofascial-release", "relaxation"],
    keyword_slugs: ["swedish", "myofascial-release", "first-session-friendly", "budget-friendly", "inclusive"],
    languages: ["English"],
    contact_email: "raul@masseurmatch.com",
    phone: "+1 (972) 555-2202",
    website: "https://masseurmatch.com/therapists/raul-vega",
    incall: true,
    outcall: false,
    price_range: "$90-$130",
    gay_friendly: false,
    inclusive: true,
    segments: ["inclusive", "male"],
    latitude: 32.783,
    longitude: -96.781,
    tier: "free",
    status: "approved",
    view_count: 148,
    profile_completeness: 88,
  },
  {
    slug: "adrian-cole",
    userEmail: null,
    citySlug: "houston",
    display_name: "Adrian Cole",
    state: "TX",
    bio: "Adrian serves Montrose and Downtown Houston with a polished mix of Thai and deep tissue work, especially for clients who want clear pressure adjustments and consistent pacing.",
    photo_url: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
    gallery: ["https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80"],
    modalities: ["thai-massage", "deep-tissue", "mobility-work"],
    keyword_slugs: ["thai-massage", "deep-tissue", "mobility-work", "gay-friendly", "weekend-hours"],
    languages: ["English", "Portuguese"],
    contact_email: "adrian@masseurmatch.com",
    phone: "+1 (713) 555-3303",
    website: "https://masseurmatch.com/therapists/adrian-cole",
    incall: true,
    outcall: true,
    price_range: "$115-$175",
    gay_friendly: true,
    inclusive: true,
    segments: ["gay", "inclusive", "male", "lgbtq"],
    latitude: 29.7421,
    longitude: -95.378,
    tier: "pro",
    status: "approved",
    view_count: 286,
    profile_completeness: 92,
  },
  {
    slug: "jordan-brooks",
    userEmail: null,
    citySlug: "houston",
    display_name: "Jordan Brooks",
    state: "TX",
    bio: "Jordan focuses on steady relaxation sessions for Houston visitors who want evening hours, direct contact details, and a calm neighborhood studio with professional boundaries.",
    photo_url: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=900&q=80",
    gallery: ["https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=900&q=80"],
    modalities: ["relaxation", "swedish", "aromatherapy"],
    keyword_slugs: ["relaxation", "swedish", "evening-hours", "direct-contact", "inclusive"],
    languages: ["English", "French"],
    contact_email: "jordan@masseurmatch.com",
    phone: "+1 (832) 555-4404",
    website: "https://masseurmatch.com/therapists/jordan-brooks",
    incall: true,
    outcall: false,
    price_range: "$95-$140",
    gay_friendly: false,
    inclusive: true,
    segments: ["inclusive", "female"],
    latitude: 29.7606,
    longitude: -95.3672,
    tier: "free",
    status: "approved",
    view_count: 97,
    profile_completeness: 84,
  },
  {
    slug: "leo-martinez",
    userEmail: "therapist@masseurmatch.com",
    citySlug: "austin",
    display_name: "Leo Martinez",
    state: "TX",
    bio: "Leo anchors the Austin seed account with a fully developed profile, inclusive language, bilingual communication, and a detailed blend of deep tissue and lymphatic recovery work.",
    photo_url: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?auto=format&fit=crop&w=900&q=80",
    ],
    modalities: ["deep-tissue", "lymphatic", "recovery"],
    keyword_slugs: ["deep-tissue", "lymphatic", "recovery", "gay-friendly", "spanish", "luxury-listing"],
    languages: ["English", "Spanish"],
    contact_email: "therapist@masseurmatch.com",
    phone: "+1 (512) 555-5505",
    website: "https://masseurmatch.com/therapists/leo-martinez",
    incall: true,
    outcall: true,
    price_range: "$125-$185",
    gay_friendly: true,
    inclusive: true,
    segments: ["gay", "inclusive", "male", "lgbtq"],
    latitude: 30.2678,
    longitude: -97.7414,
    tier: "featured",
    status: "approved",
    view_count: 525,
    profile_completeness: 100,
  },
];

const reviews = [
  {
    id: "5e64fa6f-a3fa-4d57-8e37-f3a8b43ef001",
    therapistSlug: "leo-martinez",
    author_name: "Marco",
    rating: 5,
    body: "Clear communication, excellent pressure control, and a studio that felt calm from the start.",
    status: "approved",
  },
  {
    id: "5e64fa6f-a3fa-4d57-8e37-f3a8b43ef002",
    therapistSlug: "mason-ellis",
    author_name: "Tyler",
    rating: 5,
    body: "Great deep tissue work and no guesswork about what the session would cover.",
    status: "approved",
  },
  {
    id: "5e64fa6f-a3fa-4d57-8e37-f3a8b43ef003",
    therapistSlug: "jordan-brooks",
    author_name: "Avery",
    rating: 4,
    body: "Comfortable atmosphere and thoughtful follow-up directions after the session.",
    status: "pending",
  },
];

const blogPosts = [
  {
    slug: "best-gay-massage-directory-2026",
    title: "What Makes a Strong Massage Directory in 2026",
    excerpt: "The best directories help people compare therapists quickly, understand trust signals, and reach out without extra friction.",
    seo_description: "Learn what makes a modern massage directory work for therapist discovery, city search, and direct contact.",
    content:
      "## Directory-first discovery\n\nStrong directory products answer three questions quickly: who is available in the city, what kind of bodywork they offer, and how direct outreach works.\n\n## Trust beats clutter\n\nVisitors respond to clean profiles, real modality tags, visible contact methods, and profile status that makes approval or suspension obvious.\n\n## City pages should feel local\n\nLocal directory pages work best when they explain neighborhoods, pricing context, and identity-friendly filters without sounding generic.",
    tags: ["directory", "seo", "cities"],
  },
  {
    slug: "how-to-contact-a-therapist-confidently",
    title: "How to Reach Out to a Therapist Confidently",
    excerpt: "Direct outreach works best when profiles make services, boundaries, and preferred contact methods obvious.",
    seo_description: "A practical guide to using therapist directory profiles to make clear first contact and ask better questions.",
    content:
      "## Start with the profile\n\nBefore you send a message, review the therapist's services, schedule style, neighborhood, and languages.\n\n## Keep the first message direct\n\nMention your goal, preferred timeframe, and whether you are looking for incall or outcall options.\n\n## Respect boundaries\n\nDirectories work best when contact details are used thoughtfully and therapists do not have to decode vague requests.",
    tags: ["contact", "directory", "profiles"],
  },
  {
    slug: "austin-dallas-houston-directory-guide",
    title: "Austin, Dallas, and Houston: A Texas Directory Guide",
    excerpt: "Each city searches differently. Here is how to structure therapist discovery pages for Austin, Dallas, and Houston.",
    seo_description: "Explore how Texas city directory pages can balance local context, identity filters, and direct therapist outreach.",
    content:
      "## Dallas\n\nDallas pages should foreground Oak Lawn, Uptown, and strong contact clarity.\n\n## Houston\n\nHouston directory visitors often compare neighborhoods and therapist flexibility before they reach out.\n\n## Austin\n\nAustin responds well to profiles with voice, modality depth, and a strong sense of neighborhood fit.",
    tags: ["texas", "cities", "seo"],
  },
];

async function ensureAuthUser({ email, fullName, password, role }) {
  const { data: existingUsersData, error: existingUsersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (existingUsersError) {
    throw existingUsersError;
  }

  let user = existingUsersData.users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { full_name: fullName },
    });

    if (error) {
      throw error;
    }

    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { full_name: fullName },
    });

    if (error) {
      throw error;
    }

    user = data.user;
  }

  return user;
}

function failOnError(error, context) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

async function main() {
  const ensuredUsers = await Promise.all(seedUsers.map(ensureAuthUser));
  const userIdByEmail = new Map(ensuredUsers.map((user) => [user.email.toLowerCase(), user.id]));

  const { error: storageError } = await supabase.storage.createBucket("therapist-photos", { public: true });
  if (storageError && !storageError.message.toLowerCase().includes("already exists")) {
    throw storageError;
  }

  const { error: usersError } = await supabase.from("users").upsert(
    seedUsers.map((user) => ({
      id: userIdByEmail.get(user.email.toLowerCase()),
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      created_at: timestamp,
      updated_at: timestamp,
    })),
    { onConflict: "id" },
  );
  failOnError(usersError, "Upserting users failed");

  const { error: citiesError } = await supabase.from("cities").upsert(
    cities.map((city) => ({ ...city, created_at: timestamp, updated_at: timestamp })),
    { onConflict: "slug" },
  );
  failOnError(citiesError, "Upserting cities failed");

  const { data: cityRows, error: cityFetchError } = await supabase.from("cities").select("id, slug");
  failOnError(cityFetchError, "Fetching cities failed");
  const cityIdBySlug = new Map(cityRows.map((city) => [city.slug, city.id]));

  const { error: keywordsError } = await supabase.from("keywords").upsert(
    keywords.map((keyword) => ({ ...keyword, created_at: timestamp, updated_at: timestamp })),
    { onConflict: "slug" },
  );
  failOnError(keywordsError, "Upserting keywords failed");

  const { error: therapistsError } = await supabase.from("therapists").upsert(
    therapists.map((therapist) => ({
      slug: therapist.slug,
      user_id: therapist.userEmail ? userIdByEmail.get(therapist.userEmail.toLowerCase()) : null,
      city_id: cityIdBySlug.get(therapist.citySlug),
      display_name: therapist.display_name,
      state: therapist.state,
      bio: therapist.bio,
      photo_url: therapist.photo_url,
      gallery: therapist.gallery,
      modalities: therapist.modalities,
      keyword_slugs: therapist.keyword_slugs,
      languages: therapist.languages,
      contact_email: therapist.contact_email,
      phone: therapist.phone,
      website: therapist.website,
      incall: therapist.incall,
      outcall: therapist.outcall,
      price_range: therapist.price_range,
      gay_friendly: therapist.gay_friendly,
      inclusive: therapist.inclusive,
      segments: therapist.segments,
      latitude: therapist.latitude,
      longitude: therapist.longitude,
      tier: therapist.tier,
      status: therapist.status,
      view_count: therapist.view_count,
      profile_completeness: therapist.profile_completeness,
      created_at: timestamp,
      updated_at: timestamp,
    })),
    { onConflict: "slug" },
  );
  failOnError(therapistsError, "Upserting therapists failed");

  const { data: therapistRows, error: therapistFetchError } = await supabase.from("therapists").select("id, slug");
  failOnError(therapistFetchError, "Fetching therapists failed");
  const therapistIdBySlug = new Map(therapistRows.map((therapist) => [therapist.slug, therapist.id]));

  const { error: subscriptionsError } = await supabase.from("subscriptions").upsert(
    [
      {
        user_id: userIdByEmail.get("therapist@masseurmatch.com"),
        tier: "featured",
        status: "active",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_end: "2026-04-14T12:00:00.000Z",
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
    { onConflict: "user_id" },
  );
  failOnError(subscriptionsError, "Upserting subscriptions failed");

  const { error: blogPostsError } = await supabase.from("blog_posts").upsert(
    blogPosts.map((post) => ({ ...post, published_at: timestamp, created_at: timestamp, updated_at: timestamp })),
    { onConflict: "slug" },
  );
  failOnError(blogPostsError, "Upserting blog posts failed");

  const { error: reviewsError } = await supabase.from("reviews").upsert(
    reviews.map((review) => ({
      id: review.id,
      therapist_id: therapistIdBySlug.get(review.therapistSlug),
      author_name: review.author_name,
      rating: review.rating,
      body: review.body,
      status: review.status,
      created_at: timestamp,
      updated_at: timestamp,
    })),
    { onConflict: "id" },
  );
  failOnError(reviewsError, "Upserting reviews failed");

  console.log("Supabase seed complete.");
  console.log("Admin: admin@masseurmatch.com / Admin@MM2025!");
  console.log("Therapist: therapist@masseurmatch.com / Therapist@MM2025!");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
