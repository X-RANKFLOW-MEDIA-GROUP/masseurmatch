-- Grant write privileges on profile_photos to authenticated role.
-- Previously only SELECT was granted, causing "permission denied for table profile_photos"
-- on every INSERT/UPDATE/DELETE from browser clients even when RLS policies were correct.
GRANT INSERT, UPDATE, DELETE ON public.profile_photos TO authenticated;
