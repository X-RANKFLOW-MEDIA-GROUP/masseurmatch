-- Secure scheduled Edge Function dispatch and make lifecycle cadences deterministic.
-- This is forward-only. It does not rewrite existing email history.

create table if not exists public.edge_job_invocation_tokens (
  token uuid primary key default gen_random_uuid(),
  function_name text not null check (function_name ~ '^[a-z0-9][a-z0-9-]*$'),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.edge_job_invocation_tokens enable row level security;
revoke all on public.edge_job_invocation_tokens from public, anon, authenticated;
grant all on public.edge_job_invocation_tokens to service_role;

create index if not exists idx_edge_job_invocation_tokens_expiry
  on public.edge_job_invocation_tokens(expires_at)
  where consumed_at is null;

create or replace function public.consume_edge_job_token(
  p_token uuid,
  p_function_name text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows integer := 0;
begin
  if p_token is null
     or p_function_name is null
     or p_function_name !~ '^[a-z0-9][a-z0-9-]*$' then
    return false;
  end if;

  update public.edge_job_invocation_tokens
  set consumed_at = now()
  where token = p_token
    and function_name = p_function_name
    and consumed_at is null
    and expires_at > now();

  get diagnostics v_rows = row_count;

  delete from public.edge_job_invocation_tokens
  where expires_at < now() - interval '1 day';

  return v_rows = 1;
end;
$$;

revoke all on function public.consume_edge_job_token(uuid, text) from public, anon, authenticated;
grant execute on function public.consume_edge_job_token(uuid, text) to service_role;

create or replace function public.invoke_edge_function(
  p_function_name text,
  p_body jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_anon_key text;
  v_token uuid := gen_random_uuid();
begin
  if p_function_name is null or p_function_name !~ '^[a-z0-9][a-z0-9-]*$' then
    raise exception 'Invalid edge function name';
  end if;

  select decrypted_secret into v_url
  from vault.decrypted_secrets
  where name = 'masseurmatch_supabase_url'
  limit 1;

  select decrypted_secret into v_anon_key
  from vault.decrypted_secrets
  where name = 'masseurmatch_anon_key'
  limit 1;

  if coalesce(v_url, '') = '' or coalesce(v_anon_key, '') = '' then
    raise exception 'Scheduled Edge Function configuration is missing from Vault';
  end if;

  insert into public.edge_job_invocation_tokens(token, function_name)
  values (v_token, p_function_name);

  perform net.http_post(
    url := rtrim(v_url, '/') || '/functions/v1/' || p_function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key,
      'apikey', v_anon_key,
      'x-mm-job-token', v_token::text
    ),
    body := coalesce(p_body, '{}'::jsonb),
    timeout_milliseconds := 10000
  );
end;
$$;

revoke all on function public.invoke_edge_function(text, jsonb) from public, anon, authenticated;
grant execute on function public.invoke_edge_function(text, jsonb) to service_role;

-- Reassert deterministic lifecycle queue behavior. Marketing campaign sends are
-- limited to one queue entry per user/campaign/UTC day even if the scheduler or
-- endpoint is invoked more than once. Advisory locking closes the concurrency race.
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
returns table(queue_id uuid, status text, reason text)
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
  v_scheduled_for timestamptz := coalesce(p_scheduled_for, now());
  v_day_start timestamptz;
  v_day_end timestamptz;
  v_dedupe_key text;
  v_effective_idempotency_key text := p_idempotency_key;
  v_existing_status text;
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

  if p_send_category = 'marketing'
     and p_user_id is not null
     and nullif(trim(coalesce(p_campaign_key, '')), '') is not null then
    v_day_start := date_trunc('day', v_scheduled_for at time zone 'UTC') at time zone 'UTC';
    v_day_end := v_day_start + interval '1 day';
    v_dedupe_key := 'marketing-day:' || p_campaign_key || ':user:' || p_user_id::text || ':date:' || to_char(v_day_start, 'YYYY-MM-DD');

    perform pg_advisory_xact_lock(hashtextextended(v_dedupe_key, 0));

    select q.id, q.status
      into v_id, v_existing_status
    from public.lifecycle_email_queue q
    where q.user_id = p_user_id
      and q.campaign_key = p_campaign_key
      and q.send_category = 'marketing'
      and q.scheduled_for >= v_day_start
      and q.scheduled_for < v_day_end
      and q.status <> 'suppressed'
    order by q.created_at asc
    limit 1;

    if v_id is not null then
      return query select v_id, v_existing_status, 'duplicate_campaign_day';
      return;
    end if;

    v_effective_idempotency_key := v_dedupe_key;
  end if;

  if p_send_category = 'marketing' then
    select *
      into v_can_send
    from public.can_send_marketing_email(p_user_id, v_email, v_scheduled_for)
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
    v_scheduled_for,
    v_status,
    case when v_status = 'suppressed' then v_reason else null end,
    v_effective_idempotency_key
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

revoke all on function public.queue_lifecycle_email(uuid,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,timestamptz,text) from public, anon, authenticated;
grant execute on function public.queue_lifecycle_email(uuid,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,timestamptz,text) to service_role;

-- Daily campaigns. Weekly/monthly content is intentionally excluded here.
create or replace function public.run_lifecycle_campaign_jobs_daily()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.invoke_edge_function('run-lifecycle-campaigns', jsonb_build_object('campaign_key', 'profile_completion_nudge'));
  perform public.invoke_edge_function('run-lifecycle-campaigns', jsonb_build_object('campaign_key', 'travel_mode_digest'));
  perform public.invoke_edge_function('run-lifecycle-campaigns', jsonb_build_object('campaign_key', 're_engagement_30'));
  perform public.invoke_edge_function('run-lifecycle-campaigns', jsonb_build_object('campaign_key', 're_engagement_45'));
  perform public.invoke_edge_function('run-lifecycle-campaigns', jsonb_build_object('campaign_key', 'trial_ending_general'));
end;
$$;

-- Weekly campaigns. city_demand_digest self-gates to the first Monday.
create or replace function public.run_lifecycle_campaign_jobs_weekly()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.invoke_edge_function('run-lifecycle-campaigns', jsonb_build_object('campaign_key', 'therapist_weekly_newsletter'));
  perform public.invoke_edge_function('run-lifecycle-campaigns', jsonb_build_object('campaign_key', 'city_demand_digest'));
end;
$$;

-- Preserve the legacy callable name without reintroducing the removed
-- trial-reminder-emails Edge Function.
create or replace function public.run_lifecycle_campaign_jobs()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.run_lifecycle_campaign_jobs_daily();
end;
$$;

create or replace function public.run_city_digest_weekly()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.invoke_edge_function('send-city-digest', '{}'::jsonb);
end;
$$;

create or replace function public.run_post_signup_campaigns_hourly()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.invoke_edge_function('run-post-signup-campaigns', '{}'::jsonb);
end;
$$;

revoke all on function public.run_lifecycle_campaign_jobs_daily() from public, anon, authenticated;
revoke all on function public.run_lifecycle_campaign_jobs_weekly() from public, anon, authenticated;
revoke all on function public.run_lifecycle_campaign_jobs() from public, anon, authenticated;
revoke all on function public.run_city_digest_weekly() from public, anon, authenticated;
revoke all on function public.run_post_signup_campaigns_hourly() from public, anon, authenticated;
grant execute on function public.run_lifecycle_campaign_jobs_daily() to service_role;
grant execute on function public.run_lifecycle_campaign_jobs_weekly() to service_role;
grant execute on function public.run_lifecycle_campaign_jobs() to service_role;
grant execute on function public.run_city_digest_weekly() to service_role;
grant execute on function public.run_post_signup_campaigns_hourly() to service_role;

-- Reassert the queue worker privilege boundary too.
revoke all on function public.run_lifecycle_queue_worker() from public, anon, authenticated;
grant execute on function public.run_lifecycle_queue_worker() to service_role;

-- Replace stale jobs with deterministic schedules.
do $$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id from cron.job where jobname = 'lifecycle_campaign_jobs_daily';
  if v_job_id is not null then perform cron.unschedule(v_job_id); end if;
  perform cron.schedule('lifecycle_campaign_jobs_daily', '10 14 * * *', 'select public.run_lifecycle_campaign_jobs_daily();');

  v_job_id := null;
  select jobid into v_job_id from cron.job where jobname = 'lifecycle_campaign_jobs_weekly';
  if v_job_id is not null then perform cron.unschedule(v_job_id); end if;
  perform cron.schedule('lifecycle_campaign_jobs_weekly', '0 15 * * 1', 'select public.run_lifecycle_campaign_jobs_weekly();');

  v_job_id := null;
  select jobid into v_job_id from cron.job where jobname = 'send-city-digest-weekly';
  if v_job_id is not null then perform cron.unschedule(v_job_id); end if;
  perform cron.schedule('send-city-digest-weekly', '0 9 * * 5', 'select public.run_city_digest_weekly();');

  v_job_id := null;
  select jobid into v_job_id from cron.job where jobname = 'post_signup_campaigns_hourly';
  if v_job_id is not null then perform cron.unschedule(v_job_id); end if;
  perform cron.schedule('post_signup_campaigns_hourly', '5 * * * *', 'select public.run_post_signup_campaigns_hourly();');
end
$$;

-- Reassert two security hardenings that were recorded in migration history but
-- later drifted in the live schema.
do $$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'therapist_analytics_daily'
      and c.relkind = 'v'
  ) then
    execute 'alter view public.therapist_analytics_daily set (security_invoker = true)';
  end if;

  if to_regprocedure('public.set_updated_at()') is not null then
    execute 'alter function public.set_updated_at() set search_path = public';
  end if;
end
$$;
