-- Keep profile_status normalization safe across legacy enum/text schema drift.
-- Production incident: btrim(public.profile_status) failed when a profile update
-- passed through this trigger while profile_status was still represented by the
-- legacy enum type in part of the runtime contract.

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

  -- String functions operate on text, not enum values.
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
    -- For a legacy enum, canonical values need no reassignment. For a text
    -- column, normalize only when case/whitespace actually differs.
    if new.profile_status::text is distinct from v then
      new.profile_status := v;
    end if;
  else
    new.profile_status := null;
  end if;

  return new;
end;
$$;
