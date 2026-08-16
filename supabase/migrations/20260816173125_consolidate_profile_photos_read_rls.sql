-- Preserve exact read access while avoiding two permissive SELECT policies for authenticated users.
drop policy if exists profile_photos_owner_select on public.profile_photos;
drop policy if exists profile_photos_public_read_approved on public.profile_photos;
create policy profile_photos_anon_read_approved on public.profile_photos for select to anon using (moderation_status = 'approved'::text);
create policy profile_photos_authenticated_read_approved_or_owner on public.profile_photos
  for select to authenticated
  using (
    moderation_status = 'approved'::text
    or user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = profile_photos.profile_id
        and (p.user_id = (select auth.uid()) or p.id = (select auth.uid()))
    )
  );
