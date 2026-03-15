import type { BlogPost, City, Keyword, ReviewStatus, TherapistTier } from "@/mm/types";
import { calculateProfileCompleteness } from "@/mm/lib/directory";
import { hashPassword } from "@/mm/lib/security";
import { updateStore } from "@/mm/lib/store";
import { slugify } from "@/mm/lib/utils";

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function uniqueSlug(base: string, existing: string[]): string {
  if (!existing.includes(base)) {
    return base;
  }

  let counter = 2;
  let next = `${base}-${counter}`;

  while (existing.includes(next)) {
    counter += 1;
    next = `${base}-${counter}`;
  }

  return next;
}

export async function createTherapistUser(params: {
  email: string;
  fullName: string;
  password: string;
}) {
  return updateStore((store) => {
    const existing = store.users.find((user) => user.email.toLowerCase() === params.email.toLowerCase());

    if (existing) {
      throw new Error("An account with that email already exists.");
    }

    const userId = createId("user");
    const therapistId = createId("therapist");
    const baseSlug = slugify(params.fullName);
    const slug = uniqueSlug(baseSlug, store.therapists.map((therapist) => therapist.slug));
    const now = new Date().toISOString();

    store.users.push({
      id: userId,
      email: params.email,
      fullName: params.fullName,
      role: "therapist",
      passwordHash: hashPassword(params.password),
      createdAt: now,
      emailConfirmed: true,
    });

    store.subscriptions.push({
      id: createId("subscription"),
      userId,
      tier: "free",
      status: "active",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    });

    store.therapists.push({
      id: therapistId,
      userId,
      slug,
      displayName: params.fullName,
      citySlug: "austin",
      state: "TX",
      bio: "Complete your onboarding to publish the full therapist profile.",
      photoUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      gallery: [],
      modalities: [],
      keywordSlugs: [],
      languages: ["English"],
      contactEmail: params.email,
      phone: "+1 (555) 000-0000",
      website: `https://masseurmatch.com/therapists/${slug}`,
      incall: true,
      outcall: false,
      priceRange: "$0-$0",
      gayFriendly: false,
      inclusive: true,
      segments: ["inclusive"],
      latitude: 30.2672,
      longitude: -97.7431,
      tier: "free",
      status: "draft",
      viewCount: 0,
      profileCompleteness: 22,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: userId,
      email: params.email,
      fullName: params.fullName,
      role: "therapist" as const,
    };
  });
}

export async function completeTherapistOnboarding(
  userId: string,
  data: {
    displayName: string;
    bio: string;
    photoUrl: string;
    citySlug: string;
    state: string;
    latitude: number;
    longitude: number;
    modalities: string[];
    priceRange: string;
    incall: boolean;
    outcall: boolean;
    gayFriendly: boolean;
    inclusive: boolean;
    languages: string[];
  },
) {
  return updateStore((store) => {
    const therapist = store.therapists.find((item) => item.userId === userId);

    if (!therapist) {
      throw new Error("Therapist profile not found.");
    }

    therapist.displayName = data.displayName;
    therapist.slug = uniqueSlug(slugify(data.displayName), store.therapists.filter((item) => item.id !== therapist.id).map((item) => item.slug));
    therapist.bio = data.bio;
    therapist.photoUrl = data.photoUrl;
    therapist.gallery = [data.photoUrl];
    therapist.citySlug = data.citySlug;
    therapist.state = data.state;
    therapist.latitude = data.latitude;
    therapist.longitude = data.longitude;
    therapist.modalities = data.modalities;
    therapist.keywordSlugs = Array.from(new Set([...therapist.keywordSlugs, ...data.modalities]));
    therapist.priceRange = data.priceRange;
    therapist.incall = data.incall;
    therapist.outcall = data.outcall;
    therapist.gayFriendly = data.gayFriendly;
    therapist.inclusive = data.inclusive;
    therapist.languages = data.languages;
    therapist.segments = Array.from(
      new Set([
        ...(data.gayFriendly ? ["gay", "lgbtq"] : []),
        ...(data.inclusive ? ["inclusive"] : []),
        "male",
      ]),
    );
    therapist.status = "pending";
    therapist.updatedAt = new Date().toISOString();
    therapist.profileCompleteness = calculateProfileCompleteness(therapist);

    return therapist;
  });
}

export async function updateTherapistProfile(
  userId: string,
  data: {
    bio: string;
    contactEmail: string;
    displayName: string;
    gayFriendly: boolean;
    inclusive: boolean;
    incall: boolean;
    languages: string[];
    modalities: string[];
    outcall: boolean;
    phone: string;
    photoUrl: string;
    priceRange: string;
    state: string;
    website: string;
    citySlug: string;
    latitude: number;
    longitude: number;
  },
) {
  return updateStore((store) => {
    const therapist = store.therapists.find((item) => item.userId === userId);

    if (!therapist) {
      throw new Error("Therapist profile not found.");
    }

    therapist.displayName = data.displayName;
    therapist.bio = data.bio;
    therapist.contactEmail = data.contactEmail;
    therapist.phone = data.phone;
    therapist.website = data.website;
    therapist.photoUrl = data.photoUrl;
    therapist.gallery = [data.photoUrl];
    therapist.priceRange = data.priceRange;
    therapist.citySlug = data.citySlug;
    therapist.state = data.state;
    therapist.latitude = data.latitude;
    therapist.longitude = data.longitude;
    therapist.modalities = data.modalities;
    therapist.keywordSlugs = Array.from(new Set([...therapist.keywordSlugs, ...data.modalities]));
    therapist.languages = data.languages;
    therapist.incall = data.incall;
    therapist.outcall = data.outcall;
    therapist.gayFriendly = data.gayFriendly;
    therapist.inclusive = data.inclusive;
    therapist.segments = Array.from(
      new Set([
        ...(data.gayFriendly ? ["gay", "lgbtq"] : []),
        ...(data.inclusive ? ["inclusive"] : []),
        "male",
      ]),
    );
    therapist.updatedAt = new Date().toISOString();
    therapist.profileCompleteness = calculateProfileCompleteness(therapist);

    return therapist;
  });
}

export async function updateSubscriptionTier(userId: string, tier: TherapistTier) {
  return updateStore((store) => {
    const subscription = store.subscriptions.find((item) => item.userId === userId);
    const therapist = store.therapists.find((item) => item.userId === userId);

    if (!subscription || !therapist) {
      throw new Error("Subscription not found.");
    }

    subscription.tier = tier;
    subscription.status = "active";
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    therapist.tier = tier;
    therapist.updatedAt = new Date().toISOString();
    return subscription;
  });
}

export async function applyTherapistAdminAction(therapistId: string, action: "approve" | "suspend" | "delete") {
  return updateStore((store) => {
    const therapist = store.therapists.find((item) => item.id === therapistId);

    if (!therapist) {
      throw new Error("Therapist not found.");
    }

    if (action === "delete") {
      store.therapists = store.therapists.filter((item) => item.id !== therapistId);
      store.reviews = store.reviews.filter((review) => review.therapistId !== therapistId);
      return null;
    }

    therapist.status = action === "approve" ? "approved" : "suspended";
    therapist.updatedAt = new Date().toISOString();
    return therapist;
  });
}

export async function updateUserRole(userId: string, role: "admin" | "therapist") {
  return updateStore((store) => {
    const user = store.users.find((item) => item.id === userId);

    if (!user) {
      throw new Error("User not found.");
    }

    user.role = role;
    return user;
  });
}

export async function applyReviewAdminAction(reviewId: string, action: "approve" | "remove") {
  return updateStore((store) => {
    const review = store.reviews.find((item) => item.id === reviewId);

    if (!review) {
      throw new Error("Review not found.");
    }

    review.status = action === "approve" ? "approved" : "removed";
    return review;
  });
}

export async function saveCity(city: Omit<City, "id"> & { id?: string }) {
  return updateStore((store) => {
    if (city.id) {
      const existing = store.cities.find((item) => item.id === city.id);

      if (!existing) {
        throw new Error("City not found.");
      }

      Object.assign(existing, city);
      return existing;
    }

    const next: City = {
      ...city,
      id: createId("city"),
    };
    store.cities.push(next);
    return next;
  });
}

export async function saveKeyword(keyword: Omit<Keyword, "id"> & { id?: string }) {
  return updateStore((store) => {
    if (keyword.id) {
      const existing = store.keywords.find((item) => item.id === keyword.id);

      if (!existing) {
        throw new Error("Keyword not found.");
      }

      Object.assign(existing, keyword);
      return existing;
    }

    const next: Keyword = {
      ...keyword,
      id: createId("keyword"),
    };
    store.keywords.push(next);
    return next;
  });
}

export async function saveBlogPost(post: Omit<BlogPost, "id" | "publishedAt" | "updatedAt"> & { id?: string }) {
  return updateStore((store) => {
    const timestamp = new Date().toISOString();

    if (post.id) {
      const existing = store.blogPosts.find((item) => item.id === post.id);

      if (!existing) {
        throw new Error("Blog post not found.");
      }

      existing.slug = post.slug;
      existing.title = post.title;
      existing.excerpt = post.excerpt;
      existing.seoDescription = post.seoDescription;
      existing.content = post.content;
      existing.tags = post.tags;
      existing.updatedAt = timestamp;
      return existing;
    }

    const next: BlogPost = {
      ...post,
      id: createId("blog"),
      publishedAt: timestamp,
      updatedAt: timestamp,
    };
    store.blogPosts.push(next);
    return next;
  });
}

export async function deleteBlogPost(id: string) {
  return updateStore((store) => {
    store.blogPosts = store.blogPosts.filter((post) => post.id !== id);
    return true;
  });
}
