ALTER TABLE public.profile_photos
  ADD COLUMN IF NOT EXISTS storage_bucket text NOT NULL DEFAULT 'external';

UPDATE public.profile_photos
SET storage_bucket = 'therapist-photos'
WHERE storage_path IS NOT NULL
  AND storage_path !~* '^https?://'
  AND url ~* '/storage/v1/object/public/therapist-photos/';

ALTER TABLE public.profile_photos
  DROP CONSTRAINT IF EXISTS profile_photos_storage_bucket_check;
ALTER TABLE public.profile_photos
  ADD CONSTRAINT profile_photos_storage_bucket_check
  CHECK (storage_bucket IN ('external','pending-photos','therapist-photos'));

UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']::text[]
WHERE id = 'pending-photos';

DROP POLICY IF EXISTS "Authenticated can delete therapist photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update therapist photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload therapist photos" ON storage.objects;
DROP POLICY IF EXISTS "List/read own therapist photos" ON storage.objects;
DROP POLICY IF EXISTS "Upload own therapist photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read therapist photos by path" ON storage.objects;

COMMENT ON COLUMN public.profile_photos.storage_bucket IS
  'Storage origin: external for legacy remote assets, pending-photos while under moderation, therapist-photos after publication.';
