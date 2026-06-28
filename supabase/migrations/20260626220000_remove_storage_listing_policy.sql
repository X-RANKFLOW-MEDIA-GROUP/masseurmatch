-- Remove the broad storage listing policy on the therapist-photos bucket.
-- Public buckets can serve objects via their URL without a blanket SELECT
-- policy that allows listing the entire bucket.
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can read therapist photos'
  ) then
    execute 'drop policy "Public can read therapist photos" on storage.objects';
  end if;
end $$;
