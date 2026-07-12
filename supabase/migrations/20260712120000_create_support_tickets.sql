-- MasseurMatch support ticket system
-- A two-way support desk between massage therapists (providers) and admins.
--
-- The support_tickets / support_ticket_messages tables may already exist in the
-- live project (they are present in the generated types), so every statement
-- here is written to be idempotent and additive — it creates the tables only if
-- missing and never rewrites existing columns or data. All reads/writes flow
-- through server-side API routes using the service-role key, so RLS is
-- deny-by-default for anon / authenticated clients.

-- ---------------------------------------------------------------------------
-- Tickets
-- ---------------------------------------------------------------------------
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid null references public.profiles(id) on delete set null,
  subject text not null,
  category text not null default 'other',
  priority text not null default 'medium',
  status text not null default 'open',
  assigned_to uuid null,
  resolved_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_user_id_created_at_idx
  on public.support_tickets (user_id, created_at desc);

create index if not exists support_tickets_status_updated_at_idx
  on public.support_tickets (status, updated_at desc);

-- ---------------------------------------------------------------------------
-- Ticket messages (thread)
-- ---------------------------------------------------------------------------
create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null,
  sender_role text not null default 'provider',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_ticket_messages_ticket_id_created_at_idx
  on public.support_ticket_messages (ticket_id, created_at asc);

-- ---------------------------------------------------------------------------
-- Keep the parent ticket's activity timestamp fresh when a message arrives,
-- and reopen a resolved/closed ticket when the provider replies.
-- ---------------------------------------------------------------------------
create or replace function public.support_ticket_touch_parent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_tickets
     set updated_at = new.created_at,
         status = case
           when new.sender_role = 'provider' and status in ('resolved', 'closed')
             then 'open'
           else status
         end,
         resolved_at = case
           when new.sender_role = 'provider' and status in ('resolved', 'closed')
             then null
           else resolved_at
         end
   where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists support_ticket_messages_touch_parent on public.support_ticket_messages;
create trigger support_ticket_messages_touch_parent
  after insert on public.support_ticket_messages
  for each row
  execute function public.support_ticket_touch_parent();

-- ---------------------------------------------------------------------------
-- Row level security. Tickets are managed exclusively through server routes
-- that use the service-role key (which bypasses RLS), so direct anon /
-- authenticated access is denied.
-- ---------------------------------------------------------------------------
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;

drop policy if exists "support_tickets_no_public_select" on public.support_tickets;
create policy "support_tickets_no_public_select"
  on public.support_tickets
  for select
  to anon, authenticated
  using (false);

drop policy if exists "support_ticket_messages_no_public_select" on public.support_ticket_messages;
create policy "support_ticket_messages_no_public_select"
  on public.support_ticket_messages
  for select
  to anon, authenticated
  using (false);
