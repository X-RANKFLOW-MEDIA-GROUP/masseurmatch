# Unified Admin People CRM

## Goal

Replace the separate Users and Therapists admin destinations with one People CRM that gives admins a complete operational view of each person and their therapist profile.

## Current implementation in this branch

- Adds `/admin/people`.
- Replaces the Users and Therapists sidebar entries with People CRM.
- Redirects `/admin/users` and `/admin/therapists` to `/admin/people`.
- Loads account and therapist management data on one page.

## Required follow-up before production merge

### People record

Create one consolidated record per person by joining the auth user, profile, roles, subscription, photos, moderation, reports and admin activity.

### CRM actions

- Search and filter by account type and status.
- Open a person detail drawer or page.
- Send password reset email without exposing a password.
- Revoke sessions.
- Edit account and profile fields.
- Approve, reject, suspend or ban.
- Manage subscription tier, discount and featured placement.
- Add internal notes, tags and follow-up dates.
- Show audit history.

### Photos

Use `profile_photos` as the source of truth for the person's complete gallery. `moderation_queue` must be treated as workflow state, not as the only way to discover photos.

Expected flow:

1. Authenticated provider requests a Cloudinary signature.
2. Browser uploads directly to Cloudinary.
3. Secure Cloudinary URL is inserted into `profile_photos.storage_path`.
4. A moderation queue item is created for the photo.
5. `moderate-photo` processes the image.
6. Both `profile_photos` and `moderation_queue` receive the final status.
7. If queue creation or automated moderation fails, keep the photo visible to admins and mark it for manual review.

### Profile status

`profile_status` is the canonical approval workflow field. The legacy `status` column must not independently control admin display or public visibility.

Public listing state should be derived consistently from:

- `profile_status`
- `visibility_status`
- `is_active`
- suspension and ban flags

Do not automatically alter existing production records until the reconciliation rules are implemented and reviewed.
