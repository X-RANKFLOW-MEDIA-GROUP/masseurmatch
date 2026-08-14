# PR #722 deployment requirements

Before deploying the application commit, apply the new forward-only Supabase
migrations through the normal deployment pipeline, in filename order:

- `20260814185234_restore_referral_service_role_rpc.sql`
- `20260814184500_sync_profile_extras_contract.sql`

Do not run these migrations manually from a developer checkout. The referral
migration preserves service-role-only RPC grants; the profile migration uses
`ADD COLUMN IF NOT EXISTS` and preserves existing profile data.

The CI and Vercel environments must define these exact names:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Only the two `NEXT_PUBLIC_` values are browser-visible. The service-role key
must remain server-only.
