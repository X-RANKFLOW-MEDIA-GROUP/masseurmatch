-- featured_masters was created manually in production and is not in any prior migration.
-- The /api/admin/profile/[id]/feature route upserts into this table; without it the
-- route returns 500. Safe to run on production (CREATE TABLE IF NOT EXISTS).

create table if not exists public.featured_masters (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid unique references public.profiles(id) on delete cascade,
  city          text,
  display_order integer default 0,
  is_active     boolean default true,
  featured_by   uuid references auth.users(id) on delete set null,
  starts_at     timestamptz,
  ends_at       timestamptz,
  created_at    timestamptz not null default timezone('utc', now())
);

create index if not exists idx_featured_masters_active
  on public.featured_masters (is_active, display_order);

alter table public.featured_masters enable row level security;

drop policy if exists "featured_masters_public_read" on public.featured_masters;
create policy "featured_masters_public_read"
  on public.featured_masters for select
  using (is_active = true);

drop policy if exists "featured_masters_admin_all" on public.featured_masters;
create policy "featured_masters_admin_all"
  on public.featured_masters for all
  using (public.is_admin())
  with check (public.is_admin());
