import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/mm/types";

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.SESSION_SECRET || "masseurmatch-demo-secret");
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function readSessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (
      typeof payload.id === "string" &&
      typeof payload.email === "string" &&
      typeof payload.fullName === "string" &&
      (payload.role === "admin" || payload.role === "therapist")
    ) {
      return {
        id: payload.id,
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
      };
    }
  } catch {
    return null;
  }

  return null;
}
