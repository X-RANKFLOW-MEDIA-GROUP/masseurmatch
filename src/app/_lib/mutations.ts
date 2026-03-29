"use client";

import { requestJson, postJson } from "@/app/_lib/request";
import type {
  AuthLoginInput,
  AuthRegisterInput,
  ContactFormInput,
  ForgotPasswordInput,
  ProBillingInput,
  ProProfileInput,
} from "@/app/_lib/validation";

export type AuthMutationResponse = {
  ok: boolean;
  user: {
    id: string;
    email: string;
  };
  role: "admin" | "provider" | "client" | null;
};

export type ForgotPasswordMutationResponse = {
  ok: boolean;
  message: string;
  reset: {
    mock: boolean;
    email: string;
    redirectTo: string;
    requestedAt: string;
    previewToken?: string;
  };
};

export type ContactMutationResponse = {
  ok: boolean;
  to: string;
  resendId: string;
  mock: boolean;
};

export type BillingMutationResponse = {
  ok: boolean;
  subscription: {
    userId: string;
    tier: "free" | "standard" | "pro" | "elite";
  };
};

export type ProProfileMutationResponse = {
  ok: boolean;
  profile: {
    id: string;
    user_id: string;
    slug: string | null;
    display_name: string | null;
    full_name: string;
    bio: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
    specialties: string[] | null;
    incall_price: number | null;
    outcall_price: number | null;
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

export function updateBillingTier(input: ProBillingInput) {
  return postJson<BillingMutationResponse>("/api/pro/billing", input);
}

export function updateProfileMutation(input: ProProfileInput) {
  return postJson<ProProfileMutationResponse>("/api/pro/profile", input);
}
