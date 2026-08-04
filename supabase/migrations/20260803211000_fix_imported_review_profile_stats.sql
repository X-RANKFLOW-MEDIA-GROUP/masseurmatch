begin;

-- Keep profile review aggregates valid when an imported review is inserted,
-- unpublished, rerated, or deleted. AVG() returns NULL for an empty set, while
-- profiles.average_rating and profiles.review_count are NOT NULL in production.
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

  with all_public_reviews as (
    select r.rating::numeric as rating
    from public.reviews r
    where r.profile_id = v_profile_id
      and coalesce(r.is_public, false) = true
      and coalesce(r.status, 'approved') in ('approved', 'published', 'active')
      and r.rating is not null

    union all

    select ir.rating::numeric as rating
    from public.imported_reviews ir
    where ir.profile_id = v_profile_id
      and coalesce(ir.is_public, false) = true
      and ir.rating is not null
  )
  select count(*), round(avg(rating), 2)
    into v_count, v_average
  from all_public_reviews;

  update public.profiles
    set review_count = coalesce(v_count, 0),
        average_rating = coalesce(v_average, 0),
        updated_at = timezone('utc', now())
  where id = v_profile_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists imported_reviews_refresh_profile_stats on public.imported_reviews;
create trigger imported_reviews_refresh_profile_stats
after insert or delete or update of is_public, rating
on public.imported_reviews
for each row execute function public.refresh_imported_review_profile_stats();

commit;
