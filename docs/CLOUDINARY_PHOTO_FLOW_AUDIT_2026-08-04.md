# Cloudinary Photo Flow Audit — 2026-08-04

## Verified

- Provider photo uploads are intended to go to Cloudinary.
- Existing production photo records store Cloudinary secure URLs in `profile_photos.storage_path`.
- Bruno and Rene/Rey have approved Cloudinary photos in `profile_photos`.
- The `cloudinary-sign` Edge Function is active.
- Production `cloudinary-sign` was updated to accept either the three direct Cloudinary credentials or `CLOUDINARY_URL`.

## Data inconsistencies found

- Some approved `profile_photos` rows do not have matching `moderation_queue` rows.
- Some old `moderation_queue` rows point to photos that no longer exist.
- Some approved profiles still have legacy `status = pending_approval` while `profile_status = approved`.

## Operational rule

The Admin must load the full gallery from `profile_photos`. A missing moderation queue row must never make an uploaded photo disappear from the Admin.

`profile_status` is the canonical profile approval field. The legacy `status` field should not be used independently to determine approval or visibility.

## Remaining implementation

- Make queue insertion and status synchronization reliable for every Cloudinary upload.
- Surface missing queue records as manual-review items.
- Add orphan queue cleanup and reconciliation.
- Add an authenticated end-to-end production upload test.
- Build the full People CRM detail view with photos, profile state, account actions and secure password-reset delivery.
