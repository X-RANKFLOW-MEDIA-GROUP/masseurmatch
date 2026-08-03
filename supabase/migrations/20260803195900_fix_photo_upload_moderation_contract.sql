-- Repair the profile photo upload/moderation contract.
--
-- Problems addressed:
-- 1. Providers could not reliably read/update their own pending photos because
--    the surviving RLS policy only exposed approved photos publicly.
-- 2. The moderation queue unique index allowed only one pending photo per
--    profile/source, so additional uploads were never represented in admin.
-- 3. profiles.is_verified_photos drifted from the real approved-photo count.

begin;

alter table public.profile_photos enable row level security;
alter table public.moderation_queue enable row level security;

grant select, insert, update, delete on public.profile_photos to authenticated;
grant select, insert on public.moderation_queue to authenticated;

-- Public users may only see approved photos.
drop policy if exists profile_photos_public_read_approved on public.profile_photos;
create policy profile_photos_public_read_approved
on public.profile_photos
for select
using (moderation_status = 'approved');

-- Providers must be able to manage and see every status for their own photos.
drop policy if exists profile_photos_owner_select on public.profile_photos;
create policy profile_photos_owner_select
on public.profile_photos
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = profile_photos.profile_id
      and (p.user_id = auth.uid() or p.id = auth.uid())
  )
);

drop policy if exists profile_photos_owner_insert on public.profile_photos;
create policy profile_photos_owner_insert
on public.profile_photos
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = profile_photos.profile_id
      and (p.user_id = auth.uid() or p.id = auth.uid())
  )
);

drop policy if exists profile_photos_owner_update on public.profile_photos;
create policy profile_photos_owner_update
on public.profile_photos
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = profile_photos.profile_id
      and (p.user_id = auth.uid() or p.id = auth.uid())
  )
);

drop policy if exists profile_photos_owner_delete on public.profile_photos;
create policy profile_photos_owner_delete
on public.profile_photos
for delete
to authenticated
using (user_id = auth.uid());

-- Keep provider-created moderation items constrained to their own profile.
drop policy if exists "Users can insert their own moderation queue items" on public.moderation_queue;
drop policy if exists moderation_queue_insert_self_or_admin on public.moderation_queue;
create policy moderation_queue_insert_self
on public.moderation_queue
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = moderation_queue.profile_id
      and (p.user_id = auth.uid() or p.id = auth.uid())
  )
);

-- One profile can have many pending photo uploads. Deduplicate only the exact
-- target photo, not the whole profile/source pair.
drop index if exists public.idx_moderation_queue_pending_profile_source;
create unique index if not exists idx_moderation_queue_pending_target
on public.moderation_queue (item_type, source, target_id)
where status = 'pending' and target_id is not null;

-- Synchronize the profile badge from the actual approved photo count.
create or replace function public.sync_profile_verified_photos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_profile_id uuid;
begin
  affected_profile_id := coalesce(new.profile_id, old.profile_id);

  if affected_profile_id is not null then
    update public.profiles p
    set
      is_verified_photos = exists (
        select 1
        from public.profile_photos pp
        where pp.profile_id = affected_profile_id
          and pp.moderation_status = 'approved'
      ),
      updated_at = timezone('utc', now())
    where p.id = affected_profile_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_profile_verified_photos on public.profile_photos;
create trigger trg_sync_profile_verified_photos
after insert or update of moderation_status or delete on public.profile_photos
for each row execute function public.sync_profile_verified_photos();

-- Backfill existing profiles immediately.
update public.profiles p
set is_verified_photos = exists (
  select 1
  from public.profile_photos pp
  where pp.profile_id = p.id
    and pp.moderation_status = 'approved'
);

commit;
