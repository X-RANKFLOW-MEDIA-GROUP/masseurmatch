-- Align the profile editor's human-readable Schedule statuses with the
-- canonical profiles.current_status values, while protecting legacy saves that
-- accidentally send visibility_status through the current-status field.

create or replace function public.normalize_profiles_current_status()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v text;
  normalized text;
begin
  if new.current_status is null then
    return new;
  end if;

  v := lower(btrim(new.current_status::text));

  if new.is_featured = true then
    normalized := 'active';
  else
    normalized := case
      when v in ('available', 'available now') then 'available'
      when v = 'mobile' then 'mobile'
      when v = 'traveling' then 'traveling'
      when v = 'hidden' then 'hidden'
      when v in ('active', 'booking ahead', 'limited availability') then 'active'
      when v in ('inactive', 'away', 'unavailable') then 'inactive'
      when v in ('public', 'featured', 'pending', 'paused', 'suspended', 'private')
        then coalesce(old.current_status, 'active')
      else coalesce(old.current_status, 'active')
    end;
  end if;

  new.current_status := normalized;
  return new;
end;
$$;
