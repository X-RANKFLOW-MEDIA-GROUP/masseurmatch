import type {
  BlogPost,
  City,
  Keyword,
  Review,
  Role,
  Subscription,
  Therapist,
  TherapistStatus,
  TherapistTier,
  User,
} from "@/mm/types";
import {
  listBlogPosts,
  listCities,
  listKeywords,
  listReviews,
  listSubscriptions,
  listTherapists,
  listUsers,
  readStore,
} from "@/mm/lib/store";
import { clamp } from "@/mm/lib/utils";

export const identitySegments = ["gay", "inclusive", "lgbtq", "female", "male", "non-binary"] as const;

export type SearchFilters = {
  city?: string;
  modality?: string;
  tier?: TherapistTier;
  q?: string;
  segment?: string;
  keyword?: string;
  includeSuspended?: boolean;
};

export async function getDirectorySnapshot(): Promise<{
  blogPosts: BlogPost[];
  cities: City[];
  keywords: Keyword[];
  reviews: Review[];
  subscriptions: Subscription[];
  therapists: Therapist[];
  users: User[];
}> {
  const store = await readStore();

  return {
    blogPosts: store.blogPosts,
    cities: store.cities,
    keywords: store.keywords,
    reviews: store.reviews,
    subscriptions: store.subscriptions,
    therapists: store.therapists,
    users: store.users,
  };
}

export async function getCities(): Promise<City[]> {
  return listCities();
}

export async function getCityBySlug(citySlug: string): Promise<City | null> {
  const cities = await listCities();
  return cities.find((city) => city.slug === citySlug) || null;
}

export async function getKeywords(): Promise<Keyword[]> {
  return listKeywords();
}

export async function getKeywordBySlug(keywordSlug: string): Promise<Keyword | null> {
  const keywords = await listKeywords();
  return keywords.find((keyword) => keyword.slug === keywordSlug) || null;
}

export async function getPublicTherapists(filters: SearchFilters = {}): Promise<Therapist[]> {
  const therapists = await listTherapists();
  const normalizedQuery = filters.q?.trim().toLowerCase();

  return therapists
    .filter((therapist) => filters.includeSuspended || therapist.status !== "suspended")
    .filter((therapist) => therapist.status === "approved" || filters.includeSuspended)
    .filter((therapist) => (filters.city ? therapist.citySlug === filters.city : true))
    .filter((therapist) => (filters.modality ? therapist.modalities.includes(filters.modality) : true))
    .filter((therapist) => (filters.tier ? therapist.tier === filters.tier : true))
    .filter((therapist) => (filters.segment ? therapist.segments.includes(filters.segment) : true))
    .filter((therapist) =>
      filters.keyword
        ? therapist.keywordSlugs.includes(filters.keyword) || therapist.modalities.includes(filters.keyword)
        : true,
    )
    .filter((therapist) => {
      if (!normalizedQuery) {
        return true;
      }

      return [
        therapist.displayName,
        therapist.bio,
        therapist.citySlug,
        therapist.priceRange,
        therapist.modalities.join(" "),
        therapist.keywordSlugs.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .sort((left, right) => {
      const tierOrder: Record<TherapistTier, number> = {
        featured: 0,
        pro: 1,
        free: 2,
      };

      return tierOrder[left.tier] - tierOrder[right.tier] || right.viewCount - left.viewCount;
    });
}

export async function getTherapistBySlug(slug: string): Promise<Therapist | null> {
  const therapists = await listTherapists();
  return therapists.find((therapist) => therapist.slug === slug) || null;
}

export async function getTherapistReviews(therapistId: string): Promise<Review[]> {
  const reviews = await listReviews();
  return reviews.filter((review) => review.therapistId === therapistId && review.status === "approved");
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const blogPosts = await listBlogPosts();
  return [...blogPosts].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await listBlogPosts();
  return posts.find((post) => post.slug === slug) || null;
}

export async function getPendingReviews(): Promise<Review[]> {
  const reviews = await listReviews();
  return reviews.filter((review) => review.status === "pending");
}

export async function getAdminStats(): Promise<{
  activeTherapists: number;
  cities: number;
  mrr: number;
  pendingReviews: number;
}> {
  const therapists = await listTherapists();
  const subscriptions = await listSubscriptions();
  const reviews = await listReviews();
  const cities = await listCities();

  const mrr = subscriptions.reduce((total, subscription) => {
    if (subscription.status !== "active") {
      return total;
    }

    if (subscription.tier === "featured") {
      return total + 149;
    }

    if (subscription.tier === "pro") {
      return total + 79;
    }

    return total;
  }, 0);

  return {
    activeTherapists: therapists.filter((therapist) => therapist.status === "approved").length,
    cities: cities.length,
    mrr,
    pendingReviews: reviews.filter((review) => review.status === "pending").length,
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await listUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserById(userId: string): Promise<User | null> {
  const users = await listUsers();
  return users.find((user) => user.id === userId) || null;
}

export async function getSubscriptionForUser(userId: string): Promise<Subscription | null> {
  const subscriptions = await listSubscriptions();
  return subscriptions.find((subscription) => subscription.userId === userId) || null;
}

export async function getTherapistForUser(userId: string): Promise<Therapist | null> {
  const therapists = await listTherapists();
  return therapists.find((therapist) => therapist.userId === userId) || null;
}

export function calculateProfileCompleteness(therapist: Therapist): number {
  const checks = [
    therapist.displayName.length > 1,
    therapist.bio.length > 40,
    therapist.photoUrl.length > 10,
    therapist.modalities.length > 0,
    therapist.languages.length > 0,
    therapist.contactEmail.length > 3,
    therapist.phone.length > 6,
    therapist.website.length > 8,
    therapist.priceRange.length > 2,
  ];

  return clamp(Math.round((checks.filter(Boolean).length / checks.length) * 100), 0, 100);
}

export function getRoleLabel(role: Role): string {
  return role === "admin" ? "Administrator" : "Therapist";
}

export function getTherapistStatusLabel(status: TherapistStatus): string {
  return status[0].toUpperCase() + status.slice(1);
}
