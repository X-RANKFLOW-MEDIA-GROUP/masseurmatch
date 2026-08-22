-- Treat legacy 10-digit NANP numbers and canonical +1XXXXXXXXXX numbers as
-- the same effective phone. The profile editor canonicalizes mirrored phone
-- columns on save, so formatting-only changes must not trigger verification.

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
  old_phone_digits text;
  new_phone_digits text;
  auth_phone_digits text;
  must_verify boolean := false;
begin
  profile_phone := coalesce(nullif(btrim(new.phone), ''), nullif(btrim(new.phone_number), ''));

  old_phone_digits := nullif(
    regexp_replace(
      coalesce(nullif(btrim(old.phone), ''), nullif(btrim(old.phone_number), ''), ''),
      '[^0-9]', '', 'g'
    ),
    ''
  );
  new_phone_digits := nullif(regexp_replace(coalesce(profile_phone, ''), '[^0-9]', '', 'g'), '');

  if old_phone_digits is not null and length(old_phone_digits) = 10 then
    old_phone_digits := '1' || old_phone_digits;
  end if;
  if new_phone_digits is not null and length(new_phone_digits) = 10 then
    new_phone_digits := '1' || new_phone_digits;
  end if;

  if tg_op = 'INSERT' then
    must_verify := new.visibility_status = 'public';
  else
    must_verify := new.visibility_status = 'public'
      and (
        old.visibility_status is distinct from 'public'
        or new_phone_digits is distinct from old_phone_digits
        or new.is_verified_phone is distinct from old.is_verified_phone
      );
  end if;

  if not must_verify then
    return new;
  end if;

  if new_phone_digits is null then
    raise exception using
      errcode = '23514',
      message = 'A phone number is required before a provider profile can be public.';
  end if;

  if coalesce(new.is_verified_phone, false) = false then
    raise exception using
      errcode = '23514',
      message = 'Phone verification must be completed before a provider profile can be made public or its phone number can be changed.';
  end if;

  select u.phone, u.phone_confirmed_at
    into auth_phone, auth_phone_confirmed_at
  from auth.users u
  where u.id = new.user_id;

  auth_phone_digits := nullif(regexp_replace(coalesce(auth_phone, ''), '[^0-9]', '', 'g'), '');
  if auth_phone_digits is not null and length(auth_phone_digits) = 10 then
    auth_phone_digits := '1' || auth_phone_digits;
  end if;

  if auth_phone_confirmed_at is null
     or auth_phone_digits is null
     or new_phone_digits <> auth_phone_digits then
    raise exception using
      errcode = '23514',
      message = 'Public profile phone must match the phone number confirmed in Supabase Auth.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_verified_phone_for_public_profile() from public;
