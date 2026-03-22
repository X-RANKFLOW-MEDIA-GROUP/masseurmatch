create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('text', 'photo')),
  source text not null default 'provider_listing',
  field_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  moderation_provider text,
  moderation_reason text,
  snapshot jsonb not null default '{}'::jsonb,
  ai_response jsonb,
  admin_reason text,
  resolved_by uuid references auth.users (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_moderation_queue_status_created_at
  on public.moderation_queue (status, created_at desc);

create index if not exists idx_moderation_queue_profile_status
  on public.moderation_queue (profile_id, status, created_at desc);

create index if not exists idx_moderation_queue_user_status
  on public.moderation_queue (user_id, status, created_at desc);

create unique index if not exists idx_moderation_queue_pending_profile_source
  on public.moderation_queue (profile_id, item_type, source)
  where status = 'pending';

drop trigger if exists trg_moderation_queue_set_updated_at on public.moderation_queue;
create trigger trg_moderation_queue_set_updated_at
before update on public.moderation_queue
for each row execute function public.set_updated_at();

alter table public.moderation_queue enable row level security;

drop policy if exists "moderation_queue_select_self_or_admin" on public.moderation_queue;
create policy "moderation_queue_select_self_or_admin"
  on public.moderation_queue
  for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "moderation_queue_insert_self_or_admin" on public.moderation_queue;
create policy "moderation_queue_insert_self_or_admin"
  on public.moderation_queue
  for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "moderation_queue_update_admin_only" on public.moderation_queue;
create policy "moderation_queue_update_admin_only"
  on public.moderation_queue
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "moderation_queue_delete_admin_only" on public.moderation_queue;
create policy "moderation_queue_delete_admin_only"
  on public.moderation_queue
  for delete
  using (public.is_admin());
