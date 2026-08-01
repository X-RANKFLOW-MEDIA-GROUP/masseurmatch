alter table public.support_tickets
  add column if not exists import_migration_id uuid null references public.profile_migrations(id) on delete set null;

create unique index if not exists support_tickets_import_migration_id_uidx
  on public.support_tickets(import_migration_id)
  where import_migration_id is not null;

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

create or replace function public.create_profile_import_ticket()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_ticket_id uuid;
  v_profile_name text;
  v_platform_label text;
begin
  select p.user_id, coalesce(nullif(p.display_name, ''), nullif(p.full_name, ''), 'Provider')
    into v_user_id, v_profile_name
  from public.profiles p
  where p.id = new.profile_id;

  if v_user_id is null then
    return new;
  end if;

  v_platform_label := case
    when new.platform is null or new.platform = '' or new.platform = 'custom' then 'another platform'
    else initcap(replace(new.platform, '_', ' '))
  end;

  insert into public.support_tickets (
    user_id,
    profile_id,
    subject,
    category,
    status,
    priority,
    source,
    import_migration_id
  ) values (
    v_user_id,
    new.profile_id,
    'Profile import request',
    'profile',
    'open',
    'medium',
    'profile_import',
    new.id
  )
  on conflict (import_migration_id) where import_migration_id is not null do nothing
  returning id into v_ticket_id;

  if v_ticket_id is not null then
    insert into public.support_ticket_messages (
      ticket_id,
      sender_id,
      sender_role,
      body,
      external_id
    ) values (
      v_ticket_id,
      v_user_id,
      'provider',
      'Automatic profile import request submitted.' || E'\n\n' ||
      'Provider: ' || v_profile_name || E'\n' ||
      'Source: ' || v_platform_label || E'\n' ||
      'Profile URL: ' || new.source_url || E'\n' ||
      'Import status: ' || new.status || E'\n' ||
      'Migration ID: ' || new.id::text,
      'profile-import:' || new.id::text
    );
  end if;

  return new;
end;
$$;

drop trigger if exists profile_migration_create_ticket on public.profile_migrations;
create trigger profile_migration_create_ticket
after insert on public.profile_migrations
for each row execute function public.create_profile_import_ticket();

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
  v_native_count integer;
  v_imported_count integer;
  v_native_sum numeric;
  v_imported_sum numeric;
  v_total_count integer;
  v_average numeric;
begin
  v_profile_id := coalesce(new.profile_id, old.profile_id);

  select count(*), coalesce(sum(rating), 0)
    into v_native_count, v_native_sum
  from public.reviews
  where profile_id = v_profile_id
    and status = 'approved'
    and is_public = true
    and rating is not null;

  select count(*), coalesce(sum(rating), 0)
    into v_imported_count, v_imported_sum
  from public.imported_reviews
  where profile_id = v_profile_id
    and is_public = true
    and rating is not null;

  v_total_count := coalesce(v_native_count, 0) + coalesce(v_imported_count, 0);
  v_average := case
    when v_total_count > 0 then round(((v_native_sum + v_imported_sum) / v_total_count)::numeric, 2)
    else null
  end;

  update public.profiles
    set review_count = v_total_count,
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