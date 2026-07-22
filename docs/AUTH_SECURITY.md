# Supabase Authentication Security Enhancements

Comprehensive security improvements to the MasseurMatch authentication system, including session management, OAuth security, password recovery, MFA, and E2E testing.

## Overview

This document outlines the security architecture and implementation details for the auth system.

### Components

```
src/app/api/_lib/
├── csrf.ts                    # CSRF token generation and verification
├── brute-force.ts             # Account lockout and brute-force protection
├── totp.ts                    # TOTP/MFA implementation (RFC 6238 & RFC 4226)
├── password-policy.ts         # Password strength validation
└── oauth-security.ts          # OAuth PKCE and state validation

src/app/api/auth/
├── login/route.ts             # Enhanced login with brute-force & CSRF
├── register/route.ts          # Registration with password validation
├── mfa/
│   ├── setup/route.ts         # MFA enrollment
│   └── verify/route.ts        # MFA verification
└── ...                        # Other auth routes

tests/auth/
└── comprehensive-security.spec.ts  # Full E2E test suite
```

## Security Features

### 1. Session Management

**File:** `src/app/_lib/session.ts`

- **HMAC-SHA256 signed cookies** with timing-safe comparison
- **30-day TTL** with configurable expiration
- **HttpOnly + Secure + SameSite=Lax** flags
- **Automatic invalidation** on logout
- No session data stored in client (only signed cookie)

```typescript
// Session cookie format: base64(payload).signature
// Payload contains: userId, email, role, expiresAt
```

**Usage:** (sessions are managed by Supabase SSR — cookies are written by the
Supabase client on sign-in, not minted manually.)
```typescript
import { getRequestSession } from "@/app/api/_lib/session";

// Retrieve the verified session (validated against Supabase Auth).
const session = await getRequestSession(request);
```

### 2. CSRF Protection

**File:** `src/app/api/_lib/csrf.ts`

- **Double-submit cookie pattern** with HMAC verification
- **State tokens** with timestamp validation (1-hour TTL)
- **Timing-safe comparison** to prevent timing attacks
- **Automatic cookie refresh** on each request

**Implementation:**
```typescript
import { generateCsrfToken, verifyCsrfToken, extractCsrfToken } from "@/app/api/_lib/csrf";

// Generate token for form
const { token, cookie } = generateCsrfToken();

// Verify on form submission
const csrfData = extractCsrfToken(request.headers);
if (!csrfData || !verifyCsrfToken(csrfData.token, csrfData.cookieValue)) {
  // Invalid CSRF token
}
```

### 3. Brute-Force Protection & Account Lockout

**File:** `src/app/api/_lib/brute-force.ts`

- **Per-user + per-IP tracking** of failed login attempts
- **5 failed attempts** → 15-minute account lockout
- **Automatic cleanup** of old attempt records
- **Progressive delays** (configurable)
- **Admin unlock capability** (via database)

**Configuration:**
```typescript
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // Reset after 15 minutes
```

**Usage:**
```typescript
import { checkBruteForce, recordFailedAttempt, clearFailedAttempts, assertNotBruteForceLocked } from "@/app/api/_lib/brute-force";

// Check if account is locked
assertNotBruteForceLocked(email, request); // Throws if locked

// Record failed attempt
recordFailedAttempt(email, request);

// Clear on successful login
clearFailedAttempts(email, request);
```

### 4. Password Security

**File:** `src/app/api/_lib/password-policy.ts`

**Requirements:**
- Minimum 12 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- Special character recommended

**Validation returns:**
```typescript
interface PasswordStrengthResult {
  isValid: boolean;        // Meets minimum requirements
  score: number;           // 0-4 (Weak → Strong)
  feedback: string[];      // What's missing
  suggestions: string[];   // How to improve
}
```

### 5. Multi-Factor Authentication (MFA)

**File:** `src/app/api/_lib/totp.ts`

**Supported:**
- **TOTP (Time-based One-Time Password)** - RFC 6238
- **HMAC-SHA1** for TOTP generation - RFC 4226
- **Backup codes** (10 generated at setup)
- **Clock skew tolerance** (±30 seconds)

**Setup Flow:**
```
1. POST /api/auth/mfa/setup → Generates secret + backup codes
2. User scans QR code with authenticator app
3. POST /api/auth/mfa/verify?code=123456 → Enables MFA
4. Backup codes saved securely
```

