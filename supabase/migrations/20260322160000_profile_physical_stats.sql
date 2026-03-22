alter table public.profiles
  add column if not exists height_inches integer,
  add column if not exists weight_lb integer,
  add column if not exists body_type text;

update public.profiles
set body_type = case lower(trim(body_type))
  when 'slim' then 'slim'
  when 'athletic' then 'athletic'
  when 'average' then 'average'
  when 'muscular' then 'muscular'
  when 'stocky' then 'stocky'
  when 'large' then 'large'
  else null
end
where body_type is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_height_inches_check'
  ) then
    alter table public.profiles
      add constraint profiles_height_inches_check
      check (height_inches is null or height_inches between 48 and 96);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_weight_lb_check'
  ) then
    alter table public.profiles
      add constraint profiles_weight_lb_check
      check (weight_lb is null or weight_lb between 80 and 450);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_body_type_check'
  ) then
    alter table public.profiles
      add constraint profiles_body_type_check
      check (
        body_type is null
        or body_type in ('slim', 'athletic', 'average', 'muscular', 'stocky', 'large')
      );
  end if;
end $$;

create index if not exists idx_profiles_body_type on public.profiles (body_type);
