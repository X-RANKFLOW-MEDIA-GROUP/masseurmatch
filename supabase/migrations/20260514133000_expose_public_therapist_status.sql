create or replace view public.public_therapist_profiles as
select
  tp.id,
  tp.slug,
  tp.display_name,
  tp.headline,
  tp.bio,
  tp.city,
  tp.state,
  tp.country,
  tp.neighborhood,
  tp.latitude,
  tp.longitude,
  tp.service_radius_miles,
  tp.offers_incall,
  tp.offers_outcall,
  tp.availability_note,
  tp.seo_title,
  tp.seo_description,
  tp.canonical_city_slug,
  tp.profile_completion_score,
  tp.created_at,
  tp.updated_at,
  case
    when tp.is_published = true and tp.moderation_status = 'approved' then 'active'
    else coalesce(tp.moderation_status, 'pending')
  end::text as status,
  tp.moderation_status::text as profile_status,
  case
    when tp.is_published = true and tp.moderation_status = 'approved' then 'visible'
    else 'hidden'
  end::text as visibility_status
from public.therapist_profiles tp
where tp.is_published = true
  and tp.moderation_status = 'approved';

create or replace view public.public_therapist_profiles_safe as
select
  tp.id,
  tp.slug,
  tp.display_name,
  tp.headline,
  tp.bio,
  tp.city,
  tp.state,
  tp.country,
  tp.neighborhood,
  tp.latitude,
  tp.longitude,
  tp.service_radius_miles,
  tp.offers_incall,
  tp.offers_outcall,
  tp.availability_note,
  tp.seo_title,
  tp.seo_description,
  tp.canonical_city_slug,
  tp.profile_completion_score,
  tp.created_at,
  tp.updated_at,
  case
    when tp.is_published = true and tp.moderation_status = 'approved' then 'active'
    else coalesce(tp.moderation_status, 'pending')
  end::text as status,
  tp.moderation_status::text as profile_status,
  case
    when tp.is_published = true and tp.moderation_status = 'approved' then 'visible'
    else 'hidden'
  end::text as visibility_status
from public.therapist_profiles tp
where tp.is_published = true
  and tp.moderation_status = 'approved';
