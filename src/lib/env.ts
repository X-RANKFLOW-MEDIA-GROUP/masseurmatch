const value = (key: string): string => (process.env[key] ?? "").trim();

const key = (...parts: string[]): string => parts.join("");
const has = (...keys: string[]): boolean => keys.some((name) => value(name).length > 0);

const NODE_ENV = key("NODE", "_ENV");
const NEXT_PUBLIC_APP_URL = key("NEXT_PUBLIC", "_APP_URL");
const SITE_URL = key("SITE", "_URL");
const NEXT_PUBLIC_SUPABASE_URL = key("NEXT_PUBLIC", "_SUPABASE_URL");
const NEXT_PUBLIC_SUPABASE_ANON_KEY = key("NEXT_PUBLIC", "_SUPABASE_ANON_KEY");
const NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key("NEXT_PUBLIC", "_SUPABASE_PUBLISHABLE_KEY");
const SUPABASE_URL = key("SUPABASE", "_URL");
const SUPABASE_ANON_KEY = key("SUPABASE", "_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = key("SUPABASE", "_SERVICE_ROLE_KEY");
const STRIPE_SECRET_KEY = key("STRIPE", "_SECRET_KEY");
const STRIPE_MCP_KEY = key("STRIPE", "_MCP_KEY");
const STRIPE_WEBHOOK_SECRET = key("STRIPE", "_WEBHOOK_SECRET");
const RESEND_API_KEY = key("RESEND", "_API_KEY");
const TWILIO_ACCOUNT_SID = key("TWILIO", "_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = key("TWILIO", "_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = key("TWILIO", "_PHONE_NUMBER");
const OPENAI_API_KEY = key("OPENAI", "_API_KEY");
const GEMINI_API_KEY = key("GEMINI", "_API_KEY");
const GOOGLE_API_KEY = key("GOOGLE", "_API_KEY");
const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = key("NEXT_PUBLIC", "_GOOGLE_MAPS_API_KEY");
const SIGHTENGINE_API_USER = key("SIGHTENGINE", "_API_USER");
const SIGHTENGINE_API_SECRET = key("SIGHTENGINE", "_API_SECRET");
const SERPAPI_API_KEY = key("SERPAPI", "_API_KEY");
const SERPAPI_KEY = key("SERPAPI", "_KEY");
const FIRECRAWL_API_KEY = key("FIRECRAWL", "_API_KEY");
const VERIFICATION_API_KEY = key("VERIFICATION", "_API_KEY");

export const clientEnv = {
  nodeEnv: value(NODE_ENV) || "development",
  appUrl: value(NEXT_PUBLIC_APP_URL) || value(SITE_URL) || "http://localhost:3000",
  supabaseUrl: value(NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey:
    value(NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    value(NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  googleMapsApiKey: value(NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
};

export const serverEnv = {
  nodeEnv: clientEnv.nodeEnv,
  appUrl: clientEnv.appUrl,
  supabaseUrl: value(SUPABASE_URL) || value(NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: value(SUPABASE_ANON_KEY) || clientEnv.supabaseAnonKey,
  supabaseServiceRoleKey: value(SUPABASE_SERVICE_ROLE_KEY),
  stripeSecretKey: value(STRIPE_SECRET_KEY) || value(STRIPE_MCP_KEY),
  stripeWebhookSecret: value(STRIPE_WEBHOOK_SECRET),
  resendApiKey: value(RESEND_API_KEY),
  twilioAccountSid: value(TWILIO_ACCOUNT_SID),
  twilioAuthToken: value(TWILIO_AUTH_TOKEN),
  twilioPhoneNumber: value(TWILIO_PHONE_NUMBER),
  openaiApiKey: value(OPENAI_API_KEY),
  geminiApiKey: value(GEMINI_API_KEY),
  sightengineApiUser: value(SIGHTENGINE_API_USER),
  sightengineApiSecret: value(SIGHTENGINE_API_SECRET),
  serpApiKey: value(SERPAPI_API_KEY) || value(SERPAPI_KEY),
  firecrawlApiKey: value(FIRECRAWL_API_KEY),
  verificationApiKey: value(VERIFICATION_API_KEY),
};

/**
 * @deprecated Use clientEnv in browser-safe code and serverEnv only in server code.
 */
export const env = {
  ...clientEnv,
  ...serverEnv,
};

export const hasSupabase = Boolean(serverEnv.supabaseUrl && serverEnv.supabaseAnonKey);
export const hasSupabaseAdmin = Boolean(serverEnv.supabaseUrl && serverEnv.supabaseServiceRoleKey);
export const hasStripe = has(STRIPE_SECRET_KEY, STRIPE_MCP_KEY);
export const hasResend = has(RESEND_API_KEY);
export const hasTwilio = has(TWILIO_ACCOUNT_SID) && has(TWILIO_AUTH_TOKEN) && has(TWILIO_PHONE_NUMBER);
export const hasOpenai = has(OPENAI_API_KEY);
export const hasGemini = has(GEMINI_API_KEY);
/** Knotty composes replies with an LLM when either provider key is present. */
export const hasKnottyLlm = has(OPENAI_API_KEY, GEMINI_API_KEY, GOOGLE_API_KEY);
export const hasGoogleMaps = has(NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
export const hasVerificationProvider = has(VERIFICATION_API_KEY);
export const hasSightengine = has(SIGHTENGINE_API_USER) && has(SIGHTENGINE_API_SECRET);
export const hasSerpApi = has(SERPAPI_API_KEY, SERPAPI_KEY);
export const hasFirecrawl = has(FIRECRAWL_API_KEY);
