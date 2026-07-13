-- FOSTA-SESTA: record each provider's explicit attestation that they are 18+
-- and provide non-sexual massage therapy only. Captured at signup submission.
alter table public.profiles
  add column if not exists age_conduct_attested_at timestamptz;
