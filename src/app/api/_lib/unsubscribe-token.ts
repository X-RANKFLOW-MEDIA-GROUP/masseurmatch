import { jwtVerify, SignJWT } from "jose";

const UNSUBSCRIBE_ISSUER = "masseurmatch";
const UNSUBSCRIBE_AUDIENCE = "masseurmatch-unsubscribe";
const UNSUBSCRIBE_PURPOSE = "marketing-unsubscribe";
const MIN_SECRET_LENGTH = 32;

export class UnsubscribeTokenConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsubscribeTokenConfigurationError";
  }
}

function getUnsubscribeSecret(): Uint8Array {
  const secret = process.env.UNSUBSCRIBE_JWT_SECRET?.trim() ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new UnsubscribeTokenConfigurationError(
      `UNSUBSCRIBE_JWT_SECRET must be configured with at least ${MIN_SECRET_LENGTH} characters.`,
    );
  }
  return new TextEncoder().encode(secret);
}

export async function generateUnsubscribeToken(
  userId: string,
  email: string,
  expirationHours: number = 365 * 24,
): Promise<string> {
  // Preserve the historical call signature without putting the user's email in
  // a URL token. The subject is sufficient to process an unsubscribe request.
  void email;

  if (!userId) {
    throw new Error("A user id is required to generate an unsubscribe token.");
  }

  const expirationDate = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

  return new SignJWT({ purpose: UNSUBSCRIBE_PURPOSE })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(UNSUBSCRIBE_ISSUER)
    .setAudience(UNSUBSCRIBE_AUDIENCE)
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(expirationDate)
    .sign(getUnsubscribeSecret());
}

export async function verifyUnsubscribeToken(token: string): Promise<{ userId: string }> {
  const secret = getUnsubscribeSecret();

  try {
    const verified = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      issuer: UNSUBSCRIBE_ISSUER,
      audience: UNSUBSCRIBE_AUDIENCE,
    });

    const userId = verified.payload.sub;
    if (typeof userId !== "string" || !userId || verified.payload.purpose !== UNSUBSCRIBE_PURPOSE) {
      throw new Error("Invalid unsubscribe token claims.");
    }

    return { userId };
  } catch (primaryError) {
    // Transitional support for previously issued tokens that used the same
    // configured secret but did not yet carry issuer/audience/purpose claims.
    // Tokens created with the removed hard-coded fallback do not verify once a
    // real UNSUBSCRIBE_JWT_SECRET is configured.
    try {
      const legacy = await jwtVerify(token, secret, { algorithms: ["HS256"] });
      const userId = legacy.payload.sub || legacy.payload.user_id;
      if (typeof userId !== "string" || !userId) {
        throw primaryError;
      }
      return { userId };
    } catch {
      throw primaryError;
    }
  }
}

export function getUnsubscribeUrl(token: string, baseUrl?: string): string {
  const url = new URL(
    "/unsubscribe",
    baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://masseurmatch.com",
  );
  url.searchParams.set("token", token);
  return url.toString();
}
