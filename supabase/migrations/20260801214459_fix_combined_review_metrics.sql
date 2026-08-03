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
      and ir.is_public = true
      and ir.rating is not null
  )
  select count(*), round(avg(rating), 2)
    into v_count, v_average
  from all_public_reviews;

  update public.profiles
    set review_count = coalesce(v_count, 0),
        average_rating = v_average,
        updated_at = now()
  where id = v_profile_id;

  return coalesce(new, old);
end;
$$;
