-- Keep profile_status normalization safe across legacy enum and canonical text schemas.
create or replace function public.normalize_profiles_profile_status()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v text;
begin
  if new.profile_status is null then
    return new;
  end if;

  v := lower(btrim(new.profile_status::text));

  if v in (
    'draft',
    'pending',
    'pending_approval',
    'under_review',
    'approved',
    'suspended',
    'rejected',
    'changes_requested'
  ) then
    if new.profile_status::text is distinct from v then
      new.profile_status := v;
    end if;
  else
    new.profile_status := null;
  end if;

  return new;
end;
$$;
