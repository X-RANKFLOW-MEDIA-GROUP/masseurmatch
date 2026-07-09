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
      let value = rest.join("=");
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
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
loadEnvFile(path.join(rootDir, ".env"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local or .env.");
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
    email: process.env.SEED_ADMIN_EMAIL || "admin@masseurmatch.com",
    password: process.env.SEED_ADMIN_PASSWORD,
    fullName: "MasseurMatch Admin",
    role: "admin",
  },
  {
    email: process.env.SEED_THERAPIST_EMAIL || "therapist@masseurmatch.com",
    password: process.env.SEED_THERAPIST_PASSWORD,
    fullName: "Leo Martinez",
    role: "provider",
  },
];

for (const u of seedUsers) {
  if (!u.password) {
    throw new Error(
      `Missing password env var for ${u.role}. Set SEED_ADMIN_PASSWORD and SEED_THERAPIST_PASSWORD.`,
    );
  }
}

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
  // ============================================
  // EXPANDED SEED DATA — 45 Therapists
  // ============================================
  // DALLAS (15 therapists)
  { slug: "marcus-chen-oak-lawn-dallas", userEmail: null, citySlug: "dallas", display_name: "Marcus Chen", state: "TX", bio: "Licensed massage therapist with 8 years of experience in deep-tissue and sports massage. Specializing in athletic recovery and chronic pain relief for the Oak Lawn and Uptown communities. Certified in myofascial release and trigger-point therapy. Proud LGBTQ+ ally providing a welcoming, judgment-free environment for all clients. Fluent in English and Mandarin. Perfect for athletes, desk workers, and anyone seeking therapeutic relief.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "sports-massage", "myofascial-release", "trigger-point"], keyword_slugs: ["athletic-recovery", "chronic-pain", "oak-lawn", "sports-massage", "trigger-point", "deep-tissue", "lgbtq-friendly"], languages: ["English", "Mandarin"], contact_email: "marcus@masseurmatch.local", phone: "+1-214-555-0101", website: "https://example.com", incall: true, outcall: true, price_range: "$80-$120", gay_friendly: true, inclusive: true, segments: ["athletes", "desk-workers", "pain-relief"], latitude: 32.7821, longitude: -96.8089, tier: "standard", status: "approved", view_count: 342, profile_completeness: 92 },
  { slug: "alexis-torres-oak-lawn-dallas", userEmail: null, citySlug: "dallas", display_name: "Alexis Torres", state: "TX", bio: "Experienced Swedish and relaxation massage specialist serving Oak Lawn for 6 years. Bilingual English/Spanish, dedicated to creating a serene, affirming space for LGBTQ+ clients and allies. Certified in aromatherapy and lymphatic drainage. Specializes in stress relief, anxiety reduction, and wellness maintenance. Perfect for those seeking a calming, professional experience with a warm touch.", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "relaxation", "aromatherapy", "lymphatic"], keyword_slugs: ["stress-relief", "swedish-massage", "aromatherapy", "oak-lawn", "relaxation", "anxiety", "lgbtq-affirming"], languages: ["English", "Spanish"], contact_email: "alexis@masseurmatch.local", phone: "+1-214-555-0102", website: "https://example.com", incall: true, outcall: false, price_range: "$60-$90", gay_friendly: true, inclusive: true, segments: ["stress-relief", "wellness", "anxiety"], latitude: 32.7845, longitude: -96.8112, tier: "free", status: "approved", view_count: 156, profile_completeness: 88 },
  { slug: "james-rivera-oak-lawn-dallas", userEmail: null, citySlug: "dallas", display_name: "James Rivera", state: "TX", bio: "Clinical massage therapist with 10+ years of experience in hot-stone, Thai, and deep-tissue massage. Located in Oak Lawn, serving Dallas's LGBTQ+ community with pride and professionalism. Licensed and certified in multiple modalities. Specializes in injury recovery, flexibility improvement, and full-body wellness. Friendly, discreet, and dedicated to your health goals. English/Spanish fluent.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["hot-stone", "thai", "deep-tissue", "relaxation"], keyword_slugs: ["thai-massage", "hot-stone", "injury-recovery", "flexibility", "oak-lawn", "deep-tissue", "lgbtq-owned"], languages: ["English", "Spanish"], contact_email: "james@masseurmatch.local", phone: "+1-214-555-0103", website: "https://example.com", incall: true, outcall: true, price_range: "$75-$110", gay_friendly: true, inclusive: true, segments: ["injury-recovery", "wellness", "flexibility"], latitude: 32.7802, longitude: -96.8067, tier: "standard", status: "approved", view_count: 478, profile_completeness: 95 },
  { slug: "derek-washington-oak-lawn-dallas", userEmail: null, citySlug: "dallas", display_name: "Derek Washington", state: "TX", bio: "Professional massage therapist specializing in sports medicine and prenatal massage. Serving the Oak Lawn community with evidence-based therapeutic techniques. Certified in prenatal care, myofascial release, and trigger-point therapy. Comfortable working with diverse bodies and needs. LGBTQ+ affirming, judgment-free space. Dedicated to pain management and recovery. Available for both incall and outcall services.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["prenatal", "myofascial-release", "trigger-point", "sports-massage"], keyword_slugs: ["prenatal-massage", "sports-medicine", "myofascial-release", "oak-lawn", "pregnancy", "trigger-point", "inclusive"], languages: ["English"], contact_email: "derek@masseurmatch.local", phone: "+1-214-555-0104", website: "https://example.com", incall: true, outcall: true, price_range: "$70-$105", gay_friendly: false, inclusive: true, segments: ["prenatal", "pregnancy", "sports-medicine"], latitude: 32.7876, longitude: -96.8094, tier: "pro", status: "approved", view_count: 521, profile_completeness: 94 },
  { slug: "nicolas-fontaine-oak-lawn-dallas", userEmail: null, citySlug: "dallas", display_name: "Nicolas Fontaine", state: "TX", bio: "Internationally trained massage therapist from France, now serving Oak Lawn with 12 years of expertise in Swedish, aromatherapy, and relaxation techniques. Bilingual (English/French). Creates a luxurious, calming environment perfect for stress relief and wellness. Known for attention to detail and personalized care. LGBTQ+-friendly with a focus on inclusive, affirming service. Premium experience at accessible rates.", photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "aromatherapy", "relaxation", "lymphatic"], keyword_slugs: ["french-trained", "aromatherapy", "luxury", "oak-lawn", "swedish-massage", "stress-relief", "lgbtq-affirming"], languages: ["English", "French"], contact_email: "nicolas@masseurmatch.local", phone: "+1-214-555-0105", website: "https://example.com", incall: true, outcall: false, price_range: "$85-$125", gay_friendly: true, inclusive: true, segments: ["wellness", "stress-relief", "luxury"], latitude: 32.7799, longitude: -96.8043, tier: "featured", status: "approved", view_count: 612, profile_completeness: 96 },
  { slug: "samantha-brooks-uptown-dallas", userEmail: null, citySlug: "dallas", display_name: "Samantha Brooks", state: "TX", bio: "Licensed massage therapist and wellness coach serving Uptown Dallas. 7 years of experience in deep-tissue, trigger-point therapy, and sports massage. Specializes in chronic pain management, athletic performance, and injury prevention. Certified and insured. LGBTQ+ proud and committed to creating a welcoming, safe space for all clients. Evidence-based, results-oriented approach to therapeutic massage.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "trigger-point", "sports-massage", "myofascial-release"], keyword_slugs: ["chronic-pain", "sports-massage", "uptown", "trigger-point", "athletic", "injury-prevention", "lgbtq-owned"], languages: ["English"], contact_email: "samantha@masseurmatch.local", phone: "+1-214-555-0106", website: "https://example.com", incall: true, outcall: true, price_range: "$75-$110", gay_friendly: true, inclusive: true, segments: ["athletes", "chronic-pain", "wellness"], latitude: 32.8142, longitude: -96.7975, tier: "standard", status: "approved", view_count: 289, profile_completeness: 91 },
  { slug: "david-park-uptown-dallas", userEmail: null, citySlug: "dallas", display_name: "David Park", state: "TX", bio: "Expert in Thai massage and reflexology, based in Uptown. 9 years of traditional and modern therapeutic techniques. Specializes in energy balance, flexibility, and holistic wellness. Licensed and certified. LGBTQ+-friendly professional dedicated to client comfort and health. English and Korean speaking. Perfect for those seeking alternative healing modalities and traditional techniques with a modern approach.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["thai", "reflexology", "relaxation", "aromatherapy"], keyword_slugs: ["thai-massage", "reflexology", "uptown", "energy-balance", "holistic", "flexibility", "lgbtq-friendly"], languages: ["English", "Korean"], contact_email: "david@masseurmatch.local", phone: "+1-214-555-0107", website: "https://example.com", incall: true, outcall: false, price_range: "$70-$100", gay_friendly: true, inclusive: true, segments: ["wellness", "flexibility", "holistic"], latitude: 32.8165, longitude: -96.7998, tier: "standard", status: "approved", view_count: 234, profile_completeness: 89 },
  { slug: "rachel-sullivan-uptown-dallas", userEmail: null, citySlug: "dallas", display_name: "Rachel Sullivan", state: "TX", bio: "Certified massage therapist and wellness specialist in Uptown, Dallas. 5 years of experience focusing on relaxation, stress management, and self-care. Swedish massage expert with additional training in hot-stone therapy and aromatherapy. Passionate about creating a peaceful environment for healing. LGBTQ+ affirming, inclusive space for all backgrounds and body types. Dedicated to your well-being.", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "hot-stone", "aromatherapy", "relaxation"], keyword_slugs: ["stress-relief", "swedish-massage", "uptown", "hot-stone", "self-care", "wellness", "lgbtq-affirming"], languages: ["English"], contact_email: "rachel@masseurmatch.local", phone: "+1-214-555-0108", website: "https://example.com", incall: true, outcall: false, price_range: "$65-$95", gay_friendly: false, inclusive: true, segments: ["stress-relief", "wellness", "self-care"], latitude: 32.8128, longitude: -96.7956, tier: "free", status: "approved", view_count: 198, profile_completeness: 86 },
  { slug: "christopher-lee-uptown-dallas", userEmail: null, citySlug: "dallas", display_name: "Christopher Lee", state: "TX", bio: "Licensed massage therapist with 11 years of clinical experience. Specializes in myofascial release, deep-tissue work, and injury rehabilitation. Located in Uptown, serving Dallas with evidence-based therapeutic methods. LGBTQ+ proud and dedicated to inclusive, affirming care. Excellent with chronic pain, post-surgical recovery, and athletic conditioning. Certified in multiple advanced techniques.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["myofascial-release", "deep-tissue", "trigger-point", "sports-massage"], keyword_slugs: ["myofascial-release", "injury-rehabilitation", "uptown", "chronic-pain", "post-surgical", "athletic", "lgbtq-owned"], languages: ["English"], contact_email: "christopher@masseurmatch.local", phone: "+1-214-555-0109", website: "https://example.com", incall: true, outcall: true, price_range: "$80-$120", gay_friendly: true, inclusive: true, segments: ["injury-recovery", "chronic-pain", "athletic"], latitude: 32.8151, longitude: -96.7981, tier: "pro", status: "approved", view_count: 445, profile_completeness: 93 },
  { slug: "isabella-santos-downtown-dallas", userEmail: null, citySlug: "dallas", display_name: "Isabella Santos", state: "TX", bio: "Professional massage therapist in Downtown Dallas serving corporate professionals and wellness seekers. 6 years of experience in Swedish, relaxation, and aromatherapy. Bilingual English/Portuguese and Spanish. Specializes in stress relief, tension reduction, and promoting overall wellness. LGBTQ+ affirming, creating a comfortable and inclusive environment for all clients. Perfect for busy professionals.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "relaxation", "aromatherapy", "lymphatic"], keyword_slugs: ["stress-relief", "downtown-dallas", "corporate", "swedish-massage", "wellness", "professional", "lgbtq-affirming"], languages: ["English", "Portuguese", "Spanish"], contact_email: "isabella@masseurmatch.local", phone: "+1-214-555-0110", website: "https://example.com", incall: true, outcall: true, price_range: "$70-$100", gay_friendly: true, inclusive: true, segments: ["corporate", "stress-relief", "wellness"], latitude: 32.7770, longitude: -96.7965, tier: "standard", status: "approved", view_count: 267, profile_completeness: 90 },
  { slug: "thomas-hunter-downtown-dallas", userEmail: null, citySlug: "dallas", display_name: "Thomas Hunter", state: "TX", bio: "Experienced deep-tissue and sports massage specialist in Downtown Dallas. 8 years of professional therapeutic practice. Expert in treating sports injuries, muscle tension, and mobility improvement. Certified in multiple therapeutic modalities. LGBTQ+ community member and proud advocate. Professional, discreet, results-focused approach. Serving Dallas's downtown professionals and athletes.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "sports-massage", "myofascial-release", "trigger-point"], keyword_slugs: ["sports-massage", "deep-tissue", "downtown-dallas", "sports-injuries", "mobility", "muscle-tension", "lgbtq-owned"], languages: ["English"], contact_email: "thomas@masseurmatch.local", phone: "+1-214-555-0111", website: "https://example.com", incall: true, outcall: false, price_range: "$75-$110", gay_friendly: true, inclusive: true, segments: ["sports", "injury-recovery", "mobility"], latitude: 32.7765, longitude: -96.7952, tier: "standard", status: "approved", view_count: 356, profile_completeness: 91 },
  { slug: "olivia-green-downtown-dallas", userEmail: null, citySlug: "dallas", display_name: "Olivia Green", state: "TX", bio: "Holistic wellness practitioner and licensed massage therapist in Downtown Dallas. 7 years combining Thai massage, reflexology, and aromatherapy for complete wellness. Specializes in energy balance, stress relief, and preventative health. LGBTQ+-friendly, creating a judgment-free space for all. Dedicated to helping clients achieve optimal well-being. Available for both incall and outcall services.", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["thai", "reflexology", "aromatherapy", "relaxation"], keyword_slugs: ["thai-massage", "reflexology", "downtown-dallas", "holistic", "energy-balance", "stress-relief", "lgbtq-friendly"], languages: ["English"], contact_email: "olivia@masseurmatch.local", phone: "+1-214-555-0112", website: "https://example.com", incall: true, outcall: true, price_range: "$68-$98", gay_friendly: false, inclusive: true, segments: ["wellness", "holistic", "stress-relief"], latitude: 32.7768, longitude: -96.7978, tier: "free", status: "approved", view_count: 183, profile_completeness: 87 },
  { slug: "michael-brady-fair-park-dallas", userEmail: null, citySlug: "dallas", display_name: "Michael Brady", state: "TX", bio: "Licensed therapeutic massage specialist near Fair Park. 9 years of expertise in deep-tissue, sports massage, and trigger-point therapy. Specializes in pain management, injury recovery, and performance optimization. LGBTQ+ proud, creating an inclusive, welcoming environment. Certified in multiple therapeutic disciplines. Professional, respectful approach to client care and privacy.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "sports-massage", "trigger-point", "myofascial-release"], keyword_slugs: ["deep-tissue", "sports-massage", "fair-park", "pain-management", "injury-recovery", "trigger-point", "lgbtq-owned"], languages: ["English"], contact_email: "michael@masseurmatch.local", phone: "+1-214-555-0113", website: "https://example.com", incall: true, outcall: true, price_range: "$76-$108", gay_friendly: true, inclusive: true, segments: ["injury-recovery", "pain-relief", "sports"], latitude: 32.7682, longitude: -96.7636, tier: "standard", status: "approved", view_count: 312, profile_completeness: 89 },
  { slug: "vanessa-cole-east-dallas-dallas", userEmail: null, citySlug: "dallas", display_name: "Vanessa Cole", state: "TX", bio: "Wellness-focused massage therapist serving East Dallas. 5 years combining Swedish, relaxation, and aromatherapy techniques. Specializes in stress relief, self-care, and preventative wellness. LGBTQ+ affirming, creating a safe space for all clients. Bilingual English/Spanish. Perfect for those seeking accessible, affordable, high-quality therapeutic massage in a welcoming environment.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "relaxation", "aromatherapy", "lymphatic"], keyword_slugs: ["stress-relief", "swedish-massage", "east-dallas", "wellness", "self-care", "affordable", "lgbtq-affirming"], languages: ["English", "Spanish"], contact_email: "vanessa@masseurmatch.local", phone: "+1-214-555-0114", website: "https://example.com", incall: true, outcall: false, price_range: "$55-$85", gay_friendly: true, inclusive: true, segments: ["wellness", "stress-relief", "self-care"], latitude: 32.7912, longitude: -96.7254, tier: "free", status: "approved", view_count: 127, profile_completeness: 85 },
  { slug: "ryan-martinez-lakewood-dallas", userEmail: null, citySlug: "dallas", display_name: "Ryan Martinez", state: "TX", bio: "Professional massage therapist in Lakewood area. 10 years of experience in comprehensive therapeutic massage including deep-tissue, hot-stone, and myofascial release. Bilingual English/Spanish. Specializes in chronic pain, mobility improvement, and holistic wellness. LGBTQ+-friendly professional dedicated to creating a judgment-free, inclusive treatment experience for all clients.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "hot-stone", "myofascial-release", "relaxation"], keyword_slugs: ["deep-tissue", "hot-stone", "lakewood", "chronic-pain", "mobility", "holistic", "lgbtq-friendly"], languages: ["English", "Spanish"], contact_email: "ryan@masseurmatch.local", phone: "+1-214-555-0115", website: "https://example.com", incall: true, outcall: true, price_range: "$72-$105", gay_friendly: false, inclusive: true, segments: ["chronic-pain", "wellness", "mobility"], latitude: 32.8347, longitude: -96.7436, tier: "standard", status: "approved", view_count: 398, profile_completeness: 92 },
  // HOUSTON (15 therapists)
  { slug: "eric-williams-montrose-houston", userEmail: null, citySlug: "houston", display_name: "Eric Williams", state: "TX", bio: "Licensed massage therapist and LGBTQ+ community leader in Montrose. 8 years of experience in deep-tissue, sports massage, and myofascial release. Specializes in pain management, athletic recovery, and injury prevention. Certified in multiple therapeutic modalities. Proud LGBTQ+ business owner creating an affirming, safe space for all clients. Professional, confidential, results-oriented approach.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "sports-massage", "myofascial-release", "trigger-point"], keyword_slugs: ["deep-tissue", "sports-massage", "montrose", "pain-management", "lgbtq-owned", "myofascial-release", "injury-recovery"], languages: ["English"], contact_email: "eric@masseurmatch.local", phone: "+1-713-555-0201", website: "https://example.com", incall: true, outcall: true, price_range: "$80-$120", gay_friendly: true, inclusive: true, segments: ["athletes", "pain-relief", "injury-recovery"], latitude: 29.7497, longitude: -95.4196, tier: "pro", status: "approved", view_count: 567, profile_completeness: 95 },
  { slug: "patricia-chen-montrose-houston", userEmail: null, citySlug: "houston", display_name: "Patricia Chen", state: "TX", bio: "Holistic wellness specialist and licensed massage therapist in Montrose. 7 years of experience in Thai massage, reflexology, and aromatherapy. Bilingual English/Mandarin. Specializes in energy balance, stress relief, and preventative health. LGBTQ+-friendly, creating a welcoming environment for all. Dedicated to whole-body wellness and sustainable health practices.", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["thai", "reflexology", "aromatherapy", "relaxation"], keyword_slugs: ["thai-massage", "reflexology", "montrose", "holistic", "energy-balance", "stress-relief", "lgbtq-friendly"], languages: ["English", "Mandarin"], contact_email: "patricia@masseurmatch.local", phone: "+1-713-555-0202", website: "https://example.com", incall: true, outcall: false, price_range: "$70-$105", gay_friendly: true, inclusive: true, segments: ["wellness", "holistic", "stress-relief"], latitude: 29.7512, longitude: -95.4182, tier: "standard", status: "approved", view_count: 289, profile_completeness: 90 },
  { slug: "andrew-foster-montrose-houston", userEmail: null, citySlug: "houston", display_name: "Andrew Foster", state: "TX", bio: "Clinical massage therapist with 11 years of experience in Montrose. Specializes in sports medicine, injury rehabilitation, and chronic pain management. Certified in myofascial release and trigger-point therapy. LGBTQ+ proud professional dedicated to evidence-based care. Creating a comfortable, inclusive space for therapeutic healing. Serving athletes, desk workers, and anyone seeking pain relief.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["sports-massage", "myofascial-release", "trigger-point", "deep-tissue"], keyword_slugs: ["sports-medicine", "myofascial-release", "montrose", "injury-rehabilitation", "chronic-pain", "lgbtq-owned", "evidence-based"], languages: ["English"], contact_email: "andrew@masseurmatch.local", phone: "+1-713-555-0203", website: "https://example.com", incall: true, outcall: true, price_range: "$85-$125", gay_friendly: true, inclusive: true, segments: ["athletes", "chronic-pain", "injury-recovery"], latitude: 29.7489, longitude: -95.4208, tier: "pro", status: "approved", view_count: 523, profile_completeness: 94 },
  { slug: "jessica-torres-montrose-houston", userEmail: null, citySlug: "houston", display_name: "Jessica Torres", state: "TX", bio: "Professional massage therapist specializing in prenatal and relaxation massage in Montrose. 6 years of experience. Certified in prenatal care, Swedish massage, and aromatherapy. Bilingual English/Spanish. LGBTQ+-affirming space committed to supporting all bodies and life stages. Compassionate, gentle approach to therapeutic care. Perfect for pregnancy, self-care, and wellness.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["prenatal", "swedish", "aromatherapy", "relaxation"], keyword_slugs: ["prenatal-massage", "pregnancy", "montrose", "swedish-massage", "aromatherapy", "stress-relief", "lgbtq-affirming"], languages: ["English", "Spanish"], contact_email: "jessica@masseurmatch.local", phone: "+1-713-555-0204", website: "https://example.com", incall: true, outcall: false, price_range: "$65-$95", gay_friendly: false, inclusive: true, segments: ["prenatal", "pregnancy", "wellness"], latitude: 29.7505, longitude: -95.4189, tier: "free", status: "approved", view_count: 156, profile_completeness: 88 },
  { slug: "gabriel-santos-montrose-houston", userEmail: null, citySlug: "houston", display_name: "Gabriel Santos", state: "TX", bio: "Luxury spa massage therapist and wellness expert in Montrose. 9 years of premium service delivery in Swedish, hot-stone, and aromatherapy massage. Bilingual English/Portuguese and Spanish. Creates a luxurious, calming environment for ultimate relaxation. LGBTQ+ community member and inclusive professional. Perfect for special occasions, corporate events, and ongoing wellness programs.", photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "hot-stone", "aromatherapy", "relaxation"], keyword_slugs: ["luxury-spa", "swedish-massage", "montrose", "hot-stone", "relaxation", "wellness", "lgbtq-owned"], languages: ["English", "Portuguese", "Spanish"], contact_email: "gabriel@masseurmatch.local", phone: "+1-713-555-0205", website: "https://example.com", incall: true, outcall: true, price_range: "$90-$140", gay_friendly: true, inclusive: true, segments: ["wellness", "luxury", "relaxation"], latitude: 29.7500, longitude: -95.4200, tier: "featured", status: "approved", view_count: 654, profile_completeness: 96 },
  { slug: "laura-jackson-heights-houston", userEmail: null, citySlug: "houston", display_name: "Laura Jackson", state: "TX", bio: "Licensed massage therapist serving the Heights area. 5 years of experience in deep-tissue and sports massage. Specializes in athletic recovery, muscle tension relief, and performance optimization. LGBTQ+ affirming, professional, and committed to client care. Certified in multiple therapeutic techniques. Available for both incall and outcall services.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "sports-massage", "myofascial-release", "trigger-point"], keyword_slugs: ["deep-tissue", "sports-massage", "heights", "athletic-recovery", "muscle-tension", "trigger-point", "lgbtq-affirming"], languages: ["English"], contact_email: "laura@masseurmatch.local", phone: "+1-713-555-0206", website: "https://example.com", incall: true, outcall: true, price_range: "$70-$100", gay_friendly: false, inclusive: true, segments: ["athletes", "muscle-tension", "recovery"], latitude: 29.7895, longitude: -95.4081, tier: "standard", status: "approved", view_count: 234, profile_completeness: 89 },
  { slug: "marcus-williams-heights-houston", userEmail: null, citySlug: "houston", display_name: "Marcus Williams", state: "TX", bio: "Wellness-focused massage therapist in the Heights. 7 years of experience in Thai massage, reflexology, and holistic healing. Specializes in energy balance, stress management, and preventative wellness. LGBTQ+ proud professional creating an inclusive, welcoming space. Dedicated to supporting clients in achieving optimal health and well-being.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["thai", "reflexology", "relaxation", "aromatherapy"], keyword_slugs: ["thai-massage", "reflexology", "heights", "energy-balance", "stress-management", "holistic", "lgbtq-owned"], languages: ["English"], contact_email: "marcus@masseurmatch.local", phone: "+1-713-555-0207", website: "https://example.com", incall: true, outcall: false, price_range: "$68-$98", gay_friendly: true, inclusive: true, segments: ["wellness", "stress-relief", "holistic"], latitude: 29.7912, longitude: -95.4095, tier: "free", status: "approved", view_count: 178, profile_completeness: 86 },
  { slug: "sophia-rodriguez-heights-houston", userEmail: null, citySlug: "houston", display_name: "Sophia Rodriguez", state: "TX", bio: "Professional massage therapist specializing in relaxation and wellness in the Heights. 6 years of experience in Swedish massage, aromatherapy, and hot-stone therapy. Bilingual English/Spanish. LGBTQ+-affirming, creating a safe, comfortable space for all clients. Focused on stress relief, self-care, and promoting overall wellness and life balance.", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "aromatherapy", "hot-stone", "relaxation"], keyword_slugs: ["swedish-massage", "aromatherapy", "heights", "hot-stone", "stress-relief", "self-care", "lgbtq-affirming"], languages: ["English", "Spanish"], contact_email: "sophia@masseurmatch.local", phone: "+1-713-555-0208", website: "https://example.com", incall: true, outcall: false, price_range: "$62-$92", gay_friendly: false, inclusive: true, segments: ["stress-relief", "wellness", "self-care"], latitude: 29.7878, longitude: -95.4067, tier: "free", status: "approved", view_count: 142, profile_completeness: 85 },
  { slug: "kevin-lee-downtown-houston", userEmail: null, citySlug: "houston", display_name: "Kevin Lee", state: "TX", bio: "Licensed therapeutic massage specialist in Downtown Houston. 10 years of clinical experience in deep-tissue, myofascial release, and sports medicine. Bilingual English/Mandarin. Specializes in injury recovery, chronic pain management, and performance enhancement. LGBTQ+ proud, dedicated to creating an inclusive, professional environment. Serving Houston's corporate professionals and athletes.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "myofascial-release", "sports-massage", "trigger-point"], keyword_slugs: ["deep-tissue", "myofascial-release", "downtown-houston", "sports-medicine", "chronic-pain", "injury-recovery", "lgbtq-owned"], languages: ["English", "Mandarin"], contact_email: "kevin@masseurmatch.local", phone: "+1-713-555-0209", website: "https://example.com", incall: true, outcall: true, price_range: "$82-$125", gay_friendly: true, inclusive: true, segments: ["chronic-pain", "injury-recovery", "corporate"], latitude: 29.7604, longitude: -95.3863, tier: "pro", status: "approved", view_count: 489, profile_completeness: 93 },
  { slug: "natalie-green-downtown-houston", userEmail: null, citySlug: "houston", display_name: "Natalie Green", state: "TX", bio: "Wellness and corporate massage specialist in Downtown Houston. 7 years of experience delivering Swedish, relaxation, and aromatherapy massage to busy professionals. LGBTQ+-friendly, creating a comfortable escape from the downtown hustle. Certified in stress management and wellness coaching. Perfect for corporate events, chair massage, and ongoing wellness programs.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "relaxation", "aromatherapy", "lymphatic"], keyword_slugs: ["corporate-massage", "swedish-massage", "downtown-houston", "stress-relief", "wellness", "chair-massage", "lgbtq-affirming"], languages: ["English"], contact_email: "natalie@masseurmatch.local", phone: "+1-713-555-0210", website: "https://example.com", incall: true, outcall: true, price_range: "$70-$105", gay_friendly: false, inclusive: true, segments: ["corporate", "stress-relief", "wellness"], latitude: 29.7598, longitude: -95.3875, tier: "standard", status: "approved", view_count: 267, profile_completeness: 88 },
  { slug: "james-cooper-downtown-houston", userEmail: null, citySlug: "houston", display_name: "James Cooper", state: "TX", bio: "Expert therapeutic massage practitioner in Downtown Houston with 9 years of clinical experience. Specializes in deep-tissue work, trigger-point therapy, and myofascial release. LGBTQ+ community member committed to inclusive, affirming care. Excellent with chronic pain, post-surgical recovery, and athletic conditioning. Professional, confidential, results-oriented service.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "trigger-point", "myofascial-release", "sports-massage"], keyword_slugs: ["deep-tissue", "trigger-point", "downtown-houston", "myofascial-release", "post-surgical", "chronic-pain", "lgbtq-owned"], languages: ["English"], contact_email: "james@masseurmatch.local", phone: "+1-713-555-0211", website: "https://example.com", incall: true, outcall: false, price_range: "$80-$120", gay_friendly: true, inclusive: true, segments: ["chronic-pain", "injury-recovery", "athletics"], latitude: 29.7610, longitude: -95.3850, tier: "standard", status: "approved", view_count: 356, profile_completeness: 91 },
  { slug: "rachel-phillips-downtown-houston", userEmail: null, citySlug: "houston", display_name: "Rachel Phillips", state: "TX", bio: "Holistic wellness practitioner and licensed massage therapist in Downtown Houston. 8 years of experience combining Thai massage, reflexology, and energy work. Specializes in holistic healing, stress relief, and preventative wellness. LGBTQ+ affirming, creating a judgment-free space for all clients. Dedicated to supporting sustainable health and well-being.", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["thai", "reflexology", "aromatherapy", "relaxation"], keyword_slugs: ["thai-massage", "reflexology", "downtown-houston", "holistic", "stress-relief", "preventative", "lgbtq-affirming"], languages: ["English"], contact_email: "rachel@masseurmatch.local", phone: "+1-713-555-0212", website: "https://example.com", incall: true, outcall: true, price_range: "$72-$105", gay_friendly: false, inclusive: true, segments: ["wellness", "holistic", "stress-relief"], latitude: 29.7615, longitude: -95.3892, tier: "free", status: "approved", view_count: 198, profile_completeness: 87 },
  { slug: "david-brooks-midtown-houston", userEmail: null, citySlug: "houston", display_name: "David Brooks", state: "TX", bio: "Licensed massage therapist serving Midtown Houston. 6 years of experience in sports massage, deep-tissue, and myofascial release. Specializes in athletic performance, injury prevention, and recovery. LGBTQ+ proud professional providing inclusive, affirming service. Serving Houston's active community with evidence-based therapeutic techniques.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["sports-massage", "deep-tissue", "myofascial-release", "trigger-point"], keyword_slugs: ["sports-massage", "deep-tissue", "midtown", "athletic-performance", "injury-prevention", "myofascial-release", "lgbtq-owned"], languages: ["English"], contact_email: "david@masseurmatch.local", phone: "+1-713-555-0213", website: "https://example.com", incall: true, outcall: true, price_range: "$75-$110", gay_friendly: true, inclusive: true, segments: ["athletes", "injury-prevention", "recovery"], latitude: 29.7480, longitude: -95.3895, tier: "standard", status: "approved", view_count: 312, profile_completeness: 90 },
  { slug: "isabella-diaz-west-houston-houston", userEmail: null, citySlug: "houston", display_name: "Isabella Diaz", state: "TX", bio: "Bilingual massage therapist serving West Houston. 5 years of experience in Swedish massage, relaxation, and aromatherapy. Specializes in stress relief, wellness, and self-care. Spanish/English fluent. LGBTQ+-affirming professional creating a welcoming environment for all. Focused on helping clients relax, recharge, and maintain optimal health.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "relaxation", "aromatherapy", "lymphatic"], keyword_slugs: ["swedish-massage", "relaxation", "west-houston", "stress-relief", "wellness", "bilingual", "lgbtq-affirming"], languages: ["English", "Spanish"], contact_email: "isabella@masseurmatch.local", phone: "+1-713-555-0214", website: "https://example.com", incall: true, outcall: false, price_range: "$60-$90", gay_friendly: false, inclusive: true, segments: ["stress-relief", "wellness", "self-care"], latitude: 29.7365, longitude: -95.5209, tier: "free", status: "approved", view_count: 121, profile_completeness: 86 },
  { slug: "alexander-chen-sugar-land-houston", userEmail: null, citySlug: "houston", display_name: "Alexander Chen", state: "TX", bio: "Professional massage therapist in Sugar Land area. 8 years of experience in comprehensive therapeutic massage including Thai, deep-tissue, and hot-stone techniques. Bilingual English/Mandarin. Specializes in pain management, flexibility improvement, and holistic wellness. LGBTQ+-friendly professional creating an inclusive, professional treatment space.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["thai", "deep-tissue", "hot-stone", "relaxation"], keyword_slugs: ["thai-massage", "deep-tissue", "sugar-land", "pain-management", "flexibility", "hot-stone", "lgbtq-affirming"], languages: ["English", "Mandarin"], contact_email: "alexander@masseurmatch.local", phone: "+1-713-555-0215", website: "https://example.com", incall: true, outcall: true, price_range: "$70-$105", gay_friendly: true, inclusive: true, segments: ["pain-relief", "flexibility", "wellness"], latitude: 29.6196, longitude: -95.6138, tier: "standard", status: "approved", view_count: 267, profile_completeness: 89 },
  // AUSTIN (15 therapists)
  { slug: "carlos-mendoza-east-austin-austin", userEmail: null, citySlug: "austin", display_name: "Carlos Mendoza", state: "TX", bio: "Licensed massage therapist serving East Austin. 9 years of experience in deep-tissue, sports massage, and myofascial release. Bilingual English/Spanish. Specializes in injury recovery, athletic performance, and pain management. LGBTQ+ community member dedicated to creating an inclusive, affirming therapeutic space. Professional, confidential, results-oriented approach.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "sports-massage", "myofascial-release", "trigger-point"], keyword_slugs: ["deep-tissue", "sports-massage", "east-austin", "injury-recovery", "myofascial-release", "bilingual", "lgbtq-owned"], languages: ["English", "Spanish"], contact_email: "carlos@masseurmatch.local", phone: "+1-512-555-0301", website: "https://example.com", incall: true, outcall: true, price_range: "$75-$110", gay_friendly: true, inclusive: true, segments: ["athletes", "injury-recovery", "pain-relief"], latitude: 30.2709, longitude: -97.7360, tier: "standard", status: "approved", view_count: 398, profile_completeness: 91 },
  { slug: "anita-kumar-east-austin-austin", userEmail: null, citySlug: "austin", display_name: "Anita Kumar", state: "TX", bio: "Holistic wellness specialist in East Austin. 7 years of experience in Thai massage, reflexology, and energy work. Bilingual English/Hindi. Specializes in holistic healing, stress relief, and preventative wellness. LGBTQ+-affirming, creating a welcoming space for all clients. Dedicated to supporting sustainable health and whole-body wellness.", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["thai", "reflexology", "relaxation", "aromatherapy"], keyword_slugs: ["thai-massage", "reflexology", "east-austin", "holistic", "stress-relief", "energy-work", "lgbtq-affirming"], languages: ["English", "Hindi"], contact_email: "anita@masseurmatch.local", phone: "+1-512-555-0302", website: "https://example.com", incall: true, outcall: false, price_range: "$68-$98", gay_friendly: false, inclusive: true, segments: ["wellness", "holistic", "stress-relief"], latitude: 30.2724, longitude: -97.7385, tier: "free", status: "approved", view_count: 156, profile_completeness: 87 },
  { slug: "jordan-ellis-east-austin-austin", userEmail: null, citySlug: "austin", display_name: "Jordan Ellis", state: "TX", bio: "Licensed therapeutic massage specialist in East Austin. 6 years of clinical experience in myofascial release, trigger-point therapy, and sports medicine. LGBTQ+ proud professional creating an inclusive, affirming space. Specializes in chronic pain, post-injury recovery, and performance enhancement. Evidence-based, client-centered approach to healing.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["myofascial-release", "trigger-point", "sports-massage", "deep-tissue"], keyword_slugs: ["myofascial-release", "trigger-point", "east-austin", "chronic-pain", "sports-medicine", "evidence-based", "lgbtq-owned"], languages: ["English"], contact_email: "jordan@masseurmatch.local", phone: "+1-512-555-0303", website: "https://example.com", incall: true, outcall: true, price_range: "$72-$105", gay_friendly: true, inclusive: true, segments: ["chronic-pain", "injury-recovery", "sports"], latitude: 30.2698, longitude: -97.7345, tier: "standard", status: "approved", view_count: 312, profile_completeness: 90 },
  { slug: "sophia-oliveira-east-austin-austin", userEmail: null, citySlug: "austin", display_name: "Sophia Oliveira", state: "TX", bio: "Wellness and relaxation specialist in East Austin. 5 years of experience in Swedish massage, aromatherapy, and stress relief. Portuguese/English bilingual. LGBTQ+-affirming professional dedicated to creating a peaceful, inclusive space. Specializes in self-care, anxiety relief, and supporting clients in their wellness journey.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "aromatherapy", "relaxation", "lymphatic"], keyword_slugs: ["swedish-massage", "aromatherapy", "east-austin", "stress-relief", "anxiety", "self-care", "lgbtq-affirming"], languages: ["English", "Portuguese"], contact_email: "sophia@masseurmatch.local", phone: "+1-512-555-0304", website: "https://example.com", incall: true, outcall: false, price_range: "$60-$90", gay_friendly: false, inclusive: true, segments: ["stress-relief", "anxiety", "self-care"], latitude: 30.2715, longitude: -97.7370, tier: "free", status: "approved", view_count: 134, profile_completeness: 85 },
  { slug: "michael-torres-downtown-austin", userEmail: null, citySlug: "austin", display_name: "Michael Torres", state: "TX", bio: "Professional massage therapist in Downtown Austin. 8 years of experience in deep-tissue, sports massage, and recovery work. Specializes in athletic performance, injury prevention, and chronic pain management. LGBTQ+ community member dedicated to inclusive, affirming care. Serving Austin's active, diverse population with evidence-based therapeutic methods.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "sports-massage", "trigger-point", "myofascial-release"], keyword_slugs: ["deep-tissue", "sports-massage", "downtown-austin", "athletic-performance", "chronic-pain", "injury-prevention", "lgbtq-owned"], languages: ["English"], contact_email: "michael@masseurmatch.local", phone: "+1-512-555-0305", website: "https://example.com", incall: true, outcall: true, price_range: "$78-$115", gay_friendly: true, inclusive: true, segments: ["athletes", "chronic-pain", "injury-recovery"], latitude: 30.2672, longitude: -97.7431, tier: "pro", status: "approved", view_count: 534, profile_completeness: 94 },
  { slug: "elena-santos-downtown-austin", userEmail: null, citySlug: "austin", display_name: "Elena Santos", state: "TX", bio: "Licensed massage therapist and wellness coach in Downtown Austin. 6 years of experience in relaxation, stress relief, and holistic wellness. Spanish/English bilingual. LGBTQ+-affirming, creating a welcoming space for all clients. Specializes in supporting busy professionals and individuals seeking sustainable wellness and self-care.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["relaxation", "swedish", "aromatherapy", "lymphatic"], keyword_slugs: ["stress-relief", "relaxation", "downtown-austin", "wellness", "self-care", "bilingual", "lgbtq-affirming"], languages: ["English", "Spanish"], contact_email: "elena@masseurmatch.local", phone: "+1-512-555-0306", website: "https://example.com", incall: true, outcall: false, price_range: "$65-$95", gay_friendly: false, inclusive: true, segments: ["stress-relief", "wellness", "corporate"], latitude: 30.2665, longitude: -97.7425, tier: "standard", status: "approved", view_count: 234, profile_completeness: 88 },
  { slug: "tyler-johnson-downtown-austin", userEmail: null, citySlug: "austin", display_name: "Tyler Johnson", state: "TX", bio: "Certified therapeutic massage specialist in Downtown Austin. 7 years of clinical experience in myofascial release, deep-tissue work, and recovery modalities. LGBTQ+ proud professional committed to inclusive, affirming care. Excellent with pain management, athletic conditioning, and post-injury rehabilitation. Evidence-based, professional approach.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["myofascial-release", "deep-tissue", "trigger-point", "sports-massage"], keyword_slugs: ["myofascial-release", "deep-tissue", "downtown-austin", "pain-management", "post-injury", "athletic", "lgbtq-owned"], languages: ["English"], contact_email: "tyler@masseurmatch.local", phone: "+1-512-555-0307", website: "https://example.com", incall: true, outcall: true, price_range: "$75-$110", gay_friendly: true, inclusive: true, segments: ["injury-recovery", "pain-relief", "athletics"], latitude: 30.2678, longitude: -97.7418, tier: "standard", status: "approved", view_count: 289, profile_completeness: 91 },
  { slug: "jasmine-wong-downtown-austin", userEmail: null, citySlug: "austin", display_name: "Jasmine Wong", state: "TX", bio: "Luxury spa and wellness specialist in Downtown Austin. 10 years of premium service in Thai massage, hot-stone therapy, and aromatherapy. Bilingual English/Mandarin. Creates a luxurious, calming environment for optimal relaxation. LGBTQ+-friendly professional dedicated to exceptional client care. Perfect for special occasions and ongoing wellness.", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["thai", "hot-stone", "aromatherapy", "relaxation"], keyword_slugs: ["thai-massage", "luxury-spa", "downtown-austin", "hot-stone", "aromatherapy", "premium", "lgbtq-affirming"], languages: ["English", "Mandarin"], contact_email: "jasmine@masseurmatch.local", phone: "+1-512-555-0308", website: "https://example.com", incall: true, outcall: false, price_range: "$95-$145", gay_friendly: false, inclusive: true, segments: ["wellness", "luxury", "relaxation"], latitude: 30.2680, longitude: -97.7438, tier: "featured", status: "approved", view_count: 687, profile_completeness: 96 },
  { slug: "lucas-garcia-south-austin-austin", userEmail: null, citySlug: "austin", display_name: "Lucas Garcia", state: "TX", bio: "Licensed massage therapist serving South Austin. 7 years of experience in deep-tissue, sports massage, and recovery work. Spanish/English bilingual. Specializes in athletic performance, injury rehabilitation, and pain management. LGBTQ+ community member committed to inclusive, professional care. Perfect for athletes and anyone seeking therapeutic relief.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "sports-massage", "myofascial-release", "trigger-point"], keyword_slugs: ["deep-tissue", "sports-massage", "south-austin", "athletic-performance", "injury-rehabilitation", "bilingual", "lgbtq-owned"], languages: ["English", "Spanish"], contact_email: "lucas@masseurmatch.local", phone: "+1-512-555-0309", website: "https://example.com", incall: true, outcall: true, price_range: "$70-$105", gay_friendly: true, inclusive: true, segments: ["athletes", "injury-recovery", "sports"], latitude: 30.2308, longitude: -97.7392, tier: "standard", status: "approved", view_count: 267, profile_completeness: 89 },
  { slug: "amanda-davies-south-austin-austin", userEmail: null, citySlug: "austin", display_name: "Amanda Davies", state: "TX", bio: "Wellness and holistic massage specialist in South Austin. 6 years of experience in Swedish, Thai, and relaxation massage. Specializes in stress relief, self-care, and preventative wellness. LGBTQ+-affirming, creating a welcoming space for all clients. Committed to supporting sustainable health and community wellness.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["swedish", "thai", "relaxation", "aromatherapy"], keyword_slugs: ["swedish-massage", "thai-massage", "south-austin", "stress-relief", "self-care", "wellness", "lgbtq-affirming"], languages: ["English"], contact_email: "amanda@masseurmatch.local", phone: "+1-512-555-0310", website: "https://example.com", incall: true, outcall: false, price_range: "$62-$92", gay_friendly: false, inclusive: true, segments: ["stress-relief", "wellness", "self-care"], latitude: 30.2315, longitude: -97.7405, tier: "free", status: "approved", view_count: 145, profile_completeness: 86 },
  { slug: "robert-lee-south-austin-austin", userEmail: null, citySlug: "austin", display_name: "Robert Lee", state: "TX", bio: "Professional therapeutic massage specialist in South Austin. 9 years of clinical experience in myofascial release, trigger-point therapy, and sports medicine. Specializes in chronic pain, post-surgical recovery, and performance optimization. LGBTQ+ proud, creating an inclusive, professional environment. Evidence-based, client-centered approach to healing.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["myofascial-release", "trigger-point", "deep-tissue", "sports-massage"], keyword_slugs: ["myofascial-release", "trigger-point", "south-austin", "chronic-pain", "post-surgical", "sports-medicine", "lgbtq-owned"], languages: ["English"], contact_email: "robert@masseurmatch.local", phone: "+1-512-555-0311", website: "https://example.com", incall: true, outcall: true, price_range: "$80-$120", gay_friendly: true, inclusive: true, segments: ["chronic-pain", "injury-recovery", "athletics"], latitude: 30.2298, longitude: -97.7378, tier: "pro", status: "approved", view_count: 456, profile_completeness: 93 },
  { slug: "natasha-diaz-north-austin-austin", userEmail: null, citySlug: "austin", display_name: "Natasha Diaz", state: "TX", bio: "Licensed massage therapist in North Austin. 5 years of experience in relaxation, stress relief, and wellness support. Spanish/English bilingual. Specializes in self-care, anxiety management, and supporting clients in their wellness journey. LGBTQ+-affirming professional creating a peaceful, inclusive space for all.", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1559599810-46d8d7139e14?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["relaxation", "swedish", "aromatherapy", "lymphatic"], keyword_slugs: ["relaxation", "stress-relief", "north-austin", "anxiety-management", "self-care", "bilingual", "lgbtq-affirming"], languages: ["English", "Spanish"], contact_email: "natasha@masseurmatch.local", phone: "+1-512-555-0312", website: "https://example.com", incall: true, outcall: false, price_range: "$60-$90", gay_friendly: false, inclusive: true, segments: ["stress-relief", "anxiety", "self-care"], latitude: 30.3860, longitude: -97.7236, tier: "free", status: "approved", view_count: 118, profile_completeness: 85 },
  { slug: "daniel-morrison-north-austin-austin", userEmail: null, citySlug: "austin", display_name: "Daniel Morrison", state: "TX", bio: "Professional sports massage and deep-tissue specialist in North Austin. 8 years of experience serving athletes and active individuals. Specializes in athletic performance, injury prevention, and recovery optimization. LGBTQ+ proud professional creating an inclusive, professional environment. Excellent with mobility work and functional recovery.", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["sports-massage", "deep-tissue", "myofascial-release", "trigger-point"], keyword_slugs: ["sports-massage", "deep-tissue", "north-austin", "athletic-performance", "injury-prevention", "mobility", "lgbtq-owned"], languages: ["English"], contact_email: "daniel@masseurmatch.local", phone: "+1-512-555-0313", website: "https://example.com", incall: true, outcall: true, price_range: "$75-$110", gay_friendly: true, inclusive: true, segments: ["athletes", "injury-prevention", "sports"], latitude: 30.3875, longitude: -97.7220, tier: "standard", status: "approved", view_count: 343, profile_completeness: 90 },
  { slug: "victoria-brooks-north-austin-austin", userEmail: null, citySlug: "austin", display_name: "Victoria Brooks", state: "TX", bio: "Holistic wellness practitioner and licensed massage therapist in North Austin. 7 years of experience in Thai massage, reflexology, and energy work. Specializes in holistic healing, preventative wellness, and stress relief. LGBTQ+-affirming, creating a judgment-free space for all clients. Dedicated to supporting sustainable health practices.", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["thai", "reflexology", "aromatherapy", "relaxation"], keyword_slugs: ["thai-massage", "reflexology", "north-austin", "holistic", "preventative-wellness", "stress-relief", "lgbtq-affirming"], languages: ["English"], contact_email: "victoria@masseurmatch.local", phone: "+1-512-555-0314", website: "https://example.com", incall: true, outcall: true, price_range: "$68-$98", gay_friendly: false, inclusive: true, segments: ["wellness", "holistic", "stress-relief"], latitude: 30.3855, longitude: -97.7250, tier: "standard", status: "approved", view_count: 267, profile_completeness: 89 },
  { slug: "noah-palmer-north-austin-austin", userEmail: null, citySlug: "austin", display_name: "Noah Palmer", state: "TX", bio: "Certified therapeutic massage specialist in North Austin. 10 years of clinical experience in deep-tissue work, myofascial release, and pain management. LGBTQ+ community member dedicated to inclusive, affirming care. Specializes in chronic pain, post-injury rehabilitation, and athletic conditioning. Evidence-based, professional approach to client wellness.", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", gallery: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1600881555147-ae82b1b17368?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"], modalities: ["deep-tissue", "myofascial-release", "trigger-point", "sports-massage"], keyword_slugs: ["deep-tissue", "myofascial-release", "north-austin", "chronic-pain", "post-injury", "athletic-conditioning", "lgbtq-owned"], languages: ["English"], contact_email: "noah@masseurmatch.local", phone: "+1-512-555-0315", website: "https://example.com", incall: true, outcall: true, price_range: "$82-$125", gay_friendly: true, inclusive: true, segments: ["chronic-pain", "injury-recovery", "athletics"], latitude: 30.3870, longitude: -97.7210, tier: "pro", status: "approved", view_count: 512, profile_completeness: 94 },
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
  // Try to create the user first; if they already exist, find and update them.
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { full_name: fullName },
  });

  if (!createError && createData?.user) {
    console.log(`  Created ${role}: ${email}`);
    return createData.user;
  }

  // User already exists — find them by paginating in small batches.
  if (createError.status === 422 || createError.message?.toLowerCase().includes("already")) {
    let page = 1;
    while (page > 0) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage: 20,
      });

      if (error) {
        throw error;
      }

      const users = Array.isArray(data.users) ? data.users : [];
      const match = users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase());

      if (match) {
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(match.id, {
          password,
          email_confirm: true,
          app_metadata: { role },
          user_metadata: { full_name: fullName },
        });

        if (updateError) {
          throw updateError;
        }

        console.log(`  Updated ${role}: ${email}`);
        return updateData.user;
      }

      page = data.nextPage ?? 0;
    }

    throw new Error(`User ${email} reportedly exists but was not found in any page.`);
  }

  throw createError;
}

function failOnError(error, context) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

async function main() {
  const ensuredUsers = [];
  for (const seedUser of seedUsers) {
    ensuredUsers.push(await ensureAuthUser(seedUser));
  }
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
      reviewer_name: review.author_name,
      rating: review.rating,
      review_text: review.body,
      status: review.status,
      created_at: timestamp,
      updated_at: timestamp,
    })),
    { onConflict: "id" },
  );
  failOnError(reviewsError, "Upserting reviews failed");

  console.log("Supabase seed complete.");
  console.log(`Admin: ${seedUsers[0].email}`);
  console.log(`Therapist: ${seedUsers[1].email}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
