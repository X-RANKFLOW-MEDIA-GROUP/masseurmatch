# Provider OTP Twilio fallback fix

## Problem

Provider text verification can fail with this Twilio authentication error:

```txt
Error sending confirmation OTP to provider: Authenticate More information: https://www.twilio.com/docs/errors/20003
```

## Root cause

The provider OTP endpoint currently treats Twilio as a hard requirement. When Twilio credentials are missing, invalid, revoked, or unavailable in a Vercel environment, the endpoint returns a blocking 500 response.

## Required implementation

Patch `src/app/api/provider/verification/text/send/route.ts` so Twilio becomes optional instead of mandatory.

Required behavior:

1. Generate the provider verification code before SMS delivery.
2. Save `verification_code` and `phone_number` to `profiles` for the authenticated provider even if SMS delivery fails.
3. Attempt Twilio SMS only when all required Twilio environment variables are present.
4. Catch Twilio failures, including error 20003, and log only safe metadata such as `code`, `status`, and a non secret message.
5. Never return raw Twilio errors to the user.
6. Return `success: true` when the code is saved successfully.
7. Include `smsSent: true` only when Twilio delivery succeeds.
8. Include `smsSent: false` when the code was saved but SMS delivery is unavailable.

## Safe response shape

```json
{
  "success": true,
  "smsSent": false,
  "message": "Verification code created. SMS delivery is temporarily unavailable."
}
```

## Validation

Run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

## Business constraint

MasseurMatch remains a directory only platform. Do not add booking, client payment, or client account logic.
