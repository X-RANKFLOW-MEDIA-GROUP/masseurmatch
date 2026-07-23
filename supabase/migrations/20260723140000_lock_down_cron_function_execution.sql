-- Restrict internal maintenance functions created by the cron reconciliation
-- migration. PostgreSQL grants EXECUTE on new functions to PUBLIC by default;
-- these SECURITY DEFINER functions trigger scoring refreshes and lifecycle
-- email edge functions and must not be callable through the public RPC surface.

revoke all on function public.refresh_knotty_learning_scores() from public;
revoke all on function public.refresh_knotty_learning_scores() from anon;
revoke all on function public.refresh_knotty_learning_scores() from authenticated;

revoke all on function public.invoke_edge_function(text, jsonb) from public;
revoke all on function public.invoke_edge_function(text, jsonb) from anon;
revoke all on function public.invoke_edge_function(text, jsonb) from authenticated;

revoke all on function public.run_lifecycle_queue_worker() from public;
revoke all on function public.run_lifecycle_queue_worker() from anon;
revoke all on function public.run_lifecycle_queue_worker() from authenticated;

revoke all on function public.run_lifecycle_campaign_jobs() from public;
revoke all on function public.run_lifecycle_campaign_jobs() from anon;
revoke all on function public.run_lifecycle_campaign_jobs() from authenticated;

-- Keep explicit backend access for controlled administrative execution and
-- troubleshooting. Function owners and pg_cron retain owner execution rights.
grant execute on function public.refresh_knotty_learning_scores() to service_role;
grant execute on function public.invoke_edge_function(text, jsonb) to service_role;
grant execute on function public.run_lifecycle_queue_worker() to service_role;
grant execute on function public.run_lifecycle_campaign_jobs() to service_role;
