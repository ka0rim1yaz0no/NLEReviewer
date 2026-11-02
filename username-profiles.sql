-- Username-only, device-remembered profiles. Run once after supabase.sql.
create table if not exists public.study_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(btrim(username)) between 1 and 40),
  normalized_username text generated always as (lower(btrim(username))) stored unique,
  created_at timestamptz not null default now()
);
alter table public.study_profiles enable row level security;
create policy "Read own username profile" on public.study_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own username profile" on public.study_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
grant select, insert on public.study_profiles to authenticated;
revoke all on public.study_profiles from anon;
