import { createHmac, randomBytes } from "node:crypto";

const TOTP_WINDOW = 1; // Allow 1 time window in each direction for clock skew
const TIME_STEP = 30; // 30 seconds per time window
const DIGITS = 6;

// HMAC-based One-Time Password algorithm (RFC 4226)
function hmacSha1(key: Buffer, counter: Buffer): Buffer {
  return createHmac("sha1", key).update(counter).digest();
}

// Time-based One-Time Password algorithm (RFC 6238)
function generateTotp(secret: string, timestamp: number = Date.now()): string {
  const secretBuffer = Buffer.from(secret, "base64");
  let timeCounter = Math.floor(timestamp / 1000 / TIME_STEP);
  const counterBuffer = Buffer.alloc(8);

  for (let i = 7; i >= 0; i--) {
    // eslint-disable-next-line no-bitwise
    counterBuffer[i] = timeCounter & 0xff;
    // eslint-disable-next-line no-bitwise
    timeCounter = timeCounter >> 8;
  }

  const hmac = hmacSha1(secretBuffer, counterBuffer);
  // eslint-disable-next-line no-bitwise
  const offset = hmac[hmac.length - 1] & 0xf;
  // eslint-disable-next-line no-bitwise
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % Math.pow(10, DIGITS)).toString().padStart(DIGITS, "0");
}

export function generateTotpSecret(): string {
  // Generate 32 random bytes and encode as base32 (RFC 4648)
  const randomBytes32 = randomBytes(32);
  const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let base32 = "";

  let bits = 0;
  let value = 0;

  for (const byte of randomBytes32) {
    // eslint-disable-next-line no-bitwise
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      // eslint-disable-next-line no-bitwise
      base32 += base32Alphabet[(value >> bits) & 31];
    }
  }

  if (bits > 0) {
    // eslint-disable-next-line no-bitwise
    base32 += base32Alphabet[(value << (5 - bits)) & 31];
  }

  // Pad to multiple of 8
  while (base32.length % 8 !== 0) {
    base32 += "=";
  }

  return base32;
}

export function verifyTotp(secret: string, token: string, timestamp: number = Date.now()): boolean {
  if (token.length !== DIGITS || !/^\d+$/.test(token)) {
    return false;
  }

  try {
    const timeCounter = Math.floor(timestamp / 1000 / TIME_STEP);

    // Check current window and adjacent windows for clock skew tolerance
    for (let offset = -TOTP_WINDOW; offset <= TOTP_WINDOW; offset++) {
      const checkCounter = timeCounter + offset;
      const checkTimestamp = checkCounter * TIME_STEP * 1000;
      const expectedToken = generateTotp(secret, checkTimestamp);

      if (token === expectedToken) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export function generateTotpUri(secret: string, email: string, issuer: string = "MasseurMatch"): string {
  // Generate otpauth:// URI for QR code scanning (RFC 6238 Appendix B)
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: DIGITS.toString(),
    period: TIME_STEP.toString(),
  });

  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?${params.toString()}`;
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = randomBytes(4)
      .toString("hex")
      .toUpperCase()
      .replace(/(.{4})/g, "$1-")
      .slice(0, -1);

    codes.push(code);
  }

  return codes;
}
