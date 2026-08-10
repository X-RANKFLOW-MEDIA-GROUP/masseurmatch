import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.UNSUBSCRIBE_JWT_SECRET || process.env.JWT_SECRET || 'unsubscribe-secret-key'
);

export async function generateUnsubscribeToken(
  userId: string,
  email: string,
  expirationHours: number = 365 * 24 // Default: 1 year
): Promise<string> {
  const now = new Date();
  const expirationDate = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);

  const token = await new SignJWT({
    email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(expirationDate)
    .sign(JWT_SECRET);

  return token;
}

export function getUnsubscribeUrl(token: string, baseUrl?: string): string {
  const url = new URL('/unsubscribe', baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://masseurmatch.com');
  url.searchParams.set('token', token);
  return url.toString();
}
