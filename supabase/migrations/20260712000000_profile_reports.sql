-- FOSTA-SESTA: in-app abuse-report inbox for public visitors.
-- A dedicated, purpose-built table (the legacy `complaints` table carries an
-- inconsistent, FK-less schema across migrations, so we do not reuse it). Reports
-- are submitted through a service-role API route, so there is no public INSERT
-- policy — anonymous visitors can report without an account.

create table if not exists public.profile_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  profile_slug text,
  profile_name text,
  category text not null default 'other'
    check (category in (
      'sexual_solicitation',
      'trafficking',
      'prohibited_content',
      'csam',
      'fake_or_stolen',
      'harassment_safety',
      'other'
    )),
  reason text not null,
  reporter_email text,
  reporter_user_id uuid references auth.users (id) on delete set null,
  ip_hash text,
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'actioned', 'dismissed')),
  admin_notes text,
  resolved_by uuid references auth.users (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profile_reports_status_created_at
  on public.profile_reports (status, created_at desc);

create index if not exists idx_profile_reports_profile
  on public.profile_reports (profile_id, created_at desc);

create index if not exists idx_profile_reports_category
  on public.profile_reports (category, created_at desc);

drop trigger if exists trg_profile_reports_set_updated_at on public.profile_reports;
create trigger trg_profile_reports_set_updated_at
before update on public.profile_reports
for each row execute function public.set_updated_at();

alter table public.profile_reports enable row level security;

-- Reviewable by admins only. Inserts happen through the service role (which
-- bypasses RLS), so there is deliberately no public/self INSERT policy.
drop policy if exists "profile_reports_select_admin_only" on public.profile_reports;
create policy "profile_reports_select_admin_only"
  on public.profile_reports
  for select
  using (public.is_admin());

drop policy if exists "profile_reports_update_admin_only" on public.profile_reports;
create policy "profile_reports_update_admin_only"
  on public.profile_reports
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "profile_reports_delete_admin_only" on public.profile_reports;
create policy "profile_reports_delete_admin_only"
  on public.profile_reports
  for delete
  using (public.is_admin());
