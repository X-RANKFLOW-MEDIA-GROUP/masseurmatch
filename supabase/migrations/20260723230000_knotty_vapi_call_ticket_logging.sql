-- Log Knotty/Vapi support calls directly in the existing Support Tickets desk.
-- This migration is additive and also aligns live sender-role/priority constraints
-- with the application code.

begin;

alter table public.support_tickets
  add column if not exists source text not null default 'web',
  add column if not exists vapi_call_id text null,
  add column if not exists call_direction text null,
  add column if not exists call_customer_number text null,
  add column if not exists call_started_at timestamptz null,
  add column if not exists call_ended_at timestamptz null,
  add column if not exists call_duration_seconds integer null,
  add column if not exists call_ended_reason text null,
  add column if not exists call_summary text null,
  add column if not exists call_transcript text null,
  add column if not exists call_recording_url text null,
  add column if not exists call_recording_consent_granted boolean not null default false;

create unique index if not exists support_tickets_vapi_call_id_key
  on public.support_tickets (vapi_call_id)
  where vapi_call_id is not null;

create index if not exists support_tickets_source_updated_at_idx
  on public.support_tickets (source, updated_at desc);

alter table public.support_ticket_messages
  add column if not exists external_id text null;

create unique index if not exists support_ticket_messages_external_id_key
  on public.support_ticket_messages (external_id)
  where external_id is not null;

-- The production database historically allowed user/admin while newer code and
-- the admin UI use provider/admin/system. Keep user as a backward-compatible
-- alias and permit system call-report entries.
alter table public.support_ticket_messages
  drop constraint if exists support_ticket_messages_sender_role_check;

alter table public.support_ticket_messages
  add constraint support_ticket_messages_sender_role_check
  check (sender_role in ('user', 'provider', 'admin', 'system'));

alter table public.support_ticket_messages
  alter column sender_role set default 'provider';

-- Production uses normal while an older migration/UI used medium. Normalize the
-- stored values and enforce one canonical set going forward.
update public.support_tickets
   set priority = 'normal'
 where priority = 'medium';

alter table public.support_tickets
  alter column priority set default 'normal';

alter table public.support_tickets
  drop constraint if exists support_tickets_priority_check;

alter table public.support_tickets
  add constraint support_tickets_priority_check
  check (priority in ('low', 'normal', 'high', 'urgent'));

-- Keep ticket activity current. Provider/user replies reopen a ticket; system
-- call reports update activity without changing an administrator's resolution.
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
           when new.sender_role in ('user', 'provider')
             and status in ('resolved', 'closed', 'waiting_on_user')
             then 'open'
           else status
         end,
         resolved_at = case
           when new.sender_role in ('user', 'provider')
             and status in ('resolved', 'closed')
             then null
           else resolved_at
         end
   where id = new.ticket_id;
  return new;
end;
$$;

commit;
