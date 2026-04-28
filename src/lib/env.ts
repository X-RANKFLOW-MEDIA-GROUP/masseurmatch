const value = (key: string): string => (process.env[key] ?? "").trim();

const has = (...keys: string[]): boolean => keys.some((key) => value(key).length > 0);

export const env = {
  nodeEnv: value("NODE_ENV") || "development",
  appUrl: value("NEXT_PUBLIC_APP_URL") || value("SITE_URL") || "http://localhost:3000",
  supabaseUrl: value("NEXT_PUBLIC_SUPABASE_URL") || value("SUPABASE_URL"),
  supabaseAnonKey:
    value("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    value("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    value("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: value("SUPABASE_SERVICE_ROLE_KEY"),
  stripeSecretKey: value("STRIPE_SECRET_KEY") || value("STRIPE_MCP_KEY"),
  stripeWebhookSecret: value("STRIPE_WEBHOOK_SECRET"),
  resendApiKey: value("RESEND_API_KEY"),
  twilioAccountSid: value("TWILIO_ACCOUNT_SID"),
  twilioAuthToken: value("TWILIO_AUTH_TOKEN"),
  twilioPhoneNumber: value("TWILIO_PHONE_NUMBER"),
  geminiApiKey: value("GEMINI_API_KEY"),
  googleMapsApiKey: value("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY") || value("GOOGLE_MAPS_API_KEY"),
  sightengineApiUser: value("SIGHTENGINE_API_USER"),
  sightengineApiSecret: value("SIGHTENGINE_API_SECRET"),
  serpApiKey: value("SERPAPI_API_KEY") || value("SERPAPI_KEY"),
  firecrawlApiKey: value("FIRECRAWL_API_KEY"),
  verificationApiKey: value("VERIFICATION_API_KEY"),
};

export const hasSupabase = Boolean(env.supabaseUrl && (env.supabaseAnonKey || env.supabaseServiceRoleKey));
export const hasStripe = has("STRIPE_SECRET_KEY", "STRIPE_MCP_KEY");
export const hasResend = has("RESEND_API_KEY");
export const hasTwilio = has("TWILIO_ACCOUNT_SID") && has("TWILIO_AUTH_TOKEN") && has("TWILIO_PHONE_NUMBER");
export const hasGemini = has("GEMINI_API_KEY");
export const hasGoogleMaps = has("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "GOOGLE_MAPS_API_KEY");
export const hasVerificationProvider = has("VERIFICATION_API_KEY");
export const hasSightengine = has("SIGHTENGINE_API_USER") && has("SIGHTENGINE_API_SECRET");
export const hasSerpApi = has("SERPAPI_API_KEY", "SERPAPI_KEY");
export const hasFirecrawl = has("FIRECRAWL_API_KEY");
