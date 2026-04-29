create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_user_id_idx on public.support_tickets(user_id);
create index if not exists support_tickets_status_idx on public.support_tickets(status);

alter table public.support_tickets enable row level security;

drop policy if exists "users can read own support tickets" on public.support_tickets;
create policy "users can read own support tickets"
  on public.support_tickets
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users can insert own support tickets" on public.support_tickets;
create policy "users can insert own support tickets"
  on public.support_tickets
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Admin mutations are performed through service role routes.
