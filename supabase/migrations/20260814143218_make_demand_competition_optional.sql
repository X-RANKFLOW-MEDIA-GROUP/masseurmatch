alter table public.demand_scores alter column competition_index drop not null;
alter table public.demand_scores alter column competition_index drop default;
