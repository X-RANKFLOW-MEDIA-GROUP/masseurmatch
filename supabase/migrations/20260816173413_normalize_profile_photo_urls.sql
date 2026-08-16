-- Keep public profile photo rows safe for Next/Image.
create or replace function public.normalize_profile_photo_public_url()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.storage_path is not null and new.storage_path !~* '^https?://' and new.url ~* '^https?://' then
    new.storage_path := new.url;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_normalize_profile_photo_public_url on public.profile_photos;
create trigger trg_normalize_profile_photo_public_url before insert or update of storage_path, url on public.profile_photos for each row execute function public.normalize_profile_photo_public_url();
update public.profile_photos set storage_path = url, updated_at = now() where storage_path is not null and storage_path !~* '^https?://' and url ~* '^https?://';
revoke execute on function public.normalize_profile_photo_public_url() from public, anon, authenticated;
