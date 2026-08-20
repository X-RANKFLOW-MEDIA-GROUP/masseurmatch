-- Production ledger alignment for the enum-safe profile status normalizer.
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

  -- Cast before string functions so this remains safe if an environment
  -- temporarily has profiles.profile_status as the legacy enum type.
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
    -- Enum values are already canonical. Avoid an unnecessary text-to-enum
    -- assignment; text columns still get whitespace/case normalization.
    if new.profile_status::text is distinct from v then
      new.profile_status := v;
    end if;
  else
    new.profile_status := null;
  end if;

  return new;
end;
$$;