**Usage:**
```typescript
import { generateTotpSecret, verifyTotp, generateBackupCodes, generateTotpUri } from "@/app/api/_lib/totp";

// Generate secret (base32 encoded)
const secret = generateTotpSecret();

// Generate URI for QR code
const uri = generateTotpUri(secret, email, "MasseurMatch");

// Verify user's code
const isValid = verifyTotp(secret, userCode);

// Generate backup codes
const codes = generateBackupCodes(10);
```

### 6. OAuth Security

**File:** `src/app/api/_lib/oauth-security.ts`

**Features:**
- **PKCE (Proof Key for Code Exchange)** - RFC 7636
- **State parameter** with timestamp validation
- **Nonce** for ID token verification
- **Provider validation** (Google, GitHub, Apple)
- **Automatic cookie cleanup** on completion

**Supported Providers:**
- Google OAuth 2.0
- GitHub OAuth 2.0
- Apple Sign In

**PKCE Flow:**
```
1. Generate state + code_verifier
2. Create code_challenge = SHA256(code_verifier)
3. Redirect to provider with code_challenge
4. Provider returns authorization_code
5. Exchange code + code_verifier for token
```

### 7. Password Recovery

**Features:**
- Rate-limited (5 requests per IP per 60 seconds)
- **No email enumeration** (same success message for all emails)
- **Secure token generation** via Supabase
- **Token expiration** (typically 1 hour)
- **Email validation** before password change

### 8. Rate Limiting

**Two-tier approach:**

**Global Rate Limits (IP-based):**
```
/api/auth/login           → 10 req/min per IP
/api/auth/register        → 5 req/min per IP
/api/auth/forgot-password → 5 req/min per IP
/api/auth/mfa/verify      → 15 req/min per IP
```

**Distributed Rate Limiting:**
- Uses Upstash Redis when available
- Falls back to in-memory store for local dev
- Automatic cleanup of expired keys

## Implementation Guide

### Adding Security to Existing Routes

**1. Protect login endpoint:**
```typescript
import { assertNotBruteForceLocked, recordFailedAttempt, clearFailedAttempts } from "@/app/api/_lib/brute-force";
import { extractCsrfToken, verifyCsrfToken } from "@/app/api/_lib/csrf";

// Check lockout
assertNotBruteForceLocked(email, request);

// Verify CSRF
const csrfData = extractCsrfToken(request.headers);
if (!verifyCsrfToken(csrfData.token, csrfData.cookieValue)) {
  throw new RouteError(403, "Invalid CSRF token");
}

// On auth failure
recordFailedAttempt(email, request);

// On auth success
clearFailedAttempts(email, request);
```

**2. Protect registration:**
```typescript
import { validatePasswordStrength } from "@/app/api/_lib/password-policy";

const strength = validatePasswordStrength(password);
if (!strength.isValid) {
  throw new RouteError(400, `Password too weak: ${strength.feedback.join(", ")}`);
}
```

**3. Protect OAuth flow:**
```typescript
import { generateOAuthState, verifyOAuthState, createOAuthStateCookie } from "@/app/api/_lib/oauth-security";

// On OAuth initiation
const state = generateOAuthState();
const cookie = createOAuthStateCookie(state, secure);

// On OAuth callback
const storedState = extractOAuthStateFromCookie(request.headers.get("cookie"));
if (!verifyOAuthState(storedState, receivedState)) {
  throw new RouteError(403, "Invalid OAuth state");
}
```

## Database Schema

Required tables for full functionality:

```sql
-- MFA setup in progress
create table mfa_pending (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users,
  totp_secret text not null,
  backup_codes text[] not null,
  expires_at timestamp not null,
  created_at timestamp default now(),
  unique(user_id)
);

-- MFA configuration (stored)
create table user_mfa (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users unique,
  totp_secret text not null,
  backup_codes text[] not null,
  enabled_at timestamp not null,
  updated_at timestamp default now()
);

-- OAuth state tracking (optional, for additional audit)
create table oauth_states (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  provider text not null,
  state_hash text not null unique,
  expires_at timestamp not null,
  created_at timestamp default now()
);

-- Audit log for security events
create table security_audit_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  event_type text not null,
  ip_address text,
  user_agent text,
  result text not null,
  metadata jsonb,
  created_at timestamp default now()
);
```

## Environment Variables

Required for full functionality:

