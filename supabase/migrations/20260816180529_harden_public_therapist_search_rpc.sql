-- Keep the public search RPC invoker-safe and derive plan priority from the
-- canonical profile tier when legacy therapist_subscriptions rows are absent.

create or replace function public.search_public_therapists(
  search_city_slug text default null,
  search_lat numeric default null,
  search_lng numeric default null,
  radius_miles numeric default 25,
  result_limit integer default 24,
  result_offset integer default 0
)
returns table(
  id uuid,
  slug text,
  display_name text,
  headline text,
  city text,
  state text,
  country text,
  canonical_city_slug text,
  offers_incall boolean,
  offers_outcall boolean,
  latitude numeric,
  longitude numeric,
  distance_miles numeric,
  priority_rank integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  with ranked as (
    select
      p.id,
      p.slug,
      p.display_name,
      p.headline,
      p.city,
      p.state,
      p.country,
      p.canonical_city_slug,
      p.offers_incall,
      p.offers_outcall,
      p.latitude,
      p.longitude,
      case
        when search_lat is not null
         and search_lng is not null
         and p.latitude is not null
         and p.longitude is not null
        then (
          3958.7613 * acos(
            least(1.0, greatest(-1.0,
              sin(radians(search_lat::double precision)) * sin(radians(p.latitude::double precision))
              + cos(radians(search_lat::double precision)) * cos(radians(p.latitude::double precision))
              * cos(radians(p.longitude::double precision - search_lng::double precision))
            ))
          )
        )::numeric
        else null
      end as distance_miles,
      (
        coalesce((
          select max(sp.priority_rank)
          from public.subscription_plans sp
          where sp.is_active = true
            and lower(sp.code) = lower(coalesce(p.subscription_tier, 'free'))
        ), 0)
        +
        case when coalesce(p.is_featured, false) then 30 else 0 end
      )::integer as priority_rank,
      p.updated_at
    from public.profiles p
    where p.role = 'provider'
      and p.profile_status = 'approved'
      and p.visibility_status = 'public'
      and coalesce(p.is_active, true) = true
      and coalesce(p.is_suspended, false) = false
      and coalesce(p.is_banned, false) = false
      and (search_city_slug is null or p.canonical_city_slug = search_city_slug)
  )
  select
    r.id,
    r.slug,
    r.display_name,
    r.headline,
    r.city,
    r.state,
    r.country,
    r.canonical_city_slug,
    r.offers_incall,
    r.offers_outcall,
    r.latitude,
    r.longitude,
    r.distance_miles,
    r.priority_rank
  from ranked r
  where search_lat is null
     or search_lng is null
     or r.latitude is null
     or r.longitude is null
     or r.distance_miles <= radius_miles
  order by r.priority_rank desc,
           r.distance_miles asc nulls last,
           r.updated_at desc
  limit least(greatest(result_limit, 1), 100)
  offset greatest(result_offset, 0);
$$;

revoke all on function public.search_public_therapists(text,numeric,numeric,numeric,integer,integer) from public;
grant execute on function public.search_public_therapists(text,numeric,numeric,numeric,integer,integer) to anon, authenticated, service_role;
