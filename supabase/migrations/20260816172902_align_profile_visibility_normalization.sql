create or replace function public.normalize_profiles_visibility_status()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v text;
begin
  if new.visibility_status is null then
    return new;
  end if;

  v := lower(btrim(new.visibility_status::text));

  new.visibility_status := case
    when v in ('public', 'active', 'featured') then 'public'
    when v in ('hidden', 'inactive', 'pending', 'private') then 'hidden'
    when v = 'paused' then 'paused'
    when v = 'suspended' then 'suspended'
    else null
  end;

  return new;
end;
$$;

create or replace function public.moderate_profile(
  p_profile_id uuid,
  p_action text,
  p_reason text,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_catalog'
as $$
declare
  v_admin uuid := auth.uid();
  v_profile_status text;
  v_visibility text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin may moderate a profile.' using errcode = '42501';
  end if;

  if p_reason is null or length(btrim(p_reason)) < 10 then
    raise exception 'A reason of at least 10 characters is required.' using errcode = '22023';
  end if;

  case p_action
    when 'approve' then
      v_profile_status := 'approved';
      v_visibility := 'public';
    when 'reject' then
      v_profile_status := 'rejected';
      v_visibility := 'hidden';
    when 'suspend' then
      v_profile_status := 'suspended';
      v_visibility := 'suspended';
    else
      raise exception 'Unknown moderation action: %', p_action using errcode = '22023';
  end case;

  insert into public.audit_log (
    admin_id, admin_user_id, action, target_type,
    target_id, target_profile_id, reason, details
  ) values (
    v_admin, v_admin, 'profile.' || p_action, 'profile',
    p_profile_id, p_profile_id, p_reason, p_details
  );

  update public.profiles
  set profile_status = v_profile_status,
      visibility_status = v_visibility,
      moderation_status = v_profile_status,
      moderation_notes = p_reason,
      reviewed_at = now(),
      reviewed_by = v_admin,
      updated_at = now()
  where id = p_profile_id;

  if not found then
    raise exception 'No profile with id %', p_profile_id using errcode = 'P0002';
  end if;
end;
$$;
