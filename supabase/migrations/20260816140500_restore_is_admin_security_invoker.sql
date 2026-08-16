-- Restore the canonical privilege mode for public.is_admin().
-- The function body and EXECUTE grants are intentionally unchanged.

alter function public.is_admin() security invoker;
