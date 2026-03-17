import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export const onboardingSchema = z.object({
  displayName: z.string().min(2),
  bio: z.string().min(40),
  photoUrl: z.string().min(10),
  citySlug: z.string().min(2),
  state: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  modalities: z.array(z.string()).min(1),
  priceRange: z.string().min(3),
  incall: z.boolean(),
  outcall: z.boolean(),
  gayFriendly: z.boolean(),
  inclusive: z.boolean(),
  languages: z.array(z.string()).min(1),
});

export const profileUpdateSchema = onboardingSchema.extend({
  contactEmail: z.string().email(),
  phone: z.string().min(7),
  website: z.string().url(),
  status: z.enum(["draft", "pending", "approved", "suspended"]).optional(),
});

export const billingSchema = z.object({
  tier: z.enum(["free", "pro", "featured"]),
});

export const adminTherapistActionSchema = z.object({
  therapistId: z.string().min(1),
  action: z.enum(["approve", "suspend", "delete"]),
});

export const adminUserActionSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "therapist"]),
});

export const adminReviewActionSchema = z.object({
  reviewId: z.string().min(1),
  action: z.enum(["approve", "remove"]),
});

export const citySchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().min(2),
  name: z.string().min(2),
  state: z.string().min(2),
  stateCode: z.string().min(2).max(2),
  description: z.string().min(20),
  latitude: z.number(),
  longitude: z.number(),
  hero: z.string().min(10),
});

export const keywordSchema = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(2),
  slug: z.string().min(2),
  category: z.enum(["modality", "identity", "intent"]),
});

export const blogSchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().min(2),
  title: z.string().min(5),
  excerpt: z.string().min(20),
  seoDescription: z.string().min(20),
  content: z.string().min(60),
  tags: z.array(z.string()).min(1),
});
