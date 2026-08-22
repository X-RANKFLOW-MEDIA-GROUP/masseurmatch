alter table public.messaging_settings
  add column if not exists imessage_outbound_enabled boolean not null default false;

comment on column public.messaging_settings.imessage_outbound_enabled is
  'Dedicated fail-closed gate for outbound iMessage claims. This is separate from the shared global messaging pause.';

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
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select q.id into v_id
  from public.messaging_queue q
  join public.messaging_contacts c on c.id = q.contact_id
  left join public.messaging_campaigns camp on camp.id = q.campaign_id
  cross join public.messaging_settings s
  where q.status = 'pending'
    and q.transport_preference is distinct from 'imessage'
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

comment on function public.messaging_claim_next_queue(text) is
  'Claims one due non-iMessage queue row. Dedicated iMessage rows are reserved for the fail-closed iMessage claimant.';

create or replace function public.messaging_claim_next_imessage_queue(p_worker_id text)
returns table (
  queue_id uuid, contact_id uuid, conversation_id uuid, campaign_id uuid,
  message_id uuid, phone_e164 text, contact_name text, contact_timezone text,
  body text, idempotency_key text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_worker_id text := left(btrim(coalesce(p_worker_id, '')), 120);
begin
  if v_worker_id = '' then return; end if;

  select q.id into v_id
  from public.messaging_queue q
  join public.messaging_contacts c on c.id = q.contact_id
  left join public.messaging_campaigns camp on camp.id = q.campaign_id
  join public.messaging_settings s on s.id = 'default'
  join public.messaging_imessage_bridge_workers w on w.worker_id = v_worker_id
  where q.status = 'pending'
    and q.transport_preference = 'imessage'
    and q.scheduled_for <= now()
    and q.attempts < q.max_attempts
    and not c.opted_out
    and not s.global_pause
    and s.imessage_outbound_enabled
    and w.last_seen_at >= now() - interval '2 minutes'
    and not w.replay_history
    and (camp.id is null or camp.status = 'active')
    and (
      camp.id is null
      or ((now() at time zone c.timezone)::time >= camp.sending_window_start
          and (now() at time zone c.timezone)::time <= camp.sending_window_end)
    )
  order by q.priority asc, q.scheduled_for asc, q.created_at asc
  for update of q skip locked
  limit 1;

  if v_id is null then return; end if;

  update public.messaging_queue
  set status = 'claimed', locked_at = now(), locked_by = v_worker_id,
      attempts = attempts + 1, updated_at = now()
  where id = v_id;

  update public.messaging_messages m
  set delivery_status = 'claimed', updated_at = now()
  from public.messaging_queue q
  where q.id = v_id and q.message_id = m.id;

  return query
  select q.id, q.contact_id, q.conversation_id, q.campaign_id, q.message_id,
         c.phone_e164, c.name, c.timezone, q.body, q.idempotency_key
  from public.messaging_queue q
  join public.messaging_contacts c on c.id = q.contact_id
  where q.id = v_id;
end;
$$;

revoke all on function public.messaging_claim_next_imessage_queue(text) from public;
revoke all on function public.messaging_claim_next_imessage_queue(text) from anon;
revoke all on function public.messaging_claim_next_imessage_queue(text) from authenticated;
grant execute on function public.messaging_claim_next_imessage_queue(text) to service_role;

comment on function public.messaging_claim_next_imessage_queue(text) is
  'Claims one due iMessage only when outbound is explicitly armed and the requesting bridge has a recent safe heartbeat.';
