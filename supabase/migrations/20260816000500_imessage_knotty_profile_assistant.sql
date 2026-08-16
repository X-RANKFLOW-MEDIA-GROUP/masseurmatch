-- Secure profile-assistance layer for the existing admin messaging system.
-- Additive only. iMessage is the transport; Knotty never receives credentials.

-- Production already carries user ownership on the messaging tables. Reassert
-- those columns idempotently so clean environments reproduce the live contract.
alter table public.messaging_contacts
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists profile_id uuid references public.profiles(id) on delete set null;

alter table public.messaging_conversations
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.messaging_messages
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.messaging_queue
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists idx_messaging_contacts_profile_id
  on public.messaging_contacts(profile_id)
  where profile_id is not null;

create table if not exists public.messaging_profile_sessions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.messaging_contacts(id) on delete cascade,
  conversation_id uuid not null references public.messaging_conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'unverified' check (status in ('unverified','pending_verification','verified','expired','revoked')),
  pending_field text,
  pending_value jsonb,
  pending_preview text,
  verification_token_hash text,
  verification_requested_at timestamptz,
  verified_at timestamptz,
  expires_at timestamptz,
  last_prompted_field text,
  last_inbound_message_id uuid references public.messaging_messages(id) on delete set null,
  last_outbound_message_id uuid references public.messaging_messages(id) on delete set null,
  audit_version text not null default 'imessage-profile-v1',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (conversation_id)
);

create index if not exists idx_messaging_profile_sessions_profile
  on public.messaging_profile_sessions(profile_id, status);
create unique index if not exists idx_messaging_profile_sessions_token_hash
  on public.messaging_profile_sessions(verification_token_hash)
  where verification_token_hash is not null;

create table if not exists public.messaging_profile_audit_log (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.messaging_profile_sessions(id) on delete set null,
  conversation_id uuid not null references public.messaging_conversations(id) on delete cascade,
  contact_id uuid not null references public.messaging_contacts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('verification_requested','verified','field_staged','field_updated','field_rejected','session_revoked')),
  field_name text,
  previous_value jsonb,
  new_value jsonb,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_messaging_profile_audit_profile_created
  on public.messaging_profile_audit_log(profile_id, created_at desc);

create trigger trg_messaging_profile_sessions_updated_at
before update on public.messaging_profile_sessions
for each row execute function public.messaging_touch_updated_at();

alter table public.messaging_profile_sessions enable row level security;
alter table public.messaging_profile_audit_log enable row level security;

create policy messaging_profile_sessions_admin_all on public.messaging_profile_sessions
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy messaging_profile_audit_admin_read on public.messaging_profile_audit_log
for select to authenticated using (public.is_admin());

revoke all on public.messaging_profile_sessions from anon;
revoke all on public.messaging_profile_audit_log from anon;

grant select, insert, update, delete on public.messaging_profile_sessions to service_role;
grant select, insert on public.messaging_profile_audit_log to service_role;

-- Populate links only when a phone maps to exactly one provider profile.
-- Ambiguous phone matches are deliberately left unlinked for manual review.
with provider_phones as (
  select
    p.id as profile_id,
    p.user_id,
    case
      when regexp_replace(coalesce(nullif(p.phone,''), nullif(p.phone_number,''), nullif(p.whatsapp_number,''), nullif(p.whatsapp,'')), '[^0-9]', '', 'g') ~ '^[0-9]{10}$'
        then '+1' || regexp_replace(coalesce(nullif(p.phone,''), nullif(p.phone_number,''), nullif(p.whatsapp_number,''), nullif(p.whatsapp,'')), '[^0-9]', '', 'g')
      when regexp_replace(coalesce(nullif(p.phone,''), nullif(p.phone_number,''), nullif(p.whatsapp_number,''), nullif(p.whatsapp,'')), '[^0-9]', '', 'g') ~ '^1[0-9]{10}$'
        then '+' || regexp_replace(coalesce(nullif(p.phone,''), nullif(p.phone_number,''), nullif(p.whatsapp_number,''), nullif(p.whatsapp,'')), '[^0-9]', '', 'g')
      when coalesce(nullif(p.phone,''), nullif(p.phone_number,''), nullif(p.whatsapp_number,''), nullif(p.whatsapp,'')) like '+%'
        then '+' || regexp_replace(coalesce(nullif(p.phone,''), nullif(p.phone_number,''), nullif(p.whatsapp_number,''), nullif(p.whatsapp,'')), '[^0-9]', '', 'g')
      else null
    end as phone_e164
  from public.profiles p
  where p.role = 'provider'
    and coalesce(p.is_demo, false) = false
), unique_provider_phones as (
  select phone_e164, min(profile_id) as profile_id, min(user_id) as user_id
  from provider_phones
  where phone_e164 is not null
  group by phone_e164
  having count(*) = 1
)
update public.messaging_contacts c
set profile_id = u.profile_id,
    user_id = coalesce(c.user_id, u.user_id),
    updated_at = now()
from unique_provider_phones u
where c.phone_e164 = u.phone_e164
  and c.profile_id is null;

comment on table public.messaging_profile_sessions is 'Short-lived authorization and pending-field state for Knotty profile assistance over iMessage.';
comment on table public.messaging_profile_audit_log is 'Immutable audit trail for profile changes staged or applied through Knotty iMessage assistance.';
