export const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const appName = "MasseurMatch";

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const stripeConfigured = Boolean(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY,
);

export const resendConfigured = Boolean(process.env.RESEND_API_KEY);
