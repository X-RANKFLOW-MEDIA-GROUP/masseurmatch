-- Follow-up to 20260725190000_fix_profiles_public_read_policy.sql.
--
-- The recreated profiles_public_read_active policy calls public.is_admin(),
-- but the anon role had no EXECUTE grant on that function. PostgREST then
-- failed every anonymous read of public.profiles with
-- "42501: permission denied for function is_admin" — worse than the zero-row
-- behavior the policy was meant to fix. A policy's USING expression runs with
-- the privileges of the querying role, so every role that can SELECT the
-- table needs EXECUTE on functions the policy references.
--
-- is_admin() only reports whether auth.uid() belongs to an admin; for anon it
-- returns false, so granting EXECUTE exposes nothing.

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'is_admin' AND pronamespace = 'public'::regnamespace
  ) THEN
    GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
  END IF;
END $$;
