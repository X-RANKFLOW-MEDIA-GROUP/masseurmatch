import { createHash, randomBytes } from "node:crypto";

const STATE_COOKIE_NAME = "mm_oauth_state";
const PKCE_COOKIE_NAME = "mm_oauth_pkce";
const OAUTH_TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface OAuthState {
  state: string;
  codeChallenge: string;
  codeVerifier: string;
  createdAt: number;
  nonce: string;
}

export function generateOAuthState(): OAuthState {
  const state = randomBytes(32).toString("hex");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  const nonce = randomBytes(16).toString("hex");

  return {
    state,
    codeChallenge,
    codeVerifier,
    createdAt: Date.now(),
    nonce,
  };
}

export function serializeOAuthState(state: OAuthState): string {
  return Buffer.from(JSON.stringify(state)).toString("base64url");
}

export function deserializeOAuthState(serialized: string): OAuthState | null {
  try {
    const json = Buffer.from(serialized, "base64url").toString("utf-8");
    return JSON.parse(json) as OAuthState;
  } catch {
    return null;
  }
}

export function verifyOAuthState(storedState: OAuthState, receivedState: string): boolean {
  if (storedState.state !== receivedState) {
    return false;
  }

  const age = Date.now() - storedState.createdAt;
  if (age > OAUTH_TTL_MS || age < 0) {
    return false;
  }

  return true;
}

export function createOAuthStateCookie(state: OAuthState, secure: boolean): string {
  const serialized = serializeOAuthState(state);
  const parts = [`${STATE_COOKIE_NAME}=${encodeURIComponent(serialized)}`, "Path=/", "SameSite=Lax", "HttpOnly"];

  if (secure) {
    parts.push("Secure");
    parts.push("Domain=.masseurmatch.com");
  }

  parts.push(`Max-Age=${OAUTH_TTL_MS / 1000}`);

  return parts.join("; ");
}

export function createOAuthPkceCookie(codeVerifier: string, secure: boolean): string {
  const parts = [
    `${PKCE_COOKIE_NAME}=${encodeURIComponent(codeVerifier)}`,
    "Path=/",
    "SameSite=Lax",
    "HttpOnly",
  ];

  if (secure) {
    parts.push("Secure");
    parts.push("Domain=.masseurmatch.com");
  }

  parts.push(`Max-Age=${OAUTH_TTL_MS / 1000}`);

  return parts.join("; ");
}

export function clearOAuthCookies(secure: boolean): string[] {
  const createClearCookie = (name: string) => {
    const parts = [`${name}=`, "Path=/", "SameSite=Lax", "HttpOnly", "Max-Age=0"];
    if (secure) {
      parts.push("Secure");
      parts.push("Domain=.masseurmatch.com");
    }
    return parts.join("; ");
  };

  return [createClearCookie(STATE_COOKIE_NAME), createClearCookie(PKCE_COOKIE_NAME)];
}

export function extractOAuthStateFromCookie(cookieHeader: string | null): OAuthState | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`${STATE_COOKIE_NAME}=([^;]+)`));
  if (!match?.[1]) return null;

  try {
    const decoded = decodeURIComponent(match[1]);
    return deserializeOAuthState(decoded);
  } catch {
    return null;
  }
}

export function extractPkceVerifierFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`${PKCE_COOKIE_NAME}=([^;]+)`));
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export const OAUTH_ALLOWED_PROVIDERS = ["google", "github", "apple"] as const;
export type OAuthProvider = (typeof OAUTH_ALLOWED_PROVIDERS)[number];

export function isValidOAuthProvider(provider: unknown): provider is OAuthProvider {
  return typeof provider === "string" && OAUTH_ALLOWED_PROVIDERS.includes(provider as OAuthProvider);
}
