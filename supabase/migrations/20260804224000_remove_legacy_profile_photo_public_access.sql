-- Remove legacy permissive profile photo policies that bypass moderation.
-- The canonical policies are:
--   profile_photos_public_read_approved
--   profile_photos_owner_select
--   profile_photos_owner_insert
--   profile_photos_owner_update
--   profile_photos_owner_delete

begin;

drop policy if exists "Users can view profile photos" on public.profile_photos;
drop policy if exists "Users can insert their own profile photos" on public.profile_photos;
drop policy if exists "Users can update their own profile photos" on public.profile_photos;
drop policy if exists "Users can delete their own profile photos" on public.profile_photos;
drop policy if exists "Users can insert their own profile photos (authenticated)" on public.profile_photos;
drop policy if exists "Users can update their own profile photos (authenticated)" on public.profile_photos;
drop policy if exists "Users can delete their own profile photos (authenticated)" on public.profile_photos;

commit;
