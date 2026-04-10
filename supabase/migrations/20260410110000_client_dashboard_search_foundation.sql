create table if not exists public.client_favorites (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references auth.users (id) on delete cascade,
  therapist_profile_id uuid not null references public.profiles (id) on delete cascade,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (client_user_id, therapist_profile_id)
);

create index if not exists idx_client_favorites_client on public.client_favorites (client_user_id);
create index if not exists idx_client_favorites_therapist on public.client_favorites (therapist_profile_id);

drop trigger if exists trg_client_favorites_set_updated_at on public.client_favorites;
create trigger trg_client_favorites_set_updated_at
before update on public.client_favorites
for each row execute function public.set_updated_at();

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references auth.users (id) on delete cascade,
  query text not null,
  filters jsonb not null default '{}'::jsonb,
  result_count integer,
  searched_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_search_history_client on public.search_history (client_user_id, searched_at desc);

alter table public.profiles
  add column if not exists preferred_budget_min integer,
  add column if not exists preferred_budget_max integer,
  add column if not exists preferred_specialties text[] not null default '{}'::text[],
  add column if not exists preferred_languages text[] not null default '{}'::text[],
  add column if not exists preferred_radius_miles integer;

alter table public.client_favorites enable row level security;
alter table public.search_history enable row level security;

drop policy if exists "client_favorites_select_own" on public.client_favorites;
create policy "client_favorites_select_own" on public.client_favorites
for select using (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "client_favorites_insert_own" on public.client_favorites;
create policy "client_favorites_insert_own" on public.client_favorites
for insert with check (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "client_favorites_update_own" on public.client_favorites;
create policy "client_favorites_update_own" on public.client_favorites
for update using (client_user_id = auth.uid() or public.is_admin())
with check (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "client_favorites_delete_own" on public.client_favorites;
create policy "client_favorites_delete_own" on public.client_favorites
for delete using (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "search_history_select_own" on public.search_history;
create policy "search_history_select_own" on public.search_history
for select using (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "search_history_insert_own" on public.search_history;
create policy "search_history_insert_own" on public.search_history
for insert with check (client_user_id = auth.uid() or public.is_admin());

drop policy if exists "search_history_delete_own" on public.search_history;
create policy "search_history_delete_own" on public.search_history
for delete using (client_user_id = auth.uid() or public.is_admin());