```bash
# Session security
MM_SESSION_SECRET=<your-secret-key>  # 32+ character random string

# CSRF protection
MM_CSRF_SECRET=<your-secret-key>     # 32+ character random string

# Rate limiting (optional, uses in-memory fallback)
UPSTASH_REDIS_REST_URL=<url>
UPSTASH_REDIS_REST_TOKEN=<token>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
SUPABASE_SERVICE_ROLE_KEY=<key>
```

## Testing

### Unit Tests

```bash
npm run test:unit
```

Covers:
- Password strength validation
- TOTP generation and verification
- CSRF token lifecycle
- Session serialization

### E2E Tests

```bash
npm run test:auth              # Run auth tests only
npm run test:auth -- --headed  # Run in browser
```

Comprehensive test suite: `tests/auth/comprehensive-security.spec.ts`

**Covers:**
- Password validation flows
- Session security and expiration
- Account lockout mechanisms
- Password recovery email
- OAuth provider flows
- Security header validation
- XSS prevention
- Logout and session clearing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid password → lockout after 5 attempts
- [ ] Login while locked → 15-minute delay
- [ ] Password recovery sends email
- [ ] Forgot password doesn't enumerate users
- [ ] Session expires after 30 days
- [ ] Logout clears session cookie
- [ ] OAuth redirect includes state + PKCE
- [ ] Session cookie has HttpOnly + Secure flags
- [ ] No password requirements in error messages

## Security Considerations

### What We Protect Against

✅ **Brute force attacks** - Account lockout after 5 failed attempts  
✅ **CSRF** - Double-submit cookie pattern  
✅ **Session hijacking** - HttpOnly, Secure, SameSite cookies + HMAC signatures  
✅ **XSS** - No inline scripts, all sanitized input  
✅ **Timing attacks** - Constant-time comparison for crypto operations  
✅ **Email enumeration** - Same response for valid/invalid emails on password recovery  
✅ **Man-in-the-middle** - PKCE for OAuth, HTTPS requirement in production  
✅ **Weak passwords** - Enforced minimum strength requirements  

### What We Don't Handle (Application-Level)

⚠️ **DDoS protection** - Use Vercel/CF WAF or upstream DDoS service  
⚠️ **Rate limiting at scale** - Distribute with Redis in multi-instance setups  
⚠️ **Account recovery** - Supabase handles email delivery security  
⚠️ **API key leakage** - Secrets management is responsibility of deployment  

## Monitoring

### Audit Logging

Log security events via `recordAuditLog()`:

```typescript
import { recordAuditLog } from "@/app/api/_lib/supabase-server";

await recordAuditLog(
  adminUserId,
  "LOGIN_FAILED_BRUTE_FORCE",
  "user",
  userId,
  { ip, attempts: 5, lockedUntil: timestamp }
);
```

### Key Metrics to Monitor

```
authentication.login.success_rate      # Should be 95%+
authentication.login.lockout_events    # Alert if > 100/hour
authentication.mfa.enrollment_rate     # Target: 50%+
authentication.session.duration        # Should match TTL
security.csrf.validation_failures      # Alert if > 0
password_recovery.rate_limit_hits      # Alert if > 50/hour
```

## Roadmap

### Phase 1 ✅ (Current)
- [x] CSRF protection
- [x] Brute-force protection
- [x] Password strength validation
- [x] TOTP/MFA framework
- [x] OAuth PKCE
- [x] E2E tests

### Phase 2 (Optional)
- [ ] Hardware security key support (WebAuthn)
- [ ] Risk-based authentication (geo-location, device fingerprinting)
- [ ] Session activity dashboard (admin view)
- [ ] Security event webhooks
- [ ] Passwordless authentication (magic links)

### Phase 3 (Future)
- [ ] Zero-knowledge password proof
- [ ] Decentralized identity support
- [ ] Advanced threat detection (ML)

## References

- RFC 2104 - HMAC
- RFC 3394 - Key Wrap Algorithm
- RFC 4226 - HOTP (One-Time Password Algorithm)
- RFC 5234 - ABNF
- RFC 6238 - TOTP (Time-based One-Time Password Algorithm)
- RFC 6234 - US Secure Hash and HMAC Algorithms
- RFC 6749 - OAuth 2.0 Authorization Framework
- RFC 6819 - OAuth 2.0 Threat Model and Security Considerations
- RFC 7636 - Proof Key for Public Clients (PKCE)
- RFC 8174 - Ambiguity in RFC 2119
- OWASP - Authentication Cheat Sheet
- OWASP - Password Storage Cheat Sheet

## Support

For security issues, see `SECURITY.md` in the repository root.
