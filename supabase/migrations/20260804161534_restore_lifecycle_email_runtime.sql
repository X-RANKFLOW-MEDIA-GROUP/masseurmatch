-- Restore the lifecycle email runtime in production environments where the
-- 202603 lifecycle migration was recorded without its tables, columns or RPCs.
-- Existing legacy queue rows keep status=pending so this repair cannot
-- accidentally release an historical email backlog.

create table if not exists public.marketing_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marketing_opt_in boolean not null default false,
  newsletter_opt_in boolean not null default false,
  updated_at timestamptz not null default now(),
  source text,
  updated_by text
);

create table if not exists public.email_suppressions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  reason text not null,
  details jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, reason, is_active)
);

create table if not exists public.email_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'resend',
  provider_event_id text,
  recipient_email text,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

alter table public.newsletter_subscribers
  add column if not exists unsubscribed_at timestamptz;

alter table public.lifecycle_email_queue
  add column if not exists from_address text,
  add column if not exists reply_to text,
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists max_retries integer not null default 2,
  add column if not exists processing_started_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.lifecycle_email_queue
  alter column provider_id type text using provider_id::text,
  alter column status set default 'queued';

alter table public.lifecycle_email_log
  alter column provider_id type text using provider_id::text;

create index if not exists idx_email_suppressions_email_active
  on public.email_suppressions (email, is_active);
create index if not exists idx_email_provider_events_type_time
  on public.email_provider_events (event_type, created_at desc);
create index if not exists idx_email_provider_events_recipient
  on public.email_provider_events (recipient_email, created_at desc);
create index if not exists idx_lifecycle_email_queue_pending
  on public.lifecycle_email_queue (status, scheduled_for);
create index if not exists idx_lifecycle_email_queue_user
  on public.lifecycle_email_queue (user_id, created_at desc);
create unique index if not exists idx_lifecycle_email_queue_idempotency
  on public.lifecycle_email_queue (idempotency_key)
  where idempotency_key is not null;

alter table public.marketing_preferences enable row level security;
alter table public.email_suppressions enable row level security;
alter table public.email_provider_events enable row level security;
alter table public.lifecycle_email_queue enable row level security;
alter table public.lifecycle_email_log enable row level security;

drop policy if exists "Users can read own marketing preferences" on public.marketing_preferences;
create policy "Users can read own marketing preferences"
  on public.marketing_preferences for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can update own marketing preferences" on public.marketing_preferences;
create policy "Users can update own marketing preferences"
  on public.marketing_preferences for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own marketing preferences" on public.marketing_preferences;
create policy "Users can insert own marketing preferences"
  on public.marketing_preferences for insert to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on public.marketing_preferences from public, anon, authenticated;
grant select, insert, update on public.marketing_preferences to authenticated;
grant all on public.marketing_preferences to service_role;

revoke all on public.email_suppressions from public, anon, authenticated;
revoke all on public.email_provider_events from public, anon, authenticated;
revoke all on public.lifecycle_email_queue from public, anon, authenticated;
revoke all on public.lifecycle_email_log from public, anon, authenticated;
grant all on public.email_suppressions to service_role;
grant all on public.email_provider_events to service_role;
grant all on public.lifecycle_email_queue to service_role;
grant all on public.lifecycle_email_log to service_role;

create or replace function public.lifecycle_email_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_marketing_preferences_updated_at on public.marketing_preferences;
create trigger trg_marketing_preferences_updated_at
before update on public.marketing_preferences
for each row execute function public.lifecycle_email_touch_updated_at();

drop trigger if exists trg_email_suppressions_updated_at on public.email_suppressions;
create trigger trg_email_suppressions_updated_at
before update on public.email_suppressions
for each row execute function public.lifecycle_email_touch_updated_at();

drop trigger if exists trg_lifecycle_email_queue_updated_at on public.lifecycle_email_queue;
create trigger trg_lifecycle_email_queue_updated_at
before update on public.lifecycle_email_queue
for each row execute function public.lifecycle_email_touch_updated_at();

