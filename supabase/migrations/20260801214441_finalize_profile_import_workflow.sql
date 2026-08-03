alter table public.imported_reviews
  add column if not exists public_label text not null default 'Imported review';

create or replace view public.public_imported_reviews as
select
  ir.id,
  ir.profile_id,
  ir.reviewer_name,
  ir.rating,
  ir.review_text,
  ir.review_date,
  ir.public_label,
  ir.imported_at,
  ir.created_at
from public.imported_reviews ir
where ir.is_public = true;

create or replace function public.sync_profile_import_ticket_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_verified = true and coalesce(old.is_verified, false) = false then
    update public.support_tickets
      set status = 'resolved',
          resolved_at = now(),
          updated_at = now()
    where import_migration_id = new.id
      and status not in ('resolved', 'closed');

    insert into public.support_ticket_messages (
      ticket_id,
      sender_id,
      sender_role,
      body,
      external_id
    )
    select
      st.id,
      st.user_id,
      'admin',
      'Import approved. Approved reviews are now eligible to appear publicly as "Imported review". The source platform remains private in admin records.',
      'profile-import-approved:' || new.id::text
    from public.support_tickets st
    where st.import_migration_id = new.id
      and not exists (
        select 1 from public.support_ticket_messages stm
        where stm.external_id = 'profile-import-approved:' || new.id::text
      );
  elsif new.status = 'manual_review' and old.status is distinct from new.status then
    update public.support_tickets
      set status = 'in_progress',
          updated_at = now()
    where import_migration_id = new.id
      and status = 'open';
  elsif new.status = 'failed' and old.status is distinct from new.status then
    update public.support_tickets
      set status = 'in_progress',
          priority = 'high',
          updated_at = now()
    where import_migration_id = new.id
      and status not in ('resolved', 'closed');
  end if;

  return new;
end;
$$;

drop trigger if exists profile_migration_sync_ticket_status on public.profile_migrations;
create trigger profile_migration_sync_ticket_status
after update of status, is_verified on public.profile_migrations
for each row execute function public.sync_profile_import_ticket_status();

create or replace function public.refresh_imported_review_profile_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_count integer;
  v_average numeric;
begin
  v_profile_id := coalesce(new.profile_id, old.profile_id);

  select count(*), round(avg(rating)::numeric, 2)
    into v_count, v_average
  from public.imported_reviews
  where profile_id = v_profile_id
    and is_public = true
    and rating is not null;

  update public.profiles
    set review_count = coalesce(v_count, 0),
        average_rating = v_average,
        updated_at = now()
  where id = v_profile_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists imported_reviews_refresh_profile_stats on public.imported_reviews;
create trigger imported_reviews_refresh_profile_stats
after insert or update of is_public, rating or delete on public.imported_reviews
for each row execute function public.refresh_imported_review_profile_stats();

update public.imported_reviews
set public_label = 'Imported review'
where public_label is distinct from 'Imported review';
