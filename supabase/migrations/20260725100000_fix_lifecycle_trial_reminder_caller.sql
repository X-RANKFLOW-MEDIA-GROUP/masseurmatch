-- The lifecycle campaign scheduler was invoking a `trial-reminder-emails`
-- edge function that does not exist (404 on every daily/weekly cron run).
-- Trial-ending reminders are already produced by the `run-lifecycle-campaigns`
-- function (segment "Therapist - Trial Ending", flow `trial_ending`), so the
-- extra invocation is removed rather than wrapped.

CREATE OR REPLACE FUNCTION public.run_lifecycle_campaign_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Core segment automation flow (includes the trial-ending cadence).
  PERFORM public.invoke_edge_function('run-lifecycle-campaigns', '{}'::jsonb);
END;
$$;
