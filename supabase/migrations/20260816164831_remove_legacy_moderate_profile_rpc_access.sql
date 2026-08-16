-- The active admin moderation flow runs through server-side admin API routes.
-- This legacy SECURITY DEFINER RPC has no repository caller and should not be
-- exposed to signed-in clients through PostgREST.
revoke execute on function public.moderate_profile(uuid, text, text, jsonb) from authenticated;
revoke execute on function public.moderate_profile(uuid, text, text, jsonb) from public;
revoke execute on function public.moderate_profile(uuid, text, text, jsonb) from anon;
