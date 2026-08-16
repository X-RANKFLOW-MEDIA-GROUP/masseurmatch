-- Restore reviewed imported reputation to public profile pages without exposing
-- source URLs, private migration metadata, or raw anonymized reviewer names.
alter table public.imported_reviews drop constraint if exists imported_reviews_never_public_check;
alter table public.imported_reviews alter column is_public set default false;
update public.imported_reviews set is_public = true, public_label = coalesce(nullif(btrim(public_label), ''), 'Imported review'), updated_at = now() where reviewed_at is not null and review_text is not null and btrim(review_text) <> '';
create or replace view public.public_imported_reviews with (security_invoker = true) as select ir.id, ir.profile_id, case when coalesce(ir.reviewer_anonymized, false) then null else ir.reviewer_name end as reviewer_name, ir.rating, ir.review_text, ir.review_date, coalesce(nullif(btrim(ir.public_label), ''), 'Imported review') as public_label, ir.imported_at, ir.created_at from public.imported_reviews ir where ir.is_public = true and ir.reviewed_at is not null and ir.review_text is not null and btrim(ir.review_text) <> '';
revoke select on table public.imported_reviews from anon, authenticated;
revoke all on public.public_imported_reviews from public, anon, authenticated;
grant select on public.public_imported_reviews to service_role;
comment on view public.public_imported_reviews is 'Safe server-side projection of reviewed imported reputation for public provider profiles. Source URLs and private migration metadata are intentionally excluded.';
