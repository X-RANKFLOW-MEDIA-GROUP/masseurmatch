-- Persist the last Vapi chat ID for each Twilio SMS phone pair so that
-- previousChatId can preserve multi-turn conversation context.

begin;

create table if not exists public.vapi_sms_sessions (
  id uuid primary key default gen_random_uuid(),
  from_number text not null,
  to_number text not null,
  assistant_id text not null,
  last_chat_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (from_number, to_number, assistant_id)
);

create index if not exists vapi_sms_sessions_updated_at_idx
  on public.vapi_sms_sessions (updated_at desc);

alter table public.vapi_sms_sessions enable row level security;

-- This table is accessed only by server-side service-role routes. No public
-- policies are intentionally created, so anon/authenticated access is denied.

commit;
