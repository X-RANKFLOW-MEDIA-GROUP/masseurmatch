-- minimal but SAFE (no missing core fields)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text,
  email text,
  city text,
  profile_status text,
  visibility_status text,
  subscription_tier text,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
