import { z } from "zod";

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
export type ProProfileInput = z.infer<typeof proProfileSchema>;
