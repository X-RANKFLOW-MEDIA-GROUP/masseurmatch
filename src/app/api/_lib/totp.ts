import { createHmac, randomBytes } from "node:crypto";

const TOTP_WINDOW = 1; // Allow 1 time window in each direction for clock skew
const TIME_STEP = 30; // 30 seconds per time window
const DIGITS = 6;

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// Decode an RFC 4648 base32 secret (the encoding authenticator apps use) into
// its raw bytes. The secret is produced by generateTotpSecret below, so the two
// MUST agree on the encoding — decoding base32 as base64 (the previous bug)
// yields different bytes and every code fails to verify.
function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >> bits) & 0xff);
    }
  }

  return Buffer.from(bytes);
}

// HMAC-based One-Time Password algorithm (RFC 4226)
function hmacSha1(key: Buffer, counter: Buffer): Buffer {
  return createHmac("sha1", key).update(counter).digest();
}

// Time-based One-Time Password algorithm (RFC 6238)
function generateTotp(secret: string, timestamp: number = Date.now()): string {
  const secretBuffer = base32Decode(secret);
  let timeCounter = Math.floor(timestamp / 1000 / TIME_STEP);
  const counterBuffer = Buffer.alloc(8);

  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = timeCounter & 0xff;
    timeCounter = timeCounter >> 8;
  }

  const hmac = hmacSha1(secretBuffer, counterBuffer);
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % Math.pow(10, DIGITS)).toString().padStart(DIGITS, "0");
}

export function generateTotpSecret(): string {
  // Generate 20 random bytes and encode as unpadded base32 (RFC 4648). No `=`
  // padding: authenticator apps expect the bare base32 secret in otpauth URIs.
  const raw = randomBytes(20);
  let base32 = "";
  let bits = 0;
  let value = 0;

  for (const byte of raw) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      base32 += BASE32_ALPHABET[(value >> bits) & 31];
    }
  }

  if (bits > 0) {
    base32 += BASE32_ALPHABET[(value << (5 - bits)) & 31];
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