revoke execute on function public.lifecycle_email_touch_updated_at()
  from public, anon, authenticated;

create or replace function public.is_major_us_holiday(p_date date)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_year integer := extract(year from p_date);
  v_thanksgiving date;
begin
  if extract(month from p_date) = 1 and extract(day from p_date) = 1 then
    return true;
  end if;

  if extract(month from p_date) = 12 and extract(day from p_date) = 25 then
    return true;
  end if;

  v_thanksgiving := make_date(v_year, 11, 1)
    + ((11 - extract(dow from make_date(v_year, 11, 1))::integer) % 7)
    + 21;

  return p_date = v_thanksgiving;
end;
$$;

revoke execute on function public.is_major_us_holiday(date)
  from public, anon, authenticated;
grant execute on function public.is_major_us_holiday(date) to service_role;

create or replace function public.can_send_marketing_email(
  p_user_id uuid,
  p_email text,
  p_send_time timestamptz default now()
)
returns table (eligible boolean, reason text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_opt_in boolean;
  v_last_marketing timestamptz;
  v_monthly_count integer;
  v_tx_same_day_count integer;
  v_sent_30d integer;
  v_complaints_30d integer;
begin
  if v_email is null or v_email = '' then
    return query select false, 'missing_email';
    return;
  end if;

  if split_part(v_email, '@', 1) ~* '^(info|admin|support)$' then
    return query select false, 'role_based_address';
    return;
  end if;

  if exists (
    select 1
    from public.email_suppressions suppression
    where lower(suppression.email) = v_email
      and suppression.is_active = true
  ) then
    return query select false, 'suppressed_address';
    return;
  end if;

  if exists (
    select 1
    from public.newsletter_subscribers subscriber
    where lower(subscriber.email) = v_email
      and (
        subscriber.is_active = false
        or subscriber.unsubscribed_at is not null
      )
  ) then
    return query select false, 'newsletter_unsubscribed';
    return;
  end if;

  if p_user_id is not null then
    select preference.marketing_opt_in
    into v_opt_in
    from public.marketing_preferences preference
    where preference.user_id = p_user_id;

    if coalesce(v_opt_in, true) = false then
      return query select false, 'user_opted_out';
      return;
    end if;
  end if;

  if public.is_major_us_holiday((p_send_time at time zone 'America/New_York')::date) then
    return query select false, 'major_holiday_blackout';
    return;
  end if;

  select max(log.created_at)
  into v_last_marketing
  from public.lifecycle_email_log log
  where lower(log.recipient_email) = v_email
    and log.send_category = 'marketing'
    and log.status = 'sent';

  if v_last_marketing is not null
    and p_send_time < v_last_marketing + interval '24 hours'
  then
    return query select false, 'marketing_cooldown_24h';
    return;
  end if;

  select count(*)
  into v_tx_same_day_count
  from public.lifecycle_email_log log
  where lower(log.recipient_email) = v_email
    and log.send_category = 'transactional'
    and log.status = 'sent'
    and (log.created_at at time zone 'UTC')::date =
      (p_send_time at time zone 'UTC')::date;

  if v_tx_same_day_count > 0 then
    return query select false, 'same_day_transactional';
    return;
  end if;

  select count(*)
  into v_monthly_count
  from public.lifecycle_email_log log
  where lower(log.recipient_email) = v_email
    and log.send_category = 'marketing'
    and log.status = 'sent'
    and date_trunc('month', log.created_at) = date_trunc('month', p_send_time);

  if v_monthly_count >= 8 then
    return query select false, 'monthly_marketing_cap_reached';
    return;
  end if;

  select count(*)
  into v_sent_30d
  from public.lifecycle_email_log log
  where log.send_category = 'marketing'
    and log.status = 'sent'
    and log.created_at >= now() - interval '30 days';

  select count(*)
  into v_complaints_30d
  from public.email_provider_events event
  where event.event_type = 'complained'
    and event.created_at >= now() - interval '30 days';

  if v_sent_30d >= 200
    and (v_complaints_30d::numeric / v_sent_30d::numeric) > 0.0008
  then
    return query select false, 'global_complaint_threshold_exceeded';
    return;
  end if;

  return query select true, 'ok';
end;
$$;

revoke execute on function public.can_send_marketing_email(uuid, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.can_send_marketing_email(uuid, text, timestamptz)
  to service_role;

create or replace function public.queue_lifecycle_email(
  p_user_id uuid,
  p_recipient_email text,
  p_recipient_name text,
  p_segment text,
  p_campaign_key text,
  p_flow_key text,
  p_template_key text,
  p_send_category text,
  p_subject text,
  p_body_html text,
  p_body_text text default null,
  p_from_address text default null,
  p_reply_to text default null,
  p_payload jsonb default '{}'::jsonb,
  p_scheduled_for timestamptz default now(),
  p_idempotency_key text default null
)
returns table (queue_id uuid, status text, reason text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_recipient_email));
  v_can_send record;
  v_id uuid;
  v_status text := 'queued';
  v_reason text := 'ok';
begin
  if p_send_category not in ('marketing', 'transactional') then
    raise exception 'Invalid send_category: %', p_send_category;
  end if;

  if trim(coalesce(p_subject, '')) = '' then
    raise exception 'Subject is required';
  end if;

  if trim(coalesce(p_body_html, '')) = '' then
    raise exception 'body_html is required';
  end if;

  if v_email = '' then
    v_email := null;
  end if;

  if p_send_category = 'marketing' then
    select *
    into v_can_send
    from public.can_send_marketing_email(p_user_id, v_email, p_scheduled_for)
    limit 1;

    if coalesce(v_can_send.eligible, false) = false then
      v_status := 'suppressed';
      v_reason := coalesce(v_can_send.reason, 'suppressed');
    end if;
  end if;

  insert into public.lifecycle_email_queue (
    user_id,
    recipient_email,
    recipient_name,
    segment,
    campaign_key,
    flow_key,
    template_key,
    send_category,
    subject,
    body_html,
    body_text,
    from_address,
    reply_to,
    payload,
    scheduled_for,
    status,
    suppression_reason,
    idempotency_key
  )
  values (
    p_user_id,
    v_email,
    p_recipient_name,
    p_segment,
    p_campaign_key,
    p_flow_key,
    p_template_key,
    p_send_category,
    trim(p_subject),
    p_body_html,
    p_body_text,
    p_from_address,
    p_reply_to,
    coalesce(p_payload, '{}'::jsonb),
    coalesce(p_scheduled_for, now()),
    v_status,
    case when v_status = 'suppressed' then v_reason else null end,
    p_idempotency_key
  )
  on conflict (idempotency_key)
  where idempotency_key is not null
  do update set updated_at = now()
  returning id into v_id;

  if v_status = 'suppressed' then
    insert into public.lifecycle_email_log (
      queue_id,
      user_id,
      recipient_email,
      segment,
      campaign_key,
      flow_key,
      template_key,
      send_category,
      status,
      suppression_reason,
      subject,
      metadata
    )
    values (
      v_id,
      p_user_id,
      coalesce(v_email, ''),
      p_segment,
      p_campaign_key,
      p_flow_key,
      p_template_key,
      p_send_category,
      'suppressed',
      v_reason,
      p_subject,
      coalesce(p_payload, '{}'::jsonb)
    );
  end if;

  return query select v_id, v_status, v_reason;
end;
$$;

revoke execute on function public.queue_lifecycle_email(
  uuid, text, text, text, text, text, text, text, text, text,
  text, text, text, jsonb, timestamptz, text
) from public, anon, authenticated;
grant execute on function public.queue_lifecycle_email(
  uuid, text, text, text, text, text, text, text, text, text,
  text, text, text, jsonb, timestamptz, text
) to service_role;

create or replace function public.claim_lifecycle_queue_batch(
  p_limit integer default 50
)
returns setof public.lifecycle_email_queue
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with claimed as (
    select queue.id
    from public.lifecycle_email_queue queue
    where queue.status = 'queued'
      and queue.scheduled_for <= now()
      and queue.retry_count <= queue.max_retries
    order by queue.scheduled_for asc
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 50), 200))
  )
  update public.lifecycle_email_queue queue
  set status = 'processing',
      processing_started_at = now(),
      updated_at = now()
  from claimed
  where queue.id = claimed.id
  returning queue.*;
