-- Atomically increment a public profile contact-click counter from server routes.

create or replace function public.increment_profile_contact_clicks(p_profile_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set contact_clicks = coalesce(contact_clicks, 0) + 1
  where id = p_profile_id;
$$;

revoke all on function public.increment_profile_contact_clicks(uuid) from public;
grant execute on function public.increment_profile_contact_clicks(uuid) to service_role;
