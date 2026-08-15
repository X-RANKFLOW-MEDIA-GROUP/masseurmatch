begin;

create or replace function public.assert_service_role_caller()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Only service_role can call this function'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.assert_service_role_caller() from public;
grant execute on function public.assert_service_role_caller() to service_role;

alter table public.identity_verifications
  add column if not exists verification_method text not null default 'stripe_identity';

alter table public.identity_verifications
  drop constraint if exists identity_verifications_verification_method_check;
alter table public.identity_verifications
  add constraint identity_verifications_verification_method_check
  check (verification_method in ('stripe_identity', 'manual', 'text', 'document', 'other'));

create unique index if not exists demand_scores_city_state_neighborhood_week_start_uidx
  on public.demand_scores (city_key, state_key, neighborhood_key, week_start);

commit;
