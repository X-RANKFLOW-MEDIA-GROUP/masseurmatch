"use client";

import { requestJson, postJson } from "@/app/_lib/request";
import type {
  AuthLoginInput,
  AuthRegisterInput,
  ContactFormInput,
  ForgotPasswordInput,
} from "@/app/_lib/validation";
import type { MassageTherapistProfileInput } from "@/app/_lib/validation.massagist";

export type AuthMutationResponse = {
  ok: boolean;
  user: {
    id: string;
    email: string;
  };
  role: "admin" | "provider" | "client" | null;
  session?: {
    access_token: string;
    refresh_token: string;
  } | null;
};

export type ForgotPasswordMutationResponse = {
  ok: boolean;
  message: string;
};

export type ContactMutationResponse = {
  ok: boolean;
  to: string;
  resendId: string;
  mock: boolean;
};

export type ProProfileMutationResponse = {
  ok: boolean;
  profile: {
    id: string;
    user_id: string;
    slug: string | null;
    display_name: string | null;
    full_name: string;
    headline: string | null;
    bio: string | null;
    city: string | null;
    state: string | null;
    neighborhood: string | null;
    location_description: string | null;
    phone: string | null;
    booking_link: string | null;
    whatsapp_number: string | null;
    telegram_handle: string | null;
    specialties: string[] | null;
    languages: string[] | null;
    massage_techniques: string[] | null;
    incall_price: number | null;
    outcall_price: number | null;
    offers_incall: boolean | null;
    offers_outcall: boolean | null;
    outcall_radius: number | null;
    travel_note: string | null;
    travel_cities: string[] | null;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string[] | null;
    height_inches: number | null;
    weight_lb: number | null;
    body_type: string | null;
    status: string;
    updated_at: string;
  } | null;
};

export function loginMutation(input: AuthLoginInput) {
  return postJson<AuthMutationResponse>("/api/auth/login", input);
}

export function registerMutation(input: AuthRegisterInput) {
  return postJson<AuthMutationResponse>("/api/auth/register", input);
}

export function logoutMutation() {
  return requestJson<{ ok: true }>("/api/auth/logout", {
    method: "POST",
  });
}

export function forgotPasswordMutation(input: ForgotPasswordInput) {
  return postJson<ForgotPasswordMutationResponse>("/api/auth/forgot-password", input);
}

export function sendContactMessage(input: ContactFormInput) {
  return postJson<ContactMutationResponse>("/api/contact", input);
}

export function updateProfileMutation(input: MassageTherapistProfileInput) {
  return postJson<ProProfileMutationResponse>("/api/pro/profile", input);
}
