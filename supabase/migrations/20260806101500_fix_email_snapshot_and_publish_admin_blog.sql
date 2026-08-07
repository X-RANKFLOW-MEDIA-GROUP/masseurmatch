-- Repair the Email Center snapshot aliases used by the outer json aggregations.
-- The subqueries expose camelCase aliases, so ordering by snake_case names fails.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'public.admin_email_center_snapshot(text,integer)'::regprocedure
  ) into function_definition;

  function_definition := replace(
    function_definition,
    'order by t.updated_at desc',
    'order by t."updatedAt" desc'
  );
  function_definition := replace(
    function_definition,
    'order by c.created_at desc',
    'order by c."createdAt" desc'
  );

  execute function_definition;
end;
$$;

-- Publish posts that already exist in the durable admin_content singleton.
-- Future saves are synchronized by /api/admin/blog.
insert into public.blog_posts (
  slug,
  title,
  excerpt,
  seo_description,
  content,
  tags,
  published_at,
  updated_at
)
select
  post ->> 'slug',
  post ->> 'title',
  post ->> 'excerpt',
  post ->> 'excerpt',
  coalesce((
    select jsonb_agg(
      case block ->> 'type'
        when 'heading' then jsonb_build_object('type', 'h2', 'content', block ->> 'text')
        when 'list' then jsonb_build_object('type', 'ul', 'content', coalesce(block -> 'items', '[]'::jsonb))
        else jsonb_build_object('type', 'paragraph', 'content', block ->> 'text')
      end
    )
    from jsonb_array_elements(coalesce(post -> 'blocks', '[]'::jsonb)) block
  ), '[]'::jsonb)::text,
  array['MasseurMatch', 'wellness']::text[],
  coalesce((post ->> 'publishedAt')::date::timestamptz, now()),
  coalesce((post ->> 'updatedAt')::timestamptz, now())
from public.admin_content content_store
cross join lateral jsonb_array_elements(coalesce(content_store.blog_posts, '[]'::jsonb)) post
where content_store.id = 'singleton'
  and nullif(post ->> 'slug', '') is not null
  and nullif(post ->> 'title', '') is not null
  and nullif(post ->> 'excerpt', '') is not null
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  seo_description = excluded.seo_description,
  content = excluded.content,
  tags = excluded.tags,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;
