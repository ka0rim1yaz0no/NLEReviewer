-- Apply once in Supabase SQL Editor. No service-role key is used by the app.
create table if not exists public.study_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint valid_state_version check (data->>'version' = '1')
);
alter table public.study_states enable row level security;
create policy "Read own study state" on public.study_states for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own study state" on public.study_states for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own study state" on public.study_states for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.study_states to authenticated;
revoke all on public.study_states from anon;
