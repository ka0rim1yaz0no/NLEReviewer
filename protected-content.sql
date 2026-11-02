-- Study content is readable only after a username profile has been claimed.
create table if not exists public.study_content (
 id text primary key,
 kind text not null check (kind in ('manifest','questions','cases')),
 data jsonb not null
);
alter table public.study_content enable row level security;
revoke all on public.study_content from anon, authenticated;
grant select on public.study_content to authenticated;
drop policy if exists "Username profiles read study content" on public.study_content;
create policy "Username profiles read study content" on public.study_content for select to authenticated
 using (exists (select 1 from public.study_profiles p where p.user_id=(select auth.uid())));
