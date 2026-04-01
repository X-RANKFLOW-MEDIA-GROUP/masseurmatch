import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { envOptional } from "@/app/_lib/env";

export type AuthTokenPayload = JWTPayload & {
  sub: string;
  email?: string;
  role?: "admin" | "provider" | null;
  scope?: "auth" | "password-reset" | "session";
};

const encoder = new TextEncoder();

function getSigningKey() {
  return encoder.encode(
    envOptional(["MM_JWT_SECRET", "JWT_SECRET", "MM_SESSION_SECRET"]) ??
    (process.env.NODE_ENV === "production"
      ? (() => { throw new Error("MM_JWT_SECRET is required in production."); })()
      : "dev-only-masseurmatch-jwt-secret"),
  );
}

export async function signAuthToken(
  payload: AuthTokenPayload,
  expiresIn: string | number = "1h",
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSigningKey());
}

export async function verifyAuthToken<TPayload extends AuthTokenPayload = AuthTokenPayload>(token: string) {
  const verified = await jwtVerify(token, getSigningKey());
  return verified.payload as TPayload;
}
