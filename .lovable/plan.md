
# Comprehensive Profile Approval Pipeline and Moderation System

## Overview
This plan addresses multiple interconnected requirements: translating the provider UI to English, enhancing the moderation panel, implementing a full approval pipeline, email notifications, and re-approval on edits.

---

## 1. Translate Provider Dashboard to English

All provider-facing pages currently use Portuguese labels. These will be converted to English:

**Files to update:**
- `src/pages/dashboard/DashboardProfile.tsx` -- All labels, placeholders, toast messages
- `src/pages/dashboard/DashboardPhotos.tsx` -- All labels, placeholders, toast messages  
- `src/pages/dashboard/DashboardVerification.tsx` -- All labels, descriptions, compliance text
- `src/components/auth/StepProfile.tsx` -- All labels, section headers, button text
- `src/components/auth/StepVerification.tsx` -- All labels, descriptions, button text

**Specialties list** will also be translated:
- "Relaxation Massage", "Therapeutic Massage", "Sports Massage", "Shiatsu", "Reflexology", "Lymphatic Drainage", "Tantric Massage", "Thai Massage", "Hot Stones", "Aromatherapy", "Chiropractic"

---

## 2. Moderation Panel -- Show User Names on Identity Verifications

Currently, `identity_verifications` query does not join with `profiles`. The fix:

- Update the query in `AdminModeration.tsx` to join via `user_id`:
  ```
  .select("*, profiles!identity_verifications_user_id_fkey(display_name, full_name)")
  ```
  If the FK relationship isn't set up, we'll join manually using the `user_id` field.
- Display the user's name in each verification card instead of just `Verification #id`.

---

## 3. Profile Edit Triggers Re-Approval

When a provider edits their profile or uploads new photos, their profile status should revert to `pending_approval`, requiring admin re-review.

**Changes:**
- **`useProfile.ts` (updateProfile function):** After saving profile changes, also set `status: 'pending_approval'` and `is_active: false` on the profile.
- **`DashboardPhotos.tsx`:** After uploading a new photo, set the profile to `pending_approval`.
- **`DashboardProfile.tsx`:** Show a warning banner explaining that saving changes will send the profile back for review.
- **`StepProfile.tsx`:** Already sets profile to pending on initial creation -- no change needed.

---

## 4. Full Approval Pipeline (Profile Goes Live Checklist)

A profile can only go live (status = `active`, `is_active = true`) when ALL of the following are complete:

1. **Email verified** -- handled by authentication (email confirmation on signup)
2. **Phone verified** -- stored in `profiles.phone`; we'll add a `is_verified_phone` boolean column
3. **Identity verified** -- `profiles.is_verified_identity` (via Stripe Identity)
4. **Photos approved** -- `profiles.is_verified_photos` (at least one photo with `moderation_status = approved`)
5. **Profile text approved** -- new field `is_verified_profile` (admin approves bio/text content)

**Database migration:**
- Add `is_verified_phone` (boolean, default false) to `profiles`
- Add `is_verified_profile` (boolean, default false) to `profiles`

**Admin Moderation panel updates:**
- Add a third tab: "Profiles" showing profiles with `status = 'pending_approval'`
- Admin can review bio, specialties, certifications, pricing, etc.
- Approve sets `is_verified_profile = true`; reject sends back with reason

**Auto-activation logic:**
- When admin approves any item (photo, profile text, identity), check if ALL verification flags are true. If yes, set `status = 'active'` and `is_active = true`.
- This can be done in the admin moderation handlers or via a database trigger.

---

## 5. Post-Verification Redirect

After Stripe Identity verification completes, the user is currently left on the verification step with a "Check verification" button. The flow will be:

1. After verification, user clicks "Verification Complete" which checks status
2. If verified, advance to Step 3 (Profile setup)
3. If during onboarding: after profile submission, redirect to `/dashboard` with a message "Your profile is under review"
4. If from dashboard: show updated checklist status

No major change needed -- current flow already handles this. We'll just ensure the dashboard shows a clear "Under Review" banner when `status = 'pending_approval'`.

---

## 6. Email Notifications

Create a new edge function `send-notification-email` that sends transactional emails via Supabase Auth's built-in email or a simple SMTP/Resend integration.

**Trigger points:**
1. **Account created** -- Welcome email (already handled by Supabase auth email confirmation)
2. **Profile approved** -- "Your profile is now live!" email sent when admin approves and all checks pass

**Implementation approach:**
- Use a database trigger on `profiles` table: when `status` changes to `active`, call the edge function
- Or handle it directly in the admin moderation code after setting a profile to active

For MVP, we'll send emails using Supabase's built-in `supabase.auth.admin.sendRawEmail` or use the Resend API if a key is configured. Since no email service key exists yet, we'll implement the structure and use Lovable AI to generate the email content, deferring actual sending to when an email provider is connected.

---

## 7. Admin Moderation Panel Enhancements

The moderation panel will have three tabs:

| Tab | Content |
|-----|---------|
| **Photos** | Pending photos with user name, photo preview, approve/reject |
| **Profiles** | Pending profile text/bio reviews with full profile details |
| **Identity** | Pending ID verifications with user name |

Each approval action will:
1. Update the specific verification flag
2. Check if all flags are now true
3. If yes, auto-activate the profile and send approval email
4. Log to audit_log

---

## Technical Summary

### Database Migration
```sql
ALTER TABLE profiles ADD COLUMN is_verified_phone boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN is_verified_profile boolean DEFAULT false;
```

### Files to Create
- `supabase/functions/send-notification-email/index.ts` -- Email notification edge function

### Files to Modify
- `src/pages/dashboard/DashboardProfile.tsx` -- English translation + re-approval warning
- `src/pages/dashboard/DashboardPhotos.tsx` -- English translation + trigger re-approval on upload
- `src/pages/dashboard/DashboardVerification.tsx` -- English translation + expanded checklist
- `src/components/auth/StepProfile.tsx` -- English translation
- `src/components/auth/StepVerification.tsx` -- English translation
- `src/pages/admin/AdminModeration.tsx` -- Add Profiles tab, show user names on identity, auto-activate logic
- `src/hooks/useProfile.ts` -- Set pending_approval on profile updates
- `supabase/config.toml` -- Register new edge function

### Estimated scope
- ~10 files modified/created
- 1 database migration
- 1 new edge function
