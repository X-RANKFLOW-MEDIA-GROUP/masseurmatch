update public.profile_photos set storage_path = url, updated_at = now() where storage_path is not null and storage_path !~* '^https?://' and url ~* '^https?://';
create or replace function public.normalize_profile_photo_urls()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.storage_path is null or new.storage_path !~* '^https?://') and new.url ~* '^https?://' then new.storage_path := new.url; end if;
  if (new.url is null or new.url !~* '^https?://') and new.storage_path ~* '^https?://' then new.url := new.storage_path; end if;
  return new;
end;
$$;
drop trigger if exists trg_normalize_profile_photo_urls on public.profile_photos;
create trigger trg_normalize_profile_photo_urls before insert or update of storage_path, url on public.profile_photos for each row execute function public.normalize_profile_photo_urls();
revoke execute on function public.normalize_profile_photo_urls() from public, anon, authenticated;
