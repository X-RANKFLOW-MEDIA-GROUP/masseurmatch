-- Normalize legacy profile visibility values before enforcing the production CHECK constraint.
-- Existing production rows may still use 'private', which violates the new allowed set.

update public.profiles
set visibility_status = 'hidden'
where visibility_status = 'private';

alter table public.profiles drop constraint if exists profiles_visibility_status_check;

alter table public.profiles add constraint profiles_visibility_status_check
  check (visibility_status in ('hidden','public','paused','suspended'));
