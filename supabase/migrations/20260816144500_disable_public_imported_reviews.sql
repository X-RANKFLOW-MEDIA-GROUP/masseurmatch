-- MasseurMatch is a directory and does not publish client reviews or ratings.
-- Preserve imported review history for private/admin reference while making
-- public exposure impossible at the database contract level.

update public.imported_reviews
set is_public = false,
    updated_at = now()
where is_public is distinct from false;

alter table public.imported_reviews
  alter column is_public set default false,
  alter column is_public set not null;

alter table public.imported_reviews
  drop constraint if exists imported_reviews_never_public_check;

alter table public.imported_reviews
  add constraint imported_reviews_never_public_check
  check (is_public = false);

do $$
declare
  v_public_count bigint;
begin
  select count(*) into v_public_count
  from public.imported_reviews
  where is_public = true;

  if v_public_count <> 0 then
    raise exception 'imported reviews must remain private';
  end if;
end;
$$;
