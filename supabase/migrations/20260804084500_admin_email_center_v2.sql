-- Admin Email Center v2
-- Durable campaigns/templates layered on the existing lifecycle queue.

create table if not exists public.admin_email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  subject text not null,
  body_html text not null,
  body_text text,
  send_category text not null default 'marketing' check (send_category in ('marketing', 'transactional')),
  from_address text,
  reply_to text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body_html text not null,
  body_text text,
  send_category text not null check (send_category in ('marketing', 'transactional')),
  from_address text,
  reply_to text,
  audience jsonb not null default '{}'::jsonb,
  scheduled_for timestamptz not null default now(),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'processing', 'completed', 'cancelled')),
  template_id uuid references public.admin_email_templates(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  cancelled_by uuid references auth.users(id) on delete set null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_email_campaigns_created_at
  on public.admin_email_campaigns(created_at desc);
create index if not exists idx_admin_email_templates_updated_at
  on public.admin_email_templates(updated_at desc);

alter table public.admin_email_templates enable row level security;
alter table public.admin_email_campaigns enable row level security;
-- No direct client policies. All access is through admin-gated server routes.

create or replace function public.admin_email_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_admin_email_templates_updated_at on public.admin_email_templates;
create trigger trg_admin_email_templates_updated_at
before update on public.admin_email_templates
for each row execute function public.admin_email_touch_updated_at();

drop trigger if exists trg_admin_email_campaigns_updated_at on public.admin_email_campaigns;
create trigger trg_admin_email_campaigns_updated_at
before update on public.admin_email_campaigns
for each row execute function public.admin_email_touch_updated_at();

create or replace function public.admin_email_center_snapshot(
  p_query text default null,
  p_limit integer default 250
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_query text := lower(trim(coalesce(p_query, '')));
  v_limit integer := greatest(1, least(coalesce(p_limit, 250), 500));
  v_result jsonb;
begin
  select jsonb_build_object(
    'recipients', coalesce((
      select jsonb_agg(row_to_json(r) order by r.updated_at desc)
      from (
        select
          p.user_id as "userId",
          p.id as "profileId",
          coalesce(nullif(p.display_name, ''), nullif(p.full_name, ''), 'Provider') as name,
          coalesce(u.email, p.email_address, p.email) as email,
          p.city,
          p.state,
          p.profile_status as "profileStatus",
          coalesce(p.subscription_tier, p._tier, 'free') as plan,
          coalesce(mp.marketing_opt_in, true) as "marketingOptIn",
          exists (
            select 1 from public.email_suppressions es
            where lower(es.email) = lower(coalesce(u.email, p.email_address, p.email, ''))
              and es.is_active = true
          ) as suppressed,
          p.updated_at
        from public.profiles p
        left join auth.users u on u.id = p.user_id
        left join public.marketing_preferences mp on mp.user_id = p.user_id
        where p.user_id is not null
          and coalesce(u.email, p.email_address, p.email) is not null
          and (
            v_query = '' or
            lower(coalesce(p.display_name, '') || ' ' || coalesce(p.full_name, '') || ' ' ||
              coalesce(u.email, p.email_address, p.email, '') || ' ' || coalesce(p.city, '') || ' ' ||
              coalesce(p.state, '') || ' ' || coalesce(p.profile_status, '') || ' ' ||
              coalesce(p.subscription_tier, p._tier, 'free')) like '%' || v_query || '%'
          )
        order by p.updated_at desc
        limit v_limit
      ) r
    ), '[]'::jsonb),
    'templates', coalesce((
      select jsonb_agg(row_to_json(t) order by t.updated_at desc)
      from (
        select id, name, description, subject, body_html as "bodyHtml", body_text as "bodyText",
          send_category as "sendCategory", from_address as "fromAddress", reply_to as "replyTo",
          is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
        from public.admin_email_templates
        where is_active = true
        order by updated_at desc
        limit 100
      ) t
    ), '[]'::jsonb),
    'campaigns', coalesce((
      select jsonb_agg(row_to_json(c) order by c.created_at desc)
      from (
        select
          campaign.id,
          campaign.name,
          campaign.subject,
          campaign.send_category as "sendCategory",
          campaign.scheduled_for as "scheduledFor",
          campaign.status,
          campaign.created_at as "createdAt",
          count(q.id)::int as total,
          count(q.id) filter (where q.status = 'queued')::int as queued,
          count(q.id) filter (where q.status = 'processing')::int as processing,
          count(q.id) filter (where q.status = 'sent')::int as sent,
          count(q.id) filter (where q.status = 'suppressed')::int as suppressed,
          count(q.id) filter (where q.status = 'failed')::int as failed
        from public.admin_email_campaigns campaign
        left join public.lifecycle_email_queue q
          on q.payload ->> 'campaign_id' = campaign.id::text
        group by campaign.id
        order by campaign.created_at desc
        limit 50
      ) c
    ), '[]'::jsonb),
    'summary', jsonb_build_object(
      'sent30d', (select count(*) from public.lifecycle_email_log where status = 'sent' and created_at >= now() - interval '30 days'),
      'failed30d', (select count(*) from public.lifecycle_email_log where status = 'failed' and created_at >= now() - interval '30 days'),
      'suppressed30d', (select count(*) from public.lifecycle_email_log where status = 'suppressed' and created_at >= now() - interval '30 days'),
      'complaints30d', (select count(*) from public.email_provider_events where event_type = 'complained' and created_at >= now() - interval '30 days')
    )
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.admin_email_save_template(
  p_admin_user_id uuid,
  p_id uuid,
  p_name text,
  p_description text,
  p_subject text,
  p_body_html text,
  p_body_text text,
  p_send_category text,
  p_from_address text,
  p_reply_to text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if trim(coalesce(p_name, '')) = '' or trim(coalesce(p_subject, '')) = '' or trim(coalesce(p_body_html, '')) = '' then
    raise exception 'Template name, subject and HTML body are required';
  end if;
  if p_send_category not in ('marketing', 'transactional') then
    raise exception 'Invalid send category';
  end if;

  insert into public.admin_email_templates (
    id, name, description, subject, body_html, body_text, send_category,
    from_address, reply_to, created_by, updated_by
  ) values (
    coalesce(p_id, gen_random_uuid()), trim(p_name), nullif(trim(coalesce(p_description, '')), ''),
    trim(p_subject), p_body_html, nullif(p_body_text, ''), p_send_category,
    nullif(trim(coalesce(p_from_address, '')), ''), nullif(trim(coalesce(p_reply_to, '')), ''),
    p_admin_user_id, p_admin_user_id
  )
  on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    subject = excluded.subject,
    body_html = excluded.body_html,
    body_text = excluded.body_text,
    send_category = excluded.send_category,
    from_address = excluded.from_address,
    reply_to = excluded.reply_to,
    updated_by = excluded.updated_by,
    is_active = true
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.admin_email_create_campaign(
  p_admin_user_id uuid,
  p_name text,
  p_subject text,
  p_body_html text,
  p_body_text text,
  p_send_category text,
  p_from_address text,
  p_reply_to text,
  p_scheduled_for timestamptz,
  p_template_id uuid,
  p_user_ids uuid[],
  p_profile_statuses text[],
  p_plans text[],
  p_cities text[],
  p_states text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_campaign_id uuid;
  v_row record;
  v_queue record;
  v_total integer := 0;
  v_queued integer := 0;
  v_suppressed integer := 0;
  v_scheduled_for timestamptz := coalesce(p_scheduled_for, now());
begin
  if trim(coalesce(p_name, '')) = '' or trim(coalesce(p_subject, '')) = '' or trim(coalesce(p_body_html, '')) = '' then
    raise exception 'Campaign name, subject and HTML body are required';
  end if;
  if p_send_category not in ('marketing', 'transactional') then
    raise exception 'Invalid send category';
  end if;

  insert into public.admin_email_campaigns (
    name, subject, body_html, body_text, send_category, from_address, reply_to,
    audience, scheduled_for, status, template_id, created_by
  ) values (
    trim(p_name), trim(p_subject), p_body_html, nullif(p_body_text, ''), p_send_category,
    nullif(trim(coalesce(p_from_address, '')), ''), nullif(trim(coalesce(p_reply_to, '')), ''),
    jsonb_build_object(
      'userIds', coalesce(to_jsonb(p_user_ids), '[]'::jsonb),
      'profileStatuses', coalesce(to_jsonb(p_profile_statuses), '[]'::jsonb),
      'plans', coalesce(to_jsonb(p_plans), '[]'::jsonb),
      'cities', coalesce(to_jsonb(p_cities), '[]'::jsonb),
      'states', coalesce(to_jsonb(p_states), '[]'::jsonb)
    ),
    v_scheduled_for,
    case when v_scheduled_for > now() then 'scheduled' else 'processing' end,
    p_template_id,
    p_admin_user_id
  ) returning id into v_campaign_id;

  for v_row in
    select distinct on (p.user_id)
      p.user_id,
      coalesce(u.email, p.email_address, p.email) as email,
      coalesce(nullif(p.display_name, ''), nullif(p.full_name, ''), 'there') as recipient_name,
      p.city,
      p.state,
      p.profile_status,
      coalesce(p.subscription_tier, p._tier, 'free') as plan
    from public.profiles p
    left join auth.users u on u.id = p.user_id
    where p.user_id is not null
      and coalesce(u.email, p.email_address, p.email) is not null
      and (
        (
          coalesce(array_length(p_user_ids, 1), 0) > 0
          and p.user_id = any(p_user_ids)
        )
        or (
          coalesce(array_length(p_user_ids, 1), 0) = 0
          and (coalesce(array_length(p_profile_statuses, 1), 0) = 0 or p.profile_status = any(p_profile_statuses))
          and (coalesce(array_length(p_plans, 1), 0) = 0 or coalesce(p.subscription_tier, p._tier, 'free') = any(p_plans))
          and (coalesce(array_length(p_cities, 1), 0) = 0 or p.city = any(p_cities))
          and (coalesce(array_length(p_states, 1), 0) = 0 or p.state = any(p_states))
        )
      )
    order by p.user_id, p.updated_at desc
    limit 500
  loop
    v_total := v_total + 1;

    select * into v_queue
    from public.queue_lifecycle_email(
      v_row.user_id,
      v_row.email,
      v_row.recipient_name,
      'admin_email_center',
      'admin-' || v_campaign_id::text,
      'admin_email_center',
      coalesce(p_template_id::text, 'custom'),
      p_send_category,
      replace(replace(p_subject, '{{name}}', v_row.recipient_name), '{{city}}', coalesce(v_row.city, '')),
      replace(replace(p_body_html, '{{name}}', v_row.recipient_name), '{{city}}', coalesce(v_row.city, '')),
      case when p_body_text is null then null else replace(replace(p_body_text, '{{name}}', v_row.recipient_name), '{{city}}', coalesce(v_row.city, '')) end,
      p_from_address,
      p_reply_to,
      jsonb_build_object(
        'source', 'admin_email_center',
        'campaign_id', v_campaign_id,
        'profile_status', v_row.profile_status,
        'plan', v_row.plan,
        'city', v_row.city,
        'state', v_row.state
      ),
      v_scheduled_for,
      'admin-email:' || v_campaign_id::text || ':' || v_row.user_id::text
    ) limit 1;

    if v_queue.status = 'queued' then
      v_queued := v_queued + 1;
    else
      v_suppressed := v_suppressed + 1;
    end if;
  end loop;

  if v_total = 0 then
    delete from public.admin_email_campaigns where id = v_campaign_id;
    raise exception 'No eligible recipients matched the selected audience';
  end if;

  update public.admin_email_campaigns
  set status = case
    when v_queued = 0 then 'completed'
    when v_scheduled_for > now() then 'scheduled'
    else 'processing'
  end
  where id = v_campaign_id;

  return jsonb_build_object(
    'campaignId', v_campaign_id,
    'total', v_total,
    'queued', v_queued,
    'suppressed', v_suppressed
  );
end;
$$;

create or replace function public.admin_email_cancel_campaign(
  p_admin_user_id uuid,
  p_campaign_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cancelled integer;
begin
  update public.lifecycle_email_queue
  set status = 'skipped', suppression_reason = 'campaign_cancelled'
  where payload ->> 'campaign_id' = p_campaign_id::text
    and status = 'queued';
  get diagnostics v_cancelled = row_count;

  update public.admin_email_campaigns
  set status = 'cancelled', cancelled_by = p_admin_user_id, cancelled_at = now()
  where id = p_campaign_id;

  return v_cancelled;
end;
$$;

revoke all on function public.admin_email_center_snapshot(text, integer) from public, anon, authenticated;
revoke all on function public.admin_email_save_template(uuid, uuid, text, text, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_email_create_campaign(uuid, text, text, text, text, text, text, text, timestamptz, uuid, uuid[], text[], text[], text[], text[]) from public, anon, authenticated;
revoke all on function public.admin_email_cancel_campaign(uuid, uuid) from public, anon, authenticated;

grant execute on function public.admin_email_center_snapshot(text, integer) to service_role;
grant execute on function public.admin_email_save_template(uuid, uuid, text, text, text, text, text, text, text, text) to service_role;
grant execute on function public.admin_email_create_campaign(uuid, text, text, text, text, text, text, text, timestamptz, uuid, uuid[], text[], text[], text[], text[]) to service_role;
grant execute on function public.admin_email_cancel_campaign(uuid, uuid) to service_role;
