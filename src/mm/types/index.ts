export type Role = "admin" | "therapist";

export type TherapistTier = "free" | "pro" | "featured";

export type TherapistStatus = "draft" | "pending" | "approved" | "suspended";

export type ReviewStatus = "pending" | "approved" | "removed";

export type SubscriptionStatus = "active" | "past_due" | "canceled";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
  emailConfirmed: boolean;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  description: string;
  latitude: number;
  longitude: number;
  hero: string;
}

export interface Keyword {
  id: string;
  slug: string;
  label: string;
  category: "modality" | "identity" | "intent";
}

export interface Therapist {
  id: string;
  userId: string | null;
  slug: string;
  displayName: string;
  citySlug: string;
  state: string;
  bio: string;
  photoUrl: string;
  gallery: string[];
  modalities: string[];
  keywordSlugs: string[];
  languages: string[];
  contactEmail: string;
  phone: string;
  website: string;
  incall: boolean;
  outcall: boolean;
  priceRange: string;
  gayFriendly: boolean;
  inclusive: boolean;
  segments: string[];
  latitude: number;
  longitude: number;
  tier: TherapistTier;
  status: TherapistStatus;
  viewCount: number;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  therapistId: string;
  authorName: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  seoDescription: string;
  content: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: TherapistTier;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

export interface DemoStore {
  users: User[];
  therapists: Therapist[];
  reviews: Review[];
  cities: City[];
  keywords: Keyword[];
  blogPosts: BlogPost[];
  subscriptions: Subscription[];
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}
