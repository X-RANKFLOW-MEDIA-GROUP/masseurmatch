create extension if not exists pgcrypto;

create table if not exists public.messaging_settings (
  id text primary key default 'default' check (id = 'default'),
  receiving_number text not null default '+19786277387',
  transport_mode text not null default 'automatic' check (transport_mode in ('automatic','sms','rcs','imessage')),
  knotty_enabled boolean not null default true,
  global_pause boolean not null default false,
  inbound_since timestamptz not null default '2026-08-13 05:00:00+00',
  default_send_interval_seconds integer not null default 15 check (default_send_interval_seconds between 10 and 3600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.messaging_settings (id) values ('default') on conflict (id) do nothing;

create table if not exists public.messaging_contacts (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null unique check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  name text,
  city text,
  state text,
  timezone text not null default 'America/Chicago',
  profile_url text,
  source text,
  lifecycle_status text not null default 'new' check (lifecycle_status in ('new','queued','contacted','replied','interested','not_interested','opted_out','invalid')),
  knotty_enabled boolean not null default true,
  opted_out boolean not null default false,
  opted_out_at timestamptz,
  opted_out_reason text,
  last_outbound_at timestamptz,
  last_inbound_at timestamptz,
  last_activity_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((not opted_out) or opted_out_at is not null)
);

create table if not exists public.messaging_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'draft' check (status in ('draft','active','paused','completed','cancelled')),
  default_message text,
  short_sms_message text,
  sending_window_start time not null default '09:00',
  sending_window_end time not null default '20:59',
  transport_preference text not null default 'automatic' check (transport_preference in ('automatic','sms','rcs','imessage')),
  created_by uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sending_window_start < sending_window_end)
);

create table if not exists public.messaging_campaign_contacts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.messaging_campaigns(id) on delete cascade,
  contact_id uuid not null references public.messaging_contacts(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','queued','sent','replied','skipped','failed','opted_out')),
  skip_reason text,
  queued_at timestamptz,
  sent_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, contact_id)
);

create table if not exists public.messaging_conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.messaging_contacts(id) on delete cascade,
  receiving_number text not null,
  status text not null default 'open' check (status in ('open','needs_human','closed','opted_out')),
  knotty_enabled boolean not null default true,
  current_channel text not null default 'unknown' check (current_channel in ('unknown','automatic','imessage','rcs','sms')),
  unread_count integer not null default 0 check (unread_count >= 0),
  last_message_at timestamptz,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contact_id, receiving_number)
);

