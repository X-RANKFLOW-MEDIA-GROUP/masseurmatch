-- Replace the open "public can read everything" storage policy with one that
-- restricts reads to photos whose status is 'approved' in the therapist_photos table.
-- This ensures rejected or pending photos are unreachable via their CDN URL even if
-- the storage path is known — they are also deleted from storage on rejection (see
-- admin photo reject route), providing defense-in-depth.

drop policy if exists "Public can read therapist photos" on storage.objects;

create policy "Approved therapist photos are publicly readable"
on storage.objects
for select
to public
using (
  bucket_id = 'therapist-photos'
  and exists (
    select 1
      from public.therapist_photos tp
     where tp.storage_path = storage.objects.name
       and tp.status       = 'approved'
  )
);

-- Allow service-role (used by admin) to read any photo regardless of status,
-- so the moderation UI can display pending/rejected photos for review.
drop policy if exists "Service role can read all therapist photos" on storage.objects;

create policy "Service role can read all therapist photos"
on storage.objects
for select
to service_role
using (bucket_id = 'therapist-photos');
