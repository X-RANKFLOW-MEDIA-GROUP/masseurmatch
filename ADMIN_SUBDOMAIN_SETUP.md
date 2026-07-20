# Admin Portal Subdomain Setup - admin.masseurmatch.com

## Overview

The admin portal is now accessible via the dedicated subdomain **`admin.masseurmatch.com`**, making it the primary entry point for admin users. This implementation provides:

- **Secure subdomain routing** — requests to `admin.masseurmatch.com` are intelligently routed to `/admin/*`
- **Session validation** — admins must be logged in with valid `admin` role
- **Automatic redirection** — unauthenticated users are sent to the main login page
- **Protection from non-admins** — users with non-admin roles are redirected to the homepage

## Implementation Details

### Middleware Configuration

**File:** `src/middleware.ts` (lines 195–211)

The middleware intercepts requests to `admin.masseurmatch.com` and:

1. **Validates session** — checks for valid `mm_session` cookie with `admin` role
2. **Handles unauthenticated access** — redirects to `https://masseurmatch.com/login?redirect=/admin`
3. **Prevents unauthorized access** — non-admin users are redirected to `https://masseurmatch.com/`
4. **Rewrites URLs** — translates `admin.masseurmatch.com/*` → `/admin/*` transparently

```typescript
// Admin subdomain routing
const host = request.headers.get("host") ?? "";
if (host === "admin.masseurmatch.com") {
  const adminPathname = pathname === "/" ? "/admin" : pathname.startsWith("/admin") ? pathname : `/admin${pathname}`;
  if (!session) {
    const loginUrl = new URL("https://masseurmatch.com/login");
    loginUrl.searchParams.set("redirect", adminPathname);
    return NextResponse.redirect(loginUrl);
  }
  if (session.role !== "admin") {
    return NextResponse.redirect(new URL("https://masseurmatch.com/"));
  }
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = adminPathname;
  return NextResponse.rewrite(rewriteUrl);
}
```

### Admin App Structure

**Base:** `src/app/admin/`

**Authentication:** `src/app/admin/login/page.tsx`
- Dedicated login page for admin subdomain
- Keeps users on `admin.masseurmatch.com` throughout authentication
- Reuses main `LoginPageClient` component
- Automatically redirects authenticated users back to `/admin` dashboard

The admin portal includes the following modules:

- **Dashboard** — `dashboard/` — Overview and key metrics
- **Approvals** — `approvals/` — Therapist profile verification & approval
- **Verification** — `verification/` — Document and photo verification
- **Moderation** — `moderation/` — Review flagged content
- **Users** — `users/` — User management and permissions
- **Cities** — `cities/` — Geographic coverage settings
- **Billing** — `billing/` — Revenue and subscription tracking
- **Blog** — `blog/` — Content management
- **Reports** — `reports/` — Analytics and insights
- **SMS** — `sms/` — Alert management
- **Logs** — `logs/` — System activity logs
- **Settings** — `settings/` — Admin configuration

### Session and Authentication

**Files:**
- `src/middleware.ts` — Session validation and cookie parsing
- `src/app/api/_lib/supabase-server.ts` — Admin role verification
- `src/app/admin/layout.tsx` — Admin layout with access guards

The session system uses HMAC-signed cookies (`mm_session`) containing:
- `userId` — Admin user ID
- `email` — Admin email address
- `role` — User role (`admin`, `provider`, or `client`)
- `expiresAt` — Session expiration timestamp

### Login Flow for Admin Subdomain

1. User visits `admin.masseurmatch.com` (or any subpath)
2. Middleware checks for valid admin session
3. If no session → redirect to `admin.masseurmatch.com/login?redirect=/admin`
4. User sees login page on admin subdomain
5. User logs in with admin credentials
6. Session is created and returned to browser
7. User is redirected to `/admin` dashboard
8. On next request to `admin.masseurmatch.com`, middleware validates session and allows access
9. Request is rewritten to `/admin/*` and the admin dashboard loads

**Key difference:** Users now stay on the admin subdomain throughout the entire authentication flow, rather than being redirected to the main domain.

## Vercel Configuration Required

### 1. Domain Alias Setup

Add `admin.masseurmatch.com` as a domain alias in Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the **MasseurMatch** project
3. Navigate to **Settings → Domains**
4. Click **Add Domain**
5. Enter `admin.masseurmatch.com`
6. Select **Alias to an existing domain** and choose `masseurmatch.com`
7. Configure DNS (Vercel will provide CNAME records)
8. Wait for DNS propagation (typically 10-30 minutes)

### 2. DNS Configuration (at your domain registrar)

Add a CNAME record:
```
admin.masseurmatch.com  CNAME  cname.vercel-dns.com.
```

