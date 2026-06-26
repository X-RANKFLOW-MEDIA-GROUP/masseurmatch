-- 20260410000000 creates client_favorites(user_id, therapist_id) and
-- search_history(user_id, ...). 20260410110000 then does CREATE TABLE IF NOT
-- EXISTS (skipped) but immediately indexes client_user_id / therapist_profile_id
-- / searched_at which don't exist. Add them here so those indexes succeed.

alter table public.client_favorites
  add column if not exists client_user_id      uuid references auth.users(id) on delete cascade,
  add column if not exists therapist_profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists notes               text,
  add column if not exists updated_at          timestamptz not null default timezone('utc', now());

alter table public.search_history
  add column if not exists client_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists result_count    integer,
  add column if not exists searched_at     timestamptz not null default timezone('utc', now());
