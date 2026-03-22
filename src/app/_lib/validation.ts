import { z } from "zod";
import {
  KNOTTY_DEVICE_TYPES,
  KNOTTY_EVENT_NAMES,
  KNOTTY_INTENTS,
  KNOTTY_QUICK_ACTIONS,
} from "@/lib/knotty/types";

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRegisterSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().url().optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export const billingTierSchema = z.enum(["free", "standard", "pro", "elite"]);

export const proBillingSchema = z.object({
  tier: billingTierSchema,
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]).default("user"),
  content: z.string().min(1),
});

export const chatRequestSchema = z
  .object({
    message: z.string().min(1).optional(),
    messages: z.array(chatMessageSchema).optional(),
  })
  .refine((value) => Boolean(value.message || value.messages?.length), {
    message: "Provide a message or messages array.",
  });

export const knottyContextSchema = z.object({
  pagePath: z.string().max(200).optional(),
  pageQuery: z.string().max(600).optional(),
  city: z.string().max(120).nullable().optional(),
  neighborhood: z.string().max(120).nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  radiusMiles: z.number().nullable().optional(),
  deviceType: z.enum(KNOTTY_DEVICE_TYPES).optional(),
  filters: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export const knottyRequestSchema = z.object({
  sessionId: z.string().min(6).max(120),
  messages: z.array(chatMessageSchema).optional(),
  quickAction: z.enum(KNOTTY_QUICK_ACTIONS).optional(),
  context: knottyContextSchema.optional(),
});

export const knottyEventSchema = z.object({
  event: z.enum(KNOTTY_EVENT_NAMES),
  session_id: z.string().min(6).max(120),
  therapist_id: z.string().uuid().nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  neighborhood: z.string().max(120).nullable().optional(),
  intent: z.enum(KNOTTY_INTENTS).nullable().optional(),
  device_type: z.enum(KNOTTY_DEVICE_TYPES).nullable().optional(),
  position_in_results: z.number().int().min(1).max(10).nullable().optional(),
  recommendation_source: z.string().max(80).nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  ts: z.number().optional(),
});

export const proProfileSchema = z.object({
  displayName: z.string().min(2).max(80),
  bio: z.string().min(20).max(4000),
  city: z.string().min(2).max(120),
  state: z.string().min(2).max(120).nullable().optional(),
  phone: z.string().min(7).max(30).nullable().optional(),
  specialties: z.array(z.string().min(2).max(60)).max(12).default([]),
  incallPrice: z.number().int().min(0).nullable().optional(),
  outcallPrice: z.number().int().min(0).nullable().optional(),
});

export type AuthLoginInput = z.infer<typeof authLoginSchema>;
export type AuthRegisterInput = z.infer<typeof authRegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ProBillingInput = z.infer<typeof proBillingSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type KnottyRequestInput = z.infer<typeof knottyRequestSchema>;
export type KnottyEventInput = z.infer<typeof knottyEventSchema>;
export type ProProfileInput = z.infer<typeof proProfileSchema>;
