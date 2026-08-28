-- Legacy public profiles that predate phone verification must still be able to
-- save unrelated profile sections. Phone verification remains mandatory when a
-- profile is made public or when phone/verification fields are changed.

create or replace function public.enforce_verified_phone_for_public_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  auth_phone text;
  auth_phone_confirmed_at timestamptz;
  profile_phone text;
  must_verify boolean := false;
begin
  profile_phone := coalesce(nullif(btrim(new.phone), ''), nullif(btrim(new.phone_number), ''));

  if tg_op = 'INSERT' then
    must_verify := new.visibility_status = 'public';
  else
    must_verify := new.visibility_status = 'public'
      and (
        old.visibility_status is distinct from 'public'
        or new.phone is distinct from old.phone
        or new.phone_number is distinct from old.phone_number
        or new.is_verified_phone is distinct from old.is_verified_phone
      );
  end if;

  if not must_verify then
    return new;
  end if;

  if profile_phone is null then
    raise exception using
      errcode = '23514',
      message = 'A phone number is required before a provider profile can be public.';
  end if;

  if coalesce(new.is_verified_phone, false) = false then
    raise exception using
      errcode = '23514',
      message = 'Phone verification must be completed before a provider profile can be made public or its phone details can be changed.';
  end if;

  select u.phone, u.phone_confirmed_at
    into auth_phone, auth_phone_confirmed_at
  from auth.users u
  where u.id = new.user_id;

  if auth_phone_confirmed_at is null
     or auth_phone is null
     or regexp_replace(profile_phone, '[^0-9]', '', 'g')
        <> regexp_replace(auth_phone, '[^0-9]', '', 'g') then
    raise exception using
      errcode = '23514',
      message = 'Public profile phone must match the phone number confirmed in Supabase Auth.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_verified_phone_for_public_profile() from public;