create table if not exists public.messaging_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.messaging_conversations(id) on delete cascade,
  contact_id uuid not null references public.messaging_contacts(id) on delete cascade,
  campaign_id uuid references public.messaging_campaigns(id) on delete set null,
  direction text not null check (direction in ('inbound','outbound')),
  sender_type text not null check (sender_type in ('campaign','knotty','human','contact','system')),
  body text not null check (length(btrim(body)) > 0),
  channel text not null default 'unknown' check (channel in ('unknown','automatic','imessage','rcs','sms')),
  delivery_status text not null default 'queued' check (delivery_status in ('queued','claimed','sent','delivered','failed','received','cancelled')),
  external_id text,
  idempotency_key text unique,
  sent_at timestamptz,
  delivered_at timestamptz,
  received_at timestamptz,
  failed_at timestamptz,
  error_code text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messaging_queue (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.messaging_campaigns(id) on delete cascade,
  contact_id uuid not null references public.messaging_contacts(id) on delete cascade,
  conversation_id uuid references public.messaging_conversations(id) on delete cascade,
  message_id uuid references public.messaging_messages(id) on delete cascade,
  body text not null check (length(btrim(body)) > 0),
  short_sms_body text,
  transport_preference text not null default 'automatic' check (transport_preference in ('automatic','sms','rcs','imessage')),
  status text not null default 'pending' check (status in ('pending','claimed','sent','delivered','failed','cancelled')),
  scheduled_for timestamptz not null default now(),
  priority integer not null default 100,
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  idempotency_key text not null unique,
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_messaging_contacts_status on public.messaging_contacts(lifecycle_status);
create index if not exists idx_messaging_contacts_activity on public.messaging_contacts(last_activity_at desc nulls last);
create index if not exists idx_messaging_campaign_contacts_campaign_status on public.messaging_campaign_contacts(campaign_id, status);
create index if not exists idx_messaging_conversations_last_message on public.messaging_conversations(last_message_at desc nulls last);
create index if not exists idx_messaging_messages_conversation_created on public.messaging_messages(conversation_id, created_at);
create index if not exists idx_messaging_messages_contact_created on public.messaging_messages(contact_id, created_at desc);
create index if not exists idx_messaging_queue_ready on public.messaging_queue(status, scheduled_for, priority, created_at) where status = 'pending';
create index if not exists idx_messaging_queue_contact on public.messaging_queue(contact_id, created_at desc);

create or replace function public.messaging_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.messaging_contact_optout_guard()
returns trigger language plpgsql as $$
begin
  if new.opted_out and not coalesce(old.opted_out, false) then
    new.opted_out_at := coalesce(new.opted_out_at, now());
    new.lifecycle_status := 'opted_out';
    new.knotty_enabled := false;

    update public.messaging_queue
      set status = 'cancelled', last_error = coalesce(last_error, 'contact_opted_out'), updated_at = now()
    where contact_id = new.id and status in ('pending','claimed');

    update public.messaging_conversations
      set status = 'opted_out', knotty_enabled = false, updated_at = now()
    where contact_id = new.id;

    update public.messaging_campaign_contacts
      set status = 'opted_out', skip_reason = coalesce(skip_reason, 'contact_opted_out'), updated_at = now()
    where contact_id = new.id and status in ('pending','queued');
  end if;
  return new;
end;
$$;

create or replace function public.messaging_message_activity_sync()
returns trigger language plpgsql as $$
begin
  update public.messaging_conversations
  set last_message_at = new.created_at,
      last_inbound_at = case when new.direction = 'inbound' then new.created_at else last_inbound_at end,
      last_outbound_at = case when new.direction = 'outbound' then new.created_at else last_outbound_at end,
      unread_count = case when new.direction = 'inbound' then unread_count + 1 else unread_count end,
      current_channel = case when new.channel <> 'unknown' then new.channel else current_channel end,
      updated_at = now()
  where id = new.conversation_id;

  update public.messaging_contacts
  set last_inbound_at = case when new.direction = 'inbound' then new.created_at else last_inbound_at end,
      last_outbound_at = case when new.direction = 'outbound' then new.created_at else last_outbound_at end,
      last_activity_at = new.created_at,
      lifecycle_status = case
        when opted_out then lifecycle_status
        when new.direction = 'inbound' then 'replied'
        when lifecycle_status in ('new','queued') then 'contacted'
        else lifecycle_status
      end,
      updated_at = now()
  where id = new.contact_id;

  if new.direction = 'inbound' and new.campaign_id is not null then
    update public.messaging_campaign_contacts
    set status = 'replied', replied_at = coalesce(replied_at, new.created_at), updated_at = now()
    where campaign_id = new.campaign_id and contact_id = new.contact_id;
  end if;

  return new;
end;
$$;

create or replace function public.messaging_claim_next_queue(p_worker_id text)
returns table (
  queue_id uuid,
  contact_id uuid,
  conversation_id uuid,
  campaign_id uuid,
  phone_e164 text,
  contact_name text,
  contact_timezone text,
  body text,
  short_sms_body text,
  transport_preference text,
  idempotency_key text
)
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  select q.id into v_id
  from public.messaging_queue q
  join public.messaging_contacts c on c.id = q.contact_id
  left join public.messaging_campaigns camp on camp.id = q.campaign_id
  cross join public.messaging_settings s
  where q.status = 'pending'
    and q.scheduled_for <= now()
    and q.attempts < q.max_attempts
    and not c.opted_out
    and not s.global_pause
    and (camp.id is null or camp.status = 'active')
    and (
      camp.id is null
      or ((now() at time zone c.timezone)::time >= camp.sending_window_start
          and (now() at time zone c.timezone)::time <= camp.sending_window_end)
    )
  order by q.priority asc, q.scheduled_for asc, q.created_at asc
  for update of q skip locked
  limit 1;

  if v_id is null then
    return;
  end if;

  update public.messaging_queue
  set status = 'claimed', locked_at = now(), locked_by = p_worker_id,
      attempts = attempts + 1, updated_at = now()
  where id = v_id;

  return query
  select q.id, q.contact_id, q.conversation_id, q.campaign_id,
         c.phone_e164, c.name, c.timezone,
         q.body, q.short_sms_body, q.transport_preference, q.idempotency_key
  from public.messaging_queue q
  join public.messaging_contacts c on c.id = q.contact_id
  where q.id = v_id;
end;
$$;

revoke all on function public.messaging_claim_next_queue(text) from public;
revoke all on function public.messaging_claim_next_queue(text) from anon;
revoke all on function public.messaging_claim_next_queue(text) from authenticated;

create trigger trg_messaging_settings_updated_at before update on public.messaging_settings
for each row execute function public.messaging_touch_updated_at();
create trigger trg_messaging_contacts_updated_at before update on public.messaging_contacts
for each row execute function public.messaging_touch_updated_at();
create trigger trg_messaging_contacts_optout before update of opted_out on public.messaging_contacts
for each row execute function public.messaging_contact_optout_guard();
create trigger trg_messaging_campaigns_updated_at before update on public.messaging_campaigns
for each row execute function public.messaging_touch_updated_at();
create trigger trg_messaging_campaign_contacts_updated_at before update on public.messaging_campaign_contacts
for each row execute function public.messaging_touch_updated_at();
create trigger trg_messaging_conversations_updated_at before update on public.messaging_conversations
for each row execute function public.messaging_touch_updated_at();
create trigger trg_messaging_messages_updated_at before update on public.messaging_messages
for each row execute function public.messaging_touch_updated_at();
create trigger trg_messaging_messages_activity after insert on public.messaging_messages
for each row execute function public.messaging_message_activity_sync();
create trigger trg_messaging_queue_updated_at before update on public.messaging_queue
for each row execute function public.messaging_touch_updated_at();

alter table public.messaging_settings enable row level security;
alter table public.messaging_contacts enable row level security;
alter table public.messaging_campaigns enable row level security;
alter table public.messaging_campaign_contacts enable row level security;
alter table public.messaging_conversations enable row level security;
alter table public.messaging_messages enable row level security;
alter table public.messaging_queue enable row level security;

create policy messaging_settings_admin_all on public.messaging_settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy messaging_contacts_admin_all on public.messaging_contacts
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy messaging_campaigns_admin_all on public.messaging_campaigns
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy messaging_campaign_contacts_admin_all on public.messaging_campaign_contacts
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy messaging_conversations_admin_all on public.messaging_conversations
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy messaging_messages_admin_all on public.messaging_messages
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy messaging_queue_admin_all on public.messaging_queue
for all to authenticated using (public.is_admin()) with check (public.is_admin());

comment on table public.messaging_contacts is 'Admin-only outreach contacts. Separate from provider/client contact inquiries.';
comment on table public.messaging_messages is 'Channel-neutral message ledger for campaign, Knotty, human, and inbound contact messages.';
comment on table public.messaging_queue is 'Durable outbound queue consumed by an authorized sender bridge or messaging provider.';

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messaging_contacts') then
    alter publication supabase_realtime add table public.messaging_contacts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messaging_conversations') then
    alter publication supabase_realtime add table public.messaging_conversations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messaging_messages') then
    alter publication supabase_realtime add table public.messaging_messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messaging_queue') then
    alter publication supabase_realtime add table public.messaging_queue;
  end if;
end $$;