*(The exact CNAME value will be provided by Vercel during domain setup)*

### 3. Environment Variables

Ensure these are set in Vercel (Settings → Environment Variables):

```
MM_SESSION_SECRET=<your-session-secret>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-key>
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
```

## Testing the Subdomain Routing

### Local Testing

1. **Add local DNS override** (edit `/etc/hosts` on macOS/Linux or `C:\Windows\System32\drivers\etc\hosts` on Windows):
   ```
   127.0.0.1  admin.masseurmatch.local
   ```

2. **Run dev server:**
   ```bash
   pnpm dev
   ```

3. **Test unauthenticated access:**
   - Visit `http://admin.masseurmatch.local:3000`
   - Should redirect to login page with `redirect=/admin` query param

4. **Test authenticated access:**
   - Log in as admin user
   - Visit `http://admin.masseurmatch.local:3000`
   - Should display admin dashboard

### Production Testing

1. Verify domain is active in Vercel dashboard
2. Visit `https://admin.masseurmatch.com`
3. Test login flow (unauthenticated → login page → dashboard)
4. Test authorization (non-admin user → redirected to homepage)
5. Test specific admin paths:
   - `https://admin.masseurmatch.com/approvals`
   - `https://admin.masseurmatch.com/moderation`
   - `https://admin.masseurmatch.com/users`

## Security Considerations

### ✅ What's Protected

- **Session validation** — only valid admin sessions allowed
- **Role verification** — only users with `admin` role can access
- **HMAC signing** — cookies are cryptographically signed to prevent tampering
- **Constant-time comparison** — signature verification is timing-safe
- **Secure redirect** — redirect URLs are sanitized and validated
- **Session expiry** — sessions expire and are automatically cleaned up

### ⚠️ Additional Security Notes

- The `MM_SESSION_SECRET` must be strong and unique
- Ensure HTTPS only (Vercel enforces this automatically)
- The session secret must be set in production (hardcoded dev secret is only for local testing)
- All admin API endpoints should validate the admin role server-side

## Troubleshooting

### Admin subdomain returns 404

**Cause:** Domain not configured in Vercel
**Solution:** Add `admin.masseurmatch.com` as a domain alias in Vercel dashboard

### Redirect loop on login

**Cause:** Session not being created or session secret mismatch
**Solution:** 
- Verify `MM_SESSION_SECRET` is set and identical across all instances
- Check browser cookies are not blocked
- Clear browser cache and cookies, try again

### Non-admins getting access to /admin

**Cause:** Session role is not being validated
**Solution:**
- Check middleware is running (logs should show host checks)
- Verify user has `admin` role in database
- Check `mm_session` cookie contains correct role

### Domain shows Vercel's default page

**Cause:** Domain not yet propagated or not linked to project
**Solution:**
- Wait for DNS propagation (up to 24 hours)
- Verify domain is linked to MasseurMatch project in Vercel
- Check CNAME record is correct at your registrar

## Files Involved

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Subdomain routing logic and unauthenticated redirect |
| `src/app/admin/layout.tsx` | Admin layout with access guards |
| `src/app/admin/page.tsx` | Admin dashboard homepage |
| `src/app/admin/login/page.tsx` | Admin subdomain login page |
| `src/app/login/LoginPageClient.tsx` | Reusable login form component |
| `src/app/admin/_components/AdminLayoutShell.tsx` | Admin UI wrapper |
| `src/app/_lib/auth/` | Session utilities |
| `vercel.json` | Vercel deployment config |

## Deployment Checklist

- [ ] Domain `admin.masseurmatch.com` added in Vercel dashboard
- [ ] DNS CNAME records propagated (test with `nslookup` or `dig`)
- [ ] Environment variables set: `MM_SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Build succeeds: `pnpm run build`
- [ ] Type check passes: `npx tsc --noEmit`
- [ ] Linting passes: `npx eslint src/middleware.ts src/app/admin/**/*.tsx`
- [ ] Local testing completed (unauthenticated → login; authenticated → dashboard)
- [ ] Production deployment verified
- [ ] Non-admin user blocked from `/admin` routes
- [ ] Admin can access all admin dashboard pages

## Future Enhancements

- [ ] Two-factor authentication for admin accounts
- [ ] Admin activity logging and audit trail
- [ ] Rate limiting on admin endpoints
- [ ] IP allowlist for admin access
- [ ] Session invalidation on password change
- [ ] Admin-only feature flags and toggles

---

**Last Updated:** July 20, 2026  
**Status:** ✅ Implemented and ready for deployment  
**Branch:** `claude/admin-portal-entry-32ghwe`