end;
$$;

revoke execute on function public.claim_lifecycle_queue_batch(integer)
  from public, anon, authenticated;
grant execute on function public.claim_lifecycle_queue_batch(integer)
  to service_role;

create or replace function public.log_email_provider_event(
  p_provider text,
  p_provider_event_id text,
  p_recipient_email text,
  p_event_type text,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_email text := lower(trim(p_recipient_email));
  v_soft_bounce_count integer;
begin
  insert into public.email_provider_events (
    provider,
    provider_event_id,
    recipient_email,
    event_type,
    payload
  )
  values (
    coalesce(nullif(p_provider, ''), 'resend'),
    p_provider_event_id,
    v_email,
    p_event_type,
    coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (provider, provider_event_id)
  do update set payload = excluded.payload
  returning id into v_id;

  if p_event_type in ('bounced_hard', 'complained')
    and v_email is not null
  then
    insert into public.email_suppressions (email, reason, details)
    values (
      v_email,
      case
        when p_event_type = 'complained' then 'spam_complaint'
        else 'hard_bounce'
      end,
      jsonb_build_object(
        'source', 'provider_event',
        'event_type', p_event_type,
        'event_id', p_provider_event_id
      )
    )
    on conflict (email, reason, is_active) do nothing;
  end if;

  if p_event_type = 'bounced_soft' and v_email is not null then
    select count(*)
    into v_soft_bounce_count
    from public.email_provider_events event
    where lower(event.recipient_email) = v_email
      and event.event_type = 'bounced_soft'
      and event.created_at >= now() - interval '14 days';

    if v_soft_bounce_count >= 3 then
      insert into public.email_suppressions (email, reason, details)
      values (
        v_email,
        'soft_bounce_3x_14d',
        jsonb_build_object(
          'source', 'provider_event',
          'count', v_soft_bounce_count
        )
      )
      on conflict (email, reason, is_active) do nothing;
    end if;
  end if;

  return v_id;
end;
$$;

revoke execute on function public.log_email_provider_event(
  text, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.log_email_provider_event(
  text, text, text, text, jsonb
) to service_role;

create or replace function public.unsubscribe_marketing_email(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
begin
  if v_email is null or v_email = '' then
    return;
  end if;

  update public.newsletter_subscribers
  set is_active = false,
      unsubscribed_at = coalesce(unsubscribed_at, now())
  where lower(email) = v_email;

  insert into public.email_suppressions (email, reason, details)
  values (
    v_email,
    'manual_unsubscribe',
    jsonb_build_object('source', 'one_click_unsubscribe')
  )
  on conflict (email, reason, is_active) do nothing;

  update public.marketing_preferences preference
  set marketing_opt_in = false,
      newsletter_opt_in = false,
      updated_at = now(),
      source = coalesce(preference.source, 'unsubscribe_link'),
      updated_by = 'system'
  where preference.user_id in (
    select auth_user.id
    from auth.users auth_user
    where lower(auth_user.email) = v_email
  );
end;
$$;

revoke execute on function public.unsubscribe_marketing_email(text)
  from public, anon, authenticated;
grant execute on function public.unsubscribe_marketing_email(text)
  to service_role;
