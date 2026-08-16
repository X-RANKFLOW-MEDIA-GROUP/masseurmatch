create or replace function public.messaging_claim_next_imessage_queue(p_worker_id text)
returns table (
  queue_id uuid,
  contact_id uuid,
  conversation_id uuid,
  campaign_id uuid,
  message_id uuid,
  phone_e164 text,
  contact_name text,
  contact_timezone text,
  body text,
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
    and q.transport_preference = 'imessage'
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
  set status = 'claimed',
      locked_at = now(),
      locked_by = left(coalesce(p_worker_id, 'imessage-bridge'), 120),
      attempts = attempts + 1,
      updated_at = now()
  where id = v_id;

  update public.messaging_messages m
  set delivery_status = 'claimed',
      updated_at = now()
  from public.messaging_queue q
  where q.id = v_id
    and q.message_id = m.id;

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

comment on function public.messaging_claim_next_imessage_queue(text) is 'Atomically claims one due outbound message that must be sent through the authorized iMessage bridge.';
