function getEnv(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return undefined;
}

interface EnvCheckResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

const REQUIRED_SERVER_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SESSION_SECRET",
];

const RECOMMENDED_SERVER_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
];

export function validateEnv(): EnvCheckResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_SERVER_VARS) {
    if (!getEnv(key)) {
      missing.push(key);
    }
  }

  for (const key of RECOMMENDED_SERVER_VARS) {
    if (!getEnv(key)) {
      warnings.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function logEnvStatus() {
  if (typeof process === "undefined") return;

  const result = validateEnv();

  if (result.missing.length > 0) {
    console.error(
      `[env] Missing required environment variables: ${result.missing.join(", ")}. Some features will not work.`,
    );
  }

  if (result.warnings.length > 0) {
    console.warn(
      `[env] Missing recommended environment variables: ${result.warnings.join(", ")}. Related features are disabled.`,
    );
  }
}
