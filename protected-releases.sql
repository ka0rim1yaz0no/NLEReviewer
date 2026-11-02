-- Immutable study releases. Permissions match the existing claimed-profile gate.
create table if not exists public.study_content_releases (
 release text not null,
 id text not null,
 kind text not null check (kind in ('page','manifest')),
 data jsonb not null,
 primary key (release,id)
);
alter table public.study_content_releases enable row level security;
revoke all on public.study_content_releases from anon, authenticated;
grant select on public.study_content_releases to authenticated;
drop policy if exists "Username profiles read study releases" on public.study_content_releases;
create policy "Username profiles read study releases" on public.study_content_releases for select to authenticated
 using (exists (select 1 from public.study_profiles p where p.user_id=(select auth.uid()))
 and release not in ('2026-11-03-supplemental-1','2026-11-03-supplemental-2','2026-11-03-original-bank-1'));
-- Superseded candidates were withdrawn before their client production deployment.
-- Keep their audit records for the project owner, outside student access.
