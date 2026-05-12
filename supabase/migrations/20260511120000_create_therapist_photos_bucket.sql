-- Creates the storage bucket used by the therapist dashboard photo upload.
-- Safe to run multiple times.

insert into storage.buckets (id, name, public)
values ('therapist-photos', 'therapist-photos', true)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public;

-- Allow authenticated providers to upload their own profile photo objects.
create policy if not exists "Authenticated users can upload therapist photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'therapist-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own therapist photo objects.
create policy if not exists "Authenticated users can update own therapist photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'therapist-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'therapist-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Public read is required because dashboard stores public_url and profile photos are publicly displayed after review.
create policy if not exists "Public can read therapist photos"
on storage.objects
for select
to public
using (bucket_id = 'therapist-photos');
