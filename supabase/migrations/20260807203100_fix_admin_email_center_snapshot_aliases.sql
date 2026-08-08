-- Fix admin email center snapshot alias references.
-- The inner queries expose camelCase aliases, so the outer jsonb_agg ORDER BY
-- must reference those aliases rather than the original snake_case names.

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
      select jsonb_agg(row_to_json(t) order by t."updatedAt" desc)
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
      select jsonb_agg(row_to_json(c) order by c."createdAt" desc)
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
