alter function public.messaging_touch_updated_at() set search_path = public;
alter function public.messaging_contact_optout_guard() set search_path = public;
alter function public.messaging_message_activity_sync() set search_path = public;

grant execute on function public.messaging_claim_next_queue(text) to service_role;

create or replace function public.messaging_validate_contact_timezone()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from pg_timezone_names where name = new.timezone) then
    raise exception 'Invalid IANA timezone: %', new.timezone;
  end if;
  return new;
end;
$$;

create trigger trg_messaging_contacts_timezone
before insert or update of timezone on public.messaging_contacts
for each row execute function public.messaging_validate_contact_timezone();

revoke all on function public.messaging_validate_contact_timezone() from public;
revoke all on function public.messaging_validate_contact_timezone() from anon;
revoke all on function public.messaging_validate_contact_timezone() from authenticated;
