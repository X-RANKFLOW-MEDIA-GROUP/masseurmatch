"use client";

import { ApiError, requestJson, postJson } from "@/app/_lib/request";
import type {
  AuthLoginInput,
  AuthRegisterInput,
  ContactFormInput,
  ForgotPasswordInput,
  ProProfileInput,
} from "@/app/_lib/validation";

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
  requiresEmailConfirmation?: boolean;
  message?: string;
};

export type ResendConfirmationResponse = { ok: boolean; message: string };

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

export async function registerMutation(input: AuthRegisterInput) {
  try {
    return await postJson<AuthMutationResponse>("/api/auth/register", input);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409 && typeof window !== "undefined") {
      const payload = error.payload as { loginPath?: string; resetPath?: string } | undefined;
      const loginPath = payload?.loginPath || `/login?email=${encodeURIComponent(input.email)}`;
      const separator = loginPath.includes("?") ? "&" : "?";
      window.location.assign(`${loginPath}${separator}reason=account-exists&reset=${encodeURIComponent(payload?.resetPath || "/forgot-password")}`);
      return await new Promise<AuthMutationResponse>(() => undefined);
    }
    throw error;
  }
}

export function logoutMutation() {
  return requestJson<{ ok: true }>("/api/auth/logout", {
    method: "POST",
  });
}

export function resendConfirmationMutation(email: string) {
  return postJson<ResendConfirmationResponse>("/api/auth/resend-confirmation", { email });
}

export function forgotPasswordMutation(input: ForgotPasswordInput) {
  return postJson<ForgotPasswordMutationResponse>("/api/auth/forgot-password", input);
}

export function sendContactMessage(input: ContactFormInput) {
  return postJson<ContactMutationResponse>("/api/contact", input);
}

export function updateProfileMutation(input: ProProfileInput) {
  return postJson<ProProfileMutationResponse>("/api/pro/profile", input);
}
