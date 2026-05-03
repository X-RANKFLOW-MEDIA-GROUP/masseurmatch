# Auth and Session Lock

## Decision

MasseurMatch uses two auth layers intentionally:

1. Supabase Auth for identity provider state and OAuth/session token exchange.
2. `mm_session`, a signed HTTP only application session cookie, for middleware and server route authorization.

This split is allowed only if every auth path keeps both layers consistent.

## Source of truth

- Identity source of truth: Supabase Auth user.
- Role source of truth: `public.user_roles.role`.
- Server authorization source of truth: signed `mm_session` cookie.
- Client hydration source: Supabase browser session, mirrored after login/register.

## Valid app roles

- `admin`
- `provider`
- `therapist` as compatibility alias for provider only where legacy code requires it
- `client` only for explicitly client scoped routes, not required for public browsing

## Hard rules

- Production must never set `mm_session` with `role: null`.
- OAuth callback must fail closed if role cannot be resolved.
- `/pro/*` requires provider or therapist compatibility role.
- `/admin/*` requires admin.
- `/client/*` requires client.
- Logout must clear server cookie and Supabase client session.
- No Twilio OTP in signup unless intentionally reintroduced with full production config and tests.

## Required test coverage

- Missing OAuth code redirects to login with error.
- Invalid OAuth code redirects to login with error.
- Provider can access `/pro/dashboard`.
- Provider cannot access `/admin`.
- Admin can access `/admin`.
- Unauthenticated users are redirected with destination preserved.
- Logout clears session.

## Forbidden patterns

- Setting an app session before role resolution.
- Client only auth checks for protected routes.
- Multiple role tables without sync strategy.
- Silent fallback to home when auth is misconfigured.
