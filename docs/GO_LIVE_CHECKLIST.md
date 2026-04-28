# MasseurMatch Go Live Checklist

## Vercel env vars checklist
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_STANDARD`
- [ ] `STRIPE_PRICE_PRO`
- [ ] `STRIPE_PRICE_ELITE`
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_PHONE_NUMBER`
- [ ] `GEMINI_API_KEY` (optional)
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional)
- [ ] `SIGHTENGINE_API_USER` + `SIGHTENGINE_API_SECRET` (optional)
- [ ] `SERPAPI_API_KEY` (optional)
- [ ] `FIRECRAWL_API_KEY` (optional)

## Supabase checklist
- [ ] Auth providers configured for email login/reset.
- [ ] `profiles` table has `_tier`, verification booleans, status, and profile identity columns.
- [ ] RLS policies allow public profile reads and authenticated profile writes.
- [ ] Service role key is configured only in server env.

## Stripe checklist
- [ ] Products/prices match `standard`, `pro`, `elite` IDs.
- [ ] Webhook endpoint `/api/webhooks/stripe` is connected.
- [ ] Event types enabled: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

## Resend checklist
- [ ] Verified sender domain configured.
- [ ] `support@masseurmatch.com`, `billing@masseurmatch.com`, `legal@masseurmatch.com` aliases routed.

## DNS checklist
- [ ] `masseurmatch.com` points to Vercel.
- [ ] `www.masseurmatch.com` redirects to primary domain.
- [ ] SPF/DKIM/DMARC records present for email deliverability.

## Robots and sitemap checklist
- [ ] `/robots.txt` serves and disallows private/query-heavy routes.
- [ ] `/sitemap.xml` serves and includes only public crawlable pages.
- [ ] Segmented sitemap routes `/sitemap/[id].xml` return valid XML.

## Auth checklist
- [ ] `/login`, `/register`, `/forgot-password`, `/reset-password` render without crash.
- [ ] Demo-safe mode works when Supabase vars are absent.
- [ ] Auth middleware does not block public SEO pages.

## Signup checklist
- [ ] Signup creates/simulates profile safely.
- [ ] Post-signup redirect lands on dashboard onboarding/demo dashboard.
- [ ] Missing optional columns do not break signup.

## Dashboard checklist
- [ ] All dashboard routes render with empty/demo fallback.
- [ ] No infinite redirects.
- [ ] Profile completion/plan/verification status visible.

## Admin checklist
- [ ] All admin routes render with demo fallback.
- [ ] Moderation queues, billing overview, SEO health, reports are visible.
- [ ] No infinite redirects.

## Profile checklist
- [ ] Listing/detail pages show profile, city/area, pricing, specialties, photo gallery.
- [ ] Contact actions use direct-contact wording (Call/Text/WhatsApp/Email/Website/Copy Phone).
- [ ] Verification text uses: Identity checked / Profile reviewed / Photo checked.

## Mobile checklist
- [ ] No horizontal overflow on key public/auth/dashboard/admin routes.
- [ ] Header/menu/filter drawers render and close correctly.
- [ ] Sticky CTAs do not cover core actions.

## Legal checklist
- [ ] `/privacy`, `/terms`, `/platform-disclaimer`, `/community-guidelines` and related legal pages render.
- [ ] No claim of license verification by MasseurMatch.
- [ ] No booking or appointment checkout claims.
